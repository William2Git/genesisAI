import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const DEMO_RESULTS = [
  { id: '1', name: 'Bento Bloom', details: 'Japanese · $ · 4 min walk', badge: 'Late-night', location: { lat: 37.7755, lng: -122.4185 } },
  { id: '2', name: 'College Slice House', details: 'Pizza · $ · 6 min walk', badge: 'Combo', location: { lat: 37.7738, lng: -122.4212 } },
  { id: '3', name: 'Maple Curry Kitchen', details: 'Indian · $$ · 8 min walk', badge: 'Bonus item', location: { lat: 37.7763, lng: -122.423 } },
];

async function getStructuredPreferences(prompt) {
  const apiKey = process.env.OPENAI_API_KEY || 'test';
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://vjioo4r1vyvcozuj.us-east-2.aws.endpoints.huggingface.cloud/v1' 
    });
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You convert free-text food requests into a JSON object for restaurant search. Reply with only valid JSON, no markdown. Keys: term (string for search, e.g. "tacos" or "cheap fast food"), price (string "1" or "1,2" for $ or $$), radius (number in meters, default 2000).',
        },
        { role: 'user', content: `User said: "${prompt}". Return JSON only.` },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });
    const text = completion.choices[0]?.message?.content?.trim() || '{}';
    const json = text.replace(/^```\w*\n?|\n?```$/g, '').trim();
    return JSON.parse(json);
  } catch (e) {
    console.error('LLM preferences error:', e.message);
    return null;
  }
}

async function getRestaurantComparison(selectedRestaurant, otherRestaurants) {
  const apiKey = process.env.OPENAI_API_KEY || 'test';
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://vjioo4r1vyvcozuj.us-east-2.aws.endpoints.huggingface.cloud/v1' 
    });
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful food critique assistant. Compare the selected restaurant with the other nearby options based on the provided details. Keep it brief, no more than 2-3 sentences. Do not use markdown or formatting tags like bolding.',
        },
        { 
          role: 'user', 
          content: `Selected restaurant: ${JSON.stringify(selectedRestaurant)}. Other options: ${JSON.stringify(otherRestaurants)}.` 
        },
      ],
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error('LLM comparison error:', e.message);
    return null;
  }
}

async function searchYelp(lat, lng, prefs) {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) return null;
  const term = prefs?.term || 'restaurants';
  const radius = Math.min(Number(prefs?.radius) || 2000, 40000);
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    term,
    radius: String(radius),
    limit: '3',
    sort_by: 'rating',
  });
  if (prefs?.price) params.set('price', prefs.price);
  try {
    const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.businesses || []).slice(0, 3).map((b, i) => ({
      id: b.id,
      name: b.name,
      details: `${(b.categories?.[0]?.title) || 'Food'} · ${'$'.repeat(b.price?.length || 1)} · ${Number(b.rating).toFixed(1)}★`,
      badge: i === 0 ? 'Top match' : 'Recommended',
      location: b.coordinates?.latitude != null && b.coordinates?.longitude != null
        ? { lat: b.coordinates.latitude, lng: b.coordinates.longitude }
        : null,
    })).filter((r) => r.location);
  } catch (e) {
    console.error('Yelp search error:', e.message);
    return null;
  }
}

app.post('/api/recommendations', async (req, res) => {
  try {
    const { prompt, userLocation } = req.body || {};
    const lat = userLocation?.lat ?? 37.7749;
    const lng = userLocation?.lng ?? -122.4194;

    const prefs = await getStructuredPreferences(prompt || '');
    const yelpResults = await searchYelp(lat, lng, prefs);

    if (yelpResults && yelpResults.length > 0) {
      return res.json({ results: yelpResults });
    }
    res.json({ results: DEMO_RESULTS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get recommendations', results: DEMO_RESULTS });
  }
});

app.post('/api/compare', async (req, res) => {
  try {
    const { restaurant, otherRestaurants } = req.body || {};
    if (!restaurant || !otherRestaurants) {
      return res.status(400).json({ error: 'Missing restaurant or otherRestaurants data' });
    }
    const comparison = await getRestaurantComparison(restaurant, otherRestaurants);
    if (comparison) {
      return res.json({ comparison });
    }
    res.status(500).json({ error: 'Failed to generate comparison' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate comparison' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Recommendations API listening on http://localhost:${PORT}`));
