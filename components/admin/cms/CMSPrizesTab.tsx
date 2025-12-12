
import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSPrize } from '../../../types';

// Independent Prize Editor Component - Moved OUTSIDE to fix hook errors
const CMSPrizeEditor = ({ prizeId, label }: { prizeId: string, label: string }) => {
    const { cmsPrizes, updateCMSPrize } = useAppContext();
    const [localPrize, setLocalPrize] = useState<CMSPrize>({ id: prizeId, title: '', reward: '', description: '' });

    useEffect(() => {
         const p = cmsPrizes.find(p => p.id === prizeId);
         if(p) setLocalPrize(p);
    }, [cmsPrizes, prizeId]);

    const save = async () => {
        await updateCMSPrize(localPrize);
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 mb-4">
            <h4 className="text-amber-500 font-bold mb-4 uppercase text-xs tracking-widest">{label}</h4>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="label-text">Ödül İsmi</label>
                    <input value={localPrize.title} onChange={e => setLocalPrize({...localPrize, title: e.target.value})} className="input-field" placeholder="Altın Kamera"/>
                </div>
                <div>
                    <label className="label-text">Tutar / Değer</label>
                    <input value={localPrize.reward} onChange={e => setLocalPrize({...localPrize, reward: e.target.value})} className="input-field" placeholder="40.000 TL"/>
                </div>
            </div>
            <div className="mb-4">
                <label className="label-text">Açıklama</label>
                <textarea value={localPrize.description} onChange={e => setLocalPrize({...localPrize, description: e.target.value})} className="input-field h-20" placeholder="Kısa açıklama..."/>
            </div>
            <div className="text-right">
                <button onClick={save} className="bg-slate-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Kaydet</button>
            </div>
        </div>
    );
};

export const CMSPrizesTab: React.FC = () => {
    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-4xl animate-fadeIn">
            <h3 className="font-bold text-white text-lg border-b border-slate-700 pb-4 mb-6 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500"/> Ödül Yönetimi
            </h3>
            
            <CMSPrizeEditor prizeId="rank1" label="1. Ödül (Altın)" />
            <CMSPrizeEditor prizeId="rank2" label="2. Ödül (Gümüş)" />
            <CMSPrizeEditor prizeId="rank3" label="3. Ödül (Bronz)" />
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <CMSPrizeEditor prizeId="mention" label="Mansiyon Ödülü" />
                <CMSPrizeEditor prizeId="special" label="Jüri Özel Ödülü" />
            </div>
        </div>
    );
};
