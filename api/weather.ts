// api/weather.ts

import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q = "London" } = req.query
  const apiKey = process.env.WEATHER_API_KEY // <-- make sure this is in your Vercel env

  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" })
  }

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${q}`)
    const data = await response.json()

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" })
  }
}
