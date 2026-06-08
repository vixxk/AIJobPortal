import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../utils/axios';
import { Briefcase, CheckCircle2, ShieldCheck, ArrowRight, Plus, X, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BENEFITS_OPTIONS = ['5 Days a Week', 'Health Insurance', 'ESOP', 'Work from Home', 'Performance Bonus'];
const PERKS_OPTIONS = ['Certificate', 'Letter of Recommendation', 'Flexible Hours', 'Work From Home', '5 Days a Week'];
const DEFAULT_QUESTIONS = ['Available to Join Immediately'];

const RadioGroup = ({ label, name, value, options, onChange, required }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange({ target: { name, value: opt } })}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${value === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const CheckGroup = ({ label, options, selected, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const checked = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onChange(checked ? selected.filter(s => s !== opt) : [...selected, opt])}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${checked ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
              {checked && '✓'}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all";

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isUnverified = user?.approvalStatus !== 'APPROVED';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [profileLogoUrl, setProfileLogoUrl] = useState(null);
  const [profileBannerUrl, setProfileBannerUrl] = useState(null);

  const [f, setF] = useState({
    opportunityType: 'Job',
    title: '', skills: '', workMode: 'In Office', workSchedule: 'Full-Time',
    experienceRequired: 'Fresher', numberOfOpenings: 1, description: '', responsibilities: '',
    candidatePreferences: '', location: '', organization: '',
    fixedPayMin: '', fixedPayMax: '', variablePayMin: '', variablePayMax: '',
    benefits: [], isSpecial: false, courseId: '',
    // Internship
    internshipStartType: 'Immediate', internshipStartFrom: '', internshipStartTo: '',
    internshipDuration: 1, stipendType: 'Paid', stipendMin: '', stipendMax: '',
    stipendVariableMin: '', stipendVariableMax: '', ppoOffered: false, perks: [],
    // Screening
    screeningQuestions: DEFAULT_QUESTIONS.map(q => ({ question: q, isDefault: true })),
    customQuestion: '',
    // AI
    enableSmartRanking: true, enableAICandidateMatching: true
  });

  const set = (name, value) => setF(p => ({ ...p, [name]: value }));
  const handleChange = e => set(e.target.name, e.target.value);

  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');

  useEffect(() => {
    (async () => {
      if (draftId) {
        try {
          const res = await axios.get(`/jobs/${draftId}`);
          if (res.data.status === 'success' && res.data.data.job) {
            const job = res.data.data.job;
            setF({
              opportunityType: job.opportunityType || 'Job',
              title: job.title || '',
              skills: (job.skillsRequired || []).join(', '),
              workMode: job.workMode || 'In Office',
              workSchedule: job.workSchedule || 'Full-Time',
              experienceRequired: job.experienceRequired || 'Fresher',
              numberOfOpenings: job.numberOfOpenings || 1,
              description: job.description || '',
              responsibilities: (job.responsibilities || []).join('\n'),
              candidatePreferences: job.candidatePreferences || '',
              location: job.location || '',
              organization: job.companyName || '',
              fixedPayMin: job.fixedPayMin || '',
              fixedPayMax: job.fixedPayMax || '',
              variablePayMin: job.variablePayMin || '',
              variablePayMax: job.variablePayMax || '',
              benefits: job.benefits || [],
              isSpecial: job.isSpecial || false,
              courseId: job.courseId || '',
              internshipStartType: job.internshipStartType || 'Immediate',
              internshipStartFrom: job.internshipStartFrom ? job.internshipStartFrom.split('T')[0] : '',
              internshipStartTo: job.internshipStartTo ? job.internshipStartTo.split('T')[0] : '',
              internshipDuration: job.internshipDuration || 1,
              stipendType: job.stipendType || 'Paid',
              stipendMin: job.stipendMin || '',
              stipendMax: job.stipendMax || '',
              stipendVariableMin: job.stipendVariableMin || '',
              stipendVariableMax: job.stipendVariableMax || '',
              ppoOffered: job.ppoOffered || false,
              perks: job.perks || [],
              screeningQuestions: job.screeningQuestions || [],
              customQuestion: '',
              enableSmartRanking: job.enableSmartRanking !== false,
              enableAICandidateMatching: job.enableAICandidateMatching !== false
            });
            if (job.companyLogo) setProfileLogoUrl(job.companyLogo);
            if (job.companyBanner) setProfileBannerUrl(job.companyBanner);
            // Fetch courses and return
            try {
              const resCourses = await axios.get('/courses');
              if (resCourses.data.status === 'success') setCourses(resCourses.data.data.courses || []);
            } catch (e) {}
            return;
          }
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      }

      try {
        const res = await axios.get('/recruiter/me');
        if (res.data.status === 'success' && res.data.data.profile) {
          const p = res.data.data.profile;
          setF(prev => ({ ...prev, organization: p.companyName || '' }));
          if (p.logo) setProfileLogoUrl(p.logo);
          if (p.companyBanner) setProfileBannerUrl(p.companyBanner);
        }
      } catch (e) {}
      try {
        const res = await axios.get('/courses');
        if (res.data.status === 'success') setCourses(res.data.data.courses || []);
      } catch (e) {}
    })();
  }, [draftId]);

  const handleSubmit = async (e, asDraft) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true); setError('');
    try {
      const isInternship = f.opportunityType === 'Internship';
      const payload = {
        opportunityType: f.opportunityType,
        title: f.title, description: f.description, location: f.location,
        companyName: f.organization,
        skillsRequired: f.skills.split(',').map(s => s.trim()).filter(Boolean),
        responsibilities: f.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
        workMode: f.workMode, workSchedule: f.workSchedule,
        numberOfOpenings: Number(f.numberOfOpenings) || 1,
        candidatePreferences: f.candidatePreferences || undefined,
        screeningQuestions: f.screeningQuestions,
        enableSmartRanking: f.enableSmartRanking,
        enableAICandidateMatching: f.enableAICandidateMatching,
        companyLogo: profileLogoUrl || undefined,
        companyBanner: profileBannerUrl || undefined,
        isSpecial: f.isSpecial, courseId: f.isSpecial ? f.courseId : undefined,
        jobType: isInternship ? 'Internship' : (f.workSchedule === 'Part-Time' ? 'Part-time' : 'Full-time'),
        status: asDraft ? 'DRAFT' : 'PENDING'
      };
      if (!isInternship) {
        payload.experienceRequired = f.experienceRequired;
        payload.experienceRange = f.experienceRequired;
        payload.fixedPayMin = Number(f.fixedPayMin) || undefined;
        payload.fixedPayMax = Number(f.fixedPayMax) || undefined;
        payload.variablePayMin = Number(f.variablePayMin) || undefined;
        payload.variablePayMax = Number(f.variablePayMax) || undefined;
        payload.benefits = f.benefits;
        if (f.fixedPayMin || f.fixedPayMax) payload.salaryRange = `₹${f.fixedPayMin || 0}L - ₹${f.fixedPayMax || 0}L per year`;
      } else {
        payload.experienceRequired = 'Fresher';
        payload.internshipStartType = f.internshipStartType;
        if (f.internshipStartType === 'Later') {
          payload.internshipStartFrom = f.internshipStartFrom || undefined;
          payload.internshipStartTo = f.internshipStartTo || undefined;
        }
        payload.internshipDuration = Number(f.internshipDuration) || 1;
        payload.stipendType = f.stipendType;
        if (f.stipendType === 'Paid') {
          payload.stipendMin = Number(f.stipendMin) || undefined;
          payload.stipendMax = Number(f.stipendMax) || undefined;
          payload.stipendVariableMin = Number(f.stipendVariableMin) || undefined;
          payload.stipendVariableMax = Number(f.stipendVariableMax) || undefined;
        }
        payload.ppoOffered = f.ppoOffered;
        payload.perks = f.perks;
      }
      
      let res;
      if (draftId) {
        res = await axios.patch(`/jobs/${draftId}`, payload);
      } else {
        res = await axios.post('/jobs', payload);
      }

      if (res.data.status === 'success') {
        if (asDraft) {
          alert('Draft saved successfully');
          navigate('/app/recruiter/drafts');
        } else {
          setShowSuccessModal(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post. Check your profile.');
    } finally { setLoading(false); }
  };

  const addCustomQuestion = () => {
    if (!f.customQuestion.trim()) return;
    set('screeningQuestions', [...f.screeningQuestions, { question: f.customQuestion.trim(), isDefault: false }]);
    set('customQuestion', '');
  };
  const removeQuestion = idx => set('screeningQuestions', f.screeningQuestions.filter((_, i) => i !== idx));

  const isJob = f.opportunityType === 'Job';
  const sectionCls = "space-y-5 pt-6 border-t border-slate-100";
  const sectionTitle = (icon, text) => (
    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-1">
      {icon}{text}
    </h3>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        {error && <div className="p-4 mb-6 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200">{error}</div>}

        <form onSubmit={e => handleSubmit(e, false)} className="space-y-6">
          {/* Opportunity Type */}
          <div className="pb-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Opportunity Type</label>
            <div className="flex gap-3">
              {['Job', 'Internship'].map(t => (
                <button key={t} type="button" onClick={() => set('opportunityType', t)}
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all ${f.opportunityType === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                  {t === 'Job' ? '💼' : '🎓'} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className={sectionCls}>
            {sectionTitle(<Briefcase className="w-4 h-4 text-indigo-500" />, isJob ? 'Job Details' : 'Internship Details')}
            <Field label={isJob ? "Job Title" : "Internship Profile"} required>
              <input type="text" name="title" required value={f.title} onChange={handleChange} className={inputCls} placeholder={isJob ? "e.g. Frontend Developer" : "e.g. Marketing Intern"} />
            </Field>
            <Field label="Skills Required" required>
              <input type="text" name="skills" required value={f.skills} onChange={handleChange} className={inputCls} placeholder="e.g. React, Node.js, Typescript" />
            </Field>
            <RadioGroup label={isJob ? "Job Type" : "Internship Type"} name="workMode" value={f.workMode} options={['In Office', 'Hybrid', 'Remote']} onChange={handleChange} required />
            <RadioGroup label="Work Schedule" name="workSchedule" value={f.workSchedule} options={['Part-Time', 'Full-Time']} onChange={handleChange} required />
            {isJob && (
              <RadioGroup label="Experience Required" name="experienceRequired" value={f.experienceRequired} options={['Fresher', '1 Year', '2 Years', '3+ Years', '5+ Years']} onChange={handleChange} required />
            )}
            <Field label="Number of Openings" required>
              <input type="number" name="numberOfOpenings" min="1" required value={f.numberOfOpenings} onChange={handleChange} className={inputCls + " max-w-[160px]"} placeholder="e.g. 4" />
            </Field>

            {/* Internship-specific */}
            {!isJob && (<>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">Internship Start Date <span className="text-rose-500">*</span></label>
                <div className="flex gap-2 mb-3">
                  {['Immediate', 'Later'].map(t => (
                    <button key={t} type="button" onClick={() => set('internshipStartType', t)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${f.internshipStartType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                      {t === 'Immediate' ? 'Immediate (within 30 days)' : 'Later'}
                    </button>
                  ))}
                </div>
                {f.internshipStartType === 'Later' && (
                  <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                    <Field label="From"><input type="date" name="internshipStartFrom" value={f.internshipStartFrom} onChange={handleChange} className={inputCls} /></Field>
                    <Field label="To"><input type="date" name="internshipStartTo" value={f.internshipStartTo} onChange={handleChange} className={inputCls} /></Field>
                  </div>
                )}
              </div>
              <Field label="Internship Duration">
                <select name="internshipDuration" value={f.internshipDuration} onChange={e => set('internshipDuration', e.target.value)} className={inputCls + " max-w-[200px]"}>
                  {[1,2,3,4,5,6].map(m => <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>)}
                </select>
              </Field>
            </>)}

            <Field label={isJob ? "Job Description" : "Intern Responsibilities"} required>
              <textarea name={isJob ? "description" : "responsibilities"} required rows="4" value={isJob ? f.description : f.responsibilities} onChange={handleChange} className={inputCls} placeholder={isJob ? "Describe the role..." : "Describe intern responsibilities..."} />
            </Field>
            {!isJob && (
              <Field label="Internship Description">
                <textarea name="description" rows="3" value={f.description} onChange={handleChange} className={inputCls} placeholder="Brief overview of the internship..." />
              </Field>
            )}
            {isJob && (
              <Field label="Key Responsibilities (one per line)">
                <textarea name="responsibilities" rows="3" value={f.responsibilities} onChange={handleChange} className={inputCls} placeholder="e.g. Design user interfaces&#10;Develop core logic" />
              </Field>
            )}
            <Field label="Additional Candidate Preferences">
              <input type="text" name="candidatePreferences" value={f.candidatePreferences} onChange={handleChange} className={inputCls} placeholder="e.g. Computer Science or IT background preferred" />
            </Field>
            <Field label="Location" required>
              <input type="text" name="location" required value={f.location} onChange={handleChange} className={inputCls} placeholder="City, State or Remote" />
            </Field>
          </div>

          {/* Salary / Stipend */}
          <div className={sectionCls}>
            {sectionTitle(<span className="text-lg">💰</span>, isJob ? 'Salary & Benefits' : 'Stipend & Benefits')}
            {!isJob && (
              <RadioGroup label="Stipend" name="stipendType" value={f.stipendType} options={['Paid', 'Unpaid']} onChange={handleChange} />
            )}
            {(isJob || f.stipendType === 'Paid') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    {isJob ? 'Fixed Pay (₹ per year)' : 'Fixed Stipend (₹ per month)'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name={isJob ? "fixedPayMin" : "stipendMin"} value={isJob ? f.fixedPayMin : f.stipendMin} onChange={handleChange} className={inputCls} placeholder="Min" />
                    <input type="number" name={isJob ? "fixedPayMax" : "stipendMax"} value={isJob ? f.fixedPayMax : f.stipendMax} onChange={handleChange} className={inputCls} placeholder="Max" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Variables / Incentives (₹ {isJob ? 'per year' : 'per month'})</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name={isJob ? "variablePayMin" : "stipendVariableMin"} value={isJob ? f.variablePayMin : f.stipendVariableMin} onChange={handleChange} className={inputCls} placeholder="Min" />
                    <input type="number" name={isJob ? "variablePayMax" : "stipendVariableMax"} value={isJob ? f.variablePayMax : f.stipendVariableMax} onChange={handleChange} className={inputCls} placeholder="Max" />
                  </div>
                </div>
              </>
            )}
            {!isJob && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">Pre-Placement Offer (PPO)?</label>
                <div className="flex gap-2">
                  {[true, false].map(v => (
                    <button key={String(v)} type="button" onClick={() => set('ppoOffered', v)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all ${f.ppoOffered === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                      {v ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <CheckGroup label={isJob ? "Benefits (Select all that apply)" : "Perks (Select all that apply)"} options={isJob ? BENEFITS_OPTIONS : PERKS_OPTIONS} selected={isJob ? f.benefits : f.perks} onChange={val => set(isJob ? 'benefits' : 'perks', val)} />
          </div>

          {/* Screening Questions */}
          <div className={sectionCls}>
            {sectionTitle(<span className="text-lg">📋</span>, 'Pre-Screening Questions')}
            <p className="text-xs text-slate-500 font-medium -mt-3 mb-4">Ask questions to identify the most suitable candidates.</p>
            <div className="space-y-2">
              {f.screeningQuestions.map((q, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  <span className="text-sm text-slate-700 font-medium">{q.question}</span>
                  <div className="flex items-center gap-2">
                    {q.isDefault && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase">Default</span>}
                    <button type="button" onClick={() => removeQuestion(i)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={f.customQuestion} onChange={e => set('customQuestion', e.target.value)} className={inputCls + " flex-1"} placeholder="Type a custom question..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomQuestion())} />
              <button type="button" onClick={addCustomQuestion} className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-100">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Applicant Ranking */}
          <div className={sectionCls}>
            {sectionTitle(<Brain className="w-4 h-4 text-violet-500" />, 'Applicant Ranking')}
            <div className="space-y-3">
              {[
                { key: 'enableSmartRanking', label: 'Enable Smart Ranking', desc: 'Rank candidates automatically' },
                { key: 'enableAICandidateMatching', label: 'Enable AI Candidate Matching', desc: 'Recommend top applicants' }
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors group">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
                  </div>
                  <input type="checkbox" checked={f[key]} onChange={e => set(key, e.target.checked)}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20" />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
              Candidates will be automatically ranked based on skills and job requirements.
            </p>
          </div>

          {/* Targeting */}
          <div className={sectionCls}>
            {sectionTitle(<Sparkles className="w-4 h-4 text-blue-500" />, 'Targeting Options')}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Course-Specific Posting</p>
                  <p className="text-[11px] text-slate-500 font-medium">Limit to students of a specific course</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={f.isSpecial} onChange={e => set('isSpecial', e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              {f.isSpecial && (
                <select name="courseId" required={f.isSpecial} value={f.courseId} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm shadow-sm">
                  <option value="">Select a course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Verification Warning */}
          {isUnverified && (
            <div className="p-4 bg-amber-50 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 flex items-center gap-2">
              <span>⚠️</span><span>Your company verification is pending. This listing will be saved as a draft.</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
            <button type="button" onClick={() => navigate('/app/recruiter')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto text-center">Cancel</button>
            {!isUnverified && (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e, true)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
            )}
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-50 w-full sm:w-auto text-center">
              {loading ? 'Posting...' : isUnverified ? 'Save as Draft' : 'Publish'}
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            {isUnverified ? (
              <div className="p-8 text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-amber-100 rounded-[28px] animate-ping opacity-20" />
                  <div className="relative bg-amber-50 rounded-[28px] w-full h-full flex items-center justify-center text-amber-500">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Saved in Drafts</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                    Your {f.opportunityType.toLowerCase()} listing has been saved as a Draft because your profile is not verified yet.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Briefcase className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Status</p>
                    <p className="text-xs font-bold text-slate-700">Draft (Unpublished)</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => navigate('/app/recruiter/verify')} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    VERIFY PROFILE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => navigate('/app/recruiter/drafts')} 
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center"
                  >
                    GO TO DRAFTS
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-emerald-100 rounded-[28px] animate-ping opacity-20" />
                  <div className="relative bg-emerald-50 rounded-[28px] w-full h-full flex items-center justify-center text-emerald-500"><CheckCircle2 className="w-10 h-10" /></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Listing Transmitted</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">Your {f.opportunityType.toLowerCase()} listing has been sent for verification.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><ShieldCheck className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="text-xs font-bold text-slate-700">Awaiting Approval</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <button onClick={() => navigate('/app/recruiter')} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 group">
                  BACK TO HUB <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PostJob;
