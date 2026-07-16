import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, CheckCircle, X } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, resendVerificationEmail, currentUser, loading: contextLoading, showToast, resetPassword } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showResend, setShowResend] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const registeredSuccess = searchParams.get('registered') === 'true';

  useEffect(() => {
    if (!contextLoading && currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, contextLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResend(false);
    setIsLoggingIn(true);

    if (email && password) {
      try {
          await login(email, password);
      } catch (err: any) {
          console.error(err);
          setIsLoggingIn(false);
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
              showToast('E-posta veya şifre hatalı.', 'error');
          } else if (err.code === 'auth/too-many-requests') {
              showToast('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.', 'error');
          } else if (err.code === 'auth/user-disabled') {
              showToast('Bu hesap devre dışı bırakılmıştır.', 'error');
          } else {
              showToast('Giriş başarısız: ' + err.message, 'error');
          }
      }
    } else {
        showToast('Lütfen tüm alanları doldurunuz.', 'error');
        setIsLoggingIn(false);
    }
  };

  const handleResend = async () => {
      try {
          await resendVerificationEmail();
          showToast("Doğrulama maili gönderildi!", 'success');
      } catch (e) {
          showToast("Doğrulama maili gönderilemedi.", 'error');
      }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!resetEmail) {
        showToast('Lütfen e-posta adresinizi giriniz.', 'error');
        return;
    }
    setIsResetting(true);
    try {
        await resetPassword(resetEmail);
        showToast('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', 'success');
        setShowForgotModal(false);
        setResetEmail('');
    } catch (e: any) {
        if(e.code === 'auth/user-not-found') {
            showToast('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.', 'error');
        } else {
            showToast('Bir hata oluştu. Lütfen tekrar deneyiniz.', 'error');
        }
    } finally {
        setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="mx-auto h-24 w-24 flex items-center justify-center mb-6">
             <img src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-xl" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
          Sisteme Giriş Yap
        </h2>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Reflect&Shoot Yönetim Paneli
        </p>
        <p className="mt-2 text-xs text-rose-900/60 font-semibold bg-rose-50 inline-block px-3 py-1 rounded-full">
            Danışman Öğretmenler, Jüri Üyeleri ve Yöneticiler içindir.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          
          {registeredSuccess && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded text-sm flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0"/>
                  <div>Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayınız ve ardından giriş yapınız.</div>
              </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            
            {showResend && (
                <div className="text-center">
                    <button type="button" onClick={handleResend} className="text-sm text-rose-600 font-bold underline hover:text-rose-800">
                        Doğrulama mailini tekrar gönder
                    </button>
                </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email" 
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 block w-full pl-11 sm:text-sm border-gray-200 rounded-xl p-3.5 border bg-slate-50 text-gray-900 transition-all placeholder-gray-400 font-medium"
                  placeholder="mail@okul.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 block w-full pl-11 sm:text-sm border-gray-200 rounded-xl p-3.5 border bg-slate-50 text-gray-900 transition-all placeholder-gray-400 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded cursor-pointer accent-rose-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 font-medium cursor-pointer">
                  Beni Hatırla
                </label>
              </div>

              <div className="text-sm">
                <button type="button" onClick={() => setShowForgotModal(true)} className="font-black text-rose-600 hover:text-rose-800 underline transition-colors">
                  Şifremi Unuttum
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoggingIn || contextLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-rose-900/20 text-sm font-bold text-white bg-slate-900 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn || contextLoading ? 'Giriş Yapılıyor...' : 'Güvenli Giriş Yap'} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <p className="mt-4 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1.5 font-medium">
                  <Lock size={10} /> Kişisel verileriniz KVKK kapsamında korunmaktadır.
              </p>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">
                  Henüz bir hesabınız yok mu?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/apply"
                className="w-full flex justify-center py-3.5 px-4 border-2 border-dashed border-teal-500 rounded-xl shadow-sm text-sm font-bold text-teal-700 bg-teal-50 hover:bg-white hover:border-teal-600 transition-all"
              >
                Danışman Öğretmen Kaydı Oluştur
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                      <X size={20} />
                  </button>
                  <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                          <Lock size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">Şifre Sıfırlama</h3>
                      <p className="text-slate-500 text-sm mt-2">
                          Kayıtlı e-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.
                      </p>
                  </div>
                  <form onSubmit={handleResetPassword}>
                      <input 
                         type="email" 
                         required
                         value={resetEmail}
                         onChange={(e) => setResetEmail(e.target.value)}
                         placeholder="E-posta Adresi"
                         className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 mb-4 outline-none focus:border-rose-500"
                      />
                      <button 
                        type="submit" 
                        disabled={isResetting}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors disabled:opacity-70"
                      >
                          {isResetting ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};