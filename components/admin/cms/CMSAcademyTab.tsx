
import React, { useState } from 'react';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSAcademyItem } from '../../../types';

export const CMSAcademyTab: React.FC = () => {
    const { cmsAcademy, addCMSAcademyItem, deleteCMSAcademyItem } = useAppContext();
    const [academyForm, setAcademyForm] = useState<Partial<CMSAcademyItem>>({ title: '', description: '', type: 'LINK', url: '', category: 'Hazırlık' });

    const handleAcademyAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await addCMSAcademyItem(academyForm as CMSAcademyItem);
        setAcademyForm({ title: '', description: '', type: 'LINK', url: '', category: 'Hazırlık' });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fadeIn">
            <h3 className="font-bold text-white text-lg mb-6 border-b border-slate-700 pb-4">Yeni Eğitim İçeriği</h3>
            <form onSubmit={handleAcademyAdd} className="bg-slate-900 p-6 rounded-xl border border-slate-600 mb-8">
                <div className="grid md:grid-cols-2 gap-5 mb-4">
                    <div>
                        <label className="label-text">Başlık</label>
                        <input required value={academyForm.title} onChange={(e) => setAcademyForm({...academyForm, title: e.target.value})} className="input-field" placeholder="Senaryo 101" />
                    </div>
                    <div>
                        <label className="label-text">Kategori</label>
                        <select value={academyForm.category} onChange={(e) => setAcademyForm({...academyForm, category: e.target.value as any})} className="input-field">
                            <option value="Hazırlık">Hazırlık</option>
                            <option value="Prodüksiyon">Prodüksiyon</option>
                            <option value="Post-Prodüksiyon">Post-Prodüksiyon</option>
                        </select>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-5 mb-4">
                    <div>
                        <label className="label-text">Tip</label>
                        <select value={academyForm.type} onChange={(e) => setAcademyForm({...academyForm, type: e.target.value as any})} className="input-field">
                            <option value="PDF">PDF Dosyası</option>
                            <option value="VIDEO">Video Linki</option>
                            <option value="LINK">Harici Bağlantı</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="label-text">URL / Link</label>
                        <input required value={academyForm.url} onChange={(e) => setAcademyForm({...academyForm, url: e.target.value})} className="input-field" placeholder="https://..." />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="label-text">Açıklama</label>
                    <input value={academyForm.description} onChange={(e) => setAcademyForm({...academyForm, description: e.target.value})} className="input-field" placeholder="Kısa açıklama..." />
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 ml-auto">
                        <Plus size={16}/> Ekle
                    </button>
                </div>
            </form>

            <h3 className="font-bold text-white text-lg mb-4">Eğitim Materyalleri</h3>
            <div className="space-y-2">
                {cmsAcademy.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                                <BookOpen size={20}/>
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{item.title}</h4>
                                <p className="text-xs text-slate-500">{item.category} • {item.type}</p>
                            </div>
                        </div>
                        <button onClick={() => deleteCMSAcademyItem(item.id)} className="text-red-500 hover:bg-red-900/20 p-2 rounded-lg"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
