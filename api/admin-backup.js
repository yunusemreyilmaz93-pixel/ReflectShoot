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
      scoresSnap,
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
      // One query for every score instead of one sequential round-trip per application
      // (which exceeds the serverless time limit as the number of teams grows).
      db.collectionGroup('scores').get(),
    ]);

    const applications = appsSnap.docs.map((appDoc) => ({ id: appDoc.id, ...appDoc.data() }));
    const scoresByApp = Object.fromEntries(applications.map((app) => [app.id, []]));
    for (const scoreDoc of scoresSnap.docs) {
      const appId = scoreDoc.ref.parent.parent?.id;
      if (appId && scoresByApp[appId]) scoresByApp[appId].push({ id: scoreDoc.id, ...scoreDoc.data() });
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
