// api/weather.ts

import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q = "London" } = req.query
  const apiKey = process.env.WEATHER_API_KEY // <-- make sure this is in your Vercel env

  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" })
  }

  const queryParams = new URLSearchParams({ key: apiKey, q: q as string, ...res as any })

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?${queryParams}`)
    const data = await response.json()

    if (!response.ok) {
      console.error("WeatherAPI error:", data)
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error("API call failed:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
