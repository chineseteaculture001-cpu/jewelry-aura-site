export default function handler(req, res) {
  const client_id = (process.env.GITHUB_CLIENT_ID || '').trim();
  if (!client_id) {
    return res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID' });
  }
  const state = Math.random().toString(36).substring(7);
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&state=${state}`;
  
  res.setHeader('Location', url);
  res.statusCode = 302;
  res.end();
}
