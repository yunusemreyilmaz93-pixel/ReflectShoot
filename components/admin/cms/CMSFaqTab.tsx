
import React, { useState } from 'react';
import { Plus, PenTool, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSFaqItem, FAQCategory } from '../../../types';

export const CMSFaqTab: React.FC = () => {
    const { cmsFaqs, addCMSFaq, updateCMSFaq, deleteCMSFaq } = useAppContext();
    const [isEditingFaq, setIsEditingFaq] = useState<string | null>(null);
    const [faqForm, setFaqForm] = useState<Partial<CMSFaqItem>>({ category: 'Genel', question: '', answer: '', order: 0 });

    const startEditFaq = (faq?: CMSFaqItem) => {
        if (faq) {
            setIsEditingFaq(faq.id);
            setFaqForm(faq);
        } else {
            setIsEditingFaq('NEW');
            setFaqForm({ category: 'Genel', question: '', answer: '', order: cmsFaqs.length + 1 });
        }
    };

    const handleFaqSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditingFaq === 'NEW') {
            await addCMSFaq(faqForm as CMSFaqItem);
        } else if (isEditingFaq) {
            await updateCMSFaq(isEditingFaq, faqForm);
        }
        setIsEditingFaq(null);
        setFaqForm({ category: 'Genel', question: '', answer: '', order: 0 });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg">Sıkça Sorulan Sorular</h3>
                <button onClick={() => startEditFaq()} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                    <Plus size={16} /> Yeni Soru Ekle
                </button>
            </div>

            {isEditingFaq && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 mb-8 animate-fadeIn">
                    <h4 className="text-white font-bold mb-4">{isEditingFaq === 'NEW' ? 'Yeni Soru' : 'Soruyu Düzenle'}</h4>
                    <form onSubmit={handleFaqSave} className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className="label-text">Kategori</label>
                                <select 
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
                                <label className="label-text">Soru</label>
                                <input value={faqForm.question} onChange={(e) => setFaqForm({...faqForm, question: e.target.value})} className="input-field" required />
                            </div>
                        </div>
                        <div>
                            <label className="label-text">Cevap</label>
                            <textarea value={faqForm.answer} onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})} className="input-field h-24" required />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsEditingFaq(null)} className="px-4 py-2 text-slate-400 hover:text-white">İptal</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold">Kaydet</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {cmsFaqs.length === 0 && <p className="text-slate-500 text-center py-8">Henüz soru eklenmemiş.</p>}
                {cmsFaqs.map(faq => (
                    <div key={faq.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-start group hover:border-slate-500 transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{faq.category}</span>
                                <h4 className="font-bold text-white text-sm">{faq.question}</h4>
                            </div>
                            <p className="text-slate-400 text-xs line-clamp-1">{faq.answer}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditFaq(faq)} className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50"><PenTool size={14}/></button>
                            <button onClick={() => deleteCMSFaq(faq.id)} className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
