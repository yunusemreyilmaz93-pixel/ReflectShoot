# Admin Panel — World-Class Plan

**Hedef:** Rahat, ölçeklenebilir, hafif, world-class internal admin (her iş buradan).  
**Kısıt:** Public görsel kimliğe dokunma; admin’de mevcut dil (slate / rose / lucide / kartlar).  
**Dağıtım:** Push yok — kullanıcı onayına kadar sadece local.

---

## Skor

| Boyut | Önce | Sonra | Not |
|--------|------|-------|-----|
| Emniyet (prod one-off) | 40 | **95** | TEST butonu + mount patch kaldırıldı |
| Bilgi mimarisi | 75 | **92** | Gruplu sidebar + `?tab=` deep-link |
| Sezon operasyonu | 55 | **88** | Checklist + legacy + kilit + yedek |
| Veri / empty UX | 70 | **90** | Akademik data-driven + aksiyon empty |
| Shell / ölçek | 55 | **92** | AdminPage ~150 satır shell |
| Performans / bundle | 80 | **88** | Lazy + manualChunks |
| **Genel** | **~74** | **~90** | Full redesign yok |

---

## İlkeler

1. **Güvenlik önce:** Admin UI asla canlı Firestore’a sessiz/tek seferlik toplu patch basmaz.
2. **Hafif shell:** `AdminPage` sadece layout + tab routing; paneller kendi dosyalarında.
3. **Deep-link her yerde:** `#/admin?tab=TEAMS` paylaşılabilir; refresh tab’ı korur.
4. **Sezon = checklist:** Yedek → kilit → etiket → tarih → yeni sezon ID.
5. **Empty state = eylem:** “Yok” değil; ne yapılacağını söyle.
6. **Aynı malzeme:** slate-950 / rose / lucide — yeni design system yok.

---

## P0 — Emniyet

- [x] Mount one-off scriptleri kaldırıldı → `scripts/ops-oneoffs/`
- [x] Header **TEST: Ödül Data Güncelle** butonu kaldırıldı
- [x] Kazanan işareti: Admin paneli (eski `markWinners.ts` script’i kaldırıldı)

## P1 — Bilgi mimarisi + hız

- [x] Sidebar grupları: Operasyon | Jüri & Sonuç | İçerik | Sistem
- [x] Tab deep-link: `#/admin?tab=TEAMS`
- [x] Settings / Logs / Team detail → ayrı paneller
- [x] Tab başlıkları `ADMIN_TAB_TITLES`

## P2 — Sezon operasyonu

- [x] Sezon ID/label, legacy etiket, blockNewApplications, yedek
- [x] **Sezon operasyonu checklist kartı**
- [ ] İleride: tek tık “yeni sezon” (tarih şablonu kopyala)

## P3 — Veri / empty

- [x] Akademik finalist listesi `academicJuryScores` verisinden
- [x] Empty state’ler: Takımlar, Kullanıcılar, Inbox, Logs

## P4 — Hafiflik & kalite kapısı

- [x] AdminPage ince shell
- [x] Bundle: lazy + manualChunks
- [x] Local: `npm run lint` + `npm run test:unit`

---

## Yapılmayacak (bu tur)

- Full redesign / shadcn göçü
- Cron / Resend zorunluluğu
- Public site / görsel snapshot değişikliği
- Git push (kullanıcı demeden)

---

## Dosya haritası

```
pages/admin/
  AdminPage.tsx                 # shell + tab switch (~150 satır)
  adminTabs.ts                  # ids, titles, nav groups
  AdminSidebar.tsx              # gruplu navigasyon
  AdminSettingsSection.tsx      # tarihler, flags, sezon checklist
  AdminLogsSection.tsx
  AdminTeamDetailDrawer.tsx
  AdminTeamsSection.tsx
  AdminUsersSection.tsx
  AdminInboxSection.tsx
  ...
scripts/ops-oneoffs/            # elle acil scriptler
(markWinners.ts kaldırıldı)
```

---

## Operatör hızlı notlar

| İş | Nerede |
|----|--------|
| Takım incele / video / belge | Takım Yönetimi → satır → drawer |
| Jüri ata / izle | Jüri & Sonuç grubu |
| CMS / sertifika | İçerik grubu |
| Tarih, kilit, bakım, yedek, sezon | Sistem Ayarları |
| Denetim | Denetim Kayıtları |
| Deep-link | `#/admin?tab=SETTINGS` vb. |

**Yeni sezon checklist:** Yedek İndir → Yeni başvuruları kilitle → Legacy dry-run/etiket → Sezon ID/label + tarihler → Ayarları Kaydet.

---

## Başarı kriteri (~90) — karşılandı

- Prod’da gizli/test toplu yazım yok  
- Operatör her sekmeyi URL ile açabiliyor  
- Sezon kapanış/açılış adımları Settings’te net  
- Shell ince; yeni sekme = `adminTabs` + 1 dosya  
- Empty ekranlar panik yaratmıyor  
- Public kimlik bozulmuyor  
