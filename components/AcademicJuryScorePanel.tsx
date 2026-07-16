import React, { useState } from 'react';
import { Category } from '../types';
import { getAcademicResult } from '../data/academicJuryScores';
import { Award, ChevronDown, ChevronUp, Star, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

interface AcademicJuryScorePanelProps {
  teamName: string;
  category: Category;
  hideMetaData?: boolean; // Option to hide category/school if already clear in context
}

export const AcademicJuryScorePanel: React.FC<AcademicJuryScorePanelProps> = ({
  teamName,
  category,
  hideMetaData = false,
}) => {
  const result = getAcademicResult(teamName, category);
  const [expandedJury, setExpandedJury] = useState<string | null>(null);

  if (!result) {
    return null;
  }

  const toggleJury = (juryName: string) => {
    if (expandedJury === juryName) {
      setExpandedJury(null);
    } else {
      setExpandedJury(juryName);
    }
  };

  return (
    <div className="w-full space-y-6 text-left" id={`academic-panel-${teamName.replace(/\s+/g, '-').toLowerCase()}`}>
      
      {/* 1. Header & Meta */}
      {!hideMetaData && (
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Kategori</span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {result.category === Category.LIVE_ACTION ? '🎬 Canlı Çekim' : '✨ Yapay Zekâ Animasyon'}
              </h4>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Okul Adı</span>
              <p className="text-sm font-bold text-slate-300 leading-tight">{result.school}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Metrics (Ödül & Genel Ortalama) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Award Plate */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/[0.02] border border-amber-500/30 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Award size={24} className="animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 block">NİHAİ KÜRSÜ / DERECE</span>
            <span className="text-lg font-black text-amber-400 uppercase tracking-wide">
              {result.award}
            </span>
          </div>
        </div>

        {/* Global Average Plate */}
        <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/[0.02] border border-teal-500/30 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-teal-500 block">AKADEMİK AKTS ORTALAMASI</span>
            <span className="text-2xl font-black text-teal-400 font-mono">
              {result.generalAverage.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2.5. Academic Criteria Averages across all academic juries */}
      <div className="space-y-4 bg-slate-900/40 p-5 rounded-[1.5rem] border border-slate-900">
        <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">
          Akademisyen Kriter Ortalamaları (Nihai)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
          {(() => {
            const totalJuries = result.juries.length;
            const avgStory = (result.juries.reduce((sum, j) => sum + j.criteria.storyDepth, 0) / totalJuries).toFixed(1);
            const avgTheme = (result.juries.reduce((sum, j) => sum + j.criteria.themeFit, 0) / totalJuries).toFixed(1);
            const avgSpiritual = (result.juries.reduce((sum, j) => sum + j.criteria.spiritualMsg, 0) / totalJuries).toFixed(1);
            const avgTech = (result.juries.reduce((sum, j) => sum + j.criteria.techQuality, 0) / totalJuries).toFixed(1);
            const avgSubjective = (result.juries.reduce((sum, j) => sum + j.criteria.subjectiveEval, 0) / totalJuries).toFixed(1);

            const criteriaList = [
              { label: "Senaryo & Anlatı Derinliği", val: parseFloat(avgStory), max: 20, color: "from-indigo-500 to-indigo-600" },
              { label: "Tema & Kaynaklara Uygunluk", val: parseFloat(avgTheme), max: 20, color: "from-amber-500 to-amber-600" },
              { label: "Düşünsel & Manevi Mesaj", val: parseFloat(avgSpiritual), max: 20, color: "from-emerald-500 to-emerald-600" },
              { label: "Teknik Kalite & Sinematografi", val: parseFloat(avgTech), max: 20, color: "from-blue-500 to-blue-600" },
              { label: "Jüri Öznel Değerlendirmesi", val: parseFloat(avgSubjective), max: 20, color: "from-purple-500 to-purple-600" }
            ];

            return criteriaList.map((crit, cIdx) => (
              <div key={cIdx} className={`space-y-1.5 ${cIdx === 4 ? 'sm:col-span-2' : ''}`}>
                <div className="flex justify-between font-bold text-slate-300">
                  <span>{crit.label}</span>
                  <span className="text-amber-400 font-mono font-black">{crit.val} <span className="text-slate-500 font-normal">/ {crit.max}</span></span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r ${crit.color} h-full rounded-full transition-all duration-1000`}
                    style={{ width: `${(crit.val / crit.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* 3. Detailed Per-Jury Criterion Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Kurul Puan Kartı Detayları
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {result.juries.map((jury) => {
            const isExpanded = expandedJury === jury.juryName;
            return (
              <div 
                key={jury.juryName} 
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Accordion Trigger */}
                <button type="button"
                  onClick={() => toggleJury(jury.juryName)}
                  className="w-full flex justify-between items-center p-4 hover:bg-slate-850/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-sm font-black text-white">{jury.juryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-teal-500/10 text-teal-400 font-mono text-sm px-3 py-1 rounded-xl border border-teal-500/20 font-black">
                      {jury.total} <span className="text-slate-500 font-normal text-xs">/ 100</span>
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/40 border-t border-slate-850 space-y-3.5 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                      
                      {/* Criteria 1: Senaryo & Anlatı Derinliği */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={12} className="text-indigo-400" /> Senaryo & Anlatı Derinliği
                          </span>
                          <span className="text-indigo-400 font-mono font-black">{jury.criteria.storyDepth} <span className="text-slate-550 font-normal">/ 20</span></span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full" style={{ width: `${(jury.criteria.storyDepth / 20) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Criteria 2: Tema & Kaynaklara Uygunluk */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-amber-400" /> Tema & Kaynaklara Uygunluk
                          </span>
                          <span className="text-amber-400 font-mono font-black">{jury.criteria.themeFit} <span className="text-slate-550 font-normal">/ 20</span></span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full" style={{ width: `${(jury.criteria.themeFit / 20) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Criteria 3: Düşünsel & Manevi Mesaj */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Star size={12} className="text-emerald-400" /> Düşünsel & Manevi Mesaj
                          </span>
                          <span className="text-emerald-400 font-mono font-black">{jury.criteria.spiritualMsg} <span className="text-slate-550 font-normal">/ 20</span></span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full" style={{ width: `${(jury.criteria.spiritualMsg / 20) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Criteria 4: Teknik Kalite & Sinematografi */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Award size={12} className="text-blue-400" /> Teknik Kalite & Sinematografi
                          </span>
                          <span className="text-blue-400 font-mono font-black">{jury.criteria.techQuality} <span className="text-slate-550 font-normal">/ 20</span></span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" style={{ width: `${(jury.criteria.techQuality / 20) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Criteria 5: Jüri Öznel Değerlendirmesi */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Star size={12} className="text-purple-400 animate-pulse" /> Jüri Öznel Değerlendirmesi
                          </span>
                          <span className="text-purple-400 font-mono font-black">{jury.criteria.subjectiveEval} <span className="text-slate-550 font-normal">/ 20</span></span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full" style={{ width: `${(jury.criteria.subjectiveEval / 20) * 100}%` }}></div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
