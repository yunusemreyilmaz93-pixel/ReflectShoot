
/**
 * Dosyayı Cloudflare R2'ye yükler (Private Bucket).
 * 
 * 1. Backend'den (Vercel API) güvenli yükleme linki (Presigned URL) alır.
 * 2. Dosyayı doğrudan R2'ye PUT eder.
 * 3. Dosyanın Key'ini döner.
 */
export const uploadFileToR2 = async (file: File, customKey?: string): Promise<string> => {
    try {
        // PDF dosyaları için tarayıcı tipi bazen eksik dönebilir, garantiye alıyoruz.
        let contentType = file.type;
        if (!contentType && file.name.toLowerCase().endsWith('.pdf')) {
            contentType = 'application/pdf';
        }
        contentType = contentType || 'application/octet-stream';

        // 1. Get Presigned URL from our API
        const apiResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: file.name,
                contentType: contentType,
                customKey
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
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': contentType
            }
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('R2 Upload Detail:', errorText);
            throw new Error(`Dosya R2'ye yüklenemedi. Durum: ${uploadResponse.status}`);
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
        throw error;
    }
};
