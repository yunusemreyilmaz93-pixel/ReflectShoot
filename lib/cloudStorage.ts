
import { jsPDF } from 'jspdf';
import { authenticatedFetch } from './authenticatedFetch';

/**
 * Dosyayı Cloudflare R2'ye yükler (Private Bucket).
 * 
 * 1. Eğer dosya bir resimse ve PDF isteniyorsa otomatik olarak PDF'e dönüştürür.
 * 2. Backend'den (Vercel API) güvenli yükleme linki (Presigned URL) alır.
 * 3. Dosyayı doğrudan R2'ye PUT eder.
 * 4. Dosyanın Key'ini döner.
 */
export const uploadFileToR2 = async (file: File, customKey?: string): Promise<string> => {
    try {
        let fileToUpload: File | Blob = file;
        let contentType = file.type;
        let fileName = file.name;

        // Otomatik PDF Dönüştürücü: Eğer resim yüklendiyse ve PDF olması gerekiyorsa (belgeler için)
        // Not: customKey genelde 'parental' veya 'kvkk' içerir, bu belgelerin PDF olması istenir.
        const isImage = file.type.startsWith('image/');
        const shouldBePdf = customKey && (customKey.includes('parental') || customKey.includes('kvkk'));

        if (isImage && shouldBePdf) {
            console.log('Resim dosyası PDF\'e dönüştürülüyor...');
            const pdf = new jsPDF();
            const imgData = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
            
            // Resmi PDF'e sığdır
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            const pdfBlob = pdf.output('blob');
            fileToUpload = pdfBlob;
            contentType = 'application/pdf';
            fileName = fileName.replace(/\.[^/.]+$/, "") + ".pdf";
        }

        // PDF dosyaları için tarayıcı tipi bazen eksik dönebilir, garantiye alıyoruz.
        if (!contentType && fileName.toLowerCase().endsWith('.pdf')) {
            contentType = 'application/pdf';
        }
        contentType = contentType || 'application/octet-stream';

        // 1. Get Presigned URL from our API
        const apiResponse = await authenticatedFetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: fileName,
                contentType: contentType,
                customKey,
                fileSize: fileToUpload.size
            })
        });

        if (!apiResponse.ok) {
            const err = await apiResponse.json();
            throw new Error(err.error || 'Upload URL alınamadı');
        }

        const { uploadUrl, fileKey } = await apiResponse.json();

        if (!uploadUrl) {
            throw new Error('Sunucudan geçerli bir yükleme adresi alınamadı.');
        }

        // 2. Upload directly to R2 using the Signed URL
        // Header'daki Content-Type, imzalanan tiple birebir aynı olmak ZORUNDADIR.
        let uploadResponse: Response | null = null;
        let retries = 2;
        let lastError: any = null;

        while (retries >= 0) {
            try {
                console.log(`R2 Uploading... (Attempts left: ${retries})`);
                uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: fileToUpload,
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': contentType
                    }
                });
                
                if (uploadResponse.ok) break;
                
                const errorText = await uploadResponse.text();
                console.error(`R2 Upload Attempt Failed (${uploadResponse.status}):`, errorText);
                lastError = new Error(`Dosya R2'ye yüklenemedi. Durum: ${uploadResponse.status}`);
            } catch (err: any) {
                console.error(`R2 Fetch Error (Attempt ${2 - retries}):`, err);
                lastError = err;
            }
            
            retries--;
            if (retries >= 0) await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
        }

        if (!uploadResponse || !uploadResponse.ok) {
            throw lastError || new Error('Bilinmeyen bir hata nedeniyle yükleme başarısız oldu.');
        }

        return fileKey; 
    } catch (error: any) {
        console.error('uploadFileToR2 Error:', error);
        throw error;
    }
};

/**
 * Logoyu Cloudflare R2'ye yükler (Public Bucket).
 */
export const uploadPublicLogo = async (file: File, teamId: string): Promise<string> => {
    try {
        const contentType = file.type || 'image/png';

        const apiResponse = await authenticatedFetch('/api/public-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contentType: contentType,
                teamId,
                fileSize: file.size
            })
        });

        if (!apiResponse.ok) {
            const err = await apiResponse.json();
            throw new Error(err.error || 'Public Upload URL alınamadı');
        }

        const { uploadUrl, key } = await apiResponse.json();

        let uploadResponse: Response | null = null;
        let retries = 2;
        let lastError: any = null;

        while (retries >= 0) {
            try {
                uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': contentType
                    }
                });
                if (uploadResponse.ok) break;
            } catch (err: any) {
                lastError = err;
            }
            retries--;
            if (retries >= 0) await new Promise(r => setTimeout(r, 1000));
        }

        if (!uploadResponse || !uploadResponse.ok) {
            throw lastError || new Error('Logo sunucuya yüklenemedi.');
        }

        return key;
    } catch (error: any) {
        console.error('Public Upload Failed:', error);
        throw error;
    }
};
