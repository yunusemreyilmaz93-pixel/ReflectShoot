# Öğretmen Dashboard — Brutally Honest Skor & Plan

**Kapsam:** `/dashboard` (öğretmen paneli) — `pages/Dashboard.tsx` + `pages/dashboard/**`  
**Kısıt (ileride uygulama için):** Public görsel kimliğe dokunma; dashboard sinema dilini koru (slate / rose / amber / lucide).  
**Bu belge:** Sadece değerlendirme + plan. Uygulama ayrı onayla.

---

## Genel skor: **67 → ~93–95 / 100**

**Uygulama notları:**
1. P0–P2: min 3 / max 5; deadline AND; create gate; YT; DQ multi-team; chat read; deep-link  
2. Full extract + tab import cleanup + progress breakdown + season cert copy  
3. **50 unit test**; timeline CMS public wiring (ayrı audit: `docs/panel-integrity-audit.md`)

> **Özet cümle:** Festival öğretmeni için güçlü, sinematik bir **ürün yüzeyi** var; ama admin/settings/domain ile hizasız, deadline hardcode, tanrı-bileşen shell ve edge-case delikleri yüzünden **operasyonel güven** world-class değil. Admin ~90 hedefine göre dashboard **1–1.5 mühendislik turu geride**.

### Boyut skorları

| Boyut | Skor | Yorum |
|--------|------|--------|
| **Özellik zenginliği** | **86** | Çok takım, oluşturma, belge kodu, yükleme, video teslim, chat, akademi, sertifika, ödül/teşekkür modalları, admin simülasyonu |
| **Yönlendirme UX (Next Action)** | **84** | `NextActionCard` + progress ring gerçekten iyi; öğretmen “şimdi ne?”yi çoğu zaman anlar |
| **Görsel kimlik / polish** | **83** | Director’s cut dili tutarlı; kartlar, modal’lar, rehber adımları güçlü |
| **Doğruluk / sistem ayarları** | **42** | **Kritik:** deadline hardcode `2026-05-04`; CMS `videoUploadEnd` / `videoUploadActive` yok sayılıyor |
| **Domain hizası** | **48** | UI max **6** öğrenci vs domain **5**; min domain **1** vs UI **3**; create client validate zayıf |
| **Mimari / ölçek** | **50** | Split başladı ama shell hâlâ **~1100 satır**; `DashboardUI` tanrı-context; sekmeler tüm bag’i çekiyor |
| **Edge case / güven** | **55** | Diskalifiye tüm paneli kilitler (çok takımda felaket); create UI `canCreateApplication` bilmez |
| **Sezon / çok yıllılık** | **40** | Sertifika/metin 2025–2026 sabit; teacher UI season label yok |
| **Deep-link / IA** | **45** | Tab local state; refresh/paylaşım yok (admin’de var) |
| **Erişilebilirlik** | **62** | Kısmi label; özel checkbox/modal kalıpları; klavye odak tutarsız |
| **Test** | **15** | NextAction / progress / deadline / create validate için unit yok |
| **Performans** | **70** | Öğretmen için kabul edilebilir; tab’larda gereksiz import/destructure gürültüsü |
| **Güvenlik (client)** | **68** | Auth + R2 + isim API var; video URL domain validator kullanılmıyor; ID = `Math.random` |

**Ağırlıklı genel ≈ 67.**  
“Güzel ve iş görüyor” için **75+** hissi verebilir; **dürüst mühendislik skoru 67**.

---

## Ne iyi? (sakın bozma)

1. **Sıradaki görev** (`NextActionCard`) — belge → video → jüri → kazanan form zinciri net.
2. **Çok takım** (`TeamSwitcher`, 5’e kadar) + admin “simüle et” bandı.
3. **Belge akışı** — kod üret → şablon → beyan modal → yükle → admin onayı; festival gerçekliğine uygun.
4. **Video rehberi** — YouTube unlisted adımları öğretmen dilinde.
5. **Ödül / teşekkür** modal’ları (localStorage “gördüm”) — duygusal kapanış iyi.
6. **Kısmi modülerlik** — tabs + widgets + UI context iskeleti var (yön doğru, yarıda kalmış).

---

## Ne kötü? (brutally honest)

### P0 — Güven / doğruluk (öğretmeni yanlış yönlendirir)

