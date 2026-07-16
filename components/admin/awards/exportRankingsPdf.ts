/** Official rankings print HTML (unchanged markup). */
export function exportRankingsPDF(): void {
  const content = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
  <meta charset="UTF-8">
  <title>Reflect & Shoot - Resmi Ödül Sıralama Listesi</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
     @page { size: A4 portrait; margin: 10mm; }
     body {
       font-family: 'Inter', sans-serif;
       color: #0f172a;
       background-color: #ffffff;
       margin: 0;
       padding: 0;
       -webkit-print-color-adjust: exact;
       print-color-adjust: exact;
     }
     .page {
       page-break-after: always;
       border: 3px double #d4af37;
       padding: 40px;
       border-radius: 8px;
       box-sizing: border-box;
       min-height: 275mm;
       display: flex;
       flex-direction: column;
       justify-content: flex-start;
       margin-bottom: 20px;
     }
     .page:last-child {
       page-break-after: avoid;
       margin-bottom: 0;
     }
     .logo-table {
       width: 100%;
       border-collapse: collapse;
       margin-bottom: 25px;
     }
     .header-logo {
       height: 65px;
       object-fit: contain;
     }
     .header-section {
       text-align: center;
       border-bottom: 2px solid #e2e8f0;
       padding-bottom: 15px;
       margin-bottom: 30px;
     }
     .main-title {
       font-family: 'Cinzel', serif;
       font-size: 22pt;
       color: #0f172a;
       margin: 5px 0;
       letter-spacing: 1.5px;
       font-weight: 800;
     }
     .sub-title {
       font-family: 'Cinzel', serif;
       font-size: 13pt;
       color: #b45309;
       margin: 0 0 10px 0;
       letter-spacing: 4px;
       font-weight: 600;
       text-transform: uppercase;
     }
     .doc-date {
       font-size: 10pt;
       color: #64748b;
       font-weight: 500;
     }
     .category-title {
       font-family: 'Cinzel', serif;
       font-size: 14pt;
       color: #1e293b;
       border-bottom: 2px solid #b45309;
       padding-bottom: 6px;
       margin-top: 20px;
       margin-bottom: 20px;
       text-transform: uppercase;
       font-weight: bold;
     }
     .data-table {
       width: 100%;
       border-collapse: collapse;
       margin-top: 10px;
     }
     .data-table th {
       background-color: #f8fafc;
       border-bottom: 2px solid #cbd5e1;
       color: #334155;
       font-weight: 700;
       font-size: 10pt;
       text-align: left;
       padding: 12px;
     }
     .data-table td {
       font-size: 10pt;
       padding: 14px 12px;
       border-bottom: 1px solid #f1f5f9;
     }
     .rank-cell {
       width: 25%;
     }
     .team-cell {
       font-weight: 700;
       width: 35%;
       color: #0f172a;
     }
     .school-cell {
       color: #475569;
       width: 40%;
     }
     .badge-rank {
       display: inline-block;
       padding: 4px 12px;
       border-radius: 99px;
       font-size: 9.5pt;
       font-weight: 800;
       text-align: center;
     }
     .badge-rank.gold {
       background: #fef3c7;
       color: #92400e;
       border: 1px solid #fde68a;
     }
     .badge-rank.special {
       background: #f0fdf4;
       color: #166534;
       border: 1px solid #bbf7d0;
     }
     .badge-rank.mention {
       background: #eff6ff;
       color: #1e40af;
       border: 1px solid #bfdbfe;
     }
  </style>
      </head>
      <body>
  <!-- PAGE 1: CANLI ÇEKİM -->
  <div class="page">
    <table class="logo-table">
      <tr>
        <td style="text-align:left; border:none; padding:0;">
          <img class="header-logo" src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Reflect & Shoot">
        </td>
        <td style="text-align:right; border:none; padding:0;">
          <img class="header-logo" src="https://assets.reflectandshoot.com/20113118_yeni_logo_konyaihl.png" alt="Konya Anadolu İHL">
        </td>
      </tr>
    </table>

    <div class="header-section">
      <div class="main-title">REFLECT & SHOOT YARIŞMASI</div>
      <div class="sub-title">Resmi Ödül Sıralama Listesi</div>
      <div class="doc-date">Tarih: 22 Mayıs 2026</div>
    </div>

    <div class="category-title">🏆 CANLI ÇEKİM ÖDÜL SIRALAMASI</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Derece / Ödül</th>
          <th>Takım Adı</th>
          <th>Okul Adı</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="rank-cell"><span class="badge-rank gold">1. Derece</span></td>
          <td class="team-cell">Sosyal Kızlar42</td>
          <td class="school-cell">Konya Türk Telekom Sosyal Bilimler Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank gold">2. Derece</span></td>
          <td class="team-cell">Diriliş Perileri</td>
          <td class="school-cell">Güngören İTO Kız Anadolu İmam Hatip Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank gold">3. Derece</span></td>
          <td class="team-cell">sinemektep</td>
          <td class="school-cell">Güngören İTO Kız Anadolu İmam Hatip Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank special">Jüri Özel</span></td>
          <td class="team-cell">Homines Longinqui</td>
          <td class="school-cell">Uluslararası Mevlana Anadolu İmam Hatip Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank mention">Mansiyon</span></td>
          <td class="team-cell">Justice Without Doubt</td>
          <td class="school-cell">Mahmut Sami Ramazanoğlu Anadolu İmam Hatip Lisesi</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PAGE 2: YAPAY ZEKÂ -->
  <div class="page">
    <table class="logo-table">
      <tr>
        <td style="text-align:left; border:none; padding:0;">
          <img class="header-logo" src="https://assets.reflectandshoot.com/Reflect_Shoot_Logo.png" alt="Reflect & Shoot">
        </td>
        <td style="text-align:right; border:none; padding:0;">
          <img class="header-logo" src="https://assets.reflectandshoot.com/20113118_yeni_logo_konyaihl.png" alt="Konya Anadolu İHL">
        </td>
      </tr>
    </table>

    <div class="header-section">
      <div class="main-title">REFLECT & SHOOT YARIŞMASI</div>
      <div class="sub-title">Resmi Ödül Sıralama Listesi</div>
      <div class="doc-date">Tarih: 22 Mayıs 2026</div>
    </div>

    <div class="category-title">🤖 YAPAY ZEKÂ ÖDÜL SIRALAMASI</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Derece / Ödül</th>
          <th>Takım Adı</th>
          <th>Okul Adı</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="rank-cell"><span class="badge-rank gold">1. Derece</span></td>
          <td class="team-cell">mitra</td>
          <td class="school-cell">15 Temmuz Şehitleri Anadolu İmam Hatip Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank gold">2. Derece</span></td>
          <td class="team-cell">Technokasyon</td>
          <td class="school-cell">Kadıköy Anadolu İmam Hatip Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank gold">3. Derece</span></td>
          <td class="team-cell">Threee</td>
          <td class="school-cell">Maltepe Kız Anadolu İmam Hatip Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank special">Jüri Özel</span></td>
          <td class="team-cell">PURE INSIGHT</td>
          <td class="school-cell">Selçuklu Fen Lisesi</td>
        </tr>
        <tr>
          <td class="rank-cell"><span class="badge-rank mention">Mansiyon</span></td>
          <td class="team-cell">Clear Vision</td>
          <td class="school-cell">Konya Anadolu İmam Hatip Lisesi</td>
        </tr>
      </tbody>
    </table>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
      </body>
      </html>
    `;
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
  }
}
