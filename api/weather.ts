// // api/weather.ts

export default async function handler(req, res) {
  const { endpoint, city, lat, lon } = req.query;
  const API_KEY = process.env.WEATHER_API_KEY; // Store API key in environment variables
  let url;

  if (endpoint === "current") {
    url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;
  } else if (endpoint === "forecast") {
    url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city ? encodeURIComponent(city) : `${lat},${lon}`}&days=1&aqi=no&alerts=no`;
  } else if (endpoint === "search") {
    url = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
  } else {
    return res.status(400).json({ error: "Invalid endpoint" });
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
    res.status(500).json({ error: "Internal server error" });
  }
}