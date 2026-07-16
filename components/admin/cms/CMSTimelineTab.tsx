import React, { useState } from 'react';
import { Plus, Calendar, Trash2, PenTool, X, Save, Info } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSTimelineItem } from '../../../types';
import { normalizeTimelineOrder } from '../../../lib/domain/timeline';

export const CMSTimelineTab: React.FC = () => {
    const { cmsTimeline, addCMSTimelineItem, updateCMSTimelineItem, deleteCMSTimelineItem, showToast } = useAppContext();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [timelineForm, setTimelineForm] = useState<Partial<CMSTimelineItem>>({ date: '', title: '', description: '', order: Math.max(1, cmsTimeline.length + 1), targetDate: '', icon: 'Clapperboard', color: 'teal' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!timelineForm.title?.trim() || !timelineForm.date?.trim()) {
            showToast('Başlık ve tarih metni zorunludur.', 'error');
            return;
        }
        const payload: Partial<CMSTimelineItem> = {
            date: timelineForm.date.trim(),
            title: timelineForm.title.trim(),
            description: (timelineForm.description || '').trim(),
            order: normalizeTimelineOrder(timelineForm.order, cmsTimeline.length + 1),
            icon: timelineForm.icon || 'Clapperboard',
            color: timelineForm.color || 'teal',
            ...(timelineForm.targetDate ? { targetDate: timelineForm.targetDate } : {}),
        };
        setIsSaving(true);
        try {
            if (isEditing) {
                await updateCMSTimelineItem(isEditing, payload);
                setIsEditing(null);
            } else {
                await addCMSTimelineItem(payload as CMSTimelineItem);
            }
            setTimelineForm({ date: '', title: '', description: '', order: cmsTimeline.length + 1, targetDate: '', icon: 'Clapperboard', color: 'teal' });
        } catch {
            /* toast already in store */
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (item: CMSTimelineItem) => {
        setIsEditing(item.id);
        setTimelineForm({ ...item, icon: item.icon || 'Clapperboard', color: item.color || 'teal', targetDate: item.targetDate || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsEditing(null);
        setTimelineForm({ date: '', title: '', description: '', order: cmsTimeline.length + 1, targetDate: '', icon: 'Clapperboard', color: 'teal' });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fadeIn">
            <div className="mb-6 p-4 rounded-xl bg-amber-900/15 border border-amber-500/20 flex gap-3 text-sm text-amber-100/90">
                <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p>
                    Bu liste ana sayfadaki <strong className="text-white">Güncel Takvim</strong> sekmesine yansır
                    (CMS doluysa static taslak yerine CMS kullanılır). Kaydettikten sonra ana sayfayı yenileyin.
                </p>
            </div>
            <h3 className="font-bold text-white text-lg mb-6 border-b border-slate-700 pb-4 flex items-center justify-between">
                <span>{isEditing ? 'Adımı Düzenle' : 'Yeni Zaman Çizelgesi Adımı'}</span>
                {isEditing && (
                    <button type="button" onClick={handleCancel} className="text-xs text-rose-400 flex items-center gap-1 hover:underline" aria-label="Kapat">
                        <X size={14}/> Vazgeç
                    </button>
                )}
            </h3>

            <form onSubmit={handleSubmit} className={`p-6 rounded-xl border mb-8 transition-all ${isEditing ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-slate-600'}`}>
                <div className="grid md:grid-cols-4 gap-5 mb-4">
                    <div>
                        <label className="label-text" htmlFor="cms-timeline-1">Sıra No</label>
                        <input id="cms-timeline-1" type="number" required min={1} value={timelineForm.order ?? 1} onChange={(e) => setTimelineForm({...timelineForm, order: normalizeTimelineOrder(e.target.value, 1)})} className="input-field" placeholder="1" />
                    </div>
                    <div>
                        <label className="label-text" htmlFor="cms-timeline-2">Tarih Metni</label>
                        <input id="cms-timeline-2" required value={timelineForm.date} onChange={(e) => setTimelineForm({...timelineForm, date: e.target.value})} className="input-field" placeholder="20 Ocak 2026" />
                    </div>
                    <div className="col-span-2">
                        <label className="label-text" htmlFor="cms-timeline-3">Başlık</label>
                        <input id="cms-timeline-3" required value={timelineForm.title} onChange={(e) => setTimelineForm({...timelineForm, title: e.target.value})} className="input-field" placeholder="Başvuruların Başlaması" />
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-5 mb-4">
                    <div>
                        <label className="label-text" htmlFor="cms-timeline-4">Hedef Tarih (Geri Sayım İçin)</label>
                        <input id="cms-timeline-4" type="datetime-local" value={timelineForm.targetDate} onChange={(e) => setTimelineForm({...timelineForm, targetDate: e.target.value})} className="input-field [color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="label-text" htmlFor="cms-timeline-5">İkon</label>
                        <select id="cms-timeline-5" value={timelineForm.icon} onChange={(e) => setTimelineForm({...timelineForm, icon: e.target.value})} className="input-field">
                            <option value="Clapperboard">Clapperboard</option>
                            <option value="Upload">Upload</option>
                            <option value="Star">Star</option>
                            <option value="BookOpen">BookOpen</option>
                            <option value="Edit3">Edit3</option>
                            <option value="CheckCircle2">CheckCircle2</option>
                            <option value="Trophy">Trophy</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-text" htmlFor="cms-timeline-6">Renk</label>
                        <select id="cms-timeline-6" value={timelineForm.color} onChange={(e) => setTimelineForm({...timelineForm, color: e.target.value})} className="input-field">
                            <option value="teal">Teal</option>
                            <option value="rose">Rose</option>
                            <option value="amber">Amber</option>
                        </select>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="label-text" htmlFor="cms-timeline-7">Açıklama</label>
                    <input id="cms-timeline-7" value={timelineForm.description} onChange={(e) => setTimelineForm({...timelineForm, description: e.target.value})} className="input-field" placeholder="Açıklama..." />
                </div>
                <div className="text-right flex justify-end gap-3">
                    {isEditing && (
                        <button type="button" onClick={handleCancel} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                            İptal
                        </button>
                    )}
                    <button type="submit" disabled={isSaving} className={`${isEditing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-600 hover:bg-rose-500'} text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50`}>
                        {isEditing ? <><Save size={16}/> {isSaving ? 'Kaydediliyor…' : 'Güncelle'}</> : <><Plus size={16}/> {isSaving ? 'Ekleniyor…' : 'Ekle'}</>}
                    </button>
                </div>
            </form>

            <div className="space-y-2">
                {cmsTimeline.length === 0 && <p className="text-slate-500 text-center py-4">Takvim boş.</p>}
                {cmsTimeline.map(item => (
                    <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isEditing === item.id ? 'bg-blue-900/10 border-blue-500/30' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-700">
                                {item.order}
                            </div>
                            <div className={`p-3 rounded-lg ${isEditing === item.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <Calendar size={20}/>
                            </div>
                            <div>
                                <h4 className={`font-bold ${isEditing === item.id ? 'text-blue-400' : 'text-white'}`}>{item.title} <span className="text-slate-500 text-xs ml-2">({item.date})</span></h4>
                                <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handleEdit(item)} className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 p-2 rounded-lg transition-colors" title="Düzenle">
                                <PenTool size={18}/>
                            </button>
                            <button type="button" onClick={() => deleteCMSTimelineItem(item.id)} className="bg-red-900/30 text-red-400 hover:bg-red-900/50 p-2 rounded-lg transition-colors" title="Sil">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
