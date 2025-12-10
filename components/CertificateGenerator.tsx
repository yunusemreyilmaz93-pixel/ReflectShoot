
import React from 'react';
import { jsPDF } from 'jspdf';
import { FileDown, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const CertificateGenerator: React.FC = () => {
  const { currentApplication, currentUser } = useAppContext();

  const generatePDF = () => {
    if (!currentApplication) return;

    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Background color
    doc.setFillColor(23, 23, 23); // slate-900 roughly
    doc.rect(0, 0, 297, 210, 'F');

    // Ornamental Border
    doc.setDrawColor(245, 158, 11); // Amber-500
    doc.setLineWidth(1);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186);

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.text("KATILIM BELGESİ", 148.5, 40, { align: "center" });

    // Subtitle
    doc.setTextColor(244, 63, 94); // Rose-500
    doc.setFontSize(16);
    doc.text("Reflect&Shoot Kısa Film Yarışması", 148.5, 55, { align: "center" });

    // Main Text
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    
    doc.text("Bu belge,", 148.5, 80, { align: "center" });
    
    // Name
    doc.setTextColor(251, 191, 36); // Amber-400
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(currentUser?.fullName || "", 148.5, 95, { align: "center" });

    // Body
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    const text = `Konya Anadolu İmam Hatip Lisesi tarafından düzenlenen yarışmada\n"${currentApplication.team.name}" takımının danışmanı olarak\ngöstermiş olduğu üstün gayret ve başarıdan dolayı verilmiştir.`;
    doc.text(text, 148.5, 115, { align: "center", lineHeightFactor: 1.5 });

    // Date and Signatures
    doc.setFontSize(12);
    doc.text("Tarih: 22 Mayıs 2026", 40, 170);
    
    doc.text("Okul Müdürü", 230, 170);
    doc.text("Süleyman EŞİT", 230, 180);

    // Save
    doc.save("ReflectShoot_Katilim_Belgesi.pdf");
  };

  return (
    <button 
      onClick={generatePDF}
      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transform hover:-translate-y-1 transition-all"
    >
      <FileDown size={20} /> Katılım Belgesi İndir
    </button>
  );
};