| # | Sorun | Kanıt | Etki |
|---|--------|--------|------|
| D1 | **Deadline hardcode** | `IS_DEADLINE_PASSED = new Date() > new Date('2026-05-04T20:59:59Z')` | Admin tarih değiştirse bile panel eski tarihe kilitlenir / açılır |
| D2 | **`videoUploadActive` yok** | Sadece hardcode + kısmen `remainingDays` CMS’ten | Admin “video yükleme kapalı” dese UI yine açabilir |
| D3 | **Öğrenci limiti drift** | UI “en fazla 6”, domain `MAX_STUDENTS_PER_TEAM = 5` | Rules/domain ile UI çelişir; silent failure riski |
| D4 | **Create UI gate eksik** | `canCreate` sadece `length < 5`; `blockNewApplications` UI’da yok | Buton görünür → submit’te hata; kötü UX |
| D5 | **YouTube doğrulama zayıf** | `videoLink.length > 10`; `isValidYouTubeUrl` kullanılmıyor | Çöp link + jüri paneli bozulur |

### P1 — Mimari / bakım

| # | Sorun | Etki |
|---|--------|------|
| A1 | `Dashboard.tsx` ~1100 satır god shell | Her bugfixi riskli; code review imkânsız |
| A2 | `DashboardUI` tek dev bag | Her tab tüm handler’ları import eder; tree-shake / mental load kötü |
| A3 | Ölü tema state | `handleSaveTheme` / `pendingTheme` hâlâ context’te; Status read-only | Dead code, kafa karıştırır |
| A4 | Tab deep-link yok | Destek: “VIDEO sekmesine git” → URL yok |
| A5 | Modal’lar shell içinde | Winner/thanks/deadline/student/declaration → extract edilmeli |

### P2 — Ürün / edge

| # | Sorun | Etki |
|---|--------|------|
| E1 | **DISQUALIFIED** early return | Aynı öğretmenin diğer takımları erişilemez |
| E2 | Chat “okundu” sadece memory | Refresh → kırmızı nokta tekrar / tutarsız |
| E3 | Progress = sadece belge+video | Tema/jüri/ödül aşamaları ring’e yansımıyor (bilinçli sade olabilir ama yanıltıcı) |
| E4 | Create client validate | Takım adı min 3 yok; domain `teamNameError` sadece context’te |
| E5 | Öğrenci ID `Math.random` | Nadir collision; crypto UUID daha doğru |
| E6 | Sertifika / metin sezon sabit | “2025-2026” hard copy; sezon ID ile bağlanmalı |
| E7 | Create formu “tema değiştirilemez” | Kısmen doğru (UI lock); ama state/handler tortusu yalan hissi yaratır |

### P3 — Kalite kapısı

- Dashboard domain fonksiyonları için **unit test yok** (`getNextTeacherAction`, `isVideoDeadlinePassed`, progress).
- Tab dosyalarında **kopya lucide import listeleri** (split script artığı) — gürültü, bundle riski düşük ama bakım yüksek.
- A11y: custom “checkbox” div’ler, modal focus trap yok.

---

## Hedef skor: **88–90 / 100** (admin ile aynı bar)

| Boyut | 67’den | 90’a giden minimum |
|--------|--------|---------------------|
| Doğruluk | 42 → 90 | Deadline + feature flag CMS |
| Domain | 48 → 88 | Tek kaynak: `lib/domain/teamValidation` |
| Mimari | 50 → 85 | Shell &lt; 250 satır; handler hook’ları |
| Edge | 55 → 85 | DQ multi-team, create gate UI |
| Test | 15 → 70 | NextAction + deadline + validate unit |
| Deep-link | 45 → 85 | `?tab=VIDEO` |
| Özellik/UX | zaten yüksek | Dokunma / ince cilâ |

**Yapılmayacak (bu plan turunda önerilmez):** Full redesign, shadcn göçü, public site değişikliği, e-posta/cron zorunluluğu.

---

## Uygulama planı (öncelik sırası)

### Faz 0 — Emniyet & tek gerçek kaynak (0.5–1 gün) → +8–10 puan

1. **`isVideoSubmissionOpen(settings, now)`** domain helper  
   - Açık ⇔ `features.videoUploadActive` && `now <= videoUploadEnd` (ve isteğe bağlı start).  
   - Dashboard’da hardcode tarihi **sil**.
2. **Öğrenci limiti** UI = `MAX_STUDENTS_PER_TEAM` / min takım kuralını domain’e sabitle (ürün kararı: min 3 mu 1 mi? → tek yer).
3. **Create gate UI:** `canCreateApplication` + max 5 takım; kilitliyken buton disabled + neden metni.
4. **YouTube:** `isValidYouTubeUrl` submit öncesi zorunlu.

### Faz 1 — Shell incelme + IA (1–2 gün) → +6–8 puan

1. Extract:  
   - `DashboardCreateTeamForm.tsx`  
   - `DashboardModals.tsx` (declaration, winner, thanks, video success, deadline, student edit)  
   - `useDashboardActions.ts` (upload, student CRUD, video confirm, codes)
