
import React, { useState } from 'react';
import { Plus, BookOpen, Trash2, PenTool, X, Save } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSAcademyItem } from '../../../types';

export const CMSAcademyTab: React.FC = () => {
    const { cmsAcademy, addCMSAcademyItem, updateCMSAcademyItem, deleteCMSAcademyItem } = useAppContext();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [academyForm, setAcademyForm] = useState<Partial<CMSAcademyItem>>({ title: '', description: '', type: 'LINK', url: '', category: 'Hazırlık', subTag: 'Genel' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
             await updateCMSAcademyItem(isEditing, academyForm);
             setIsEditing(null);
        } else {
             await addCMSAcademyItem(academyForm as CMSAcademyItem);
        }
        setAcademyForm({ title: '', description: '', type: 'LINK', url: '', category: 'Hazırlık', subTag: 'Genel' });
    };

    const handleEdit = (item: CMSAcademyItem) => {
        setIsEditing(item.id);
        setAcademyForm(item);
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsEditing(null);
        setAcademyForm({ title: '', description: '', type: 'LINK', url: '', category: 'Hazırlık', subTag: 'Genel' });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fadeIn">
            <h3 className="font-bold text-white text-lg mb-6 border-b border-slate-700 pb-4 flex items-center justify-between">
                <span>{isEditing ? 'İçeriği Düzenle' : 'Yeni Eğitim İçeriği Ekle'}</span>
                {isEditing && (
                    <button onClick={handleCancel} className="text-xs text-rose-400 flex items-center gap-1 hover:underline">
                        <X size={14}/> Vazgeç
                    </button>
                )}
            </h3>
            
            <form onSubmit={handleSubmit} className={`p-6 rounded-xl border mb-8 transition-all ${isEditing ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-slate-600'}`}>
                <div className="grid md:grid-cols-2 gap-5 mb-4">
                    <div>
                        <label className="label-text">Başlık</label>
                        <input required value={academyForm.title} onChange={(e) => setAcademyForm({...academyForm, title: e.target.value})} className="input-field" placeholder="Senaryo 101" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-text">Kategori</label>
                            <select value={academyForm.category} onChange={(e) => setAcademyForm({...academyForm, category: e.target.value as any})} className="input-field">
                                <option value="Hazırlık">Hazırlık</option>
                                <option value="Prodüksiyon">Prodüksiyon</option>
                                <option value="Post-Prodüksiyon">Post-Prodüksiyon</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">Alt Etiket</label>
                            <select value={academyForm.subTag} onChange={(e) => setAcademyForm({...academyForm, subTag: e.target.value as any})} className="input-field">
                                <option value="Genel">Genel</option>
                                <option value="Yapay Zeka">Yapay Zeka</option>
                                <option value="Canlı Çekim">Canlı Çekim</option>
                            </select>
                        </div>
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
                <div className="text-right flex justify-end gap-3">
                    {isEditing && (
                        <button type="button" onClick={handleCancel} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                            İptal
                        </button>
                    )}
                    <button type="submit" className={`${isEditing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-600 hover:bg-rose-500'} text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all`}>
                        {isEditing ? <><Save size={16}/> Güncelle</> : <><Plus size={16}/> Ekle</>}
                    </button>
                </div>
            </form>

            <h3 className="font-bold text-white text-lg mb-4">Mevcut Eğitim Materyalleri</h3>
            <div className="space-y-3">
                {cmsAcademy.length === 0 && <p className="text-slate-500 text-center py-4">Henüz içerik eklenmemiş.</p>}
                {cmsAcademy.map(item => (
                    <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all ${isEditing === item.id ? 'bg-blue-900/10 border-blue-500/30' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                        <div className="flex items-start md:items-center gap-4 mb-3 md:mb-0">
                            <div className={`p-3 rounded-lg ${isEditing === item.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <BookOpen size={20}/>
                            </div>
                            <div>
                                <h4 className={`font-bold ${isEditing === item.id ? 'text-blue-400' : 'text-white'}`}>{item.title}</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{item.category}</span>
                                    {item.subTag && <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{item.subTag}</span>}
                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{item.type}</span>
                                    <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline truncate max-w-[150px]">{item.url}</a>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => handleEdit(item)} className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 p-2 rounded-lg transition-colors" title="Düzenle">
                                <PenTool size={18}/>
                            </button>
                            <button onClick={() => deleteCMSAcademyItem(item.id)} className="bg-red-900/30 text-red-400 hover:bg-red-900/50 p-2 rounded-lg transition-colors" title="Sil">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
