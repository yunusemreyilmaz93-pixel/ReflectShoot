
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Pass along the content type or default to text/plain
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/plain');
    res.status(200).send(text);
  } catch (error) {
    console.error('Proxy Fetch Error:', error);
    res.status(500).json({ error: error.message });
  }
}
