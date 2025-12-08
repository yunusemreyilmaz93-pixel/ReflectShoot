
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Local loading state for button feedback
  const { login, resendVerificationEmail, currentUser, loading: contextLoading } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showResend, setShowResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const registeredSuccess = searchParams.get('registered') === 'true';

  // Role-based redirection when user is loaded
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
    setError('');
    setShowResend(false);
    setIsLoggingIn(true);

    if (email && password) {
      try {
          await login(email, password);
          // Redirect handled by useEffect
      } catch (err: any) {
          console.error(err);
          setIsLoggingIn(false); // Only stop loading on error, otherwise wait for redirect
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
              setError('E-posta veya şifre hatalı.');
          } else if (err.code === 'auth/too-many-requests') {
              setError('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.');
          } else if (err.code === 'auth/user-disabled') {
              setError('Bu hesap devre dışı bırakılmıştır.');
          } else {
              setError('Giriş başarısız: ' + err.message);
          }
      }
    } else {
        setError('Lütfen tüm alanları doldurunuz.');
        setIsLoggingIn(false);
    }
  };

  const handleResend = async () => {
      try {
          await resendVerificationEmail();
          setResendSuccess(true);
      } catch (e) {
          setError("Doğrulama maili gönderilemedi. Lütfen bir süre bekleyip tekrar deneyin.");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-rose-900 to-rose-800 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 mb-6 border border-white/10">
             <ShieldCheck className="h-10 w-10 text-amber-400" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
          Sisteme Giriş Yap
        </h2>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Reflect&Shoot Yönetim Paneli
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
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg text-sm shadow-sm font-medium animate-fadeIn">
                    <div className="flex items-center">
                         <AlertCircle size={20} className="mr-3 flex-shrink-0"/>
                         {error}
                    </div>
                </div>
            )}
            
            {showResend && !resendSuccess && (
                <div className="text-center">
                    <button type="button" onClick={handleResend} className="text-sm text-rose-600 font-bold underline hover:text-rose-800">
                        Doğrulama mailini tekrar gönder
                    </button>
                </div>
            )}
            
            {resendSuccess && (
                 <div className="text-center text-sm text-green-600 font-bold bg-green-50 p-2 rounded">
                    Doğrulama maili gönderildi!
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
                <a href="#" className="font-bold text-rose-600 hover:text-rose-500">
                  Şifremi Unuttum
                </a>
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
