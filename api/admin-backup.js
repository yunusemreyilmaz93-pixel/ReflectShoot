import { getAdminServices } from '../server/firebaseAdmin.js';
import { noStore, requireUser, ROLES, sendError } from '../server/auth.js';

/**
 * Admin-only full JSON export (users, applications, scores, cms, settings).
 * Prefer this over client-only export so scores/subcollections are included.
 */
export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireUser(req, { roles: [ROLES.ADMIN] });
    const { db } = getAdminServices();

    const [
      usersSnap,
      appsSnap,
      settingsSnap,
      cmsGeneral,
      cmsLinks,
      cmsAcademy,
      cmsGallery,
      cmsFaq,
      cmsTimeline,
      cmsPrizes,
      logsSnap,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('applications').get(),
      db.collection('system').doc('settings').get(),
      db.collection('cms').doc('general').get(),
      db.collection('cms').doc('links').get(),
      db.collection('cms_academy').get(),
      db.collection('cms_gallery').get(),
      db.collection('cms_faq').get(),
      db.collection('cms_timeline').get(),
      db.collection('cms_prizes').get(),
      db.collection('logs').orderBy('timestamp', 'desc').limit(500).get(),
    ]);

    const applications = [];
    const scoresByApp = {};

    for (const appDoc of appsSnap.docs) {
      const data = { id: appDoc.id, ...appDoc.data() };
      applications.push(data);
      const scoresSnap = await appDoc.ref.collection('scores').get();
      scoresByApp[appDoc.id] = scoresSnap.docs.map((s) => ({ id: s.id, ...s.data() }));
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      exporter: 'api/admin-backup',
      users: usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() })),
      applications,
      scoresByApp,
      settings: settingsSnap.exists ? settingsSnap.data() : null,
      cms: {
        general: cmsGeneral.exists ? cmsGeneral.data() : null,
        links: cmsLinks.exists ? cmsLinks.data() : null,
        academy: cmsAcademy.docs.map((d) => ({ id: d.id, ...d.data() })),
        gallery: cmsGallery.docs.map((d) => ({ id: d.id, ...d.data() })),
        faq: cmsFaq.docs.map((d) => ({ id: d.id, ...d.data() })),
        timeline: cmsTimeline.docs.map((d) => ({ id: d.id, ...d.data() })),
        prizes: cmsPrizes.docs.map((d) => ({ id: d.id, ...d.data() })),
      },
      logs: logsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reflect-backup-${new Date().toISOString().slice(0, 10)}.json"`
    );
    return res.status(200).json(payload);
  } catch (error) {
    return sendError(res, error, 'Yedek alınamadı.');
  }
}
