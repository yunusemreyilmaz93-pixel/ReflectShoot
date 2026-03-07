
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, School, MapPin, Lock, ArrowRight, Info, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon",
  "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale",
  "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export const Apply: React.FC = () => {
  const { registerTeacher, currentUser, showToast } = useAppContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  useEffect(() => {
    if (currentUser) {
        if(currentUser.role === UserRole.ADMIN) navigate('/admin');
        else navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.school || !formData.city || !formData.password) {
        showToast('Lütfen tüm zorunlu alanları doldurunuz.', 'error');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Şifreler eşleşmiyor.', 'error');
      return;
    }
    
    if (formData.password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır.', 'error');
        return;
    }

    if (!kvkkAccepted) {
      showToast('Lütfen KVKK metnini okuyup onaylayınız.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerTeacher(formData);
      showToast('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.', 'success');
      navigate('/login?registered=true');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        showToast('Bu e-posta adresi zaten kullanımda.', 'error');
      } else if (error.code === 'auth/weak-password') {
        showToast('Şifre çok zayıf. En az 6 karakter olmalı.', 'error');
      } else {
        showToast('Kayıt sırasında bir hata oluştu: ' + error.message, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8"
      >
        <Link to="/" className="inline-block mx-auto h-20 w-20 mb-4">
             <img src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Logo" className="w-full h-full object-contain" />
        </Link>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Danışman Öğretmen Kaydı
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Reflect&Shoot Kısa Film Yarışması için takım kaydını oluştur.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl"
      >
        <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg flex items-start gap-3">
              <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                  <strong>Önemli Bilgi:</strong>
                  <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Yalnızca <strong>Danışman Öğretmenler</strong> kayıt oluşturabilir.</li>
                      <li>Öğrenci bilgileri, giriş yaptıktan sonra panel üzerinden eklenecektir.</li>
                      <li>Kayıt sonrası e-posta doğrulaması zorunludur.</li>
                  </ul>
              </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Ad Soyad
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border outline-none"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    E-posta
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border outline-none"
                      placeholder="ornek@okul.com"
                    />
                  </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Okul Adı
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="school"
                      type="text"
                      required
                      value={formData.school}
                      onChange={handleChange}
                      className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border outline-none"
                      placeholder="Okulunuzun Tam Adı"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Şehir
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border outline-none bg-white appearance-none"
                    >
                        <option value="">Şehir Seçiniz</option>
                        {TURKEY_CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Şifre
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Şifre Tekrar
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
            </div>

            <div className="flex items-start">
                <div className="flex items-center h-5">
                <input
                    id="kvkk"
                    name="kvkk"
                    type="checkbox"
                    required
                    checked={kvkkAccepted}
                    onChange={(e) => setKvkkAccepted(e.target.checked)}
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded cursor-pointer accent-rose-600"
                />
                </div>
                <div className="ml-3 text-sm">
                <label htmlFor="kvkk" className="font-medium text-gray-700 cursor-pointer">
                    <a href="https://assets.reflectandshoot.com/acik_riza_metni.pdf" target="_blank" rel="noreferrer" className="text-rose-600 hover:text-rose-500 underline">Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</a>'ni okudum, onaylıyorum.
                </label>
                </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol ve Başla'} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                  Zaten bir hesabınız var mı? <Link to="/login" className="font-bold text-rose-600 hover:text-rose-500">Giriş Yap</Link>
              </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
