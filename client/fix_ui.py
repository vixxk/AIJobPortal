import re

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'r') as f:
    c = f.read()

# Replace components
old_components = """const Input = ({ label, type = 'text', value, onChange, placeholder, disabled, icon }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${icon ? 'pl-10' : ''}`}
            />
        </div>
    </div>
);

const Select = ({ label, value, onChange, options }) => (
    <div className="mb-4 relative">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="relative">
            <select
                value={value || ''}
                onChange={onChange}
                className="w-full py-3 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            >
                <option value="" disabled>Select</option>
                {options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 4, maxLength }) => (
    <div className="mb-4 relative">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <textarea
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
    </div>
);

const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer mb-4">
        <div className={`w-5 h-5 rounded flex justify-center items-center rounded border ${checked ? 'bg-blue-500 border-blue-500' : 'bg-slate-50 border-slate-300'}`}>
            {checked && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input type="checkbox" checked={checked || false} onChange={(e) => onChange(e.target.checked)} className="hidden" />
    </label>
);

const DatePicker = ({ label, value, onChange }) => (
    <div className="mb-4 flex-1">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="relative">
            <input
                type="date"
                value={value ? value.substring(0, 10) : ''}
                onChange={onChange}
                className="w-full py-3 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
);"""

new_components = """const Input = ({ label, type = 'text', value, onChange, placeholder, disabled, icon }) => (
    <div className="mb-5">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full py-3.5 px-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

const Select = ({ label, value, onChange, options }) => (
    <div className="mb-5 relative">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            <select
                value={value || ''}
                onChange={onChange}
                className="w-full py-3.5 px-4 pr-10 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] appearance-none"
            >
                <option value="" disabled>Select options...</option>
                {options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 4, maxLength }) => (
    <div className="mb-5 relative">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">{label}</label>}
        <textarea
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className="w-full py-4 px-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
        />
    </div>
);

const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer mb-5 p-1">
        <div className={`w-5 h-5 rounded flex justify-center items-center transition-all ${checked ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/30' : 'bg-white border-2 border-slate-300'}`}>
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <span className="text-[14px] font-medium text-slate-700">{label}</span>
        <input type="checkbox" checked={checked || false} onChange={(e) => onChange(e.target.checked)} className="hidden" />
    </label>
);

const DatePicker = ({ label, value, onChange }) => (
    <div className="mb-5 flex-1">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            <input
                type="date"
                value={value ? value.substring(0, 10) : ''}
                onChange={onChange}
                className="w-full py-3.5 px-4 pr-10 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
            />
        </div>
    </div>
);"""

c = c.replace(old_components, new_components)

c = c.replace('<div className="p-4 h-full flex flex-col bg-white min-h-screen pb-20">', '<div className="p-4 md:p-8 h-full flex flex-col bg-slate-50/50 min-h-screen pb-20 md:max-w-2xl md:mx-auto w-full">')
c = c.replace('<div className="flex-1 mt-4">', '<div className="flex-1 space-y-1 mt-6">')
c = c.replace('<div className="flex-1 space-y-4 mt-6">', '<div className="flex-1 space-y-4 mt-6">') # Just placeholder

c = c.replace('className="w-full py-4 mt-8 bg-blue-600 rounded-3xl text-white font-bold shadow-lg shadow-blue-500/30"', 'className="w-full py-4 mt-12 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all"')
c = c.replace('className="w-full py-4 mt-6 bg-blue-600 rounded-3xl text-white font-bold shadow-lg shadow-blue-500/30 shrink-0"', 'className="w-full py-4 mt-12 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all shrink-0"')

c = c.replace('className="p-4 border rounded-2xl cursor-pointer hover:bg-slate-50"', 'className="p-5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all shadow-sm"')

c = c.replace('p-4 mb-3 border border-slate-100 bg-white rounded-3xl shadow-sm cursor-pointer hover:bg-slate-50 active:scale-95 transition-all', 'p-4 mb-3 border border-slate-200 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:border-blue-200 hover:shadow-md active:scale-95 transition-all')

c = c.replace('<div className="p-4 h-full flex flex-col bg-slate-50 min-h-screen pb-20">', '<div className="p-4 md:p-8 h-full flex flex-col bg-slate-50/50 min-h-screen pb-20 md:max-w-2xl md:mx-auto w-full">')

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'w') as f:
    f.write(c)

