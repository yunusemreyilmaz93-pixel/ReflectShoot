import React from 'react';
import { Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const CertificateGenerator: React.FC = () => {
  const { currentApplication, currentUser } = useAppContext();

  const printCertificate = () => {
    if (!currentApplication || !currentUser) return;

    // Dates and Names
    const date = "22 Mayıs 2026";
    const directorName = "Süleyman EŞİT";
    
    const content = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Reflect&Shoot - Katılım Belgesi</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
        <style>
           @page { size: A4 landscape; margin: 0; }

           body { 
             margin: 0; 
             padding: 0; 
             width: 297mm; 
             height: 210mm; 
             font-family: 'Inter', sans-serif;
             background-color: #ffffff;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }

           /* Tam A4 sayfa – lacivert kenarlıklı zemin */
           .page {
             width: 297mm;
             height: 210mm;
             background: #020617;
             display: flex;
             align-items: center;
             justify-content: center;
           }

           .cert-frame {
             width: 277mm;
             height: 190mm;
             position: relative;
             padding: 40px 60px;
             box-sizing: border-box;
             background: radial-gradient(circle at top left, #fdfcf9 0, #f5f3ea 45%, #f2efe4 100%);
             border: 10px solid #020617;
             border-radius: 16px;
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: space-between;
             box-shadow:
               inset 0 0 0 2px #e2e8f0,
               inset 0 0 0 5px rgba(212,175,55,0.65);
             overflow: hidden;
           }

           .cert-frame::before {
             content: "";
             position: absolute;
             inset: 18px;
             border-radius: 10px;
             background-image:
               linear-gradient(135deg, rgba(148,163,184,0.08) 0, transparent 55%),
               linear-gradient(315deg, rgba(148,163,184,0.08) 0, transparent 55%);
             opacity: 0.9;
             pointer-events: none;
             z-index: 0;
           }

           .corner {
             position: absolute;
             width: 64px;
             height: 64px;
             border: 2px solid rgba(212,175,55,0.9);
             z-index: 12;
           }
           .tl { top: 22px; left: 22px; border-right: none; border-bottom: none; border-radius: 10px 0 0 0; }
           .tr { top: 22px; right: 22px; border-left: none; border-bottom: none; border-radius: 0 10px 0 0; }
           .bl { bottom: 22px; left: 22px; border-right: none; border-top: none; border-radius: 0 0 0 10px; }
           .br { bottom: 22px; right: 22px; border-left: none; border-top: none; border-radius: 0 0 10px 0; }

           .watermark {
             position: absolute;
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%) rotate(-18deg);
             font-family: 'Cinzel', serif;
             font-size: 88pt;
             letter-spacing: 0.18em;
             color: rgba(15,23,42,0.04);
             white-space: nowrap;
             z-index: 1;
             pointer-events: none;
             text-transform: uppercase;
           }

           .header {
             text-align: center;
             z-index: 20;
             margin-top: 4px;
           }

           .brand-tag {
             font-family: 'Inter', sans-serif;
             font-size: 9pt;
             letter-spacing: 4px;
             text-transform: uppercase;
             color: #64748b;
             margin-bottom: 8px;
             font-weight: 600;
           }

           .brand-tag span {
             font-weight: 700;
             color: #0f172a;
           }

           h1 {
             font-family: 'Cinzel', serif;
             font-size: 38pt;
             color: #0f172a;
             margin: 0;
             letter-spacing: 3px;
             font-weight: 800;
             text-transform: uppercase;
             background: linear-gradient(90deg, #1f2937, #020617);
             -webkit-background-clip: text;
             -webkit-text-fill-color: transparent;
           }

           h2 {
             font-family: 'Cinzel', serif;
             font-size: 14pt;
             color: #b45309;
             margin: 10px auto 0 auto;
             font-weight: 600;
             text-transform: uppercase;
             letter-spacing: 6px;
             padding: 8px 28px;
             display: inline-block;
             border-top: 1px solid rgba(148,163,184,0.6);
             border-bottom: 1px solid rgba(148,163,184,0.6);
             background: radial-gradient(circle at top, rgba(248,250,252,0.9) 0, rgba(248,250,252,0.2) 70%, transparent 100%);
             border-radius: 999px;
           }

           .content {
             text-align: center;
             z-index: 20;
             flex-grow: 1;
             display: flex;
             flex-direction: column;
             justify-content: center;
             padding-top: 8px;
           }

           .presented-to {
             font-size: 11pt;
             color: #64748b;
             margin-bottom: 10px;
             font-style: italic;
           }

           .recipient-name {
             font-family: 'Cinzel', serif;
             font-size: 28pt;
             font-weight: 700;
             color: #111827;
             margin: 0 0 4px 0;
             text-transform: uppercase;
             letter-spacing: 2px;
           }

           .recipient-role {
             font-size: 11pt;
             color: #6b7280;
             text-transform: none;
             letter-spacing: 0.8px;
             margin-bottom: 20px;
           }

           .description {
             font-size: 12.5pt;
             line-height: 1.8;
             color: #374151;
             max-width: 780px;
             margin: 0 auto;
           }

           .description span.highlight {
             font-weight: 600;
             color: #b91c1c;
             text-transform: none;
           }

           .description .emphasis {
             font-weight: 500;
           }

           .footer {
             width: 100%;
             display: flex;
             justify-content: space-between;
             align-items: flex-end;
             z-index: 20;
             margin-bottom: 10px;
             padding: 0 10px;
           }

           .date-box {
              text-align: left;
              font-family: 'Cinzel', serif;
              color: #6b7280;
              font-size: 10.5pt;
              line-height: 1.6;
           }

           .date-box .city {
             letter-spacing: 2px;
             text-transform: uppercase;
             font-size: 9.5pt;
             color: #4b5563;
           }

           .signature-box {
             text-align: center;
             min-width: 240px;
           }

           .sign-line {
             width: 230px;
             height: 1px;
             background: linear-gradient(90deg, transparent 0, #020617 18%, #020617 82%, transparent 100%);
             margin: 0 auto 6px auto;
           }

           .sign-name {
             font-weight: 700;
             font-size: 11.5pt;
             color: #111827;
             text-transform: uppercase;
             letter-spacing: 1px;
           }

           .sign-title {
             font-size: 9pt;
             color: #b45309;
             text-transform: uppercase;
             letter-spacing: 1.6px;
             font-weight: 600;
           }

           .seal {
             position: absolute;
             bottom: 62px;
             left: 50%;
             transform: translateX(-50%);
             width: 115px;
             height: 115px;
             border-radius: 50%;
             background:
               radial-gradient(circle at 30% 30%, #fef9c3 0, #facc15 30%, #b45309 70%, #7c2d12 100%);
             box-shadow:
               0 10px 25px rgba(124,45,18,0.6),
               inset 0 0 0 6px rgba(248,250,252,0.9),
               inset 0 0 0 10px rgba(0,0,0,0.15);
             display: flex;
             align-items: center;
             justify-content: center;
             z-index: 10;
             opacity: 0.95;
           }

           .seal-inner {
             width: 82px;
             height: 82px;
             border-radius: 50%;
             border: 2px solid rgba(15,23,42,0.28);
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: center;
             text-align: center;
             font-family: 'Cinzel', serif;
             font-size: 8.5pt;
             color: #111827;
             text-transform: uppercase;
             letter-spacing: 1.1px;
           }

           .seal-inner .seal-main {
             font-size: 7.2pt;
             margin-bottom: 2px;
           }

           .seal-inner .seal-sub {
             font-size: 6.2pt;
           }

        </style>
      </head>
      <body>
        <div class="page">
          <div class="cert-frame">
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>
            
            <div class="watermark">Reflect & Shoot</div>

            <div class="header">
               <div class="brand-tag">
                 <span>Konya Anadolu İmam Hatip Lisesi</span>
               </div>

               <h1>KATILIM BELGESİ</h1>
               <h2>Reflect & Shoot Kısa Film Yarışması</h2>
            </div>
            
            <div class="content">
               <div class="presented-to">Bu belge,</div>
               <div class="recipient-name">${currentUser.fullName}</div>
               <div class="recipient-role">isimli danışman öğretmene,</div>
               <div class="description">
                 Reflect&Shoot Kısa Film Yarışması kapsamında
                 <span class="highlight"> "${currentApplication.team.name}" </span>
                 takımına danışmanlık yaparak,<br>
                 gençlerin sinema sanatıyla kendilerini ifade etmelerine sağladığı katkı<br>
                 ve gösterdiği <span class="emphasis">üstün gayret</span> nedeniyle takdim edilmiştir.
               </div>
            </div>
            
            <div class="seal">
              <div class="seal-inner">
                <div class="seal-main">Reflect & Shoot</div>
                <div class="seal-sub">Kısa Film Yarışması</div>
              </div>
            </div>

            <div class="footer">
               <div class="date-box">
                  ${date}<br>
                  <span class="city">KONYA</span>
               </div>
               
               <div class="signature-box">
                  <div class="sign-line"></div>
                  <div class="sign-name">${directorName}</div>
                  <div class="sign-title">Okul Müdürü</div>
               </div>
            </div>
          </div>
        </div>
        <script>
           window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
    }
  };

  return (
    <button 
      onClick={printCertificate}
      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transform hover:-translate-y-1 transition-all"
    >
      <Award size={20} /> Katılım Belgesi (PDF)
    </button>
  );
};
