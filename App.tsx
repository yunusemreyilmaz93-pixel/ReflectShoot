
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Apply } from './pages/Apply';
import { Login } from './pages/Login';
import { Academy } from './pages/Academy';
import { AcademyDetail } from './pages/AcademyDetail';
import { Finals } from './pages/Finals';
import { Gallery } from './pages/Gallery';
import { FAQ } from './pages/FAQ';

import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole } from './types';
import { ShieldAlert, Mail, CheckCircle2, AlertCircle, Info, X, Construction, Settings, AlertTriangle } from 'lucide-react';

// Heavy authenticated / rare routes — loaded on demand (public pages stay eager).
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));
const JuryDashboard = lazy(() => import('./pages/JuryDashboard').then((m) => ({ default: m.JuryDashboard })));
const AwardParticipationForm = lazy(() =>
  import('./pages/AwardParticipationForm').then((m) => ({ default: m.AwardParticipationForm }))
);
const CinemaShowcase = lazy(() => import('./pages/CinemaShowcase').then((m) => ({ default: m.CinemaShowcase })));
const CityGuide = lazy(() => import('./pages/CityGuide').then((m) => ({ default: m.CityGuide })));

const RouteFallback = () => (
  <div className="min-h-[40vh] bg-slate-950 flex items-center justify-center" role="status" aria-label="Yükleniyor">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// --- Maintenance Page ---
const MaintenancePage = () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-8 animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Construction size={48} className="text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Sistem Bakımda</h1>
        <p className="text-lg text-slate-400 max-w-lg mb-8 leading-relaxed">
            Daha iyi bir deneyim sunmak için şu anda kısa bir bakım çalışması yapıyoruz. Lütfen biraz sonra tekrar deneyin.
        </p>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-widest border-t border-slate-800 pt-6">
            <Settings size={14} /> Reflect & Shoot Teknik Ekibi
        </div>
    </div>
);

// --- Toast Component ---
const ToastContainer = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-slideIn transition-all min-w-[300px] ${
            toast.type === 'success' ? 'bg-green-900/90 border-green-700 text-white' : 
            toast.type === 'error' ? 'bg-red-900/90 border-red-700 text-white' : 
            toast.type === 'warning' ? 'bg-amber-900/90 border-amber-700 text-white' : 
            'bg-slate-900/90 border-slate-700 text-white'
          }`}
        >
           {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-400" />}
           {toast.type === 'error' && <AlertCircle size={20} className="text-red-400" />}
           {toast.type === 'warning' && <AlertTriangle size={20} className="text-amber-400" />}
           {toast.type === 'info' && <Info size={20} className="text-blue-400" />}
           
           <span className="text-sm font-medium flex-1">{toast.message}</span>
           
           <button type="button" aria-label="Bildirimi kapat" onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white transition-colors">
              <X size={16} />
           </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { currentUser, loading, resendVerificationEmail } = useAppContext();
  
  if (loading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
      );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.emailVerified && currentUser.role !== UserRole.ADMIN) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
              <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100">
                  <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">E-posta Doğrulanmadı</h2>
                  <p className="text-gray-600 mb-6">
                      Sisteme erişebilmek için lütfen <strong>{currentUser.email}</strong> adresine gönderilen doğrulama linkine tıklayınız.
                  </p>
                  <button type="button" onClick={() => resendVerificationEmail()} className="text-rose-600 font-bold hover:underline">Doğrulama mailini tekrar gönder</button>
              </div>
          </div>
      );
  }

  if (currentUser.role === UserRole.PENDING_TEACHER) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
              <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow-xl text-center border border-amber-100">
                  <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <ShieldAlert className="h-8 w-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Hesap Onay Bekliyor</h2>
                  <p className="text-gray-600 mb-6">
                      Hesabınız yönetici onayı beklemektedir.
                  </p>
              </div>
          </div>
      );
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect logic for wrong role
    if (currentUser.role === UserRole.JUDGE) return <Navigate to="/jury" replace />;
    if (currentUser.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { systemSettings, currentUser } = useAppContext();
  const location = useLocation();

  // Maintenance Check
  if (systemSettings.features.maintenanceMode && currentUser?.role !== UserRole.ADMIN) {
      // Allow access to login so Admin can get in to disable maintenance
      if (location.pathname !== '/login') {
          return <MaintenancePage />;
      }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {/* Hide Navbar on Maintenance Page */}
      {(!systemSettings.features.maintenanceMode || currentUser?.role === UserRole.ADMIN) && <Navbar />}
      
      <ToastContainer />
      <main className="flex-grow">
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/:id" element={<AcademyDetail />} />
          <Route path="/finals" element={<Finals />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/sinema" element={<CinemaShowcase />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/city-guide" element={<CityGuide />} />
          <Route path="/award-participation/team/:teamId" element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER, UserRole.ADMIN]}>
               <AwardParticipationForm />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<Apply />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={[UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Admin />
            </ProtectedRoute>
          } />

           <Route path="/jury" element={
            <ProtectedRoute allowedRoles={[UserRole.JUDGE, UserRole.ADMIN]}>
              <JuryDashboard />
            </ProtectedRoute>
          } />
        </Routes>
        </Suspense>
      </main>
      {/* Hide Footer on Maintenance Page */}
      {(!systemSettings.features.maintenanceMode || currentUser?.role === UserRole.ADMIN) && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
