import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { GeneralSettings } from '../types';
import { Save, Globe, Phone, Share2, LayoutTemplate, BarChart3, Loader2 } from 'lucide-react';

export const CMSPanel: React.FC = () => {
  const { cmsData, updateGeneralSettings, loading } = useAppContext();
  
  // Form verilerini yerel state'te tutuyoruz
  const [formData, setFormData] = useState<GeneralSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Veri geldiğinde formu doldur
  useEffect(() => {
    if (cmsData.general) {
      setFormData(cmsData.general);
    }
  }, [cmsData.general]);

  // Nested (iç içe) objeleri güncellemek için yardımcı fonksiyon
  const handleChange = (section: keyof GeneralSettings, field: string, value: string) => {
    if (!formData) return;
    
    setFormData(prev => {
        if (!prev) return null;
        // Eğer iç içe bir obje ise (örn: contact.phone)
        if (typeof prev[section] === 'object' && prev[section] !== null) {
            return {
                ...prev,
                [section]: {
                    ...prev[section] as any,
                    [field]: value
                }
            };
        }
        return prev;
    });
  };

  // Düz metin alanlarını güncellemek için (siteTitle gibi)
  const handleTextChange = (field: keyof GeneralSettings, value: string) => {
      if (!formData) return;
      setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
      if (formData) {
          setIsSaving(true);
          await updateGeneralSettings(formData);
          setIsSaving(false);
      }
  };

  if (loading || !formData) return (
      <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="animate-spin mr-2" /> Yükleniyor...
      </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fadeIn">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">İçerik Yönetimi (CMS)</h2>
            <p className="text-slate-400 text-sm">Sitenin yazılarını, iletişim bilgilerini ve sayaçları buradan yönetebilirsiniz.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-500 transition shadow-lg hover:shadow-rose-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Kutu: Genel Ayarlar & Hero */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-rose-500 font-bold border-b border-slate-700 pb-3">
                <LayoutTemplate size={20} />
                <h3>Site Kimliği ve Ana Sayfa</h3>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Site Başlığı (Tarayıcı Sekmesi)</label>
                    <input 
                        type="text" 
                        value={formData.siteTitle}
                        onChange={(e) => handleTextChange('siteTitle', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Meta Açıklama (SEO)</label>
                    <input 
                        type="text" 
                        value={formData.metaDescription}
                        onChange={(e) => handleTextChange('metaDescription', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ana Başlık (Hero Title)</label>
                    <input 
                        type="text" 
                        value={formData.heroTitle}
                        onChange={(e) => handleTextChange('heroTitle', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-bold text-lg focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alt Başlık (Hero Subtitle)</label>
                    <textarea 
                        value={formData.heroSubtitle}
                        onChange={(e) => handleTextChange('heroSubtitle', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none resize-none h-24"
                    />
                </div>
            </div>
          </div>

          {/* 2. Kutu: İstatistikler */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-rose-500 font-bold border-b border-slate-700 pb-3">
                <BarChart3 size={20} />
                <h3>Sayaçlar ve İstatistikler</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center">Takım</label>
                    <input 
                        type="text" 
                        value={formData.stats.teams}
                        onChange={(e) => handleChange('stats', 'teams', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-center font-black text-xl focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center">Okul</label>
                    <input 
                        type="text" 
                        value={formData.stats.schools}
                        onChange={(e) => handleChange('stats', 'schools', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-center font-black text-xl focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center">Öğrenci</label>
                    <input 
                        type="text" 
                        value={formData.stats.students}
                        onChange={(e) => handleChange('stats', 'students', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-center font-black text-xl focus:border-rose-500 outline-none"
                    />
                </div>
            </div>
            <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">İpucu:</strong> Buraya yazdığınız rakamlar ana sayfadaki sayaçlarda görünür. "10+" veya "1500" gibi metinler de yazabilirsiniz.
                </p>
            </div>
          </div>

          {/* 3. Kutu: İletişim Bilgileri */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-rose-500 font-bold border-b border-slate-700 pb-3">
                <Phone size={20} />
                <h3>İletişim Bilgileri</h3>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">E-Posta</label>
                    <input 
                        type="email" 
                        value={formData.contact.email}
                        onChange={(e) => handleChange('contact', 'email', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefon</label>
                    <input 
                        type="text" 
                        value={formData.contact.phone}
                        onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Adres</label>
                    <textarea 
                        value={formData.contact.address}
                        onChange={(e) => handleChange('contact', 'address', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none resize-none h-24"
                    />
                </div>
            </div>
          </div>

          {/* 4. Kutu: Sosyal Medya */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-rose-500 font-bold border-b border-slate-700 pb-3">
                <Share2 size={20} />
                <h3>Sosyal Medya Linkleri</h3>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instagram</label>
                    <input 
                        type="text" 
                        placeholder="https://instagram.com/..."
                        value={formData.social.instagram}
                        onChange={(e) => handleChange('social', 'instagram', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Twitter (X)</label>
                    <input 
                        type="text" 
                        placeholder="https://twitter.com/..."
                        value={formData.social.twitter}
                        onChange={(e) => handleChange('social', 'twitter', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">YouTube</label>
                    <input 
                        type="text" 
                        placeholder="https://youtube.com/..."
                        value={formData.social.youtube}
                        onChange={(e) => handleChange('social', 'youtube', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none"
                    />
                </div>
            </div>
          </div>

      </div>
    </div>
  );
};
