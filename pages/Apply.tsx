
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, School, MapPin, Lock, ArrowRight, CheckSquare, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Apply: React.FC = () => {
  const navigate = useNavigate();
  const { registerTeacher, showToast, cmsLinks } = useAppContext();
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

  return (
    <div className="bg-gray-50 min-h-screen py-24 flex flex-col justify-center sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <h1 className="text-4xl font-black text-rose-900 tracking-tight">Danışman Öğretmen Kaydı</h1>
        <p className="text-gray-500 mt-2 font-medium">
            Reflect&Shoot yarışmasına başvurmak için önce hesap oluşturun.<br/>
            E-posta doğrulamasının ardından paneliniz aktif olacaktır.
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

            <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                
                <div>
                    <label className="label flex items-center gap-2 text-slate-700"><User size={16} className="text-rose-500"/> Ad Soyad</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Örn: Ahmet Yılmaz" />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div>
                    <label className="label flex items-center gap-2 text-slate-700"><School size={16} className="text-rose-500"/> Okul Adı</label>
                    <input name="school" value={formData.school} onChange={handleChange} className="input-field" placeholder="Lise Adı" />
                    {errors.school && <p className="error-text">{errors.school}</p>}
                </div>

                <div>
                    <label className="label flex items-center gap-2 text-slate-700"><MapPin size={16} className="text-rose-500"/> Şehir / İlçe</label>
                    <input name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Şehir" />
                </div>

                <div>
                    <label className="label flex items-center gap-2 text-slate-700"><Mail size={16} className="text-rose-500"/> E-posta</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="mail@okul.com" />
                    
                     {/* k12.tr Hint - UPDATED */}
                     <div className="mt-3 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="bg-teal-100 p-1.5 rounded-full text-teal-600 mt-0.5">
                           <CheckCircle2 size={16} />
                        </div>
                        <div className="text-sm text-teal-800">
                            <span className="font-bold block text-teal-900 mb-1">Hızlı Onay Avantajı</span>
                            <span className="leading-relaxed">
                                <strong>@k12.tr</strong> uzantılı kurumsal okul e-posta adresinizle kayıt olduğunuzda, hesabınız yönetici onayı beklemeden <strong>doğrudan onaylanır</strong> ve panele hemen erişebilirsiniz.
                            </span>
                        </div>
                    </div>

                    {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div>
                    <label className="label flex items-center gap-2 text-slate-700"><Lock size={16} className="text-rose-500"/> Şifre Oluştur</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="******" />
                    {errors.password && <p className="error-text">{errors.password}</p>}
                </div>

                {/* CONSENT SECTION */}
                <div className="space-y-4 pt-4 border-t border-gray-100 mt-6">
                    {/* Consent 1 */}
                    <div className="flex items-start">
                        <input 
                            id="privacy" 
                            type="checkbox" 
                            checked={consents.privacy}
                            onChange={(e) => setConsents({...consents, privacy: e.target.checked})}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1 cursor-pointer accent-teal-600" 
                        />
                        <label htmlFor="privacy" className="ml-3 block text-sm text-gray-600">
                             <span className="cursor-pointer hover:text-teal-600 hover:underline font-bold text-gray-800" onClick={() => openModal('privacy')}>GİZLİLİK VE PLATFORM KULLANIM TAAHHÜDÜ'nü</span> okudum, kabul ediyorum.
                        </label>
                    </div>
                    {errors.privacy && <p className="error-text pl-7">{errors.privacy}</p>}

                    {/* Consent 2 */}
                    <div className="flex items-start">
                        <input 
                            id="responsibility" 
                            type="checkbox" 
                            checked={consents.responsibility}
                            onChange={(e) => setConsents({...consents, responsibility: e.target.checked})}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1 cursor-pointer accent-teal-600" 
                        />
                        <label htmlFor="responsibility" className="ml-3 block text-sm text-gray-600">
                             <span className="cursor-pointer hover:text-teal-600 hover:underline font-bold text-gray-800" onClick={() => openModal('responsibility')}>ÖĞRETMEN SORUMLULUK TAAHHÜTNAMESİ'ni</span> okudum, kabul ediyorum.
                        </label>
                    </div>
                    {errors.responsibility && <p className="error-text pl-7">{errors.responsibility}</p>}

                    {/* Consent 3 */}
                    <div className="flex items-start">
                        <input 
                            id="dataLock" 
                            type="checkbox" 
                            checked={consents.dataLock}
                            onChange={(e) => setConsents({...consents, dataLock: e.target.checked})}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1 cursor-pointer accent-teal-600" 
                        />
                        <label htmlFor="dataLock" className="ml-3 block text-sm text-gray-600">
                             <span className="cursor-pointer hover:text-teal-600 hover:underline font-bold text-gray-800" onClick={() => openModal('dataLock')}>TAKIM BİLGİLERİ KİLİTLEME ONAYI'nı</span> okudum, kabul ediyorum.
                        </label>
                    </div>
                    {errors.dataLock && <p className="error-text pl-7">{errors.dataLock}</p>}
                </div>

                <div className="pt-6">
                     <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-rose-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center shadow-xl transform transition hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Kaydediliyor...</>
                        ) : <>Kayıt Ol ve İlerle <ArrowRight size={20} className="ml-2"/></>}
                    </button>
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
