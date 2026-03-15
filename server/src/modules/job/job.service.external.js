const axios = require('axios');
const https = require('https');

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';
const FINDWORK_KEY = process.env.FINDWORK_API_KEY;
const JOOBLE_KEY = process.env.JOOBLE_API_KEY;
const CAREERJET_KEY = process.env.CAREERJET_API_KEY;
const MUSE_KEY = process.env.MUSE_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheKey(role, location, type, salaryRange, experience) {
    return `${(role || '').toLowerCase()}|${(location || '').toLowerCase()}|${(type || '')}|${(salaryRange || '')}|${(experience || '')}`;
}

const healthMap = {};
const FAIL_THRESHOLD = 3;
const COOLDOWN_MS = 5 * 60 * 1000;

function isHealthy(name) {
    const h = healthMap[name];
    if (!h || h.failures < FAIL_THRESHOLD) return true;
    if (Date.now() - h.lastFail > COOLDOWN_MS) {
        healthMap[name] = { failures: 0, lastFail: null };
        return true;
    }
    return false;
}

function markFailed(name) {
    if (!healthMap[name]) healthMap[name] = { failures: 0, lastFail: null };
    healthMap[name].failures++;
    healthMap[name].lastFail = Date.now();
}

function markOk(name) { if (healthMap[name]) healthMap[name].failures = 0; }

function stripHtml(s = '') {
    let out = s
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"').replace(/&#x2F;/g, '/').replace(/&#39;/g, "'");
    out = out.replace(/<[^>]*>/g, ' ');
    return out.replace(/\s+/g, ' ').trim();
}

function snippet(s = '') { return stripHtml(s).slice(0, 200) + '...'; }

function titleMatchesRole(title = '', role = '') {
    if (!role || role.trim().length === 0) return true;
    const words = role.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const tLower = title.toLowerCase();
    return words.length > 0 && words.some(w => tLower.includes(w));
}

