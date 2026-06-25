export interface StudentInfo {
    firstName: string;
    lastName: string;
}

// Automatic Slugification Helpers for R2 Bucket URLs
const toTeamSlug = (text: string): string => {
    const trMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'I': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u'
    };
    let clean = text.toLowerCase().trim();
    for (const key in trMap) {
        clean = clean.replace(new RegExp(key, 'g'), trMap[key]);
    }
    // Replace '-i' word connection with 'i', and other hyphens with spaces
    let prepared = clean.replace(/-i\b/g, 'i').replace(/-/g, ' ');
    const words = prepared.split(/[\s_]+/).filter(Boolean);
    const slug = words.join('_');
    if (slug === '5n1k' || slug === '5_n_1_k' || slug.includes('5n1k')) {
        return '5n1k_ekibi';
    }
    return slug;
};

const toPascalUnderscore = (text: string): string => {
    const trMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G',
        'ı': 'i', 'I': 'I', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S',
        'ü': 'u', 'Ü': 'U'
    };
    let clean = text.trim();
    for (const key in trMap) {
        clean = clean.replace(new RegExp(key, 'g'), trMap[key]);
    }
    const words = clean.split(/[\s\-_]+/);
    return words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .filter(Boolean)
        .join('_');
};

const toSnakeCase = (text: string): string => {
    const trMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'I': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u'
    };
    let clean = text.toLowerCase().trim();
    for (const key in trMap) {
        clean = clean.replace(new RegExp(key, 'g'), trMap[key]);
    }
    const words = clean.split(/[\s\-_]+/).filter(Boolean);
    return words.join('_');
};

/**
 * Returns the custom 2026 advisor/teacher certificate URL based on teacher's full name.
 * Returns null if no custom certificate exists.
 */
export const getTeacherCertificateUrl_2026 = (teacherNameInput: string, teamNameInput?: string): string | null => {
    const teacherName = (teacherNameInput || "").toLowerCase();
    if (teacherName.includes("hafize") && (teacherName.includes("kırdı") || teacherName.includes("kirdi"))) {
        return "https://assets.reflectandshoot.com/certificates/ethereal_nova/Hafize_K%C4%B1rd%C4%B1_danisman.pdf";
    }
    if (teacherName.includes("burak") && (teacherName.includes("hoşgören") || teacherName.includes("hosgoren"))) {
        return "https://assets.reflectandshoot.com/certificates/mor_kelebekler/burak_hosgoren_danisman.pdf";
    }
    if (teacherName.includes("salih") && (teacherName.includes("birköse") || teacherName.includes("birkose"))) {
        return "https://assets.reflectandshoot.com/certificates/mkail_angels/salih_birkose_danisman.pdf";
    }
    if (teacherName.includes("elif") && (teacherName.includes("koç") || teacherName.includes("koc") || teacherName.includes("zeycan"))) {
        return "https://assets.reflectandshoot.com/certificates/ummeti_muhammed/elif_zeycan_koc.pdf";
    }

    // Dynamic Automatic Fallback
    if (teamNameInput) {
        const teamSlug = toTeamSlug(teamNameInput);
        const teacherSlug = toSnakeCase(teacherNameInput);
        return `https://assets.reflectandshoot.com/certificates/${teamSlug}/${teacherSlug}_danisman.pdf`;
    }

    return null;
};

/**
 * Returns the custom 2026 student certificate URL based on student's name and team name.
 * Returns null if no custom certificate exists.
 */
