import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse): VercelResponse {
  const empty = () => res.json({});

  const { q } = req.query;

  if (q == null || Array.isArray(q)) {
    return empty();
  }

  const query = q.trim();

  if (query.length === 0) {
    return empty();
  }

  return res.json({
    message: `Hello ${query}!`,
  });
}
