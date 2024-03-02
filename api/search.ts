import type { VercelRequest, VercelResponse } from '@vercel/node';
import createFetch from '@vercel/fetch';
import { parse } from 'node-html-parser';

const fetch = createFetch();

interface CustomError {
  customMessage: string;
}

function createError(mes: string): CustomError {
  return { customMessage: mes };
}

interface Result {
  title: string;
  magnet: string;
  size: string;
  seeds: number;
  leaches: number;
}

export default function handler(req: VercelRequest, res: VercelResponse): VercelResponse | Promise<VercelResponse> {
  const empty = () => res.json({});

  const { q } = req.query;

  if (q == null || Array.isArray(q)) {
    return empty();
  }

  const query = q.trim();

  if (query.length === 0) {
    return empty();
  }

  return fetch('http://rutor.info/search/' + encodeURIComponent(query), {
    signal: AbortSignal.timeout(10000),
  })
    .then(response => {
      return response.text();
    })
    .then(text => {
      const html = parse(text);
      const index = html.getElementById('index');
      const trs = index.querySelectorAll('tr:not(.backgr)');
      const results: Result[] = [];

      for (const tr of trs) {
        const tds = tr.getElementsByTagName('td');
        if (tds.length !== 4 && tds.length !== 5) {
          throw createError('wrong row cells number');
        }
        const secondTdAs = tds[1].getElementsByTagName('a');
        if (secondTdAs.length < 3) {
          throw createError('wrong links at second row cell');
        }
        const title = secondTdAs[2].textContent;
        const magnet = secondTdAs[1].attrs.href;
        const size = tds[tds.length - 2].textContent;
        const lastTd = tds[tds.length - 1];
        const lastTdSpans = lastTd.getElementsByTagName('span');
        if (lastTdSpans.length < 2) {
          throw createError('wrong spans at last row cell');
        }
        const seeds = Number(lastTdSpans[0].textContent);
        const leaches = Number(lastTdSpans[1].textContent);

        results.push({
          title,
          magnet,
          size,
          seeds,
          leaches,
        });
      }

      return res.json(results);
    })
    .catch(e => {
      console.error(e);
      res.status(500);
      return res.json({
        message: e?.customMessage ?? 'Неизвестная ошибка',
      });
    });
}
