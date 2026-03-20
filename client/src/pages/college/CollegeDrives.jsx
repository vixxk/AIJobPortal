import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Calendar, Plus, Trash2, X, MapPin, Briefcase, Clock, Users, Award, ChevronRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  UPCOMING: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500' },
  ONGOING: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  COMPLETED: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', dot: 'bg-slate-400' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', dot: 'bg-red-400' },
};

const CollegeDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);

  const [form, setForm] = useState({
    companyName: '', driveTitle: '', description: '', roles: '',
    packageOffered: '', driveDate: '', registrationDeadline: '',
    venue: '', mode: 'OFFLINE', eligibilityCriteria: ''
  });

  const fetchDrives = async () => {
    try {
      const res = await axios.get('/college/drives');
      if (res.data.status === 'success') setDrives(res.data.data);
    } catch { setError('Failed to load drives.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrives(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post('/college/drives', form);
      setSuccess('Drive posted successfully!');
      setShowModal(false);
      setForm({ companyName: '', driveTitle: '', description: '', roles: '', packageOffered: '', driveDate: '', registrationDeadline: '', venue: '', mode: 'OFFLINE', eligibilityCriteria: '' });
      fetchDrives();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create drive.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this placement drive?')) return;
    try {
      await axios.delete(`/college/drives/${id}`);
      setDrives(drives.filter(d => d._id !== id));
    } catch { alert('Failed to delete drive.'); }
  };

  const handleStatusUpdate = async (driveId, status) => {
    try {
      await axios.patch(`/college/drives/${driveId}`, { status });
      setDrives(drives.map(d => d._id === driveId ? { ...d, status } : d));
      if (selectedDrive?._id === driveId) setSelectedDrive({ ...selectedDrive, status });
    } catch { alert('Failed to update status.'); }
  };

  const InputField = ({ label, name, type = 'text', placeholder, required, className = '' }) => (
    <div className={className}>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}{required && ' *'}</label>
      <input required={required} name={name} type={type} defaultValue={form[name]} onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Placement Drives</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Announce and manage campus recruitment drives.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-10 px-5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> Announce Drive
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Drive Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : drives.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-black text-slate-800 mb-2">No Drives Posted Yet</h3>
          <p className="text-sm text-slate-400 mb-6">Announce your first campus recruitment drive.</p>
          <button onClick={() => setShowModal(true)} className="px-6 h-10 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all">
            Post First Drive
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {drives.map(drive => {
            const cfg = statusConfig[drive.status] || statusConfig.UPCOMING;
            return (
              <div key={drive._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col overflow-hidden group">
                {/* Top */}
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-200">
                      {drive.companyName[0]}
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {drive.status}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{drive.companyName}</h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5 mb-4">{drive.driveTitle}</p>

                  <div className="space-y-2 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {new Date(drive.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    {drive.venue && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-300" /> {drive.venue}</div>}
                    <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-slate-300" />
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-slate-100 bg-slate-50 ${drive.mode === 'ONLINE' ? 'text-emerald-600' : 'text-slate-500'}`}>{drive.mode}</span>
                    </div>
                    {drive.packageOffered && <div className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-amber-400" /> <span className="text-amber-700 font-black">{drive.packageOffered}</span></div>}
                  </div>

                  {drive.roles?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {drive.roles.map((r, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 uppercase">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400">
                    <Users className="w-3 h-3" />
                    {drive.registeredStudents?.length || 0} registered · {drive.shortlistedStudents?.length || 0} shortlisted
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 p-4 flex items-center gap-2">
                  <button onClick={() => setSelectedDrive(drive)}
                    className="flex-1 h-9 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(drive._id)}
                    className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drive Detail Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDrive(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">{selectedDrive.companyName}</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedDrive.driveTitle}</p>
              </div>
              <button onClick={() => setSelectedDrive(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedDrive.description && (
                <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 font-medium">
                  {selectedDrive.description}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Drive Date', value: new Date(selectedDrive.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Mode', value: selectedDrive.mode },
                  { label: 'Package', value: selectedDrive.packageOffered || 'Not disclosed' },
                  { label: 'Venue', value: selectedDrive.venue || 'TBD' },
                  { label: 'Registered', value: selectedDrive.registeredStudents?.length || 0 },
                  { label: 'Shortlisted', value: selectedDrive.shortlistedStudents?.length || 0 },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-black text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
              {selectedDrive.eligibilityCriteria && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Eligibility</p>
                  <p className="text-sm text-slate-600 font-medium">{selectedDrive.eligibilityCriteria}</p>
                </div>
              )}
              {/* Status Update */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => {
                    const cfg = statusConfig[s];
                    return (
                      <button key={s} onClick={() => handleStatusUpdate(selectedDrive._id, s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${selectedDrive.status === s ? `${cfg.bg} ${cfg.text} ${cfg.border} scale-105 shadow-sm` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Drive Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Announce Placement Drive</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Company Name" name="companyName" placeholder="e.g. Amazon" required className="col-span-2" />
                <InputField label="Drive Title" name="driveTitle" placeholder="Campus Placement 2026" required className="col-span-2" />
                <InputField label="Drive Date" name="driveDate" type="date" required />
                <InputField label="Registration Deadline" name="registrationDeadline" type="date" />
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode</label>
                  <select name="mode" onChange={handleChange} defaultValue="OFFLINE"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all">
                    <option value="OFFLINE">Offline</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <InputField label="Package Offered" name="packageOffered" placeholder="e.g. 12-18 LPA" />
                <InputField label="Venue" name="venue" placeholder="Main Auditorium" className="col-span-2" />
                <InputField label="Roles (comma-separated)" name="roles" placeholder="SDE-1, Product Manager" className="col-span-2" />
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Eligibility Criteria</label>
                  <textarea name="eligibilityCriteria" onChange={handleChange} rows={2}
                    placeholder="e.g. 7.0+ CGPA, No active backlogs"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</label>
                  <textarea name="description" onChange={handleChange} rows={2}
                    placeholder="Brief description of the drive and company..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all resize-none" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full h-11 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {submitting ? 'Posting...' : 'Publish Drive'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeDrives;
