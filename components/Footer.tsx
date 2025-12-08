
import React from 'react';
import { Instagram, Youtube, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
               <span className="text-2xl font-bold text-white">Reflect<span className="text-teal-500">&</span>Shoot</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              Gençlerin vizöründen dünyayı anlama ve anlatma çabası. 
              Asrın idrakini sinemanın diliyle buluşturan lise kısa film yarışması.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-teal-400 transition-colors"><Instagram size={24} /></a>
              <a href="#" className="hover:text-teal-400 transition-colors"><Twitter size={24} /></a>
              <a href="#" className="hover:text-teal-400 transition-colors"><Youtube size={24} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-teal-400">Yarışma Kuralları</Link></li>
              <li><Link to="/academy" className="hover:text-teal-400">Online Atölyeler</Link></li>
              <li><Link to="/finals" className="hover:text-teal-400">Geçmiş Kazananlar</Link></li>
              <li><Link to="/faq" className="hover:text-teal-400">Sıkça Sorulan Sorular</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-teal-500 mt-0.5" />
                <span>Şemsi Tebrizi Mah. Vali İzzetbey Cd.,<br/>Bölüm Sk. No:2, 42050 Karatay/Konya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-teal-500" />
                <span>(0332) 351 28 02</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-teal-500" />
                <span>reflect_shoot@proton.me</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Reflect&Shoot Kısa Film Yarışması. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};
