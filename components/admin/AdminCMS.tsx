import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CMSGeneralTab } from './cms/CMSGeneralTab';
import { CMSPrizesTab } from './cms/CMSPrizesTab';
import { CMSFaqTab } from './cms/CMSFaqTab';
import { CMSGalleryTab } from './cms/CMSGalleryTab';
import { CMSAcademyTab } from './cms/CMSAcademyTab';
import { CMSTimelineTab } from './cms/CMSTimelineTab';

const CMS_TABS = ['GENERAL', 'PRIZES', 'FAQ', 'GALLERY', 'ACADEMY', 'TIMELINE'] as const;
type CmsTabId = (typeof CMS_TABS)[number];

function isCmsTab(v: string | null): v is CmsTabId {
  return !!v && (CMS_TABS as readonly string[]).includes(v);
}

export const AdminCMS: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('cms');
  const activeTab: CmsTabId = isCmsTab(tabParam) ? tabParam : 'GENERAL';

  const setActiveTab = useCallback(
    (tab: CmsTabId) => {
      const next = new URLSearchParams(searchParams);
      // Keep admin shell tab=CONTENT when set
      if (!next.get('tab')) next.set('tab', 'CONTENT');
      if (tab === 'GENERAL') next.delete('cms');
      else next.set('cms', tab);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const tabBtn = (id: CmsTabId, label: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
        activeTab === id
          ? 'bg-amber-500 text-black'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex gap-4 border-b border-slate-700 pb-4 overflow-x-auto">
        {tabBtn('GENERAL', 'Genel & Dosyalar')}
        {tabBtn('PRIZES', 'Ödüller')}
        {tabBtn('FAQ', 'SSS')}
        {tabBtn('GALLERY', 'Galeri')}
        {tabBtn('ACADEMY', 'Akademi')}
        {tabBtn('TIMELINE', 'Zaman Çizelgesi')}
      </div>

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
