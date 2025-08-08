import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

const port = Number(process.env.PORT || 5173);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'reka-restaurants', time: new Date().toISOString() });
});

type UserLocation = { lat: number; lon: number } | null;

app.post('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const query: string = (req.body?.query ?? '').toString();
    const location: UserLocation = req.body?.location && typeof req.body.location.lat === 'number' && typeof req.body.location.lon === 'number'
      ? { lat: req.body.location.lat, lon: req.body.location.lon }
      : null;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ ok: false, error: 'OPENAI_API_KEY is not set on the server' });
    }

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Query is required' });
    }

    const systemPrompt = `You are Reka Restaurants, a helpful local restaurant concierge.
Return ONLY valid JSON and nothing else. Use this exact JSON schema:
{
  "queryEcho": string,
  "locationUsed": { "lat": number | null, "lon": number | null } | null,
  "restaurants": Array<{
    "name": string,
    "cuisine": string,
    "address": string,
    "neighborhood": string | null,
    "approx_price": "$" | "$$" | "$$$" | "$$$$" | null,
    "rating": number | null,
    "distance_km": number | null,
    "why": string,
    "url": string | null
  }>,
  "disclaimer": string
}

Guidelines:
- If latitude/longitude are provided, prioritize options within ~10km and include distance_km.
- Prefer places that are widely regarded and likely to still be open; avoid hallucinating exact details.
- If uncertain about details like exact address or rating, set them to null rather than guessing.
- Keep list concise (4-6 places) and diverse by cuisine/experience.
- Tailor to the user's preferences in the query (dietary needs, ambience, budget, occasion).
`;

    const userPrompt = `User preferences: ${query}\n\nLocation: ${location ? `${location.lat}, ${location.lon}` : 'unknown'}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    if (!content) {
      return res.status(502).json({ ok: false, error: 'No content from model' });
    }

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch (err) {
      return res.status(502).json({ ok: false, error: 'Model returned non-JSON response' });
    }

    res.json({ ok: true, data });
  } catch (error: any) {
    const message = error?.message || 'Unknown error';
    res.status(500).json({ ok: false, error: message });
  }
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Reka Restaurants server running on http://localhost:${port}`);
});

