// api/weather.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { endpoint, city, lat, lon } = req.query;
  const API_KEY = process.env.WEATHER_API_KEY;
  let url;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (endpoint === 'current') {
    url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city as string)}&aqi=no`;
  } else if (endpoint === 'forecast') {
    url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city ? encodeURIComponent(city as string) : `${lat},${lon}`}&days=1&aqi=no&alerts=no`;
  } else if (endpoint === 'search') {
    url = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(city as string)}`;
  } else {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Function invocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}