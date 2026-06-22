import React from 'react';
import { Award, Sparkles, Printer, User, Users, ShieldCheck } from 'lucide-react';

interface CertificateData {
  recipientName: string;
  type: 'ATTENDANCE' | 'APPRECIATION'; // ATTENDANCE for students, APPRECIATION for teachers
}

// Inline SVGs for Signatures and Ornaments to keep compilation self-contained and pristine
const LOGO_SVG = `
<svg width="220" height="70" viewBox="0 0 220 70" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Film Roll Curve -->
  <path d="M25 50 C15 35 15 20 35 15 C55 10 50 35 40 45 C30 55 10 45 15 25" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none" />
  <!-- Small film strip holes -->
  <circle cx="21" cy="40" r="1.5" fill="#f59e0b" />
  <circle cx="17" cy="30" r="1.5" fill="#f59e0b" />
  <circle cx="20" cy="20" r="1.5" fill="#f59e0b" />
  <circle cx="28" cy="15" r="1.5" fill="#f59e0b" />
  <circle cx="38" cy="18" r="1.5" fill="#f59e0b" />
  <circle cx="43" cy="28" r="1.5" fill="#f59e0b" />
  <circle cx="38" cy="38" r="1.5" fill="#f59e0b" />
  <circle cx="28" cy="45" r="1.5" fill="#f59e0b" />

  <!-- Logo Text -->
  <text x="65" y="32" font-family="'Cinzel', serif, sans-serif" font-size="14" font-weight="900" fill="#0b2545" letter-spacing="2">REFLECT</text>
  <text x="65" y="48" font-family="'Cinzel', serif, sans-serif" font-size="14" font-weight="900" fill="#f59e0b" letter-spacing="2">&amp; SHOOT</text>
  <text x="65" y="60" font-family="'Inter', sans-serif" font-size="6.5" font-weight="700" fill="#64748b" letter-spacing="4">OKU . ANLA . ANLAT</text>
</svg>
`;

const CORNER_SVG = `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 10 L10 100 A10 10 0 0 0 20 110 L110 110" stroke="#d4af37" stroke-width="1.5" fill="none" stroke-opacity="0.8"/>
  <path d="M22 22 L22 80 A8 8 0 0 0 30 88 L88 88" stroke="#d4af37" stroke-width="0.75" fill="none" stroke-opacity="0.5"/>
  <!-- Elegant Baroque Flourish Pattern -->
  <path d="M10 10 C35 12, 45 25, 30 40 C15 55, 12 30, 25 25 C35 22, 50 45, 25 60 C10 70, 15 90, 40 85 C65 80, 55 50, 45 45" stroke="#d4af37" stroke-width="1" fill="none" stroke-linecap="round" stroke-opacity="0.9"/>
  <path d="M10 10 C12 35, 25 45, 40 30 C55 15, 30 12, 25 25 C22 35, 45 50, 60 25 C70 10, 90 15, 85 40 C80 65, 50 55, 45 45" stroke="#d4af37" stroke-width="1" fill="none" stroke-linecap="round" stroke-opacity="0.9"/>
  <!-- Corner Star -->
  <polygon points="15,15 17,22 24,24 17,26 15,33 13,26 6,24 13,22" fill="#d4af37" fill-opacity="0.9"/>
</svg>
`;

const SIGNATIVE_SELMA = `
<svg width="150" height="70" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M 20 50 Q 35 15, 40 25 T 50 55 Q 60 62, 75 35 T 90 50 Q 100 20, 115 40 T 130 52 Q 138 30, 145 35" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
`;

const SIGNATIVE_YUNUS = `
<svg width="150" height="70" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15 45 Q 35 12, 45 18 T 55 42 Q 65 18, 75 28 T 85 48 L 135 25 M 70 45 L 140 45" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
`;

const SIGNATIVE_SAMI = `
<svg width="150" height="70" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M 25 55 Q 40 10, 48 16 T 58 48 Q 68 12, 78 22 T 88 50 L 128 50 M 55 52 Q 95 48, 135 52" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
`;

const SIGNATIVE_SULEYMAN = `
<svg width="150" height="70" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M 20 48 Q 32 8, 38 12 T 48 44 Q 58 15, 68 25 T 78 46 L 115 44 M 40 45 Q 75 42, 110 45" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
`;

