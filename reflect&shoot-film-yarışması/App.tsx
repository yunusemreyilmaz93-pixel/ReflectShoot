
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Apply } from './pages/Apply';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Academy } from './pages/Academy';
import { Finals } from './pages/Finals';
import { Gallery } from './pages/Gallery';
import { Admin } from './pages/Admin';
import { FAQ } from './pages/FAQ';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole } from './types';
import { ShieldAlert, Mail } from 'lucide-react';

// Scroll Restoration Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route Component
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

  // 1. Check Email Verification (Bypass for ADMIN)
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
                  <button onClick={() => resendVerificationEmail()} className="text-rose-600 font-bold hover:underline">Doğrulama mailini tekrar gönder</button>
                  <br/><br/>
                  <a href="/" className="text-gray-400 text-sm hover:text-gray-600">Ana Sayfaya Dön</a>
              </div>
          </div>
      );
  }

  // 2. Check Pending Status
  if (currentUser.role === UserRole.PENDING_TEACHER) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
              <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow-xl text-center border border-amber-100">
                  <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <ShieldAlert className="h-8 w-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Hesap Onay Bekliyor</h2>
                  <p className="text-gray-600 mb-6">
                      E-posta adresiniz doğrulandı ancak öğretmen hesabınızın yönetici tarafından onaylanması gerekmektedir.
                      <br/>
                      <span className="text-xs text-gray-400 block mt-2">(MEB k12.tr uzantılı mailler otomatik onaylanır.)</span>
                  </p>
                  <a href="/" className="text-gray-400 text-sm hover:text-gray-600">Ana Sayfaya Dön</a>
              </div>
          </div>
      );
  }

  // 3. Check Role Access
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/finals" element={<Finals />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/apply" element={
             <Apply />
          } />

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
        </Routes>
      </main>
      <Footer />
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
