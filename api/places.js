export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { input } = req.query;
  if (!input || input.length < 2) {
    return res.json({ predictions: [] });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Brak klucza API' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(input)}` +
    `&types=(cities)` +
    `&language=pl` +
    `&key=${key}`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    const predictions = (data.predictions || []).map(p => ({
      description: p.description,
      place_id: p.place_id,
    }));
    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
