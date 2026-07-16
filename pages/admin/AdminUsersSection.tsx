
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

export const AdminUsers = () => {
    const { allUsers, updateUserRole, deleteUser, showToast } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredUsers = allUsers.filter(u => {
        const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        setProcessingId(uid);
        try {
            await updateUserRole(uid, newRole);
            showToast(`Kullanıcı rolü güncellendi: ${newRole}`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Rol güncellenemedi.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!window.confirm("Bu kullanıcıyı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
        setProcessingId(uid);
        try {
            await deleteUser(uid);
        } catch (error) {
            console.error(error);
            showToast('Kullanıcı silinemedi.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return <span className="bg-rose-900/30 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">ADMIN</span>;
            case UserRole.JUDGE: return <span className="bg-amber-900/30 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">JUDGE</span>;
            case UserRole.TEACHER: return <span className="bg-blue-900/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">TEACHER</span>;
            case UserRole.PENDING_TEACHER: return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">ONAY BEKLİYOR</span>;
            default: return <span className="bg-slate-800 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{role}</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <UserCog size={20} className="text-slate-400"/>
                    Kullanıcı ve Rol Yönetimi
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 outline-none focus:border-rose-500"
                    >
                        <option value="ALL">Tüm Roller</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.JUDGE}>Jüri</option>
                        <option value={UserRole.TEACHER}>Öğretmen</option>
                        <option value={UserRole.STUDENT}>Öğrenci</option>
                        <option value={UserRole.PENDING_TEACHER}>Onay Bekleyen</option>
                    </select>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="İsim veya E-posta ara..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-rose-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                            <tr>
                                <th className="p-4">KULLANICI</th>
                                <th className="p-4">OKUL / ŞEHİR</th>
                                <th className="p-4">MEVCUT ROL</th>
                                <th className="p-4 text-right">ROL İŞLEMLERİ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">Kullanıcı bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.uid} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm border border-slate-600">
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{user.fullName}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-300">{user.school || '-'}</div>
                                            <div className="text-xs text-slate-500">{user.city || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.role !== UserRole.TEACHER && (
                                                    <button type="button" 
                                                        onClick={() => handleRoleChange(user.uid, UserRole.TEACHER)}
                                                        disabled={processingId === user.uid}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 text-[10px] font-bold hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        Öğretmen Yap
                                                    </button>
                                                )}
                                                {user.role !== UserRole.JUDGE && (
                                                    <button type="button" 
                                                        onClick={() => handleRoleChange(user.uid, UserRole.JUDGE)}
                                                        disabled={processingId === user.uid}
                                                        className="px-3 py-1.5 rounded-lg border border-amber-900/50 text-amber-500 text-[10px] font-bold hover:bg-amber-900/20 transition-all disabled:opacity-50"
                                                    >
                                                        Jüri Yap
                                                    </button>
                                                )}
                                                {user.role !== UserRole.ADMIN && (
                                                    <button type="button" 
                                                        onClick={() => handleDeleteUser(user.uid)}
                                                        disabled={processingId === user.uid}
                                                        className="px-3 py-1.5 rounded-lg border border-red-900/50 text-red-500 text-[10px] font-bold hover:bg-red-900/20 transition-all disabled:opacity-50"
                                                    >
                                                        Sil
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

