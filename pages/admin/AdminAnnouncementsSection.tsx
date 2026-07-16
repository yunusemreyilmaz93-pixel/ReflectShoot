
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube, PenTool, LayoutTemplate, HelpCircle, Bell, Image as ImageIcon, Megaphone, BookOpen, Calendar, Trophy, CheckCircle2, AlertOctagon, Info, ToggleRight, ToggleLeft, Power, Globe, Upload, LayoutGrid, Filter, TrendingUp, Wand2, Square, CheckSquare, MailOpen, Database, Construction, ChevronDown, Copy, AlertCircle
} from 'lucide-react';
import { ApplicationStatus, Category, Theme, Application, UserRole, LogEntry, SystemSettings, ScoreDocument, CMSGeneral, CMSFaqItem, FAQCategory, NotificationTarget, CMSGalleryItem, CMSAcademyItem, CMSTimelineItem, CMSPrize, CMSLinks, ContactMessage } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ChatArea } from '../../components/ChatArea';
import { getYouTubeEmbedUrl } from '../../lib/videoUtils';
import { AdminCMS } from '../../components/admin/AdminCMS';
import { TurkeyMap } from '../../components/TurkeyMap';
import { AdminJuryStatus } from '../../components/admin/AdminJuryStatus';
import { AdminAwards } from '../../components/admin/AdminAwards';
import { AcademicJuryScorePanel } from '../../components/AcademicJuryScorePanel';
import { AdminCertificates } from '../../components/admin/AdminCertificates';
import { writeBatch, doc, collection } from 'firebase/firestore'; // Import needed for direct batch writing
import { db } from '../../lib/firebase'; // Import db
import { authenticatedFetch } from '../../lib/authenticatedFetch';

// Removed CSV Export function since we use xlsx and jspdf now

export const AdminAnnouncements = () => {
    const { sendAnnouncement } = useAppContext();
    const [form, setForm] = useState({ title: '', message: '', target: 'ALL' as NotificationTarget, type: 'info' });
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        // Assuming sendAnnouncement handles the backend logic (Firestore add)
        await sendAnnouncement(form.target, form.title, form.message, form.type);
        setForm({ title: '', message: '', target: 'ALL', type: 'info' });
        setIsSending(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Megaphone size={24} className="text-rose-500"/> Duyuru Gönder
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Başlık</label>
                        <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none" placeholder="Duyuru Başlığı"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Hedef Kitle</label>
                            <select value={form.target} onChange={e => setForm({...form, target: e.target.value as NotificationTarget})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none">
                                <option value="ALL">Herkese</option>
                                <option value="TEACHERS">Öğretmenlere</option>
                                <option value="JUDGES">Jürilere</option>
                                <option value="FINALISTS">Finalistlere</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tür</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none">
                                <option value="info">Bilgi (Mavi)</option>
                                <option value="success">Başarı (Yeşil)</option>
                                <option value="warning">Uyarı (Sarı)</option>
                                <option value="error">Kritik (Kırmızı)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mesaj İçeriği</label>
                        <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-rose-500 outline-none h-32" placeholder="Duyuru metni..."/>
                    </div>

                    <button type="submit" disabled={isSending} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {isSending ? 'Gönderiliyor...' : <><Send size={20}/> Duyuruyu Yayınla</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

