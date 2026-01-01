import React from 'react';
import { Instagram, Youtube, Twitter, Mail, MapPin, Phone, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { cmsGeneral } = useAppContext();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
               <img src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Logo" className="w-10 h-10 object-contain" />
               <span className="text-2xl font-bold text-white">Reflect<span className="text-teal-500">&</span>Shoot</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              {cmsGeneral.footerText}
            </p>
            <div className="flex space-x-4">
              {cmsGeneral.socialInstagram !== '#' && <a href={cmsGeneral.socialInstagram} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors"><Instagram size={24} /></a>}
              {cmsGeneral.socialTwitter !== '#' && <a href={cmsGeneral.socialTwitter} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors"><Twitter size={24} /></a>}
              {cmsGeneral.socialYoutube !== '#' && <a href={cmsGeneral.socialYoutube} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors"><Youtube size={24} /></a>}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-teal-400">Yarışma Kuralları</Link></li>
              <li><Link to="/academy" className="hover:text-teal-400">Online Atölyeler</Link></li>
              <li><Link to="/finals" className="hover:text-teal-400">Ödüller</Link></li>
              <li><Link to="/faq" className="hover:text-teal-400">Sıkça Sorulan Sorular</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
            
            {/* Konya IHL */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-white uppercase mb-2">Konya Anadolu İHL</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start gap-2">
                        <MapPin size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
                        <span>Şemsi Tebrizi Mah. Vali İzzetbey Cd. No:2, Karatay/Konya</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Phone size={14} className="text-teal-500 flex-shrink-0" />
                        <span>(0332) 351 28 02</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Mail size={14} className="text-teal-500 flex-shrink-0" />
                        <a href="mailto:reflect_shoot@proton.me" className="hover:text-white transition-colors">reflect_shoot@proton.me</a>
                    </li>
                </ul>
            </div>

            {/* TIMAV */}
            <div>
                <h4 className="text-xs font-bold text-white uppercase mb-2">TİMAV</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start gap-2">
                        <MapPin size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                        <span>Şemsitebrizi, Dr. Abdullah Salim Sk. No:22, Karatay/Konya</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Phone size={14} className="text-rose-500 flex-shrink-0" />
                        <span>(0332) 350 07 96</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Mail size={14} className="text-rose-500 flex-shrink-0" />
                        <a href="mailto:bilgi@timav.org.tr" className="hover:text-white transition-colors">bilgi@timav.org.tr</a>
                    </li>
                </ul>
            </div>

          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center flex flex-col items-center gap-3">
          <p>&copy; {new Date().getFullYear()} Reflect&Shoot Kısa Film Yarışması. Tüm hakları saklıdır.</p>
          <p className="text-slate-600 text-xs flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 transition-all cursor-default font-medium">
             Designed by Yunus Emre Yılmaz with <Heart size={12} className="fill-rose-600 text-rose-600 animate-pulse" />
          </p>
        </div>
      </div>
    </footer>
  );
};