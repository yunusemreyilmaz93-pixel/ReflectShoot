
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { CMSGalleryItem } from '../../../types';

export const CMSGalleryTab: React.FC = () => {
    const { cmsGallery, addCMSGalleryItem, deleteCMSGalleryItem } = useAppContext();
    const [galleryForm, setGalleryForm] = useState<Partial<CMSGalleryItem>>({ src: '', alt: '', category: '2025 Gala', year: '2025' });

    const handleGalleryAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!galleryForm.src) return;
        await addCMSGalleryItem(galleryForm as CMSGalleryItem);
        setGalleryForm({ src: '', alt: '', category: '2025 Gala', year: '2025' });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-fadeIn">
            <h3 className="font-bold text-white text-lg mb-6 border-b border-slate-700 pb-4">Yeni Fotoğraf Ekle</h3>
            
            <form onSubmit={handleGalleryAdd} className="bg-slate-900 p-6 rounded-xl border border-slate-600 mb-8">
                <div className="grid md:grid-cols-2 gap-5 mb-4">
                    <div>
                        <label className="label-text">Resim URL (Link)</label>
                        <input required value={galleryForm.src} onChange={(e) => setGalleryForm({...galleryForm, src: e.target.value})} placeholder="https://..." className="input-field" />
                        <p className="text-[10px] text-slate-500 mt-1">* Doğrudan resim bağlantısı giriniz (Örn: .jpg, .png ile biten).</p>
                    </div>
                    <div>
                        <label className="label-text">Açıklama (Alt Metin)</label>
                        <input required value={galleryForm.alt} onChange={(e) => setGalleryForm({...galleryForm, alt: e.target.value})} placeholder="Ödül Töreni" className="input-field" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5 mb-4">
                    <div>
                        <label className="label-text">Kategori</label>
                        <input value={galleryForm.category} onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})} className="input-field" />
                    </div>
                    <div>
                        <label className="label-text">Yıl</label>
                        <input value={galleryForm.year} onChange={(e) => setGalleryForm({...galleryForm, year: e.target.value})} className="input-field" />
                    </div>
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 ml-auto">
                        <Plus size={16}/> Fotoğrafı Ekle
                    </button>
                </div>
            </form>

            <h3 className="font-bold text-white text-lg mb-4">Mevcut Fotoğraflar</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cmsGallery.length === 0 && <p className="text-slate-500 col-span-4 text-center py-4">Galeri boş.</p>}
                {cmsGallery.map(item => (
                    <div key={item.id} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                        <img src={item.src} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                            <p className="text-white text-xs font-bold mb-2">{item.alt}</p>
                            <button onClick={() => deleteCMSGalleryItem(item.id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-500">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300 w-full">
                            {item.category} ({item.year})
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
