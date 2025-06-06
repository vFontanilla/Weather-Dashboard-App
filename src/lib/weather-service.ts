import type { CurrentWeatherResponse, HourlyForecastResponse, ForecastEntry, Coordinates } from "@/types/weather"

const API_KEY = "0f9c2683d94b41429e8132352250606"
const BASE_URL = "https://api.weatherapi.com/v1"

export async function fetchCurrentWeatherByCity(city: string): Promise<CurrentWeatherResponse> {
  const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`)
  const data = await response.json()

  console.log(data);

  return {
    coord: {
      lon: data.location.lon,
      lat: data.location.lat,
    },
    weather: [{
      main: data.current.condition.text,
      description: data.current.condition.text,
      icon: `https:${data.current.condition.icon}`,
    }],
    main: {
      temp: data.current.temp_c,
      feels_like: data.current.feelslike_c,
      temp_min: data.current.temp_c, // Same as current for this endpoint
      temp_max: data.current.temp_c, // Same
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
    },
    wind: {
      speed: data.current.wind_kph,
      deg: data.current.wind_degree,
    },
    dt: data.current.last_updated_epoch,
    sys: {
      country: data.location.country,
    },
    name: data.location.name,
    // timezone: new Date(data.location.localtime).getTimezoneOffset() * -60,
    timezone: data.location.localtime,
  }
}

export async function fetchHourlyForecastByCity(city: string): Promise<HourlyForecastResponse> {
  const response = await fetch(
    `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=1&aqi=no&alerts=no`
  )
  const data = await response.json()

  const forecastDay = data.forecast.forecastday[0]

  const list: ForecastEntry[] = forecastDay.hour.map((entry: any) => ({
    dt: entry.time_epoch,
    main: {
      temp: entry.temp_c,
      feels_like: entry.feelslike_c,
      temp_min: entry.temp_c, // No separate min/max in hourly data
      temp_max: entry.temp_c,
      pressure: entry.pressure_mb,
      humidity: entry.humidity,
    },
    weather: [{
      main: entry.condition.text,
      description: entry.condition.text,
      icon: `https:${entry.condition.icon}`,
    }],
    wind: {
      speed: entry.wind_kph,
      deg: entry.wind_degree,
    },
    pop: (entry.chance_of_rain || 0) / 100, // Convert to 0–1 float
    dt_txt: entry.time,
  }))

  return {
    list,
    city: {
      name: data.location.name,
      coord: {
        lon: data.location.lon,
        lat: data.location.lat,
      },
      country: data.location.country,
      // timezone: new Date(data.location.localtime).getTimezoneOffset() * -60,
      timezone: data.location.localtime,
      sunrise: forecastDay.astro.sunrise,
      sunset: forecastDay.astro.sunset,
    },
  }
}

export async function fetchWeatherByCoords(
  coords: Coordinates,
): Promise<{ current: CurrentWeatherResponse; forecast: HourlyForecastResponse }> {
  const { lat, lon } = coords
  const response = await fetch(
    `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1&aqi=no&alerts=no`
  )
  const data = await response.json()

  const forecastDay = data.forecast.forecastday[0]

  const current: CurrentWeatherResponse = {
    coord: {
      lat: data.location.lat,
      lon: data.location.lon,
    },
    weather: [
      {
        main: data.current.condition.text,
        description: data.current.condition.text,
        icon: `https:${data.current.condition.icon}`,
      },
    ],
    main: {
      temp: data.current.temp_c,
      feels_like: data.current.feelslike_c,
      temp_min: data.current.temp_c,
      temp_max: data.current.temp_c,
      pressure: data.current.pressure_mb,
      humidity: data.current.humidity,
    },
    wind: {
      speed: data.current.wind_kph,
      deg: data.current.wind_degree,
    },
    dt: Math.floor(new Date(data.current.last_updated).getTime() / 1000),
    sys: {
      country: data.location.country,
    },
    name: data.location.name,
    timezone: data.location.localtime,
  }

  const hourlyData = data.forecast.forecastday[0].hour.slice(0, 8)

  const forecastList: ForecastEntry[] = hourlyData.map((hour: any) => ({
    dt: Math.floor(new Date(hour.time).getTime() / 1000),
    main: {
      temp: hour.temp_c,
      feels_like: hour.feelslike_c,
      temp_min: hour.temp_c,
      temp_max: hour.temp_c,
      pressure: hour.pressure_mb,
      humidity: hour.humidity,
    },
    weather: [
      {
        main: hour.condition.text,
        description: hour.condition.text,
        icon: `https:${hour.condition.icon}`,
      },
    ],
    wind: {
      speed: hour.wind_kph,
      deg: hour.wind_degree,
    },
    pop: hour.chance_of_rain ? hour.chance_of_rain / 100 : 0,
    dt_txt: hour.time,
  }))

  const forecast: HourlyForecastResponse = {
    list: forecastList,
    city: {
      name: data.location.name,
      coord: {
        lat: data.location.lat,
        lon: data.location.lon,
      },
      country: data.location.country,
      timezone: data.location.localtime,
      sunrise: forecastDay.astro.sunrise,
      sunset: forecastDay.astro.sunset,
    },
  }

  return { current, forecast }
}

// In a real application, you would use fetch like this:
// export async function fetchCurrentWeatherByCityReal(city: string): Promise<CurrentWeatherResponse> {
//   const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || 'Failed to fetch current weather');
//   }
//   return response.json();
// }

// export async function fetchHourlyForecastByCityReal(city: string): Promise<HourlyForecastResponse> {
//   const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || 'Failed to fetch hourly forecast');
//   }
//   return response.json();
// }

// export async function fetchWeatherByCoordsReal(coords: Coordinates): Promise<{ current: CurrentWeatherResponse; forecast: HourlyForecastResponse }> {
//   const currentResponse = await fetch(`${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`);
//   if (!currentResponse.ok) {
//      const errorData = await currentResponse.json();
//      throw new Error(errorData.message || 'Failed to fetch current weather by coords');
//   }
//   const current = await currentResponse.json();

//   const forecastResponse = await fetch(`${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`);
//   if (!forecastResponse.ok) {
//     const errorData = await forecastResponse.json();
//     throw new Error(errorData.message || 'Failed to fetch forecast by coords');
//   }
//   const forecast = await forecastResponse.json();
//   return { current, forecast };
// }