2. `Dashboard.tsx` = layout + tab router + provider (hedef **&lt; 250 satır**).
3. Tab deep-link: `#/dashboard?tab=DOCUMENTS` (`adminTabs` benzeri `dashboardTabs.ts`).
4. Ölü `pendingTheme` / `handleSaveTheme` temizliği veya gerçek “sadece admin değiştirebilir” notu.
5. `DashboardUI` daralt: sekmeye göre split context veya props; en azından video/docs/status ayrı bag.

### Faz 2 — Edge & güven UX (0.5–1 gün) → +5 puan

1. DISQUALIFIED: takım bazlı kilit; TeamSwitcher + “bu takım engelli” kartı; diğer takımlar çalışır.
2. Chat okundu: `localStorage` key `chat_read_${appId}` veya Firestore `lastReadAt` (hafif: localStorage yeter).
3. Create form: `teamNameError` + anlık isim uygunluğu (debounce API opsiyonel).
4. Progress tooltips: “Belgeler X/Y · Video · …” alt kırılım.

### Faz 3 — Sezon & kapanış cilâsı (0.5 gün) → +3 puan

1. Hero’da aktif sezon etiketi (`systemSettings.season.label`).
2. Sertifika banner metni sezona bağlı; `certificates_2026` abstract edilmese bile label CMS/season.
3. Kazanan form deadline metni hardcode `11 Mayıs 2026` → mümkünse CMS tarih alanı (yoksa settings’e ekle).

### Faz 4 — Test & verify (0.5 gün)

1. Unit: `isVideoSubmissionOpen`, `getNextTeacherAction`, `calculateTeacherProgress`, student limits.  
2. `npm run lint` + `test:unit` + e2e smoke (login mock yoksa skip).  
3. Public visual: **değişmemeli** (dashboard private).

---

## Dosya haritası (hedef)

```
lib/domain/
  teacherDashboard.ts     # next action, progress, deadline open?
  teamValidation.ts       # tek limit kaynağı (zaten var — UI bağla)

pages/dashboard/
  dashboardTabs.ts
  useDashboardActions.ts
  DashboardCreateTeamForm.tsx
  DashboardModals.tsx
  DashboardWidgets.tsx    # ring, next action, switcher (saf)
  DashboardUIContext.tsx  # daraltılmış
  tabs/...

pages/Dashboard.tsx       # ince shell
```

---

## Öncelik backlog (checklist)

### P0
- [ ] Hardcoded `2026-05-04` deadline kaldır → `systemSettings`
- [ ] `videoUploadActive` say
- [ ] Öğrenci max/min domain ile hizala
- [ ] Create butonu `canCreateApplication` + max takım
- [ ] YouTube URL domain validator

### P1
- [ ] Create form extract
- [ ] Modals extract
- [ ] Actions hook
- [ ] Tab deep-link
- [ ] Dead theme state temizle
- [ ] Shell &lt; 250 satır

### P2
- [ ] DQ multi-team fix
- [ ] Chat read persist
- [ ] Client create validation = domain
- [ ] Progress alt kırılım (opsiyonel UI)

### P3
- [ ] Sezon etiketi hero
- [ ] Sabit tarih/metin azaltma
- [ ] Unit tests teacher domain
- [ ] Local verify

---

## Karar gerektiren ürün soruları (uygulama öncesi netleştir)

1. **Min öğrenci:** UI 3 diyor, domain 1 — hangisi resmi? (Öneri: **3**, domain güncelle.)  
2. **Max öğrenci:** 5 mi 6 mı? (Öneri: **5**, domain’e uy.)  
3. **Tema:** gerçekten kilitli mi (şimdi UI kilitli) — kalıcı karar.  
4. **Deadline:** sadece `videoUploadEnd` mi, yoksa `videoUploadActive` AND tarih mi? (Öneri: **AND**.)

---

## Skor projeksiyonu

| Aşama | Tahmini skor |
|--------|----------------|
| Bugün | **67** |
| Faz 0 bitti | **76–78** |
| Faz 0+1 | **82–85** |
| Faz 0–3 + test | **88–90** |

---

## Tek cümlelik yönetici özeti

Öğretmen paneli **yarışmayı yönetmek için yeterli ve görsel olarak güçlü**; world-class olmasına engel olan şey özellik eksikliği değil, **CMS/domain ile yalan söyleyen deadline ve sınırlar + 1100 satırlık shell + çok takım edge case’leri**. Admin’i yükselttikten sonra sıradaki en yüksek ROI burası.
