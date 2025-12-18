
import React, { useState } from 'react';
import { Plus, BookOpen, Trash2, PenTool, X, Save, CheckSquare, Square, Crown, FileText, Image } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSAcademyItem } from '../../../types';

export const CMSAcademyTab: React.FC = () => {
    const { cmsAcademy, addCMSAcademyItem, updateCMSAcademyItem, deleteCMSAcademyItem } = useAppContext();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [academyForm, setAcademyForm] = useState<Partial<CMSAcademyItem>>({ 
        title: '', 
        description: '', 
        type: 'LINK', 
        url: '', 
        category: 'Senaryo & Tema', 
        isStarterPack: false,
        isFinalistContent: false,
        mdFile: '',
        pdfFile: '',
        coverImage: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
             await updateCMSAcademyItem(isEditing, academyForm);
             setIsEditing(null);
        } else {
             await addCMSAcademyItem(academyForm as CMSAcademyItem);
        }
        resetForm();
    };

    const resetForm = () => {
        setAcademyForm({ 
            title: '', 
            description: '', 
            type: 'LINK', 
            url: '', 
            category: 'Senaryo & Tema', 
            isStarterPack: false, 
            isFinalistContent: false,
            mdFile: '',
            pdfFile: '',
            coverImage: ''
        });
    };

    const handleEdit = (item: CMSAcademyItem) => {
        setIsEditing(item.id);
        setAcademyForm(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsEditing(null);
        resetForm();
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
                
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-5 mb-4">
                    <div>
                        <label className="label-text">Başlık</label>
                        <input required value={academyForm.title} onChange={(e) => setAcademyForm({...academyForm, title: e.target.value})} className="input-field" placeholder="Senaryo 101" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="label-text">Kategori</label>
                            <select value={academyForm.category} onChange={(e) => setAcademyForm({...academyForm, category: e.target.value as any})} className="input-field">
                                <option value="Senaryo & Tema">Senaryo & Tema</option>
                                <option value="Teknik & Kurgu">Teknik & Kurgu</option>
                                <option value="Yapay Zeka">Yapay Zeka</option>
                                <option value="İlham & Rehber">İlham & Rehber</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="label-text">Açıklama</label>
                    <input value={academyForm.description} onChange={(e) => setAcademyForm({...academyForm, description: e.target.value})} className="input-field" placeholder="Kısa açıklama..." />
                </div>

                {/* Configuration / Links */}
                <div className="grid md:grid-cols-2 gap-6 mb-6 pt-4 border-t border-slate-700">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><FileText size={14}/> Dosya Bağlantıları (Public URL)</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="label-text text-[10px]">İndirilebilir PDF (.pdf)</label>
                                <input value={academyForm.pdfFile} onChange={(e) => setAcademyForm({...academyForm, pdfFile: e.target.value})} className="input-field text-xs" placeholder="https://pub-...r2.dev/dosya.pdf" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Image size={14}/> Görsel & Medya</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="label-text text-[10px]">Kapak Resmi URL</label>
                                <input value={academyForm.coverImage} onChange={(e) => setAcademyForm({...academyForm, coverImage: e.target.value})} className="input-field text-xs" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className="label-text text-[10px]">Tip</label>
                                    <select value={academyForm.type} onChange={(e) => setAcademyForm({...academyForm, type: e.target.value as any})} className="input-field text-xs">
                                        <option value="PDF">PDF</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="LINK">Link</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="label-text text-[10px]">Harici URL (Video/Link)</label>
                                    <input value={academyForm.url} onChange={(e) => setAcademyForm({...academyForm, url: e.target.value})} className="input-field text-xs" placeholder="https://youtube..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Flags */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => setAcademyForm({...academyForm, isStarterPack: !academyForm.isStarterPack})}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${academyForm.isStarterPack ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-950 border-slate-700'}`}
                    >
                        {academyForm.isStarterPack ? <CheckSquare className="text-green-500" size={20}/> : <Square className="text-slate-500" size={20}/>}
                        <div>
                            <span className={`block text-sm font-bold ${academyForm.isStarterPack ? 'text-green-400' : 'text-slate-400'}`}>Temel Hazırlık Seti</span>
                            <span className="text-xs text-slate-500">"Yeni Başlayanlar" filtresinde görünür.</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => setAcademyForm({...academyForm, isFinalistContent: !academyForm.isFinalistContent})}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${academyForm.isFinalistContent ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-950 border-slate-700'}`}
                    >
                        {academyForm.isFinalistContent ? <CheckSquare className="text-amber-500" size={20}/> : <Square className="text-slate-500" size={20}/>}
                        <div>
                            <span className={`block text-sm font-bold ${academyForm.isFinalistContent ? 'text-amber-400' : 'text-slate-400'}`}>Finalistlere Özel</span>
                            <span className="text-xs text-slate-500">Masterclass bölümünde ve sadece finalistlere görünür.</span>
                        </div>
                    </div>
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
                            {item.coverImage ? (
                                <img src={item.coverImage} alt="Cover" className="w-12 h-12 rounded-lg object-cover border border-slate-600"/>
                            ) : (
                                <div className={`p-3 rounded-lg ${isEditing === item.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    <BookOpen size={20}/>
                                </div>
                            )}
                            <div>
                                <h4 className={`font-bold ${isEditing === item.id ? 'text-blue-400' : 'text-white'}`}>{item.title}</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{item.category}</span>
                                    {item.isStarterPack && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900/50">Başlangıç</span>}
                                    {item.isFinalistContent && <span className="text-[10px] bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded border border-amber-900/50 flex items-center gap-1"><Crown size={10}/> Finalist</span>}
                                    {item.pdfFile && <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-900/50">PDF</span>}
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
