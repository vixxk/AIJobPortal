const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';

// @route   GET /api/jobs/search
// @desc    Search jobs using Adzuna -> RemoteOK -> JSearch
router.get('/search', async (req, res) => {
  try {
    const { role, location, type } = req.query;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    console.log(`Searching for real jobs: ${role} in ${location || 'anywhere'}`);

    let formattedJobs = [];

    // Promises array for concurrent execution
    const fetchPromises = [];

    // 1️⃣ Primary API — Adzuna Jobs API
    if (ADZUNA_APP_ID && ADZUNA_API_KEY) {
        fetchPromises.push(
            axios.get("https://api.adzuna.com/v1/api/jobs/in/search/1", {
                params: {
                    app_id: ADZUNA_APP_ID,
                    app_key: ADZUNA_API_KEY,
                    what: role,
                    where: location && location.toLowerCase() !== "remote" ? location : undefined,
                    results_per_page: 10, // Request 10 from each to balance
                    sort_by: "date"
                },
                httpsAgent: new https.Agent({ family: 4 })
            }).then(response => {
                if (response.data?.results?.length) {
                    let jobs = response.data.results.map(item => ({
                        title: item.title,
                        company: item.company?.display_name || "Unknown",
                        location: item.location?.display_name || "India",
                        type: item.contract_time || "Any",
                        salary: item.salary_min && item.salary_max
                            ? `₹${item.salary_min} - ₹${item.salary_max}`
                            : "Not specified",
                        link: item.redirect_url,
                        snippet: item.description ? item.description.replace(/<[^>]*>/g, "").slice(0, 160) + "..." : "",
                        source: "Adzuna",
                        logo: null
                    }));
                    if (type && type !== "any") {
                        jobs = jobs.filter(job => job.type?.toLowerCase() === type.toLowerCase());
                    }
                    return jobs;
                }
                return [];
            })
        );
    }

    // 2️⃣ Secondary API — RemoteOK API
    const isRemote = !location || location.toLowerCase() === 'remote';
    if (isRemote) {
        const url = `https://remoteok.com/api?tags=${encodeURIComponent(role)}`;
        fetchPromises.push(
            axios.get(url).then(response => {
                if (Array.isArray(response.data) && response.data.length > 1) {
                    return response.data.slice(1, 11).map(item => ({
                        title: item.position,
                        company: item.company,
                        location: item.location || 'Remote',
                        type: 'Full-time',
                        salary: item.salary_min ? `$${item.salary_min} - $${item.salary_max}` : 'Not specified',
                        link: item.url,
                        snippet: item.description ? item.description.replace(/<[^>]*>?/gm, ' ').substring(0, 150) + '...' : '',
                        source: 'RemoteOK',
                        logo: item.company_logo || null
                    }));
                }
                return [];
            })
        );
    }

    // 3️⃣ Tertiary API — JSearch (RapidAPI)
    if (RAPIDAPI_KEY) {
        let query = role;
        if (location) query += ` in ${location}`;
        
        fetchPromises.push(
            axios.request({
                method: 'GET',
                url: `https://${RAPIDAPI_HOST}/search`,
                params: { query: query, page: '1', num_pages: '1' },
                headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST }
            }).then(response => {
                if (response.data && response.data.data && response.data.data.length > 0) {
                    return response.data.data.slice(0, 10).map(item => ({
                        title: item.job_title,
                        company: item.employer_name,
                        location: item.job_city ? `${item.job_city}, ${item.job_country}` : 'Remote',
                        type: item.job_employment_type || 'Full-time',
                        salary: item.job_min_salary ? `$${item.job_min_salary} - $${item.job_max_salary}` : 'Not specified',
                        link: item.job_apply_link || item.job_google_link || item.employer_website,
                        snippet: item.job_description ? item.job_description.substring(0, 150) + '...' : '',
                        source: 'JSearch',
                        logo: item.employer_logo || null
                    }));
                }
                return [];
            })
        );
    }

    // Execute concurrently
    const results = await Promise.allSettled(fetchPromises);
    
    // Combine all successful responses
    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
            formattedJobs = formattedJobs.concat(result.value);
        } else if (result.status === 'rejected') {
            console.error("One of the Job APIs failed:", result.reason.message);
        }
    });

    // Shuffle array slightly so sources are mixed, but still mostly relevant
    formattedJobs = formattedJobs.sort(() => Math.random() - 0.5);

    res.json({
        success: true,
        count: formattedJobs.length,
        jobs: formattedJobs 
    });

  } catch (error) {
    console.error('Job Search Error:', error);
    res.status(500).json({ message: 'Server Error fetching jobs', error: error.message });
  }
});

module.exports = router;
