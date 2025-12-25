
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, School, MapPin, Lock, ArrowRight, CheckSquare, X, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

export const Apply: React.FC = () => {
  const navigate = useNavigate();
  const { registerTeacher, showToast, cmsLinks, currentUser, loading } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ 
      name: '', 
      school: '', 
      email: '', 
      password: '', 
      city: '' 
  });

  // Consent States
  const [consents, setConsents] = useState({
      privacy: false,
      responsibility: false,
      dataLock: false
  });

  // Modal State
  const [modalContent, setModalContent] = useState<{title: string, content: React.ReactNode} | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && currentUser) {
        if (currentUser.role === UserRole.ADMIN) {
            navigate('/admin');
        } else if (currentUser.role === UserRole.JUDGE) {
            navigate('/jury');
        } else {
            navigate('/dashboard');
        }
    }
  }, [currentUser, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  };

  const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!formData.name) newErrors.name = "Ad Soyad gereklidir";
      if (!formData.school) newErrors.school = "Okul bilgisi gereklidir";
      if (!formData.email) newErrors.email = "E-posta gereklidir";
      if (!formData.password) newErrors.password = "Şifre belirleyiniz";
      if (formData.password && formData.password.length < 6) newErrors.password = "Şifre en az 6 karakter olmalıdır";
      
      // Consent Validation
      if (!consents.privacy) newErrors.privacy = "Gizlilik taahhüdü onaylanmalıdır.";
      if (!consents.responsibility) newErrors.responsibility = "Öğretmen sorumluluk beyanı onaylanmalıdır.";
      if (!consents.dataLock) newErrors.dataLock = "Bilgi kilitleme onayı gereklidir.";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
        showToast('Lütfen formdaki hataları gideriniz.', 'error');
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
        await registerTeacher({
            name: formData.name,
            school: formData.school,
            city: formData.city || 'Belirtilmedi',
            email: formData.email,
            password: formData.password
        });
        
        showToast('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
        navigate('/login?registered=true');
        
    } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
            setSubmitError("Bu e-posta adresi zaten kullanımda.");
            showToast("Bu e-posta adresi zaten kullanımda.", 'error');
        } else if (error.code === 'auth/weak-password') {
            setSubmitError("Şifre çok zayıf.");
            showToast("Şifre çok zayıf.", 'error');
        } else {
            setSubmitError("Kayıt sırasında bir hata oluştu: " + error.message);
            showToast("Kayıt başarısız.", 'error');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const openModal = (type: 'privacy' | 'responsibility' | 'dataLock') => {
      switch(type) {
          case 'privacy':
              setModalContent({
                  title: "GİZLİLİK VE PLATFORM KULLANIM TAAHHÜDÜ",
                  content: (
                      <div className="space-y-4 text-gray-700">
                          <p>Reflect&Shoot platformunu kullanırken:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>Hesabımı güvenli şekilde kullanacağımı,</li>
                              <li>Zararlı yazılım, spam veya uygunsuz içerik yüklemeyeceğimi,</li>
                              <li>Başka kullanıcı hesaplarına müdahale etmeyeceğimi,</li>
                              <li>Paylaştığım tüm içeriklerin yasal sorumluluğunun bana ait olduğunu,</li>
                              <li>Organizasyonun kurallara aykırı içerikleri kaldırma hakkı bulunduğunu</li>
                          </ul>
                          <p className="font-bold">kabul ederim.</p>
                          {cmsLinks.kvkkUrl && (
                              <div className="mt-4 pt-4 border-t">
                                  <a href={cmsLinks.kvkkUrl} target="_blank" className="text-teal-600 hover:underline font-bold">KVKK Metnini İncele</a>
                              </div>
                          )}
                      </div>
                  )
              });
              break;
          case 'responsibility':
              setModalContent({
                  title: "ÖĞRETMEN SORUMLULUK TAAHHÜTNAMESİ",
                  content: (
                      <div className="space-y-4 text-gray-700">
                          <p>Reflect&Shoot yarışmasına katılan takımların rehber öğretmeni olarak:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>Öğrencilere sadece danışmanlık sağladığımı,</li>
                              <li>Projeyi bizzat hazırlamadığımı,</li>
                              <li>İçeriğin telif, etik ve okul kurallarına uygun olduğunu kontrol ettiğimi,</li>
                              <li>Öğrenci bilgilerinin gizliliğini koruyacağımı,</li>
                              <li>Kurallara aykırı durumda takımın yarışmadan elenebileceğini bildiğimi</li>
                          </ul>
                          <p className="font-bold">kabul ederim.</p>
                      </div>
                  )
              });
              break;
          case 'dataLock':
              setModalContent({
                  title: "TAKIM BİLGİLERİ KİLİTLEME ONAYI",
                  content: (
                      <div className="space-y-4 text-gray-700">
                          <p>Kayıt işlemi tamamlandığında:</p>
                          <ul className="list-disc pl-5 space-y-2">
                              <li>Takım adı,</li>
                              <li>Kategori seçimi,</li>
                              <li>Logo,</li>
                              <li>Öğretmen bilgisi,</li>
                              <li>Öğrenci kimlik bilgileri</li>
                          </ul>
                          <p className="bg-red-50 p-3 rounded border border-red-200 text-red-700 font-medium">
                              güvenlik ve kayıt prensipleri gereği sistem tarafından kilitlenecektir.
                              Bu bilgilerin daha sonra değiştirilmesinin mümkün olmadığını kabul ederim.
                          </p>
                      </div>
                  )
              });
              break;
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
      );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-24 flex flex-col justify-center sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <h1 className="text-4xl font-black text-rose-900 tracking-tight">Danışman Öğretmen Kaydı</h1>
        <p className="text-gray-500 mt-2 font-medium flex flex-col items-center gap-1">
            <span>Reflect&Shoot yarışmasına başvurmak için önce hesap oluşturun.</span>
            <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full text-xs">
               <Clock size={14} /> Kayıt işlemi yaklaşık 2–3 dakika sürer.
            </span>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-rose-500"></div>
            
            {submitError && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0"/>
                    <div>{submitError}</div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
                
                {/* --- HESAP BİLGİLERİ KARTI --- */}
                <div className="space-y-5">
                    <h3 className="text-lg font-black text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <User size={20} className="text-rose-500"/> Hesap Bilgileri
                    </h3>
                    
                    <div>
                        <label className="label flex items-center gap-2 text-slate-700">Ad Soyad</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Örn: Ahmet Yılmaz" />
                        {errors.name && <p className="error-text">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="label flex items-center gap-2 text-slate-700">Okul Adı</label>
                        <input name="school" value={formData.school} onChange={handleChange} className="input-field" placeholder="Örn: Konya Anadolu İmam Hatip Lisesi" />
                        {errors.school && <p className="error-text">{errors.school}</p>}
                    </div>

                    <div>
                        <label className="label flex items-center gap-2 text-slate-700">Şehir / İlçe</label>
                        <input name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Şehir" />
                    </div>

                    <div>
                        <label className="label flex items-center gap-2 text-slate-700">E-posta</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="mail@okul.com" />
                        
                        {/* k12.tr Hint */}
                        <div className="mt-3 bg-teal-50 border border-teal-100 rounded-lg p-3 flex items-start gap-3">
                            <div className="bg-teal-100 p-1 rounded-full text-teal-600 mt-0.5 flex-shrink-0">
                               <CheckCircle2 size={14} />
                            </div>
                            <div className="text-xs text-teal-800 leading-relaxed">
                                <strong className="font-bold text-teal-900">İpucu:</strong> <strong>@k12.tr</strong> uzantılı kurumsal e-posta adresinizle kayıt olduğunuzda, hesabınız yönetici onayı beklemeden <strong>doğrudan onaylanır</strong>.
                            </div>
                        </div>

                        {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="label flex items-center gap-2 text-slate-700">Şifre Oluştur</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="******" />
                        {errors.password && <p className="error-text">{errors.password}</p>}
                    </div>
                </div>

                {/* --- YASAL ONAYLAR BLOĞU --- */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <CheckSquare size={14} className="text-teal-600"/> Yasal Onaylar ve Sorumluluklar
                    </h4>
                    
                    <p className="text-[11px] text-slate-500 italic mb-4">
                        Bu onaylar, yarışma sürecinin sağlıklı ve adil yürütülmesi için zorunludur.
                    </p>

                    <div className="space-y-3">
                        {/* Consent 1 */}
                        <div className="flex items-start">
                            <input 
                                id="privacy" 
                                type="checkbox" 
                                checked={consents.privacy}
                                onChange={(e) => setConsents({...consents, privacy: e.target.checked})}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5 cursor-pointer accent-teal-600" 
                            />
                            <label htmlFor="privacy" className="ml-2 block text-xs text-gray-600 leading-snug">
                                 <span className="cursor-pointer hover:text-teal-600 hover:underline font-bold text-gray-800" onClick={() => openModal('privacy')}>GİZLİLİK VE PLATFORM KULLANIM TAAHHÜDÜ'nü</span> okudum, kabul ediyorum.
                            </label>
                        </div>
                        {errors.privacy && <p className="error-text pl-6">{errors.privacy}</p>}

                        {/* Consent 2 */}
                        <div className="flex items-start">
                            <input 
                                id="responsibility" 
                                type="checkbox" 
                                checked={consents.responsibility}
                                onChange={(e) => setConsents({...consents, responsibility: e.target.checked})}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5 cursor-pointer accent-teal-600" 
                            />
                            <label htmlFor="responsibility" className="ml-2 block text-xs text-gray-600 leading-snug">
                                 <span className="cursor-pointer hover:text-teal-600 hover:underline font-bold text-gray-800" onClick={() => openModal('responsibility')}>ÖĞRETMEN SORUMLULUK TAAHHÜTNAMESİ'ni</span> okudum, kabul ediyorum.
                            </label>
                        </div>
                        {errors.responsibility && <p className="error-text pl-6">{errors.responsibility}</p>}

                        {/* Consent 3 */}
                        <div className="flex items-start">
                            <input 
                                id="dataLock" 
                                type="checkbox" 
                                checked={consents.dataLock}
                                onChange={(e) => setConsents({...consents, dataLock: e.target.checked})}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5 cursor-pointer accent-teal-600" 
                            />
                            <label htmlFor="dataLock" className="ml-2 block text-xs text-gray-600 leading-snug">
                                 <span className="cursor-pointer hover:text-teal-600 hover:underline font-bold text-gray-800" onClick={() => openModal('dataLock')}>TAKIM BİLGİLERİ KİLİTLEME ONAYI'nı</span> okudum, kabul ediyorum.
                            </label>
                        </div>
                        {errors.dataLock && <p className="error-text pl-6">{errors.dataLock}</p>}
                    </div>
                </div>

                <div className="pt-2">
                     <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-rose-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center shadow-xl transform transition hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Kaydediliyor...</>
                        ) : <>Kayıt Ol ve İlerle <ArrowRight size={20} className="ml-2"/></>}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                        E-posta doğrulamasından sonra paneliniz aktif olacaktır.
                    </p>
                </div>
            </form>
            
            <div className="mt-8 text-center text-sm">
                <p className="text-gray-500">Zaten hesabınız var mı?</p>
                <a href="#/login" className="font-bold text-rose-600 hover:text-rose-500">Giriş Yap</a>
            </div>
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative animate-fadeIn border border-gray-100">
                  <button onClick={() => setModalContent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                      <X size={24} />
                  </button>
                  <h3 className="text-lg font-bold text-rose-900 mb-6 pr-8 border-b border-gray-100 pb-4 flex items-center gap-3">
                      <Info size={24} className="text-teal-500"/>
                      {modalContent.title}
                  </h3>
                  <div className="mb-8 text-gray-600 leading-relaxed text-sm">
                      {modalContent.content}
                  </div>
                  <button onClick={() => setModalContent(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">
                      Kapat
                  </button>
              </div>
          </div>
      )}

      <style>{`
        .input-field {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 0.875rem 1rem;
            outline: none;
            transition: all 0.2s;
            background-color: #f8fafc;
            color: #1e293b;
            font-weight: 500;
        }
        .input-field:focus {
            border-color: #f43f5e;
            box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1);
            background-color: white;
        }
        .label {
            display: flex;
            font-size: 0.875rem;
            font-weight: 700;
            color: #475569;
            margin-bottom: 0.5rem;
        }
        .error-text {
            color: #e11d48;
            font-size: 0.75rem;
            margin-top: 0.35rem;
            font-weight: 600;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
