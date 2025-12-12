
import React, { useState, useEffect } from 'react';
import { FileText, Mail, Save } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSGeneral, CMSLinks } from '../../../types';

export const CMSGeneralTab: React.FC = () => {
    const { cmsGeneral, cmsLinks, updateCMSGeneral, updateCMSLinks } = useAppContext();
    const [generalForm, setGeneralForm] = useState<CMSGeneral>(cmsGeneral);
    const [linksForm, setLinksForm] = useState<CMSLinks>(cmsLinks);

    useEffect(() => { 
        setGeneralForm(cmsGeneral); 
        setLinksForm(cmsLinks); 
    }, [cmsGeneral, cmsLinks]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateCMSGeneral(generalForm);
        await updateCMSLinks(linksForm);
    };

    return (
        <form onSubmit={handleSave} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-4xl space-y-8 animate-fadeIn">
            {/* Documents Section */}
            <div>
                <h3 className="font-bold text-white text-lg border-b border-slate-700 pb-4 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-blue-500"/> Dosya & Döküman Linkleri
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="label-text">Yarışma Şartnamesi URL</label>
                        <input value={linksForm.specUrl} onChange={(e) => setLinksForm({...linksForm, specUrl: e.target.value})} className="input-field" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="label-text">Veli İzin Belgesi URL</label>
                        <input value={linksForm.parentalUrl} onChange={(e) => setLinksForm({...linksForm, parentalUrl: e.target.value})} className="input-field" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="label-text">KVKK Metni URL</label>
                        <input value={linksForm.kvkkUrl} onChange={(e) => setLinksForm({...linksForm, kvkkUrl: e.target.value})} className="input-field" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="label-text">Afiş / Görsel URL (Opsiyonel)</label>
                        <input value={linksForm.posterUrl} onChange={(e) => setLinksForm({...linksForm, posterUrl: e.target.value})} className="input-field" placeholder="https://..." />
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div>
                <h3 className="font-bold text-white text-lg border-b border-slate-700 pb-4 mb-6 flex items-center gap-2">
                    <Mail size={20} className="text-green-500"/> İletişim Bilgileri
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="label-text">E-posta Adresi</label>
                        <input value={generalForm.contactEmail} onChange={(e) => setGeneralForm({...generalForm, contactEmail: e.target.value})} className="input-field" />
                    </div>
                    <div>
                        <label className="label-text">Telefon</label>
                        <input value={generalForm.contactPhone} onChange={(e) => setGeneralForm({...generalForm, contactPhone: e.target.value})} className="input-field" />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="label-text">Adres</label>
                    <textarea value={generalForm.contactAddress} onChange={(e) => setGeneralForm({...generalForm, contactAddress: e.target.value})} className="input-field h-24 resize-none" />
                </div>
            </div>

            <div className="pt-4 text-right">
                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ml-auto">
                    <Save size={18} /> Tüm Ayarları Kaydet
                </button>
            </div>
        </form>
    );
};
