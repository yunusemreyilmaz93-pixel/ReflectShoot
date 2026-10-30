
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Check, X, Eye, Award, FileText, Shield, Inbox, Download, 
    Users, Film, School, Mail, AlertTriangle, Send, Clapperboard, Video, 
    Cpu, Activity, PieChart, BarChart3, Clock, UserCheck, Star, Plus, Lock, 
    Menu, LayoutDashboard, Settings, LogOut, FileDown, Trash2, MapPin, List, RefreshCw, ChevronRight, UserCog, MessageSquare, ExternalLink, Link as LinkIcon, Save, Youtube, PenTool, LayoutTemplate, HelpCircle, Bell, Image as ImageIcon, Megaphone, BookOpen, Calendar, Trophy, CheckCircle2, AlertOctagon, Info, ToggleRight, ToggleLeft, Power, Globe, Upload, LayoutGrid, Filter, TrendingUp,  Square, CheckSquare, MailOpen, Database, Construction, ChevronDown, Copy, AlertCircle
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

export const SimpleTrendChart = ({ data, color = "#f43f5e" }: { data: number[], color?: string }) => {
    if (data.length < 2) return <div className="h-32 flex items-center justify-center text-slate-600 text-xs">Yeterli veri yok</div>;

    const max = Math.max(...data, 1);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `M0,100 ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`;

    return (
        <div className="h-40 w-full relative overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Area Fill */}
                <path d={fillPath} fill="url(#chartGradient)" stroke="none" />
                {/* Line */}
                <polyline 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="2" 
                    points={points} 
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {/* Tooltip hint lines (vertical grid) */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                {data.map((_, i) => <div key={i} className="w-px h-full bg-slate-400"></div>)}
            </div>
        </div>
    );
};

export const SimpleDonutChart = ({ data }: { data: { name: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let cumulativeAngle = 0;

    if (total === 0) return <div className="h-32 flex items-center justify-center text-slate-600 text-xs">Veri yok</div>;

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((slice, i) => {
                        const angle = (slice.value / total) * 360;
                        const x1 = 50 + 40 * Math.cos(Math.PI * cumulativeAngle / 180);
                        const y1 = 50 + 40 * Math.sin(Math.PI * cumulativeAngle / 180);
                        const x2 = 50 + 40 * Math.cos(Math.PI * (cumulativeAngle + angle) / 180);
                        const y2 = 50 + 40 * Math.sin(Math.PI * (cumulativeAngle + angle) / 180);
                        
                        // SVG Arc Path Command
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const pathData = total === slice.value 
                            ? "M 50, 50 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0" // Full circle
                            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                        cumulativeAngle += angle;

                        return (
                            <path 
                                key={i} 
                                d={pathData} 
                                fill={slice.color} 
                                stroke="#1e293b" 
                                strokeWidth="2"
                                className="transition-all hover:opacity-80"
                            />
                        );
                    })}
                    <circle cx="50" cy="50" r="25" fill="#1e293b" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-white">{total}</span>
                </div>
            </div>
            <div className="space-y-3 flex-1">
                {data.map((slice, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></span>
                            <span className="text-slate-300">{slice.name}</span>
                        </div>
                        <span className="font-bold text-white">{slice.value} <span className="text-slate-500 font-normal">({((slice.value/total)*100).toFixed(0)}%)</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

