import React, { useState } from 'react';
import axios from '../utils/axios';
import { 
    Building2, MapPin, Globe, Linkedin, ShieldCheck, 
    FileText, User, Mail, Phone, UploadCloud, CheckCircle, 
    AlertCircle, ArrowLeft, ArrowRight, Loader2, Info
} from 'lucide-react';

const CompanyTypeOptions = [
    'Private Limited',
    'Limited Company',
    'LLP',
    'Proprietorship',
    'Partnership Firm',
    'Startup',
    'NGO',
    'Educational Institution',
    'Government Organization',
    'Other'
];

const CompanyVerificationForm = ({ onClose, onSuccess, initialProfile = {} }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        companyName: initialProfile.companyName || '',
        companyAddress: initialProfile.address || '',
        city: initialProfile.city || '',
        state: initialProfile.state || '',
        country: initialProfile.country || 'India',
        companyWebsite: initialProfile.website || '',
        companyLinkedinPage: initialProfile.companyLinkedinPage || '',
        companyType: initialProfile.companyType || 'Private Limited',
        
        gstNumber: initialProfile.gstNumber || '',
        panNumber: initialProfile.panNumber || '',
        
        authorizedPersonName: initialProfile.authorizedPersonName || '',
        designation: initialProfile.designation || '',
        officialEmail: initialProfile.officialEmail || '',
        contactNumber: initialProfile.contactNumber || initialProfile.phoneNumber || '',
        declarationChecked: false
    });

    const [files, setFiles] = useState({
        gstCertificate: null,
        panCard: null,
        companyRegistrationCertificate: null,
        startupIndiaCertificate: null
    });

    const [filePreviews, setFilePreviews] = useState({
        gstCertificate: initialProfile.gstCertificate || null,
        panCard: initialProfile.panCard || null,
        companyRegistrationCertificate: initialProfile.companyRegistrationCertificate || null,
        startupIndiaCertificate: initialProfile.startupIndiaCertificate || null
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError(`File ${file.name} exceeds 10MB limit.`);
            return;
        }

        setFiles(prev => ({
            ...prev,
            [fieldName]: file
        }));

        // Generate local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreviews(prev => ({
                ...prev,
                [fieldName]: file.type.startsWith('image/') ? reader.result : 'pdf'
            }));
        };
        reader.readAsDataURL(file);
    };

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.companyName.trim()) return 'Company Name is required.';
            if (!formData.companyAddress.trim()) return 'Company Address is required.';
            if (!formData.city.trim()) return 'City is required.';
            if (!formData.state.trim()) return 'State is required.';
            if (!formData.country.trim()) return 'Country is required.';
            if (!formData.companyType) return 'Company Type is required.';
        } else if (step === 2) {
            if (!formData.panNumber.trim()) return 'PAN Number is required.';
            if (formData.panNumber.trim().length !== 10) return 'PAN Number must be 10 characters.';
            if (!formData.authorizedPersonName.trim()) return 'Representative Name is required.';
            if (!formData.designation.trim()) return 'Designation is required.';
            if (!formData.officialEmail.trim()) return 'Official Email is required.';
            if (!formData.contactNumber.trim()) return 'Contact Number is required.';
        } else if (step === 3) {
            if (!files.panCard && !filePreviews.panCard) return 'PAN Card document is required.';
            if (!files.companyRegistrationCertificate && !filePreviews.companyRegistrationCertificate) {
                return 'Company Registration Certificate is required.';
            }
            if (!formData.declarationChecked) return 'Please accept the declaration.';
        }
        return null;
    };

    const nextStep = () => {
        const err = validateStep();
        if (err) {
            setError(err);
            return;
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validateStep();
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const uploadData = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                uploadData.append(key, formData[key]);
            });

            // Append files
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    uploadData.append(key, files[key]);
                }
            });

            const res = await axios.post('/recruiter/profile/verify', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.status === 'success') {
                if (onSuccess) {
                    onSuccess(res.data.data.profile);
                }
            }
        } catch (err) {
            console.error('Failed to submit company verification', err);
            setError(err.response?.data?.message || 'Failed to submit verification details.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Company Info' },
        { num: 2, label: 'Representative' },
        { num: 3, label: 'Upload Documents' }
    ];

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-8 flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-5 sm:w-7 h-5 sm:h-7 text-indigo-400 shrink-0" />
                        Verification
                    </h2>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider leading-normal">
                        Submit company details to unlock publishing features.
                    </p>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors py-1.5 px-3 hover:bg-white/10 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shrink-0 border border-slate-700"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Stepper */}
            <div className="border-b border-slate-100 bg-slate-50 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-2 sm:gap-4">
                {steps.map((s, idx) => (
                    <React.Fragment key={s.num}>
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                                step === s.num 
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                                : step > s.num 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                                {step > s.num ? '✓' : s.num}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                                step === s.num ? 'text-indigo-600' : 'text-slate-500'
                            }`}>
                                {s.label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-indigo-200' : 'bg-slate-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 sm:mx-8 mt-4 sm:mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-rose-800">Verification Failure</p>
                        <p className="text-sm font-semibold mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-6">
                {step === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Company Legal Name *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="companyName"
                                        required
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="e.g. Acme Corporation Pvt Ltd"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Company Type *</label>
                                <select
                                    name="companyType"
                                    required
                                    value={formData.companyType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {CompanyTypeOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Head Office Address *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    name="companyAddress"
                                    required
                                    value={formData.companyAddress}
                                    onChange={handleChange}
                                    placeholder="Full street address, building, suite"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">City *</label>
                                <input 
                                    type="text" 
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="e.g. Mumbai"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">State *</label>
                                <input 
                                    type="text" 
                                    name="state"
                                    required
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="e.g. Maharashtra"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Country *</label>
                                <input 
                                    type="text" 
                                    name="country"
                                    required
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Company Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="url" 
                                        name="companyWebsite"
                                        value={formData.companyWebsite}
                                        onChange={handleChange}
                                        placeholder="https://www.acme.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">LinkedIn Page</label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="url" 
                                        name="companyLinkedinPage"
                                        value={formData.companyLinkedinPage}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/company/acme"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex gap-3 mb-2">
                            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-700 font-semibold leading-relaxed">
                                Enter your corporate tax identification details and authorized representative details. We verify representative credentials to avoid fraudulent listings.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">PAN Card Number *</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="panNumber"
                                        required
                                        maxLength={10}
                                        value={formData.panNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. ABCDE1234F"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">GST Number (Optional)</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="gstNumber"
                                        maxLength={15}
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. 27ABCDE1234F1Z5"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-2">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Representative Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        name="authorizedPersonName"
                                        required
                                        value={formData.authorizedPersonName}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Designation / Role *</label>
                                <input 
                                    type="text" 
                                    name="designation"
                                    required
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g. HR Manager / Founder"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Official Work Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        name="officialEmail"
                                        required
                                        value={formData.officialEmail}
                                        onChange={handleChange}
                                        placeholder="hr@acme.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5">Mobile / Contact Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="tel" 
                                        name="contactNumber"
                                        required
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        {/* File Upload Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* PAN Card */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">PAN Card Document *</label>
                                <span className="block text-[10px] font-bold text-slate-400 mb-2">Upload PAN Card (PDF/Image, max 10MB)</span>
                                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-colors rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[120px] overflow-hidden w-full">
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileChange(e, 'panCard')}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                                    {files.panCard ? (
                                        <p className="text-[11px] font-bold text-emerald-600 text-center truncate w-full px-3 block">
                                            Selected: {files.panCard.name}
                                        </p>
                                    ) : filePreviews.panCard ? (
                                        <p className="text-[11px] font-bold text-indigo-600 text-center">
                                            ✓ Document Attached
                                        </p>
                                    ) : (
                                        <p className="text-[11px] font-semibold text-slate-500 text-center">
                                            Click to Upload
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Registration Cert */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Company Registration Cert *</label>
                                <span className="block text-[10px] font-bold text-slate-400 mb-2">Upload Registration Cert (PDF/Image, max 10MB)</span>
                                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-colors rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[120px] overflow-hidden w-full">
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileChange(e, 'companyRegistrationCertificate')}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                                    {files.companyRegistrationCertificate ? (
                                        <p className="text-[11px] font-bold text-emerald-600 text-center truncate w-full px-3 block">
                                            Selected: {files.companyRegistrationCertificate.name}
                                        </p>
                                    ) : filePreviews.companyRegistrationCertificate ? (
                                        <p className="text-[11px] font-bold text-indigo-600 text-center">
                                            ✓ Document Attached
                                        </p>
                                    ) : (
                                        <p className="text-[11px] font-semibold text-slate-500 text-center">
                                            Click to Upload
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* GST Cert */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">GST Certificate</label>
                                <span className="block text-[10px] font-bold text-slate-400 mb-2">Upload GST Certificate (Optional)</span>
                                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-colors rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[120px] overflow-hidden w-full">
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileChange(e, 'gstCertificate')}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                                    {files.gstCertificate ? (
                                        <p className="text-[11px] font-bold text-emerald-600 text-center truncate w-full px-3 block">
                                            Selected: {files.gstCertificate.name}
                                        </p>
                                    ) : filePreviews.gstCertificate ? (
                                        <p className="text-[11px] font-bold text-indigo-600 text-center">
                                            ✓ Document Attached
                                        </p>
                                    ) : (
                                        <p className="text-[11px] font-semibold text-slate-500 text-center">
                                            Click to Upload
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Startup India Cert */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Startup India Cert</label>
                                <span className="block text-[10px] font-bold text-slate-400 mb-2">Upload Startup India Cert (Optional)</span>
                                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-colors rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[120px] overflow-hidden w-full">
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileChange(e, 'startupIndiaCertificate')}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                                    {files.startupIndiaCertificate ? (
                                        <p className="text-[11px] font-bold text-emerald-600 text-center truncate w-full px-3 block">
                                            Selected: {files.startupIndiaCertificate.name}
                                        </p>
                                    ) : filePreviews.startupIndiaCertificate ? (
                                        <p className="text-[11px] font-bold text-indigo-600 text-center">
                                            ✓ Document Attached
                                        </p>
                                    ) : (
                                        <p className="text-[11px] font-semibold text-slate-500 text-center">
                                            Click to Upload
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Declaration Checkbox */}
                        <div className="pt-4 mt-2 border-t border-slate-100 flex items-start gap-3">
                            <input 
                                type="checkbox" 
                                id="declarationChecked"
                                name="declarationChecked"
                                checked={formData.declarationChecked}
                                onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-1 cursor-pointer"
                            />
                            <label htmlFor="declarationChecked" className="text-xs text-slate-600 font-bold leading-relaxed cursor-pointer select-none">
                                I solemnly declare that all information provided is true and accurate. I am a legally authorized representative of the company and possess the necessary authority to post job listings on behalf of the company.
                            </label>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-indigo-100"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || !formData.declarationChecked}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit for Verification
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CompanyVerificationForm;
