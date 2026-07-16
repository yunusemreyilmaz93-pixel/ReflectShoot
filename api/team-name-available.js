import { HttpError, noStore, requireUser, ROLES, sendError } from '../server/auth.js';
import { getAdminServices } from '../server/firebaseAdmin.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireUser(req, { roles: [ROLES.TEACHER, ROLES.STUDENT] });
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (name.length < 3 || name.length > 40) {
      throw new HttpError(400, 'Takım adı 3 ile 40 karakter arasında olmalıdır.', 'invalid_team_name');
    }

    const { db } = getAdminServices();
    const snapshot = await db.collection('applications').where('team.name', '==', name).limit(1).get();
    return res.status(200).json({ available: snapshot.empty });
  } catch (error) {
    return sendError(res, error, 'Takım adı kontrol edilemedi.');
  }
}
