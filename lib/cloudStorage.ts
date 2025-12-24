
/**
 * Dosyayı Cloudflare R2'ye yükler (Private Bucket).
 * 
 * 1. Backend'den (Vercel API) güvenli yükleme linki (Presigned URL) alır.
 * 2. Dosyayı doğrudan R2'ye PUT eder.
 * 3. Dosyanın Key'ini döner.
 */
export const uploadFileToR2 = async (file: File, customKey?: string): Promise<string> => {
    try {
        // Fix A: Signed URL üretilirken kullanılan Content-Type, PUT'ta birebir aynı olmalıdır.
        // Tarayıcı boş dönerse application/pdf varsayıyoruz.
        const contentType = file.type || 'application/pdf';

        // 1. Get Presigned URL from our API
        const apiResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: file.name,
                contentType: contentType, // Backend'e tam tipi gönderiyoruz
                customKey
            })
        });

        if (!apiResponse.ok) {
            const err = await apiResponse.json();
            throw new Error(err.error || 'Upload URL alınamadı');
        }

        const { uploadUrl, fileKey } = await apiResponse.json();

        // Validate uploadUrl
        if (!uploadUrl || typeof uploadUrl !== 'string') {
            throw new Error('Geçersiz upload URL.');
        }

        // 2. Upload directly to R2 using the Signed URL
        // Header'daki Content-Type, imzalanan tiple birebir aynı olmak ZORUNDADIR.
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': contentType
            }
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('R2 Upload Error Details:', errorText);
            throw new Error('Dosya sunucuya yüklenemedi. (Hata: ' + uploadResponse.status + ')');
        }

        return fileKey; 
    } catch (error: any) {
        console.error('Upload Failed:', error);
        throw new Error(error.message || 'Dosya yükleme başarısız.');
    }
};

/**
 * Logoyu Cloudflare R2'ye yükler (Public Bucket).
 */
export const uploadPublicLogo = async (file: File, teamId: string): Promise<string> => {
    try {
        const contentType = file.type || 'image/png';

        const apiResponse = await fetch('/api/public-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contentType: contentType,
                teamId
            })
        });

        if (!apiResponse.ok) {
            const err = await apiResponse.json();
            throw new Error(err.error || 'Public Upload URL alınamadı');
        }

        const { uploadUrl, key } = await apiResponse.json();

        if (!uploadUrl || typeof uploadUrl !== 'string') {
            throw new Error('Geçersiz logo upload URL.');
        }

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': contentType
            }
        });

        if (!uploadResponse.ok) {
            throw new Error('Logo sunucuya yüklenemedi.');
        }

        return key;
    } catch (error: any) {
        console.error('Public Upload Failed:', error);
        throw new Error(error.message || 'Logo yükleme başarısız.');
    }
};
