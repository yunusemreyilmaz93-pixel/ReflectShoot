
import React from 'react';
import { Calendar
} from 'lucide-react';
// Import needed for direct batch writing
// Import db

// Removed CSV Export function since we use xlsx and jspdf now

export const ToggleSwitch = ({ checked, onChange, label, activeColor = 'bg-green-500' }: { checked: boolean, onChange: () => void, label: string, activeColor?: string }) => (
    <div 
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors group"
    >
        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
        <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? activeColor : 'bg-slate-700'}`} aria-hidden="true">
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

export const DateInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
    const inputId = `date-${label.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;
    return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col gap-1 transition-all hover:border-slate-500">
        <label htmlFor={inputId} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" aria-hidden="true" />
            <input 
                id={inputId}
                type="datetime-local" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="bg-transparent text-white text-sm font-bold outline-none w-full [color-scheme:dark]"
            />
        </div>
    </div>
    );
};