export const getStudentCertificateUrl_2026 = (student: StudentInfo, teamNameInput: string): string | null => {
    const teamName = (teamNameInput || "").toLowerCase().trim();
    const f = (student.firstName || "").toLowerCase().trim();
    const l = (student.lastName || "").toLowerCase().trim();
    const full = `${f} ${l}`;

    if (teamName.includes("ümmet") || teamName.includes("ummet") || teamName.includes("muhammed")) {
        if (full.includes("ahmet") || full.includes("sarı") || full.includes("sari")) {
            if (!full.includes("metehan")) {
                return "https://assets.reflectandshoot.com/certificates/ummeti_muhammed/Ahmet_Salih_Sari.pdf";
            }
        }
        if (full.includes("hüseyin") || full.includes("huseyin") || full.includes("batuhan")) {
            return "https://assets.reflectandshoot.com/certificates/ummeti_muhammed/Huseyin_Batuhan.pdf";
        }
        if (full.includes("metehan") || full.includes("sarıyıldız") || full.includes("sariyildiz")) {
            return "https://assets.reflectandshoot.com/certificates/ummeti_muhammed/Metehan_Sariyildiz.pdf";
        }
        if (full.includes("muhammed") && (full.includes("salih") || !full.includes("ahmet"))) {
            return "https://assets.reflectandshoot.com/certificates/ummeti_muhammed/Muhammed_Salih.pdf";
        }
        if (full.includes("murad") || full.includes("humbatov") || full.includes("murat")) {
            return "https://assets.reflectandshoot.com/certificates/ummeti_muhammed/Murad_Humbatov.pdf";
        }
        if (full.includes("yiğit") || full.includes("yigit") || full.includes("efe")) {
            return "https://assets.reflectandshoot.com/certificates/ummeti_muhammed/Yigit_Efe.pdf";
        }
    }

    if (teamName.includes("ethereal") && teamName.includes("nova")) {
        if (full.includes("ayşenaz") || full.includes("aysenaz") || full.includes("ucar") || full.includes("uçar")) {
            return "https://assets.reflectandshoot.com/certificates/ethereal_nova/aysenaz_ucar.pdf";
        }
        if (full.includes("feyzanur") || full.includes("sarısakal") || full.includes("sarisakal")) {
            return "https://assets.reflectandshoot.com/certificates/ethereal_nova/feyzanur_sarisakal.pdf";
        }
        if (full.includes("gülten") || full.includes("gulten") || full.includes("ayan")) {
            return "https://assets.reflectandshoot.com/certificates/ethereal_nova/gulten_ayan.pdf";
        }
    }

    if (teamName.includes("mor") && (teamName.includes("kelebek") || teamName.includes("kelebekler"))) {
        if (full.includes("beril")) {
            return "https://assets.reflectandshoot.com/certificates/mor_kelebekler/beril.pdf";
        }
        if (full.includes("derya")) {
            return "https://assets.reflectandshoot.com/certificates/mor_kelebekler/derya.pdf";
        }
        if (full.includes("tolgahan")) {
            return "https://assets.reflectandshoot.com/certificates/mor_kelebekler/tolgahan.pdf";
        }
    }

    if (teamName.includes("mkail") || teamName.includes("angels")) {
        if (full.includes("nisa")) {
            return "https://assets.reflectandshoot.com/certificates/mkail_angels/mkail_angels_nisa.pdf";
        }
        if (full.includes("hanne") || full.includes("meryem")) {
            return "https://assets.reflectandshoot.com/certificates/mkail_angels/mkail_angels_hanne.pdf";
        }
        if (full.includes("ecesu") || full.includes("kavalcıoğlu") || full.includes("kavalcioglu")) {
            return "https://assets.reflectandshoot.com/certificates/mkail_angels/mkail_angels_Ecesu%20Kavalc%C4%B1o%C4%9Flu.pdf";
        }
    }

    if (teamName.includes("three") || teamName.includes("threee")) {
        if (full.includes("ecrin") || full.includes("ışık") || full.includes("isik") || full.includes("işik") || full.includes("isık")) {
            return "https://assets.reflectandshoot.com/certificates/threee/threee_ecrin.pdf";
        }
        if (full.includes("elif") || full.includes("tek")) {
            return "https://assets.reflectandshoot.com/certificates/threee/threee_elif_tek.pdf";
        }
        if (full.includes("erva") || full.includes("safi")) {
            return "https://assets.reflectandshoot.com/certificates/threee/threee_erva_safi.pdf";
        }
    }

    if (teamName.includes("open") || teamName.includes("ideas")) {
        if (full.includes("ecrin") || full.includes("sare") || full.includes("guzel") || full.includes("güzel")) {
            return "https://assets.reflectandshoot.com/certificates/open_ideas/open_ideas_ecrin_sare_guzel.pdf";
        }
        if (full.includes("saliha") || full.includes("meryem") || full.includes("hatunoglu") || full.includes("hatunoğlu")) {
            return "https://assets.reflectandshoot.com/certificates/open_ideas/open_ideas_saliha_meryem.pdf";
        }
        if (full.includes("zeynep") || full.includes("erkul")) {
            return "https://assets.reflectandshoot.com/certificates/open_ideas/open_ideas_zeynep_erkul.pdf";
        }
    }

    // Dynamic Automatic Fallback
    if (teamNameInput) {
        const teamSlug = toTeamSlug(teamNameInput);
        const studentSlug = toPascalUnderscore(`${student.firstName} ${student.lastName}`);
        return `https://assets.reflectandshoot.com/certificates/${teamSlug}/${studentSlug}.pdf`;
    }

    return null;
};
