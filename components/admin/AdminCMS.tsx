
import React, { useState } from 'react';
import { CMSGeneralTab } from './cms/CMSGeneralTab';
import { CMSPrizesTab } from './cms/CMSPrizesTab';
import { CMSFaqTab } from './cms/CMSFaqTab';
import { CMSGalleryTab } from './cms/CMSGalleryTab';
import { CMSAcademyTab } from './cms/CMSAcademyTab';
import { CMSTimelineTab } from './cms/CMSTimelineTab';

export const AdminCMS: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'FAQ' | 'GALLERY' | 'ACADEMY' | 'TIMELINE' | 'PRIZES'>('GENERAL');

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-700 pb-4 overflow-x-auto">
                <button onClick={() => setActiveTab('GENERAL')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'GENERAL' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Genel & Dosyalar</button>
                <button onClick={() => setActiveTab('PRIZES')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'PRIZES' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Ödüller</button>
                <button onClick={() => setActiveTab('FAQ')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'FAQ' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>SSS</button>
                <button onClick={() => setActiveTab('GALLERY')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'GALLERY' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Galeri</button>
                <button onClick={() => setActiveTab('ACADEMY')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'ACADEMY' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Akademi</button>
                <button onClick={() => setActiveTab('TIMELINE')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'TIMELINE' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Zaman Çizelgesi</button>
            </div>

            {/* Content */}
            {activeTab === 'GENERAL' && <CMSGeneralTab />}
            {activeTab === 'PRIZES' && <CMSPrizesTab />}
            {activeTab === 'FAQ' && <CMSFaqTab />}
            {activeTab === 'GALLERY' && <CMSGalleryTab />}
            {activeTab === 'ACADEMY' && <CMSAcademyTab />}
            {activeTab === 'TIMELINE' && <CMSTimelineTab />}

            <style>{`
                .label-text { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
                .input-field { width: 100%; background-color: #0f172a; border: 1px solid #334155; border-radius: 0.75rem; padding: 0.75rem; color: white; outline: none; font-size: 0.875rem; transition: all; }
                .input-field:focus { border-color: #f59e0b; }
            `}</style>
        </div>
    );
};
