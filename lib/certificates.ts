import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { authenticatedFetch } from './authenticatedFetch';

export interface CertificateConfig {
  templateKey: string; // R2 file key of the PDF template
  fontPath: string; // Font path, e.g. "/fonts/RTL-Romman-Regular.ttf"
  x: number; // in cm
  y: number; // in cm
  width: number; // in cm
  height: number; // in cm
  rotation: number; // in degrees
  defaultFontSize: number; // in pt
  minFontSize: number; // in pt
  maxFontSize: number; // in pt
  textColor: string; // Hex color, e.g. "#071e3d"
  horizontalAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
}

export const DEFAULT_ATTENDANCE_CONFIG: CertificateConfig = {
  templateKey: '',
  fontPath: '/fonts/RTL-Romman-Regular.ttf',
  x: 5.44,
  y: 9.11,
  width: 18.82,
  height: 1.32,
  rotation: 0,
  defaultFontSize: 24,
  minFontSize: 12,
  maxFontSize: 36,
  textColor: '#071e3d',
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
};

export const DEFAULT_APPRECIATION_CONFIG: CertificateConfig = {
  templateKey: '',
  fontPath: '/fonts/RTL-Romman-Regular.ttf',
  x: 5.44,
  y: 9.11,
  width: 18.82,
  height: 1.32,
  rotation: 0,
  defaultFontSize: 24,
  minFontSize: 12,
  maxFontSize: 36,
  textColor: '#071e3d',
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
};

/**
 * Retrieves the configuration for a certificate type from Firestore,
 * falls back to default settings if not configured.
 */
export async function getCertificateConfig(type: 'ATTENDANCE' | 'APPRECIATION'): Promise<CertificateConfig> {
  const docId = type === 'ATTENDANCE' ? 'certificate_attendance' : 'certificate_appreciation';
  try {
    const docRef = doc(db, 'system', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...(type === 'ATTENDANCE' ? DEFAULT_ATTENDANCE_CONFIG : DEFAULT_APPRECIATION_CONFIG),
        ...docSnap.data()
      } as CertificateConfig;
    }
  } catch (error) {
    console.error(`Error loading certificate config for ${type}:`, error);
  }
  return type === 'ATTENDANCE' ? DEFAULT_ATTENDANCE_CONFIG : DEFAULT_APPRECIATION_CONFIG;
}

/**
 * Saves the configuration for a certificate type to Firestore.
 */
export async function saveCertificateConfig(type: 'ATTENDANCE' | 'APPRECIATION', config: CertificateConfig): Promise<void> {
  const docId = type === 'ATTENDANCE' ? 'certificate_attendance' : 'certificate_appreciation';
  const docRef = doc(db, 'system', docId);
  await setDoc(docRef, config);
}

/**
 * Converts cm to PDF points (1 cm = 28.3464567 pt).
 */
export const cmToPt = (cm: number) => cm * 28.3464567;

/**
 * Converts Hex color code to pdf-lib RGB color object.
 */