export const printCertificate = (recipientName: string, type: 'ATTENDANCE' | 'APPRECIATION') => {
  const isAttendance = type === 'ATTENDANCE';
  const titleText = isAttendance ? "CERTIFICATE OF ATTENDANCE" : "CERTIFICATE OF APPRECIATION";

  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reflect & Shoot Certificate - ${recipientName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
         @page { 
           size: A4 landscape; 
           margin: 0; 
         }
         
         @media print {
           body {
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
         }

         body { 
           margin: 0; 
           padding: 0; 
           width: 297mm; 
           height: 210mm; 
           font-family: 'Montserrat', sans-serif;
           background-color: #ffffff;
           box-sizing: border-box;
           display: flex;
           align-items: center;
           justify-content: center;
         }

         /* Beautiful outer canvas frame */
         .certificate-canvas {
           width: 297mm;
           height: 210mm;
           background: #ffffff;
           padding: 12mm;
           box-sizing: border-box;
           position: relative;
           overflow: hidden;
         }

         /* Inner borders */
         .outer-navy-border {
           width: 100%;
           height: 100%;
           border: 6px solid #071e3d;
           box-sizing: border-box;
           position: relative;
           padding: 4px;
         }

         .inner-gold-border {
           width: 100%;
           height: 100%;
           border: 2px solid #d4af37;
           box-sizing: border-box;
           position: relative;
           background: radial-gradient(circle at center, #fdfbf7 0%, #f7f4e9 80%, #f3efdf 100%);
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: space-between;
           padding: 12mm 16mm;
         }

         /* Corner Ornaments positioning mapping */
         .corner-ornament {
           position: absolute;
           width: 24mm;
           height: 24mm;
           z-index: 10;
         }

         .corner-tl { top: 0; left: 0; }
         .corner-tr { top: 0; right: 0; transform: rotate(90deg); }
         .corner-bl { bottom: 0; left: 0; transform: rotate(-90deg); }
         .corner-br { bottom: 0; right: 0; transform: rotate(180deg); }

         /* Logo and Brand row */
         .logo-wrapper {
           z-index: 20;
           display: flex;
           justify-content: center;
           margin-bottom: 2mm;
         }

         /* Certificate Headers */
         .header-section {
           text-align: center;
           z-index: 20;
           width: 100%;
         }

         .certificate-title {
           font-family: 'Cinzel', serif;
           font-size: 25pt;
           color: #071e3d;
           margin: 0 0 3mm 0;
           letter-spacing: 4px;
           font-weight: 900;
           text-transform: uppercase;
           text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.1);
         }

         .proudly-presented {
           font-family: 'Cinzel', serif;
           font-size: 10pt;
           color: #53647b;
           margin: 0;
           letter-spacing: 5px;
           font-weight: 700;
           text-transform: uppercase;
         }

         /* Name Holder Unit */
         .name-display-unit {
           width: 80%;
           text-align: center;
           z-index: 20;
           margin: 4mm auto;
           position: relative;
         }

         .recipient-name {
           font-family: 'Cinzel', serif;
           font-size: 24pt;
           font-weight: 700;
           color: #0d2c54;
           padding-bottom: 2mm;
           margin: 0 auto;
           text-transform: uppercase;
           letter-spacing: 1.5px;
           display: inline-block;
         }

         .name-separator {
           width: 100%;
           height: 1px;
           background: linear-gradient(90deg, transparent 0%, #d4af37 20%, #d4af37 80%, transparent 100%);
           margin: 1mm auto 0 auto;
         }

         /* Description Unit */
         .description-paragraph {
           font-family: 'Montserrat', sans-serif;
           font-size: 10.5pt;
           line-height: 1.7;
           color: #374151;
           max-width: 80%;
           text-align: center;
           margin: 0 auto 5mm auto;
           z-index: 20;
           font-weight: 500;
         }

         .description-paragraph strong {
           font-weight: 700;
           color: #071e3d;
         }

         /* Beautiful 2x2 Signatures Array */
         .signatures-grid-canvas {
           width: 100%;
           display: grid;
           grid-template-columns: 1fr 1fr;
           row-gap: 3mm;
           column-gap: 40mm;
           z-index: 20;
           box-sizing: border-box;
           padding: 0 10mm;
         }

         .signature-block {
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: flex-end;
           position: relative;
           height: 22mm;
         }

         .handwritten-sig-wrap {
           height: 12mm;
           display: flex;
           align-items: center;
           justify-content: center;
           margin-bottom: 0.5mm;
         }

         .short-sign-line {
           width: 180px;
           height: 1px;
           background: #94a3b8;
           margin-bottom: 1.5mm;
         }

         .signer-fullname {
           font-size: 8.5pt;
           font-weight: 700;
           color: #0f172a;
           margin: 0;
           text-transform: uppercase;
           letter-spacing: 0.8px;
         }

         .signer-role-label {
           font-size: 7.2pt;
           color: #64748b;
           margin: 0.5mm 0 0 0;
           font-weight: 600;
           letter-spacing: 0.4px;
         }

         /* Decorative watermarked background */
         .center-watermark-icon {
           position: absolute;
           top: 54%;
           left: 50%;
           transform: translate(-50%, -50%);
           width: 80mm;
           height: 80mm;
           opacity: 0.025;
           pointer-events: none;
           z-index: 1;
         }
      </style>
    </head>
    <body>
      <div class="certificate-canvas">
        <div class="outer-navy-border">
          <div class="inner-gold-border">
            
            <!-- Ornaments in Four Corners -->
            <div class="corner-ornament corner-tl">${CORNER_SVG}</div>
            <div class="corner-ornament corner-tr">${CORNER_SVG}</div>
            <div class="corner-ornament corner-bl">${CORNER_SVG}</div>
            <div class="corner-ornament corner-br">${CORNER_SVG}</div>

            <!-- Background Watermark Pattern -->
            <svg class="center-watermark-icon" viewBox="0 0 100 100" fill="none" stroke="#000000" stroke-width="0.5">
              <path d="M50 5 C25 5, 5 25, 5 50 C5 75, 25 95, 50 95 C75 95, 95 75, 95 50 C95 25, 75 5, 50 5 Z M50 15 L50 85 M15 50 L85 50" />
            </svg>

            <!-- Brand Logo Header Block -->
            <div class="logo-wrapper">
              ${LOGO_SVG}
            </div>

            <!-- Structural Headers -->
            <div class="header-section">
              <h1 class="certificate-title">${titleText}</h1>
              <p class="proudly-presented">This certificate is proudly presented to</p>
            </div>

            <!-- Recipient Name Placed exactly on the empty space/line -->
            <div class="name-display-unit">
              <div class="recipient-name">${recipientName}</div>
              <div class="name-separator"></div>
            </div>

            <!-- Descriptive Body Paragraph -->
            <p class="description-paragraph">
              For participating in <strong>Reflect&amp;Shoot</strong> short film competition held by <br/><strong>Konya Anadolu İmam Hatip High School</strong>.
            </p>

            <!-- Grid of 4 Signatures Exactly mimicking the layouts -->
            <div class="signatures-grid-canvas">
              
              <!-- Selma Ozulku -->
              <div class="signature-block">
                <div class="handwritten-sig-wrap">${SIGNATIVE_SELMA}</div>
                <div class="short-sign-line"></div>
                <div class="signer-fullname">Selma ÖZÜLKÜ</div>
                <div class="signer-role-label">Coordinator</div>
              </div>

              <!-- Yunus Emre Yilmaz -->
              <div class="signature-block">
                <div class="handwritten-sig-wrap">${SIGNATIVE_YUNUS}</div>
                <div class="short-sign-line"></div>
                <div class="signer-fullname">Yunus Emre YILMAZ</div>
                <div class="signer-role-label">Coordinator</div>
              </div>

              <!-- Sami Bayrakci -->
              <div class="signature-block">
                <div class="handwritten-sig-wrap">${SIGNATIVE_SAMI}</div>
                <div class="short-sign-line"></div>
                <div class="signer-fullname">Sami BAYRAKÇI</div>
                <div class="signer-role-label">TİMAV Principal</div>
              </div>

              <!-- Suleyman Esit -->
              <div class="signature-block">
                <div class="handwritten-sig-wrap">${SIGNATIVE_SULEYMAN}</div>
                <div class="short-sign-line"></div>
                <div class="signer-fullname">Süleyman EŞİT</div>
                <div class="signer-role-label">School Principal</div>
              </div>

            </div>

          </div>
        </div>
      </div>
      <script>
        // Automatic delay to make sure print triggers nicely across different rendering timelines
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
  } else {
    alert("Popup engelleyiciyi devre dışı bırakıp tekrar deneyiniz.");
  }
};

// React Component Wrapper to keep existing components running smoothly
export const CertificateGenerator: React.FC = () => {
  return null;
};
