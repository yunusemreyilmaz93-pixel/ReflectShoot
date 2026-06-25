export interface StudentInfo {
    firstName: string;
    lastName: string;
}

/**
 * Returns the custom 2026 advisor/teacher certificate URL based on teacher's full name.
 * Returns null if no custom certificate exists.
 */
export const getTeacherCertificateUrl_2026 = (teacherNameInput: string): string | null => {
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
    return null;
};
