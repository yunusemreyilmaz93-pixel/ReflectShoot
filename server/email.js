/**
 * Server-side email via Resend (preferred) or optional webhook.
 * No-ops cleanly when email is not configured (local / preview without secrets).
 */

const RESEND_URL = 'https://api.resend.com/emails';

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY || process.env.EMAIL_WEBHOOK_URL);
}

/**
 * @param {{ to: string | string[], subject: string, html?: string, text?: string, tags?: string[] }} opts
 */
export async function sendEmail(opts) {
  const toList = (Array.isArray(opts.to) ? opts.to : [opts.to]).filter(Boolean);
  if (toList.length === 0) {
    return { ok: false, skipped: true, reason: 'no_recipients' };
  }

  if (process.env.RESEND_API_KEY) {
    const from = process.env.EMAIL_FROM || 'Reflect & Shoot <onboarding@resend.dev>';
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: toList,
        subject: opts.subject,
        html: opts.html || undefined,
        text: opts.text || stripHtml(opts.html || ''),
        tags: (opts.tags || []).map((name) => ({ name, value: 'true' })),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('Resend error', response.status, body);
      return { ok: false, status: response.status, error: body };
    }

    const data = await response.json().catch(() => ({}));
    return { ok: true, id: data.id, provider: 'resend' };
  }

  if (process.env.EMAIL_WEBHOOK_URL) {
    const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toList,
        subject: opts.subject,
        html: opts.html,
        text: opts.text || stripHtml(opts.html || ''),
        tags: opts.tags || [],
      }),
    });
    if (!response.ok) {
      return { ok: false, status: response.status, provider: 'webhook' };
    }
    return { ok: true, provider: 'webhook' };
  }

  return { ok: false, skipped: true, reason: 'email_not_configured' };
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function renderLifecycleEmail(kind, payload = {}) {
  const site = process.env.PUBLIC_SITE_URL || 'https://reflectandshoot.com';
  const templates = {
    ROLE_APPROVED: {
      subject: `Hesabınız onaylandı — ${payload.role || 'Reflect & Shoot'}`,
      html: `
        <p>Merhaba ${escapeHtml(payload.name || '')},</p>
        <p>Reflect &amp; Shoot hesabınız <strong>${escapeHtml(payload.role || '')}</strong> olarak onaylandı.</p>
        <p><a href="${site}/#/login">Giriş yapmak için tıklayın</a></p>
      `,
    },
    DEADLINE_REMINDER: {
      subject: `Hatırlatma: Video teslim süresi yaklaşıyor`,
      html: `
        <p>Merhaba ${escapeHtml(payload.name || 'Danışman')},</p>
        <p><strong>${escapeHtml(payload.teamName || 'Takımınız')}</strong> için video teslim tarihi yaklaşıyor
        (${escapeHtml(payload.deadline || '')}).</p>
        <p>Lütfen paneli kontrol edin: <a href="${site}/#/dashboard">${site}/#/dashboard</a></p>
      `,
    },
    ADMIN_DIGEST: {
      subject: `Günlük özet — Reflect & Shoot`,
      html: `
        <p>Günlük sistem özeti (${escapeHtml(payload.date || '')}):</p>
        <ul>
          <li>Toplam başvuru: <strong>${payload.totalApps ?? '—'}</strong></li>
          <li>Aktif sezon: <strong>${escapeHtml(payload.seasonId || '—')}</strong></li>
          <li>Video bekleyen: <strong>${payload.pendingVideo ?? '—'}</strong></li>
          <li>Arşivli: <strong>${payload.archived ?? '—'}</strong></li>
          <li>Yedek: <strong>${escapeHtml(payload.backupKey || 'atlandı')}</strong></li>
        </ul>
      `,
    },
    BACKUP_DONE: {
      subject: `Yedek tamamlandı — Reflect & Shoot`,
      html: `
        <p>Otomatik yedek alındı.</p>
        <p>Anahtar: <code>${escapeHtml(payload.backupKey || '')}</code></p>
        <p>Boyut: ${payload.bytes ?? '—'} bayt</p>
      `,
    },
  };

  const t = templates[kind];
  if (!t) {
    return {
      subject: `Bildirim — ${kind}`,
      html: `<pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`,
    };
  }
  return t;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