function deduplicate(jobs) {
    const seen = new Set();
    return jobs.filter(j => {
        const k = `${(j.title || '').toLowerCase().trim()}|${(j.company || '').toLowerCase().trim()}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

function pickRandom(arr, n) {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

function parseRSS(xml) {
    const items = [];
    const itemRx = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRx.exec(xml)) !== null) {
        const raw = m[1];
        const get = tag => {
            const r = raw.match(new RegExp(
                `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`
            ));
            return r ? (r[1] || r[2] || '').trim() : '';
        };
        const link = get('link') || (raw.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
        items.push({ title: get('title'), link, description: get('description'), pubDate: get('pubDate') });
    }
    return items;
}

async function safeFetch(name, fn) {
    for (let i = 0; i <= 1; i++) {
        try { const jobs = await fn(); markOk(name); return jobs; }
        catch (err) {
            if (i === 1) { markFailed(name); throw err; }
            await new Promise(r => setTimeout(r, 700));
        }
    }
}

function parseSalaryValue(salaryStr) {
    if (!salaryStr || salaryStr === 'Not specified') return null;
    const clean = salaryStr.replace(/[^\d]/g, '');
    if (!clean) return null;
    // If it's a range, take the average or min? Let's try to find all numbers.
    const nums = salaryStr.match(/\d+/g);
    if (!nums) return null;
    let val = parseInt(nums[nums.length - 1]); // Take the max or the only number
    if (salaryStr.includes('k') || salaryStr.includes('K')) val *= 1000;
    if (salaryStr.includes('L') || salaryStr.includes('l')) val *= 100000;
    // Handle USD vs INR (rough heuristic)
    if (salaryStr.includes('$')) val *= 83; // Convert USD to INR for uniform comparison in INR
    return val;
}

function matchesExperience(job, level) {
    if (level === 'any') return true;
    const text = `${job.title} ${job.snippet} ${job.type}`.toLowerCase();
    const l = level.toLowerCase();
    if (l === 'entry level') return text.includes('entry') || text.includes('junior') || text.includes('0-1') || text.includes('fresher') || text.includes('intern');
    if (l === 'junior') return text.includes('junior') || (text.includes('1-') && !text.includes('10-'));
    if (l === 'mid-level') return text.includes('mid') || text.includes('associate') || text.includes('2-4') || text.includes('3-5');
    if (l === 'senior') return text.includes('senior') || text.includes('sr.') || text.includes('sde 2') || text.includes('sde 3') || text.includes('5+') || text.includes('lead');
    if (l === 'lead') return text.includes('lead') || text.includes('staff') || text.includes('principal') || text.includes('manager') || text.includes('architect') || text.includes('head');
    return true;
}

function matchesSalary(salaryStr, range) {
    if (range === 'any') return true;
    const val = parseSalaryValue(salaryStr);
    if (!val) return false;
    
    // Range format: '< ₹ 5L', '₹ 5L - 10L', '₹ 10L - 20L', '₹ 20L - 40L', '> ₹ 40L'
    // This expects INR usually now
    const targetVal = val; // Already in INR from parseSalaryValue

    if (range === '< ₹ 5L') return targetVal < 500000;
    if (range === '₹ 5L - 10L') return targetVal >= 500000 && targetVal <= 1000000;
    if (range === '₹ 10L - 20L') return targetVal >= 1000000 && targetVal <= 2000000;
    if (range === '₹ 20L - 40L') return targetVal >= 2000000 && targetVal <= 4000000;
    if (range === '> ₹ 40L') return targetVal > 4000000;
    
    // Legacy support or fallback
    if (range && range.includes('$')) {
        const usdVal = targetVal / 83;
        if (range === '< $40k') return usdVal < 40000;
        if (range === '$40k - $80k') return usdVal >= 40000 && usdVal <= 80000;
        if (range === '$80k - $120k') return usdVal >= 80000 && usdVal <= 120000;
        if (range === '$120k - $160k') return usdVal >= 120000 && usdVal <= 160000;
        if (range === '> $160k') return usdVal > 160000;
    }

    return true;
}

exports.searchExternalJobs = async (role = '', location = '', type = '', salaryRange = 'any', experience = 'any') => {
    const isRecent = (!role && !location);
    
    let searchRole = role;
    if (isRecent) {
        const trending = [
            'Software Engineer', 'Marketing Manager', 'Product Designer', 
            'Data Scientist', 'Sales Executive', 'Financial Analyst', 
            'Content Writer', 'HR Generalist', 'Project Manager', 
            'Customer Success Manager', 'DevOps Engineer', 'Operations Lead'
        ];
        searchRole = trending[Math.floor(Date.now() / (1000 * 60 * 60)) % trending.length]; // Rotate every hour
    }

    const cacheKey = getCacheKey(role, location, type, salaryRange, experience);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        if (cached.jobs && cached.jobs.length > 0) {
            console.log(`  📦 CACHE HIT — "${role}" → ${cached.jobs.length} jobs`);
            return cached.jobs;
        }
    }

    const isRemote = !location || location.toLowerCase() === 'remote';
    const indiaLoc = !isRemote && location ? `${location}, India` : 'India';
    const pool = [];

    if (ADZUNA_APP_ID && ADZUNA_API_KEY) {
        pool.push({
            name: 'Adzuna', region: 'IN',
            fetch: () => axios.get('https://api.adzuna.com/v1/api/jobs/in/search/1', {
                params: {
                    app_id: ADZUNA_APP_ID, app_key: ADZUNA_API_KEY,
                    what: searchRole, where: !isRemote ? location : undefined,
                    results_per_page: isRecent ? 10 : 20, sort_by: 'date',
                },
                httpsAgent: new https.Agent({ family: 4 }),
            }).then(r => {
                if (!r.data?.results?.length) return [];
                let jobs = r.data.results.map(item => ({
                    title: item.title,
                    company: item.company?.display_name || 'Unknown',
                    location: item.location?.display_name || 'India',
                    type: item.contract_time || 'Any',
                    salary: item.salary_min && item.salary_max
                        ? `₹${Math.round(item.salary_min).toLocaleString('en-IN')} – ₹${Math.round(item.salary_max).toLocaleString('en-IN')}`
                        : 'Not specified',
                    link: item.redirect_url,
                    snippet: snippet(item.description),
                    source: 'Adzuna', logo: null,
                }));
                if (type && type !== 'any') jobs = jobs.filter(j => j.type?.toLowerCase() === type.toLowerCase());
                return jobs;
            }),
        });
    }

    if (JOOBLE_KEY) {
        pool.push({
            name: 'Jooble', region: 'IN',
            fetch: () => axios.post(
                `https://jooble.org/api/${JOOBLE_KEY}`,
                { keywords: searchRole, location: indiaLoc, page: '1', resultonpage: isRecent ? '10' : '20' },
                { headers: { 'Content-Type': 'application/json' } }
            ).then(r => {
                if (!r.data?.jobs?.length) return [];
                return r.data.jobs.map(item => ({
                    title: stripHtml(item.title),
                    company: item.company || 'Unknown',
                    location: item.location || 'India',
                    type: item.type || 'Full-time',
                    salary: item.salary || 'Not specified',
                    link: item.link,
                    snippet: snippet(item.snippet),
                    source: 'Jooble', logo: null,
                }));
            }),
        });
    }

    if (CAREERJET_KEY) {
        pool.push({
            name: 'Careerjet', region: 'IN',
            fetch: () => axios.get('http://public.api.careerjet.net/search', {
                params: {
                    keywords: searchRole,
                    location: isRemote ? 'India' : indiaLoc,
                    affid: CAREERJET_KEY,
                    pagesize: isRecent ? 10 : 20,
                    page: 1,
                    sort: 'date',
                    locale_code: 'en_IN',
                },
            }).then(r => {
                if (!r.data?.jobs?.length) return [];
                return r.data.jobs.map(item => ({
                    title: item.title,
                    company: item.company || 'Unknown',
                    location: item.locations || 'India',
                    type: item.jobtype || 'Full-time',
                    salary: item.salary || 'Not specified',
                    link: item.url,
                    snippet: snippet(item.description),
                    source: 'Careerjet', logo: null,
                }));
            }),
        });
    }

    if (FINDWORK_KEY) {
        pool.push({
            name: 'FindWork', region: 'IN',
            fetch: () => axios.get('https://findwork.dev/api/jobs/', {
                params: { search: searchRole, ...(isRemote ? { remote: true } : { location }), sort_by: 'date' },
                headers: { Authorization: `Token ${FINDWORK_KEY}` },
            }).then(r => {
                if (!r.data?.results?.length) return [];
                return r.data.results.slice(0, 20).map(item => ({
                    title: item.role,
                    company: item.company_name,
                    location: item.location || (item.remote ? 'Remote' : 'On-site'),
                    type: item.employment_type || 'Full-time',
                    salary: 'Not specified',
                    link: item.url,
                    snippet: snippet(item.text),
                    source: 'FindWork', logo: null,
                }));
            }),
        });
    }

    if (RAPIDAPI_KEY) {
        pool.push({
            name: 'JSearch', region: 'IN',
            fetch: () => axios.request({
                method: 'GET',
                url: `https://${RAPIDAPI_HOST}/search`,
                params: { query: isRemote ? searchRole : `${searchRole} ${indiaLoc}`, page: '1', num_pages: isRecent ? '1' : '2' },
                headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST },
            }).then(r => {
                if (!r.data?.data?.length) return [];
                return r.data.data.slice(0, 20).map(item => ({
                    title: item.job_title,
                    company: item.employer_name,
                    location: item.job_city ? `${item.job_city}, ${item.job_country}` : 'Remote',
                    type: item.job_employment_type || 'Full-time',
                    salary: item.job_min_salary ? `₹${(item.job_min_salary * 83).toLocaleString('en-IN')} – ₹${(item.job_max_salary * 83).toLocaleString('en-IN')}` : 'Not specified',
                    link: item.job_apply_link || item.job_google_link || item.employer_website,
                    snippet: snippet(item.job_description),
                    source: 'JSearch', logo: item.employer_logo || null,
                }));
            }),
        });
    }

    pool.push({
        name: 'The Muse', region: 'IN',
        fetch: () => {
            const params = { page: Math.floor(Math.random() * 5), descending: true };
            if (MUSE_KEY && MUSE_KEY !== 'not_required') params.api_key = MUSE_KEY;
            return axios.get('https://www.themuse.com/api/public/jobs', { params }).then(r => {
                if (!r.data?.results?.length) return [];
                return r.data.results
                    .filter(item => titleMatchesRole(item.name, searchRole))
                    .slice(0, 15)
                    .map(item => ({
                        title: item.name,
                        company: item.company?.name || 'Unknown',
                        location: item.locations?.map(l => l.name).join(', ') || 'Multiple',
                        type: item.levels?.map(l => l.name).join(', ') || 'Full-time',
                        salary: 'Not specified',
                        link: item.refs?.landing_page || '#',
                        snippet: snippet(item.contents),
                        source: 'The Muse', logo: item.company?.refs?.logo_image || null,
                    }));
            });
        },
    });

    pool.push({
        name: 'Arbeitnow', region: 'IN',
        fetch: () => axios.get('https://www.arbeitnow.com/api/job-board-api', {
            params: { search: searchRole, ...(isRemote ? { remote: true } : {}) },
        }).then(r => {
            if (!r.data?.data?.length) return [];
            return r.data.data.slice(0, 20).map(item => ({
                title: item.title,
                company: item.company_name || 'Unknown',
                location: item.location || (item.remote ? 'Remote' : 'On-site'),
                type: item.job_types?.join(', ') || 'Full-time',
                salary: 'Not specified',
                link: item.url,
                snippet: snippet(item.description),
                source: 'Arbeitnow', logo: null,
            }));
        }),
    });

    if (SERPAPI_KEY) {
        pool.push({
            name: 'Google Jobs', region: 'IN',
            fetch: () => axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google_jobs',
                    q: isRemote ? searchRole : `${searchRole} ${indiaLoc}`,
                    location: isRemote ? 'India' : indiaLoc,
                    api_key: SERPAPI_KEY,
                    hl: 'en',
                },
            }).then(r => {
                if (!r.data?.jobs_results?.length) return [];
                return r.data.jobs_results.slice(0, 20).map(item => ({
                    title: item.title,
                    company: item.company_name,
                    location: item.location || 'India',
                    type: item.detected_extensions?.schedule_type || 'Full-time',
                    salary: item.detected_extensions?.salary || 'Not specified',
                    link: item.related_links?.[0]?.link || item.share_link || '#',
                    snippet: snippet(item.description),
                    source: 'Google Jobs', logo: item.thumbnail || null,
                }));
            }),
        });
    }

    pool.push({
        name: 'RemoteOK', region: 'GLB',
        fetch: () => axios.get(`https://remoteok.com/api?tags=${encodeURIComponent(searchRole)}`).then(r => {
            if (!Array.isArray(r.data) || r.data.length <= 1) return [];
            return r.data.slice(1, 21).map(item => ({
                title: item.position,
                company: item.company,
                location: item.location || 'Remote',
                type: 'Full-time',
                salary: item.salary_min ? `₹${(item.salary_min * 83).toLocaleString('en-IN')} – ₹${(item.salary_max * 83).toLocaleString('en-IN')}` : 'Not specified',
                link: item.url,
                snippet: snippet(item.description),
                source: 'RemoteOK', logo: item.company_logo || null,
            }));
        }),
    });

    pool.push({
        name: 'Jobicy', region: 'GLB',
        fetch: () => axios.get('https://jobicy.com/api/v2/remote-jobs', {
            params: { count: 20, tag: searchRole.split(' ')[0] },
        }).then(r => {
            if (!r.data?.jobs?.length) return [];
            return r.data.jobs.slice(0, 20).map(item => ({
                title: item.jobTitle,
                company: item.companyName,
                location: item.jobGeo || 'Remote',
                type: item.jobType || 'Full-time',
                salary: item.annualSalaryMin
                    ? `₹${(item.annualSalaryMin * 83).toLocaleString('en-IN')} – ₹${(item.annualSalaryMax * 83).toLocaleString('en-IN')}`
                    : 'Not specified',
                link: item.url,
                snippet: snippet(item.jobExcerpt),
                source: 'Jobicy', logo: item.companyLogo || null,
            }));
        }),
    });

    const healthyPool = pool.filter(api => isHealthy(api.name));
    const indianPool = healthyPool.filter(a => a.region === 'IN');
    const globalPool = healthyPool.filter(a => a.region === 'GLB');
    const picked = [
        ...pickRandom(indianPool, 3),
        ...pickRandom(globalPool, 2),
    ].sort(() => Math.random() - 0.5);

    const results = await Promise.allSettled(
        picked.map(api =>
            safeFetch(api.name, api.fetch)
                .then(jobs => jobs)
                .catch(err => [])
        )
    );

    let allJobs = [];
    results.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) allJobs = allJobs.concat(r.value);
    });

    allJobs = deduplicate(allJobs);

    if (location && location.trim().toLowerCase() !== 'remote') {
        const locLower = location.toLowerCase().trim();
        const locMain = locLower.split(',')[0].trim();
        allJobs = allJobs.filter(job => {
            const jobLoc = (job.location || '').toLowerCase();
            return jobLoc.includes(locLower) || locLower.includes(jobLoc) || (locMain && jobLoc.includes(locMain));
        });
    } else {
        allJobs = allJobs.filter(job => {
            const jobLoc = (job.location || '').toLowerCase();
            const jobType = (job.type ? String(job.type) : '').toLowerCase();
            return jobLoc.includes('remote') || jobLoc.includes('india') || jobLoc.includes('worldwide') || jobType.includes('remote');
        });
    }

    allJobs = allJobs.sort(() => Math.random() - 0.5);

    // Apply additional filters
    if (salaryRange && salaryRange !== 'any') {
        allJobs = allJobs.filter(j => matchesSalary(j.salary, salaryRange));
    }
    if (experience && experience !== 'any') {
        allJobs = allJobs.filter(j => matchesExperience(j, experience));
    }

    cache.set(cacheKey, { jobs: allJobs, timestamp: Date.now() });
    return allJobs;
};
