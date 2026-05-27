export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { origin, destination } = req.query;
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Brak origin lub destination' });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Brak klucza API' });
  }

  const originStr = origin.includes(',') ? origin : origin + ', Polska';
  const destStr   = destination.includes(',') ? destination : destination + ', Polska';

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${encodeURIComponent(originStr)}` +
    `&destinations=${encodeURIComponent(destStr)}` +
    `&mode=driving&language=pl&key=${key}`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ error: 'Google API error: ' + data.status });
    }

    const el = data.rows?.[0]?.elements?.[0];
    if (!el || el.status !== 'OK') {
      return res.status(400).json({ error: 'Nie znaleziono trasy' });
    }

    const km = Math.round(el.distance.value / 1000);
    const duration = el.duration.text;
    res.json({ ok: true, km, duration });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
