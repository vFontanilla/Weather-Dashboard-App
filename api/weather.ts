// api/weather.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q = "London", days = "1", aqi = "no", alerts = "no" } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  // Determine endpoint based on path
  const path = req.url?.split("/api/weather")[1] || "";
  let endpoint = "current.json"; // Default endpoint
  if (path.includes("forecast")) endpoint = "forecast.json";
  if (path.includes("search")) endpoint = "search.json";

  // Build query parameters based on endpoint
  const queryParams = new URLSearchParams({
    key: apiKey,
    q: q as string,
  });
  if (endpoint === "forecast.json") {
    queryParams.append("days", days as string);
    queryParams.append("aqi", aqi as string);
    queryParams.append("alerts", alerts as string);
  }

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/${endpoint}?${queryParams}`);
    const data = await response.text(); // Get raw text for debugging
    console.log(`Raw response from ${endpoint}:`, data);

    // Attempt to parse as JSON
    const jsonData = JSON.parse(data);
    if (!response.ok) {
      console.error(`WeatherAPI error for ${endpoint}:`, jsonData);
      return res.status(response.status).json(jsonData);
    }

    return res.status(200).json(jsonData);
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: `Invalid response from WeatherAPI for ${endpoint}: Not valid JSON`,
        details: (error as SyntaxError).message,
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
