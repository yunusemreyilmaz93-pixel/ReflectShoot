
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

export const AdminInbox = () => {
    const { contactMessages, markContactMessageAsRead, replyToContactMessage, deleteContactMessage } = useAppContext();
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const filtered = contactMessages.filter(m => filter === 'ALL' || (filter === 'UNREAD' && m.status === 'UNREAD'));

    const handleReply = async (msgId: string) => {
        if (!replyText.trim()) return;
        await replyToContactMessage(msgId, replyText);
        setReplyingTo(null);
        setReplyText('');
    };

    const handleDelete = async (msgId: string) => {
        if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
        await deleteContactMessage(msgId);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex gap-4 border-b border-slate-700 pb-4">
                <button type="button" onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Tümü</button>
                <button type="button" onClick={() => setFilter('UNREAD')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'UNREAD' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Okunmamış</button>
            </div>
            
            <div className="grid gap-4">
                {filtered.length === 0 && (
                    <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
                        <p className="text-slate-300 font-bold mb-1">
                            {filter === 'UNREAD' ? 'Okunmamış mesaj yok' : 'Gelen kutusu boş'}
                        </p>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            {filter === 'UNREAD'
                                ? 'Tümü filtresine geçerek geçmiş mesajlara bakabilirsiniz.'
                                : 'İletişim formu ve panel sohbetinden gelen mesajlar burada görünür.'}
                        </p>
                    </div>
                )}
                {filtered.map(msg => (
                    <div key={msg.id} className={`bg-slate-800 p-6 rounded-xl border transition-all ${msg.status === 'UNREAD' ? 'border-rose-500/50 shadow-lg shadow-rose-900/10' : 'border-slate-700 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    {msg.title}
                                    {msg.source === 'DASHBOARD_CHAT' && <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">PANEL</span>}
                                    {msg.status === 'REPLIED' && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-500/30">CEVAPLANDI</span>}
                                </h4>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                    <span className="text-slate-300 font-bold">{msg.name}</span> &bull; {msg.email} &bull; {new Date(msg.createdAt).toLocaleString('tr-TR')}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {msg.status === 'UNREAD' && (
                                    <button type="button" onClick={() => markContactMessageAsRead(msg.id)} className="text-xs bg-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-600 transition-colors flex items-center gap-1">
                                        <MailOpen size={12} /> Okundu
                                    </button>
                                )}
                                {msg.source === 'DASHBOARD_CHAT' && (
                                    <button type="button" onClick={() => { setReplyingTo(replyingTo === msg.id ? null : msg.id); setReplyText(''); }} className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded hover:bg-rose-500 transition-colors flex items-center gap-1 font-bold">
                                        <Send size={12} /> Cevapla
                                    </button>
                                )}
                                {msg.source !== 'DASHBOARD_CHAT' && (
                                    <a href={`mailto:${msg.email}?subject=Re: ${msg.title}`} className="text-xs bg-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-600 transition-colors flex items-center gap-1">
                                        <Mail size={12} /> E-posta At
                                    </a>
                                )}
                                <button type="button" onClick={() => handleDelete(msg.id)} className="text-xs bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-1.5 rounded hover:bg-red-900/50 transition-colors flex items-center gap-1 font-bold">
                                    <Trash2 size={12} /> Sil
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{msg.message}</p>
                        
                        {/* Reply Area */}
                        {replyingTo === msg.id && (
                            <div className="mt-4 pt-4 border-t border-slate-700 bg-slate-900/50 p-4 rounded-xl">
                                <label className="text-xs font-bold text-slate-400 mb-2 block">Cevabınız (Panele iletilir)</label>
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-rose-500 outline-none min-h-[100px]"
                                    placeholder="Mesajınızı yazın..."
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button type="button" onClick={() => setReplyingTo(null)} className="text-xs text-slate-400 hover:text-white px-3 py-2">İptal</button>
                                    <button type="button" onClick={() => handleReply(msg.id)} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                        <Send size={14}/> Gönder
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

