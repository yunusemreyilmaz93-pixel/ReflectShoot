export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  return res.status(410).json({
    error: 'Bu uç nokta güvenlik nedeniyle devre dışı bırakıldı.',
    code: 'proxy_disabled',
  });
}
