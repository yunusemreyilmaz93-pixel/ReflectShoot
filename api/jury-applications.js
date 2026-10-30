import { getAdminServices } from '../server/firebaseAdmin.js';
import { noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import { toJuryView } from '../server/juryView.js';

/** Jury member's assigned works, stripped of student and advisor personal data. */
export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireUser(req, { roles: [ROLES.JUDGE] });
    const { db } = getAdminServices();
    const snapshot = await db.collection('applications').where('assignedJuryIds', 'array-contains', user.uid).get();
    return res.status(200).json({ applications: snapshot.docs.map((doc) => toJuryView(doc, user.uid)) });
  } catch (error) {
    return sendError(res, error, 'Atanan eserler yüklenemedi.');
  }
}
