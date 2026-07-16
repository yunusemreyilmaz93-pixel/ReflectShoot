
import React, { useState } from 'react';
import { Plus, PenTool, Trash2, Save, X, HelpCircle } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSFaqItem, FAQCategory } from '../../../types';

export const CMSFaqTab: React.FC = () => {
    const { cmsFaqs, addCMSFaq, updateCMSFaq, deleteCMSFaq } = useAppContext();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [faqForm, setFaqForm] = useState<Partial<CMSFaqItem>>({ category: 'Genel', question: '', answer: '', order: 0 });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            await updateCMSFaq(isEditing, faqForm);
            setIsEditing(null);
        } else {
            await addCMSFaq({ ...faqForm, order: cmsFaqs.length + 1 } as CMSFaqItem);
        }
        setFaqForm({ category: 'Genel', question: '', answer: '', order: 0 });
    };

    const handleEdit = (item: CMSFaqItem) => {
        setIsEditing(item.id);
        setFaqForm(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFaqForm({ category: 'Genel', question: '', answer: '', order: 0 });
    };

    const getCategoryColor = (cat: string) => {
        switch(cat) {
            case 'Genel': return 'bg-blue-900/30 text-blue-400 border-blue-800';
            case 'Teknik': return 'bg-purple-900/30 text-purple-400 border-purple-800';
            case 'Süreç & Teslim': return 'bg-amber-900/30 text-amber-400 border-amber-800';
            default: return 'bg-emerald-900/30 text-emerald-400 border-emerald-800';
        }
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fadeIn">
            <h3 className="font-bold text-white text-lg mb-6 border-b border-slate-700 pb-4 flex items-center justify-between">
                <span>{isEditing ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}</span>
                {isEditing && (
                    <button type="button" onClick={handleCancel} className="text-xs text-rose-400 flex items-center gap-1 hover:underline" aria-label="Kapat">
                        <X size={14}/> Vazgeç
                    </button>
                )}
            </h3>

            <form onSubmit={handleSubmit} className={`p-6 rounded-xl border mb-8 transition-all ${isEditing ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-slate-600'}`}>
                <div className="grid md:grid-cols-4 gap-5 mb-4">
                    <div className="md:col-span-1">
                        <label className="label-text" htmlFor="cms-faq-1">Kategori</label>
                        <select id="cms-faq-1" 
                            value={faqForm.category} 
                            onChange={(e) => setFaqForm({...faqForm, category: e.target.value as FAQCategory})}
                            className="input-field"
                        >
                            <option value="Genel">Genel</option>
                            <option value="Teknik">Teknik</option>
                            <option value="Süreç & Teslim">Süreç & Teslim</option>
                            <option value="Ödüller & Değerlendirme">Ödüller & Değerlendirme</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="label-text" htmlFor="cms-faq-2">Soru</label>
                        <input id="cms-faq-2" 
                            value={faqForm.question} 
                            onChange={(e) => setFaqForm({...faqForm, question: e.target.value})} 
                            className="input-field" 
                            placeholder="Örn: Yarışmaya kimler katılabilir?"
                            required 
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="label-text" htmlFor="cms-faq-3">Cevap</label>
                    <textarea id="cms-faq-3" 
                        value={faqForm.answer} 
                        onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})} 
                        className="input-field h-24" 
                        placeholder="Cevabı buraya yazınız..."
                        required 
                    />
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

            <h3 className="font-bold text-white text-lg mb-4">Mevcut Sorular</h3>
            <div className="space-y-3">
                {cmsFaqs.length === 0 && <p className="text-slate-500 text-center py-8">Henüz soru eklenmemiş.</p>}
                {cmsFaqs.map(faq => (
                    <div key={faq.id} className={`flex flex-col md:flex-row items-start justify-between p-4 rounded-xl border transition-all ${isEditing === faq.id ? 'bg-blue-900/10 border-blue-500/30' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                        <div className="flex items-start gap-4 mb-3 md:mb-0 flex-1">
                            <div className={`p-3 rounded-lg ${isEditing === faq.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <HelpCircle size={20}/>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getCategoryColor(faq.category)}`}>
                                        {faq.category}
                                    </span>
                                    <h4 className={`font-bold text-sm ${isEditing === faq.id ? 'text-blue-400' : 'text-white'}`}>
                                        {faq.question}
                                    </h4>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">{faq.answer}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end ml-4">
                            <button type="button" onClick={() => handleEdit(faq)} className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 p-2 rounded-lg transition-colors" title="Düzenle">
                                <PenTool size={18}/>
                            </button>
                            <button type="button" onClick={() => deleteCMSFaq(faq.id)} className="bg-red-900/30 text-red-400 hover:bg-red-900/50 p-2 rounded-lg transition-colors" title="Sil">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
