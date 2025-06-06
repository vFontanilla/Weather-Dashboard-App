export interface WeatherCondition {
  main: string
  description: string
  icon: string
}

export interface MainWeatherData {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

export interface WindData {
  speed: number
  deg: number
}

export interface Coordinates {
  lon: number
  lat: number
}

export interface SysData {
  country?: string
  sunrise?: number
  sunset?: number
  localtime?: number
}

export interface CurrentWeatherResponse {
  coord: Coordinates
  weather: WeatherCondition[]
  main: MainWeatherData
  wind: WindData
  dt: number
  sys: SysData
  name: string
  timezone: string
}

export interface ForecastEntry {
  dt: number
  main: MainWeatherData
  weather: WeatherCondition[]
  wind: WindData
  pop: number
  dt_txt: string
}

export interface HourlyForecastResponse {
  list: ForecastEntry[]
  city: {
    name: string
    coord: Coordinates
    country: string
    timezone: string
    sunrise: number
    sunset: number
  }
}
