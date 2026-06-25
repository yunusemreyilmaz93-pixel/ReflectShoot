import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

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
  
  // Embed custom font
  const customFont = await pdfDoc.embedFont(fontArrayBuffer);
  
  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { width: pageW, height: pageH } = page.getSize();
  
  const ptX = cmToPt(config.x);
  const ptY = cmToPt(config.y);
  const ptW = cmToPt(config.width);
  const ptH = cmToPt(config.height);
  
  // Format the name: uppercase Turkish representation
  const upperName = recipientName.toLocaleUpperCase('tr-TR');
  
  // Dynamic font size calculation
  let fontSize = config.defaultFontSize || 24;
  let textWidth = customFont.widthOfTextAtSize(upperName, fontSize);
  
  if (textWidth > ptW) {
    fontSize = fontSize * (ptW / textWidth);
    if (fontSize < (config.minFontSize || 12)) {
      fontSize = config.minFontSize || 12;
    }
  }
  if (fontSize > (config.maxFontSize || 36)) {
    fontSize = config.maxFontSize || 36;
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
    
    // 2. Fetch template PDF signed URL
    const viewResponse = await fetch(`/api/view?key=${encodeURIComponent(config.templateKey)}`);
    if (!viewResponse.ok) {
      throw new Error('Sertifika şablonu indirme adresi alınamadı.');
    }
    const { signedUrl } = await viewResponse.json();
    if (!signedUrl) {
      throw new Error('Sertifika şablonu için geçerli bir adres bulunamadı.');
    }
    
    // 3. Fetch template PDF content
    const templateResponse = await fetch(signedUrl);
    if (!templateResponse.ok) {
      throw new Error('Şablon PDF dosyası indirilemedi.');
    }
    const templateBytes = await templateResponse.arrayBuffer();
    
    // 4. Fetch the font
    const fontResponse = await fetch(config.fontPath || '/fonts/RTL-Romman-Regular.ttf');
    if (!fontResponse.ok) {
      throw new Error('Yazı tipi (Romman) dosyası indirilemedi.');
    }
    const fontBytes = await fontResponse.arrayBuffer();
    
    // 5. Generate PDF
    const pdfBytes = await generateCertificatePdfBytes(templateBytes, fontBytes, recipientName, config);
    
    // 6. Trigger client side download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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
