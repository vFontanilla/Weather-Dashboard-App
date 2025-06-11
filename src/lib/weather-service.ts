import { getTimezoneOffset } from "date-fns-tz";
import type { CurrentWeatherResponse, HourlyForecastResponse, ForecastEntry, Coordinates, CitySuggestion } from "@/types/weather";

// Use the proxy endpoint
const BASE_URL = "https://api.weatherapi.com/v1";
const API_KEY = "0f9c2683d94b41429e8132352250606";

export async function fetchCurrentWeatherByCity(city: string): Promise<CurrentWeatherResponse> {
  const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
  console.log("Fetching current weather from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    console.error("Fetch error response:", text);
    const errorData = text.trim().startsWith("{") ? await response.json().catch(() => ({})) : {};
    const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${text || "Unknown error"}`;
    throw new Error(errorMessage);
  }
  const data = await response.json();
  console.log("Fetch response data:", data);
  return {
    coord: { lon: data.location.lon, lat: data.location.lat },
    weather: [{ main: data.current.condition.text, description: data.current.condition.text, icon: `https:${data.current.condition.icon}` }],
    main: { temp: data.current.temp_c, feels_like: data.current.feelslike_c, temp_min: data.current.temp_c, temp_max: data.current.temp_c, pressure: data.current.pressure_mb, humidity: data.current.humidity },
    wind: { speed: data.current.wind_kph, deg: data.current.wind_degree },
    dt: data.current.last_updated_epoch,
    sys: { country: data.location.country },
    name: data.location.name,
    localtime: data.location.localtime,
  };
}

export async function fetchHourlyForecastByCity(city: string): Promise<HourlyForecastResponse> {
  const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=1&aqi=no&alerts=no`;
  console.log("Fetching forecast from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    console.error("Fetch error response:", text);
    const errorData = text.trim().startsWith("{") ? await response.json().catch(() => ({})) : {};
    const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${text || "Unknown error"}`;
    throw new Error(errorMessage);
  }
  const data = await response.json();
  console.log("Fetch response data:", data);

  const forecastDay = data.forecast.forecastday[0];

  const list: ForecastEntry[] = forecastDay.hour.map((entry: any) => ({
    dt: entry.time_epoch,
    main: { temp: entry.temp_c, feels_like: entry.feelslike_c, temp_min: entry.temp_c, temp_max: entry.temp_c, pressure: entry.pressure_mb, humidity: entry.humidity },
    weather: [{ main: entry.condition.text, description: entry.condition.text, icon: `https:${entry.condition.icon}` }],
    wind: { speed: entry.wind_kph, deg: entry.wind_degree },
    pop: (entry.chance_of_rain || 0) / 100,
    dt_txt: entry.time,
  }));

  const timezoneOffset = getTimezoneOffset(data.location.tz_id, new Date()) / 1000;

  return {
    list,
    city: { name: data.location.name, coord: { lon: data.location.lon, lat: data.location.lat }, country: data.location.country, timezone: timezoneOffset, sunrise: forecastDay.astro.sunrise, sunset: forecastDay.astro.sunset },
  };
}

export async function fetchAutocompleteWeatherByCity(city: string): Promise<CitySuggestion[]> {
  const url = `${BASE_URL}search.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
  console.log("Fetching autocomplete from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    console.error("Fetch error response:", text);
    const errorData = text.trim().startsWith("{") ? await response.json().catch(() => ({})) : {};
    const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${text || "Unknown error"}`;
    throw new Error(errorMessage);
  }
  const data = await response.json();
  console.log("Fetch response data:", data);
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    lat: item.lat,
    lon: item.lon,
    region: item.region,
    country: item.country,
  }));
}

export async function fetchWeatherByCoords(coords: Coordinates): Promise<{ current: CurrentWeatherResponse; forecast: HourlyForecastResponse }> {
  const { lat, lon } = coords;
  const url = `${BASE_URL}.forecast.json?key=${API_KEY}&lat=${lat}&lon=${lon}&days=1&aqi=no&alerts=no`;
  console.log("Fetching weather by coords from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    console.error("Fetch error response:", text);
    const errorData = text.trim().startsWith("{") ? await response.json().catch(() => ({})) : {};
    const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${text || "Unknown error"}`;
    throw new Error(errorMessage);
  }
  const data = await response.json();
  console.log("Fetch response data:", data);

  const forecastDay = data.forecast.forecastday[0];
  const current: CurrentWeatherResponse = {
    coord: { lat: data.location.lat, lon: data.location.lon },
    weather: [{ main: data.current.condition.text, description: data.current.condition.text, icon: `https:${data.current.condition.icon}` }],
    main: { temp: data.current.temp_c, feels_like: data.current.feelslike_c, temp_min: data.current.temp_c, temp_max: data.current.temp_c, pressure: data.current.pressure_mb, humidity: data.current.humidity },
    wind: { speed: data.current.wind_kph, deg: data.current.wind_degree },
    dt: Math.floor(new Date(data.current.last_updated).getTime() / 1000),
    sys: { country: data.location.country },
    name: data.location.name,
    localtime: data.location.localtime,
  };

  const hourlyData = data.forecast.forecastday[0].hour.slice(0, 8);
  const forecastList: ForecastEntry[] = hourlyData.map((hour: any) => ({
    dt: Math.floor(new Date(hour.time).getTime() / 1000),
    main: { temp: hour.temp_c, feels_like: hour.feelslike_c, temp_min: hour.temp_c, temp_max: hour.temp_c, pressure: hour.pressure_mb, humidity: hour.humidity },
    weather: [{ main: hour.condition.text, description: hour.condition.text, icon: `https:${hour.condition.icon}` }],
    wind: { speed: hour.wind_kph, deg: hour.wind_degree },
    pop: hour.chance_of_rain ? hour.chance_of_rain / 100 : 0,
    dt_txt: hour.time,
  }));

  const timezoneOffset = getTimezoneOffset(data.location.tz_id, new Date()) / 1000;

  return {
    current,
    forecast: { list: forecastList, city: { name: data.location.name, coord: { lat: data.location.lat, lon: data.location.lon }, country: data.location.country, timezone: timezoneOffset, sunrise: forecastDay.astro.sunrise, sunset: forecastDay.astro.sunset } },
  };
}