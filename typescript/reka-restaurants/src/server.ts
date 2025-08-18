import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

const port = Number(process.env.PORT || 5173);

const RestaurantItemSchema = z.object({
  name: z.string(),
  cuisine: z.string(),
  address: z.string(),
  neighborhood: z.string().nullable(),
  approx_price: z.enum(["$", "$$", "$$$", "$$$$"]).nullable(),
  rating: z.number().nullable(),
  distance_km: z.number().nullable(),
  url: z.string().nullable(),
  why: z.string().nullable(),
});

const RestaurantSchema = z.object({
  restaurants: z.array(RestaurantItemSchema),
});

type ApproxLocation = {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
};

// OpenAI API Compatible Client for Reka Research
const reka_research = new OpenAI(
  { apiKey: process.env.REKA_API_KEY, baseURL: 'https://api.reka.ai/v1' },
);

app.post('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const user_query: string = (req.body?.query ?? '').toString();
    const loc: ApproxLocation = {
      country: req.body?.location?.country ?? null,
      city: req.body?.location?.city ?? null,
      region: req.body?.location?.region ?? null,
      timezone: req.body?.location?.timezone ?? null,
    };

    let query = "You are a restaurant recommender. User asked for " + user_query + ". Respond with a short list of 3 restaurants that match the user's query. Always respond as JSON that matches the provided schema.";

    const completion = await reka_research.chat.completions.parse({
      model: "reka-flash-research",
      messages: [
        { role: "user", content: query },
      ],
      // Specify the structured response format
      response_format: zodResponseFormat(RestaurantSchema, "restaurants"),
      research: {
        web_search: {
          // Can be used to restrict the search to a specific domain(s). For example, to only search TripAdvisor.
          // A separate related field is "blocked_domains" to block specific domains.
          allowed_domains: ["tripadvisor.com"],
          // Limit the number of web searches Reka Research can do.
          max_uses: 1,
          // Can specify the user's location to ground the agent's search / response.
          user_location: {
            approximate: {
              country: loc?.country,
              city: loc?.city,
              region: loc?.region,
              timezone: loc?.timezone,
            },
          },
        },
      }
    });

    const msg = completion.choices[0].message;
    // Parse reasoning trace for user transparency.
    // @ts-expect-error New API
    const reasoning_steps = msg.reasoning_steps;
    const responseBody = { ok: true, data: msg.parsed, reasoning_steps: reasoning_steps };
    res.json(responseBody);
  } catch (error: any) {
    const message = error?.message || 'Unknown error';
    console.error('Error in /api/recommendations:', message);
    res.status(500).json({ ok: false, error: message });
  }
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Reka Restaurants server running on http://localhost:${port}`);
});

