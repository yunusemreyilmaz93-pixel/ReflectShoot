
import React, { useState } from 'react';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSTimelineItem } from '../../../types';

export const CMSTimelineTab: React.FC = () => {
    const { cmsTimeline, addCMSTimelineItem, deleteCMSTimelineItem } = useAppContext();
    const [timelineForm, setTimelineForm] = useState<Partial<CMSTimelineItem>>({ date: '', title: '', description: '', order: 0 });

    const handleTimelineAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await addCMSTimelineItem(timelineForm as CMSTimelineItem);
        setTimelineForm({ date: '', title: '', description: '', order: cmsTimeline.length + 1 });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fadeIn">
            <h3 className="font-bold text-white text-lg mb-6 border-b border-slate-700 pb-4">Zaman Çizelgesi Adımları</h3>
            <form onSubmit={handleTimelineAdd} className="bg-slate-900 p-6 rounded-xl border border-slate-600 mb-8">
                <div className="grid md:grid-cols-3 gap-5 mb-4">
                    <div>
                        <label className="label-text">Tarih Metni</label>
                        <input required value={timelineForm.date} onChange={(e) => setTimelineForm({...timelineForm, date: e.target.value})} className="input-field" placeholder="20 Ocak 2026" />
                    </div>
                    <div className="col-span-2">
                        <label className="label-text">Başlık</label>
                        <input required value={timelineForm.title} onChange={(e) => setTimelineForm({...timelineForm, title: e.target.value})} className="input-field" placeholder="Başvuruların Başlaması" />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="label-text">Açıklama</label>
                    <input value={timelineForm.description} onChange={(e) => setTimelineForm({...timelineForm, description: e.target.value})} className="input-field" placeholder="Açıklama..." />
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 ml-auto">
                        <Plus size={16}/> Ekle
                    </button>
                </div>
            </form>

            <div className="space-y-2">
                {cmsTimeline.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                                <Calendar size={20}/>
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{item.title} <span className="text-slate-500 text-xs ml-2">({item.date})</span></h4>
                                <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                        </div>
                        <button onClick={() => deleteCMSTimelineItem(item.id)} className="text-red-500 hover:bg-red-900/20 p-2 rounded-lg"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
