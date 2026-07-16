import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Save, Settings, Play, Sliders, Layout, RefreshCw, 
  Eye, FileDown, Type, AlertCircle, HelpCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { 
  CertificateConfig, getCertificateConfig, saveCertificateConfig, 
  generateCertificatePdfBytes, DEFAULT_ATTENDANCE_CONFIG, DEFAULT_APPRECIATION_CONFIG
} from '../../lib/certificates';
import { uploadFileToR2 } from '../../lib/cloudStorage';
import { useAppContext } from '../../context/AppContext';
import { authenticatedFetch } from '../../lib/authenticatedFetch';

export const AdminCertificates: React.FC = () => {
  const { showToast } = useAppContext();
  const [activeType, setActiveType] = useState<'ATTENDANCE' | 'APPRECIATION'>('ATTENDANCE');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Configuration State
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_ATTENDANCE_CONFIG);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  
  // Sandbox state
  const [sampleName, setSampleName] = useState('ZEYNEP NUR CEYLAN');
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Load configuration based on active tab
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const data = await getCertificateConfig(activeType);
        setConfig(data);
        // Clear selected file and preview when switching tabs
        setSelectedFile(null);
        setPreviewPdfUrl(null);
      } catch (e: any) {
        showToast('Yapılandırma yüklenemedi.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, [activeType]);

  const handleConfigChange = (field: keyof CertificateConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Upload background template to R2 and save setting
  const handleUploadTemplate = async (file: File) => {
    setUploadProgress(true);
    try {
      const customKey = activeType === 'ATTENDANCE' 
        ? 'certificates/attendance_template' 
        : 'certificates/appreciation_template';
      
      const fileKey = await uploadFileToR2(file, customKey);
      
      const updatedConfig = {
        ...config,
        templateKey: fileKey
      };
      
      setConfig(updatedConfig);
      await saveCertificateConfig(activeType, updatedConfig);
      showToast('Şablon başarıyla yüklendi ve kaydedildi.', 'success');
    } catch (error: any) {
      console.error('Template upload failed:', error);
      showToast('Şablon yüklenirken hata oluştu.', 'error');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        showToast('Lütfen sadece PDF dosyası yükleyin.', 'warning');
        return;
      }
      setSelectedFile(file);
      handleUploadTemplate(file);
    }
  };

  // Save config to Firestore
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await saveCertificateConfig(activeType, config);
      showToast('Ayarlar başarıyla kaydedildi.', 'success');
    } catch (e: any) {
      showToast('Ayarlar kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Generate dynamic PDF Preview using current local settings and either local file or R2 template
  const handleGeneratePreview = async () => {
    setPreviewLoading(true);
    try {
      let templateBytes: ArrayBuffer;
      
      // If we have a newly selected local file, use its local ArrayBuffer (instantly previewable!)
      if (selectedFile) {
        templateBytes = await selectedFile.arrayBuffer();
      } else {
        // Otherwise load from existing template key in database
        if (!config.templateKey) {
          throw new Error('Sertifika şablonu yüklü değil. Lütfen önce bir PDF şablonu yükleyin veya seçin.');
        }
        
        const viewResponse = await authenticatedFetch(`/api/view?key=${encodeURIComponent(config.templateKey)}`);
        if (!viewResponse.ok) {
          throw new Error('Şablon adresi alınamadı.');
        }
        const { signedUrl } = await viewResponse.json();
        
        const templateResponse = await fetch(signedUrl);
        if (!templateResponse.ok) {
          throw new Error('Şablon dosyası R2 sunucusundan çekilemedi.');
        }
        templateBytes = await templateResponse.arrayBuffer();
      }
      
      // Fetch the Romman font from public directory
      const fontResponse = await fetch(config.fontPath || '/fonts/RTL-Romman-Regular.ttf');
      if (!fontResponse.ok) {
        throw new Error('Yazı tipi (Romman) dosyası sistemden çekilemedi.');
      }
      const fontBytes = await fontResponse.arrayBuffer();
      
      // Process PDF
      const pdfBytes = await generateCertificatePdfBytes(templateBytes, fontBytes, sampleName, config);
      
      // Clean up previous preview URL
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const previewUrl = URL.createObjectURL(blob);
      setPreviewPdfUrl(previewUrl);
      showToast('Önizleme başarıyla oluşturuldu.', 'success');
    } catch (error: any) {
      console.error('Preview generation failed:', error);
      showToast(error.message || 'Önizleme oluşturulurken bir hata oluştu.', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Description */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">Sertifika Üretim & Şablon Ayarları</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-4xl">
            Bu bölümden öğrenciler için <strong>Katılım Belgesi</strong>, danışman öğretmenler için ise <strong>Teşekkür Belgesi</strong> şablon koordinatlarını ve yazı biçimlerini yönetebilirsiniz. Mevcut PDF dosyaları bozulmadan, sadece isim alanı bu koordinatlara tam merkezli olarak dinamik olarak eklenir.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800 pb-4 overflow-x-auto scrollbar-hide">
        <button type="button" 
          onClick={() => setActiveType('ATTENDANCE')} 
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
            activeType === 'ATTENDANCE' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders size={16} /> Student / Certificate of Attendance
        </button>
        <button type="button" 
          onClick={() => setActiveType('APPRECIATION')} 
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
            activeType === 'APPRECIATION' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders size={16} /> Teacher / Certificate of Appreciation
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Area - 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. PDF Template Upload Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Upload size={16} className="text-amber-500" /> Şablon Yükleme
              </h4>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Mevcut Dosya Anahtarı (R2)</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={config.templateKey || ''} 
                      onChange={(e) => handleConfigChange('templateKey', e.target.value)}
                      placeholder="Şablon henüz yüklenmedi..." 
                      className="input-field grow font-mono text-xs"
                      readOnly
                    />
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-xl p-6 text-center transition-all cursor-pointer relative group bg-slate-950/40">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={`p-3 rounded-xl bg-slate-900 text-slate-400 group-hover:text-amber-500 transition-colors ${uploadProgress ? 'animate-bounce' : ''}`}>
                      <Upload size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-300">Boş Şablon PDF Yükle</p>
                      <p className="text-xs text-slate-500 mt-1">Sürükle bırak yapabilir veya seçebilirsiniz</p>
                    </div>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-500/5 border border-green-500/20 px-3 py-2 rounded-lg">
                    <CheckCircle2 size={14} />
                    <span>Seçilen dosya: {selectedFile.name} (Yüklendi)</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Positioning & Font Config Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders size={16} className="text-amber-500" /> Hizalama & Koordinatlar
              </h4>

              {/* Coordinates cm */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">X Koordinatı (Sol - cm)</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={config.x} 
                    onChange={(e) => handleConfigChange('x', parseFloat(e.target.value) || 0)}
                    className="input-field font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Y Koordinatı (Üst - cm)</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={config.y} 
                    onChange={(e) => handleConfigChange('y', parseFloat(e.target.value) || 0)}
                    className="input-field font-semibold"
                  />
                </div>
              </div>

              {/* Size cm */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Kutu Genişliği (cm)</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={config.width} 
                    onChange={(e) => handleConfigChange('width', parseFloat(e.target.value) || 0)}
                    className="input-field font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Kutu Yüksekliği (cm)</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={config.height} 
                    onChange={(e) => handleConfigChange('height', parseFloat(e.target.value) || 0)}
                    className="input-field font-semibold"
                  />
                </div>
              </div>

              {/* Alignment Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Yatay Hizalama</span>
                  <select 
                    value={config.horizontalAlignment} 
                    onChange={(e) => handleConfigChange('horizontalAlignment', e.target.value)}
                    className="input-field font-semibold"
                  >
                    <option value="left">Sol (Left)</option>
                    <option value="center">Orta (Center)</option>
                    <option value="right">Sağ (Right)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Dikey Hizalama</span>
                  <select 
                    value={config.verticalAlignment} 
                    onChange={(e) => handleConfigChange('verticalAlignment', e.target.value)}
                    className="input-field font-semibold"
                  >
                    <option value="top">Üst (Top)</option>
                    <option value="center">Orta (Center)</option>
                    <option value="bottom">Alt (Bottom)</option>
                  </select>
                </div>
              </div>

              {/* Rotation and Font configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Döndürme Derecesi</span>
                  <input 
                    type="number" 
                    value={config.rotation} 
                    onChange={(e) => handleConfigChange('rotation', parseInt(e.target.value) || 0)}
                    className="input-field font-semibold"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="label-text">Metin Rengi (Hex)</span>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={config.textColor} 
                      onChange={(e) => handleConfigChange('textColor', e.target.value)}
                      className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                    />
                    <input 
                      type="text" 
                      value={config.textColor} 
                      onChange={(e) => handleConfigChange('textColor', e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Font Sizes pt */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="label-text text-[10px]">Varsayılan (pt)</span>
                  <input 
                    type="number" 
                    value={config.defaultFontSize} 
                    onChange={(e) => handleConfigChange('defaultFontSize', parseInt(e.target.value) || 24)}
                    className="input-field font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="label-text text-[10px]">Min Boyut (pt)</span>
                  <input 
                    type="number" 
                    value={config.minFontSize} 
                    onChange={(e) => handleConfigChange('minFontSize', parseInt(e.target.value) || 12)}
                    className="input-field font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="label-text text-[10px]">Max Boyut (pt)</span>
                  <input 
                    type="number" 
                    value={config.maxFontSize} 
                    onChange={(e) => handleConfigChange('maxFontSize', parseInt(e.target.value) || 36)}
                    className="input-field font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <span className="label-text">Font Dosya Yolu</span>
                <input 
                  type="text" 
                  value={config.fontPath} 
                  onChange={(e) => handleConfigChange('fontPath', e.target.value)}
                  className="input-field font-mono text-xs"
                />
              </div>

              {/* Save Configuration Button */}
              <button type="button" 
                onClick={handleSaveConfig}
                disabled={saving}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
              >
                {saving ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Yapılandırmayı Kaydet
              </button>
            </div>
          </div>

          {/* Live Preview Area - 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[670px]">
              <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <Layout size={16} className="text-amber-500" /> Sertifika Önizleme Alanı
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Sadece isim katmanı (text-overlay) eklenir</span>
              </h4>

              {/* Preview inputs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                <div className="md:col-span-8 flex flex-col gap-1.5">
                  <span className="label-text">Örnek Alıcı Adı (Türkçe Karakter Destekli)</span>
                  <input 
                    type="text" 
                    value={sampleName} 
                    onChange={(e) => setSampleName(e.target.value)}
                    placeholder="Örn: ZEYNEP NUR CEYLAN" 
                    className="input-field font-bold"
                  />
                </div>
                <div className="md:col-span-4 flex items-end">
                  <button type="button" 
                    onClick={handleGeneratePreview}
                    disabled={previewLoading || (!selectedFile && !config.templateKey)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-3 px-4 rounded-xl font-black transition-all disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 shadow-lg h-[46px]"
                  >
                    {previewLoading ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Eye size={18} />
                    )}
                    Önizle
                  </button>
                </div>
              </div>

              {/* Preview PDF Frame */}
              <div className="grow bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                {previewPdfUrl ? (
                  <iframe 
                    src={`${previewPdfUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full rounded-xl"
                    title="Sertifika Önizleme"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm gap-3">
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-full flex items-center justify-center shadow-inner">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-sm">Önizleme Hazır Değil</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Lütfen bir PDF şablonu seçin veya yükleyin, koordinatları girin ve ardından <strong>"Önizle"</strong> butonuna basın.
                      </p>
                    </div>
                  </div>
                )}
                
                {previewLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center gap-2">
                    <RefreshCw size={24} className="text-amber-500 animate-spin" />
                    <span className="text-sm font-bold text-slate-300">Önizleme PDF'i derleniyor...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .label-text { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .input-field { width: 100%; background-color: #0f172a; border: 1px solid #334155; border-radius: 0.75rem; padding: 0.75rem; color: white; outline: none; font-size: 0.875rem; transition: all; }
        .input-field:focus { border-color: #f59e0b; }
      `}</style>
    </div>
  );
};
