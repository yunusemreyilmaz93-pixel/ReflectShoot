
/**
 * Dosyayı Cloudflare R2'ye yükler (Private Bucket).
 * 
 * 1. Backend'den (Vercel API) güvenli yükleme linki (Presigned URL) alır.
 * 2. Dosyayı doğrudan R2'ye PUT eder.
 * 3. Dosyanın Key'ini veya Private Path'ini döner.
 */
export const uploadFileToR2 = async (file: File, customKey?: string): Promise<string> => {
    try {
        // 1. Get Presigned URL from our API
        const apiResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
                customKey
            })
        });

        if (!apiResponse.ok) {
            const err = await apiResponse.json();
            throw new Error(err.error || 'Upload URL alınamadı');
        }

        const { uploadUrl, publicUrl } = await apiResponse.json();

        // 2. Upload directly to R2 using the Signed URL
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });

        if (!uploadResponse.ok) {
            throw new Error('Dosya R2 sunucusuna yüklenemedi.');
        }

        return publicUrl;
    } catch (error: any) {
        console.error('Upload Failed:', error);
        throw new Error(error.message || 'Dosya yükleme başarısız.');
    }
};

/**
 * Logoyu Cloudflare R2'ye yükler (Public Bucket).
 * 
 * 1. Backend'den (api/public-upload) signed URL alır.
 * 2. Dosyayı R2'ye PUT eder.
 * 3. Dosyanın Key'ini döner (örn: teams/123/logo.png).
 */
export const uploadPublicLogo = async (file: File, teamId: string): Promise<string> => {
    try {
        const apiResponse = await fetch('/api/public-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contentType: file.type,
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
                'Content-Type': file.type
            }
        });

        if (!uploadResponse.ok) {
            throw new Error('Logo R2 sunucusuna yüklenemedi.');
        }

        return key;
    } catch (error: any) {
        console.error('Public Upload Failed:', error);
        throw new Error(error.message || 'Logo yükleme başarısız.');
    }
};