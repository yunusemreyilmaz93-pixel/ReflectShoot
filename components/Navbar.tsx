
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Film, LogOut, LayoutDashboard, UserCircle, UserPlus, Clapperboard, Video, Vote, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  isAdmin?: boolean; 
  toggleAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout, systemSettings } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Hakkında', path: '/about' },
    { name: 'Şehir Rehberi', path: '/city-guide' }, // Added here
    { name: 'Akademi', path: '/academy' },
    { name: 'Galeri', path: '/gallery' },
    { name: 'Ödüller', path: '/finals' },
    { name: 'SSS', path: '/faq' },
  ];

  // Add Public Vote link if active
  if (systemSettings.features.publicVotingActive) {
      navLinks.splice(5, 0, { name: 'Halk Oylaması', path: '/vote' });
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const getDashboardLink = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === UserRole.ADMIN) return "/admin";
    if (currentUser.role === UserRole.JUDGE) return "/jury"; 
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (!currentUser) return "Panelim";
    if (currentUser.role === UserRole.ADMIN) return "Admin";
    if (currentUser.role === UserRole.JUDGE) return "Jüri Paneli";
    return "Panelim";
  };

  const getDashboardIcon = () => {
     if (currentUser?.role === UserRole.ADMIN) return <UserCircle size={18}/>;
     if (currentUser?.role === UserRole.JUDGE) return <Video size={18}/>;
     return <LayoutDashboard size={18}/>;
  };

  return (
    <nav className="bg-slate-950/90 backdrop-blur-md border-b border-white/5 text-white sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Reflect&Shoot Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">Reflect&Shoot</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] group-hover:text-white transition-colors">OKU, ANLA, ANLAT</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-white/10 text-amber-400 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {currentUser ? (
                 <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                   <NotificationBell />
                   
                   <Link
                      to={getDashboardLink()}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-rose-900/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
                   >
                     {getDashboardIcon()}
                     {getDashboardLabel()}
                   </Link>
                   <button 
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                      title="Çıkış Yap"
                   >
                     <LogOut size={20} />
                   </button>
                 </div>
              ) : (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
                  >
                    Giriş
                  </Link>
                  <Link
                    to="/apply"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-5 py-2 rounded-full text-sm font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <UserPlus size={16}/> Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="-mr-2 flex lg:hidden">
            {currentUser && <div className="mr-2"><NotificationBell /></div>}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden bg-slate-900 border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-bold ${
                 isActive(link.path) ? 'bg-rose-600/20 text-rose-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-white/10">
            {currentUser ? (
              <>
              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-rose-600 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg"
              >
                {getDashboardLabel()}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-center text-slate-400 hover:text-white px-4 py-3 mt-2 font-medium"
              >
                Çıkış Yap
              </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                 <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-white/5 text-white px-4 py-3 rounded-xl text-base font-bold"
                >
                  Giriş
                </Link>
                <Link
                  to="/apply"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-amber-500 text-slate-900 px-4 py-3 rounded-xl text-base font-bold shadow-lg"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
