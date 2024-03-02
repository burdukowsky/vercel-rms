import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse): VercelResponse {
  const { q } = req.query;
  if (q.length === 0) {
    return res.json({});
  }
  return res.json({
    message: `Hello ${q}!`,
  });
}
