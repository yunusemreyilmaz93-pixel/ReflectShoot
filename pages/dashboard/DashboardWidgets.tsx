import React from 'react';
import { motion } from 'motion/react';
import { 
    CheckCircle2, PartyPopper, Megaphone, ArrowRight, Plus
} from 'lucide-react';
import { ApplicationStatus, Student } from '../../types';

export const ProductionStatusRing = ({ progress }: { progress: number }) => {
    const size = 80;
    const stroke = 6;
    const radius = (size / 2) - stroke;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center group cursor-default">
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-20 transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-rose-500'}`}></div>
            
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" className="text-slate-800" />
                    <circle 
                        cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="transparent" 
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                        strokeLinecap="round"
                        className={progress === 100 ? 'text-green-500' : 'text-rose-600'} 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-white">{progress}%</span>
                    <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Hazır</span>
                </div>
            </div>
            
            {progress === 100 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-slate-900 p-1.5 rounded-full shadow-lg animate-bounce">
                    <CheckCircle2 size={16} />
                </div>
            )}
        </div>
    );
};

export const NextActionCard = ({ app, isDeadlinePassed, onAction }: { app: any, isDeadlinePassed?: boolean, onAction: (tab: string, subAction?: any) => void }) => {
    let action = { text: "Tüm aşamalar tamamlandı! Arkanıza yaslanın.", btn: "Durumu Kontrol Et", tab: "STATUS", type: "success" };
    
    // Logic Chain
    
    // Check Students (Dynamic Check)
    const missingParent = app.team.students.find((s: Student) => !s.hasParentalConsent);
    const missingKvkk = app.team.students.find((s: Student) => !s.hasKvkkConsent);

    const isWinner = app.team.isWinner;

    if (isWinner === true) {
        action = { text: "Tebrikler! Takımınız ödül kazandı. Katılım formunu doldurun.", btn: "Katılım Formuna Git", tab: "AWARD_WIN", type: "success" };
    } else if (isWinner === false) {
        action = { text: "Yarışmamıza katılımınız için teşekkür ederiz. Emekleriniz için minnettarız.", btn: "Katılım Sertifikalarını Buradan İndirebilirsiniz", tab: "STATUS", type: "success" };
    } else if (app.status === ApplicationStatus.FINAL_SUBMITTED || app.status === ApplicationStatus.UNDER_REVIEW) {
        action = { text: "Ödül Töreni değerlendirme süreci tamamlandı. Katılımlarınızdan dolayı teşekkür ederiz.", btn: "Detayları Gör", tab: "STATUS", type: "info" };
    } else if (isDeadlinePassed) {
        if (app.team.videoStatus === 'SUBMITTED_LINK' || app.team.videoStatus === 'UPLOADED') {
            action = { text: "Video teslim aşaması sona erdi. Jüri değerlendirmesi sürüyor.", btn: "Durumu Gör", tab: "STATUS", type: "success" };
        } else {
            action = { text: "Film yükleme süresi sona ermiştir. İşlemi tamamlayamadınız.", btn: "İncele", tab: "STATUS", type: "urgent" };
        }
    } else if (app.team.students.length < 3) {
        action = { text: "Takım en az 3 kişiden oluşmalıdır.", btn: "Öğrenci Ekle", tab: "DOCUMENTS", type: "urgent" };
    } else if (missingParent) {
        action = { text: `${missingParent.firstName} isimli öğrencinin Veli İzin Belgesi eksik.`, btn: "Belgeyi Yükle", tab: "DOCUMENTS", type: "warning" };
    } else if (missingKvkk) {
        action = { text: `${missingKvkk.firstName} isimli öğrencinin KVKK Metni eksik.`, btn: "Belgeyi Yükle", tab: "DOCUMENTS", type: "warning" };
    } else if (app.team.videoStatus === 'PENDING' || app.team.videoStatus === 'ERROR') {
        action = { text: "Prodüksiyon belgeleri tamam. Sırada film teslimi var.", btn: "Videoyu Teslim Et", tab: "VIDEO", type: "info" };
    } else if (app.team.videoStatus === 'SUBMITTED_LINK') {
        action = { text: "Video inceleme aşamasında. Onay bekleniyor.", btn: "Detayları Gör", tab: "VIDEO", type: "success" };
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${action.type === 'success' ? 'bg-green-500' : action.type === 'urgent' ? 'bg-red-500' : action.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>

            <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${action.type === 'success' ? 'bg-green-500/20 text-green-500' : action.type === 'urgent' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {action.type === 'success' ? <PartyPopper size={28} /> : <Megaphone size={28} className="animate-pulse" />}
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Sıradaki Görev</h4>
                    <p className="text-lg md:text-xl font-bold text-white leading-tight">{action.text}</p>
                </div>
            </div>

            <button 
                type="button"
                onClick={() => onAction(action.tab)}
                className="relative z-10 bg-white text-slate-900 hover:bg-slate-200 px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-xl hover:-translate-y-1 whitespace-nowrap w-full md:w-auto justify-center"
            >
                {action.btn} <ArrowRight size={16} />
            </button>
        </div>
    );
};

export const TeamSwitcher = ({ 
    applications, 
    activeId, 
    onSwitch, 
    onCreate, 
    canCreate 
}: { 
    applications: any[], 
    activeId: string | null, 
    onSwitch: (id: string) => void, 
    onCreate: () => void,
    canCreate: boolean
}) => {
    return (
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {applications.map((app, index) => (
                <button
                    type="button"
                    key={app.id}
                    onClick={() => onSwitch(app.id)}
                    className={`
                        group relative flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 whitespace-nowrap
                        ${activeId === app.id 
                            ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}
                    `}
                >
                    <div className={`
                        w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs
                        ${activeId === app.id ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}
                    `}>
                        {index + 1}
                    </div>
                    <div className="text-left">
                        <span className={`block text-xs font-black uppercase tracking-wider ${activeId === app.id ? 'text-rose-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            Takım {index + 1}
                        </span>
                        <span className={`block text-sm font-bold ${activeId === app.id ? 'text-white' : 'text-slate-400'}`}>
                            {app.team.name}
                        </span>
                    </div>
                    {activeId === app.id && (
                        <motion.div 
                            layoutId="active-team-glow"
                            className="absolute inset-0 rounded-2xl bg-rose-500/5 blur-md -z-10"
                        />
                    )}
                </button>
            ))}

            {canCreate && (
                <button
                    type="button"
                    onClick={onCreate}
                    className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-dashed border-slate-700 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group whitespace-nowrap"
                >
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Plus size={18} />
                    </div>
                    <div className="text-left">
                        <span className="block text-xs font-black uppercase tracking-wider text-slate-500 group-hover:text-rose-500">
                            Yeni Takım
                        </span>
                        <span className="block text-sm font-bold text-slate-400 group-hover:text-white">
                            Takım Ekle ({applications.length}/5)
                        </span>
                    </div>
                </button>
            )}
        </div>
    );
};