export function hexToRgbColor(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

/**
 * Generates a modified PDF document with the recipient name overlayed.
 */
export async function generateCertificatePdfBytes(
  templateArrayBuffer: ArrayBuffer,
  fontArrayBuffer: ArrayBuffer,
  recipientName: string,
  config: CertificateConfig
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateArrayBuffer);
  
  // Register fontkit
  pdfDoc.registerFontkit(fontkit);
  
  // Embed custom font
  const customFont = await pdfDoc.embedFont(fontArrayBuffer);
  
  // Disable buggy RTL/joining substitutions for standard Latin characters in font layout
  // and fix the extremely narrow space character (which collapses the words together)
  try {
    const fkFont = (customFont as any).embedder?.font;
    if (fkFont && typeof fkFont.layout === 'function') {
      const originalLayout = fkFont.layout.bind(fkFont);
      fkFont.layout = function (text: string, features: any) {
        const run = originalLayout(text, {
          fina: false,
          init: false,
          medi: false,
          calt: false,
          liga: false,
          rlig: false,
          aalt: false,
          salt: false,
          ...features
        });
        
        // Ensure space characters have a normal, legible width in drawing layout
        if (run && run.glyphs && run.positions) {
          for (let i = 0; i < run.glyphs.length; i++) {
            const g = run.glyphs[i];
            if (g && (g.name === 'space' || g.id === 3 || g.id === 4 || (g.codePoints && g.codePoints.includes(32)))) {
              if (run.positions[i]) {
                run.positions[i].xAdvance = 1000;
              }
            }
          }
        }
        return run;
      };

      // Also override the static advanceWidth on the cached space glyph object itself
      // so that customFont.widthOfTextAtSize correctly measures text with normal space widths.
      try {
        const spaceGlyph = fkFont.glyphForCodePoint(32);
        if (spaceGlyph) {
          Object.defineProperty(spaceGlyph, 'advanceWidth', {
            get() { return 1000; },
            configurable: true,
            enumerable: true
          });
        }
      } catch (err) {
        console.error('Failed to override space glyph advanceWidth:', err);
      }
    }
  } catch (err) {
    console.error('Failed to wrap font layout:', err);
  }
  
  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { width: pageW, height: pageH } = page.getSize();
  
  const ptX = cmToPt(config.x);
  const ptY = cmToPt(config.y);
  const ptW = cmToPt(config.width);
  const ptH = cmToPt(config.height);
  
  // Format the name: uppercase Turkish representation
  const upperName = recipientName.toLocaleUpperCase('tr-TR').trim().replace(/\s+/g, ' ');
  
  // Dynamic font size calculation
  let fontSize = config.defaultFontSize || 24;
  const minFontSize = config.minFontSize || 12;
  const maxFontSize = config.maxFontSize || 36;
  
  if (fontSize > maxFontSize) {
    fontSize = maxFontSize;
  }
  
  // Scale down if name exceeds box width
  while (fontSize > minFontSize && customFont.widthOfTextAtSize(upperName, fontSize) > ptW) {
    fontSize -= 1;
  }
  
  // Measure width again with final font size
  const finalWidth = customFont.widthOfTextAtSize(upperName, fontSize);
  
  // Horizontal alignment
  let textX = ptX;
  if (config.horizontalAlignment === 'center') {
    textX = ptX + (ptW - finalWidth) / 2;
  } else if (config.horizontalAlignment === 'right') {
    textX = ptX + ptW - finalWidth;
  }
  
  // Vertical alignment
  // Bounding box top is config.y from top, bottom is config.y + config.height from top.
  // In PDF, bottom edge of the box is pageH - (ptY + ptH).
  const pdfY_bottom = pageH - (ptY + ptH);
  const capHeight = fontSize * 0.7; // capHeight approximation
  
  let textY = pdfY_bottom;
  if (config.verticalAlignment === 'center') {
    textY = pdfY_bottom + (ptH - capHeight) / 2;
  } else if (config.verticalAlignment === 'top') {
    textY = pageH - ptY - capHeight;
  }
  
  const textColor = hexToRgbColor(config.textColor || '#071e3d');
  
  // Draw name text on PDF
  page.drawText(upperName, {
    x: textX,
    y: textY,
    size: fontSize,
    font: customFont,
    color: textColor,
    rotate: degrees(config.rotation || 0)
  });
  
  return await pdfDoc.save();
}

/**
 * Downloads a dynamically generated certificate for the recipient.
 */
export async function downloadCertificate({
  recipientName,
  type,
  showToast,
}: {
  recipientName: string;
  type: 'ATTENDANCE' | 'APPRECIATION';
  showToast: (msg: string, type?: 'success'|'error'|'info'|'warning') => void;
}) {
  try {
    showToast('Sertifikanız hazırlanıyor, lütfen bekleyiniz...', 'info');
    
    // 1. Fetch config
    const config = await getCertificateConfig(type);
    if (!config.templateKey) {
      throw new Error('Sertifika şablonu henüz yönetici tarafından yüklenmemiş.');
    }
    
    // 2. Fetch template PDF through the authenticated same-origin proxy.
    // This avoids browser CORS failures when fetching a signed R2 URL directly.
    const templateResponse = await authenticatedFetch(
      `/api/view?key=${encodeURIComponent(config.templateKey)}&raw=1`
    );
    if (!templateResponse.ok) {
      throw new Error('Sertifika şablonu indirilemedi.');
    }
    const templateBytes = await templateResponse.arrayBuffer();
    
    // 3. Fetch the font
    const fontResponse = await fetch(config.fontPath || '/fonts/RTL-Romman-Regular.ttf');
    if (!fontResponse.ok) {
      throw new Error('Yazı tipi (Romman) dosyası indirilemedi.');
    }
    const fontBytes = await fontResponse.arrayBuffer();
    
    // 4. Generate PDF
    const pdfBytes = await generateCertificatePdfBytes(templateBytes, fontBytes, recipientName, config);
    
    // 5. Trigger client side download
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const slugifyName = (name: string) => name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-');
      
    const filenameType = type === 'ATTENDANCE' ? 'certificate-of-attendance' : 'certificate-of-appreciation';
    const filename = `${slugifyName(recipientName)}-${filenameType}.pdf`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Sertifikanız başarıyla indirildi.', 'success');
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    showToast(error.message || 'Sertifika üretilirken bir hata oluştu.', 'error');
  }
}
