"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  CalendarDays,
  Sunrise,
  Sunset,
} from "lucide-react"
import type { CurrentWeatherResponse, HourlyForecastResponse } from "@/types/weather"

interface CurrentWeatherProps {
  data: CurrentWeatherResponse | null
  data2: HourlyForecastResponse | null
}

// const formatTime = (timestamp: number, timezoneOffset: number): string => {
//   const date = new Date((timestamp + timezoneOffset) * 1000)
//   return date.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     timeZone: "UTC",
//   })
// }

// const formatDate = (timestamp: number, timezoneOffset: number): string => {
//   const date = new Date((timestamp + timezoneOffset) * 1000)
//   return date.toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   })
// }

//Convert to readable local time format
const formatLocaltime = (localtime: string): string => {
  const date = new Date(localtime.replace(" ", "T")) // Convert to ISO-like format
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function CurrentWeather({ data, data2 }: CurrentWeatherProps) {
  if (!data || !data2) return null

  const { name, main, weather, wind, localtime, sys } = data
  const { city: { sunrise, sunset } } = data2
  const weatherIcon = weather[0]?.icon
  const iconUrl = weatherIcon
    ? weatherIcon.startsWith("//") ? `https:${weatherIcon}` : weatherIcon
    : "/placeholder.svg"

  return (
    <Card className="w-full max-w-xl mb-8 bg-slate-800/70 border-slate-700 text-white shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-bold">{name}, {sys.country}</CardTitle>
            <CardDescription className="text-slate-400 flex flex-col sm:flex-row sm:items-center gap-x-2">
              <span className="flex items-center">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                {formatLocaltime(localtime)}
              </span>
            </CardDescription>
          </div>
          {weatherIcon && (
            <img
              src={iconUrl}
              alt={weather[0].description}
              width={100}
              height={100}
              className="drop-shadow-lg -mt-4 -mr-2"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <p className="text-7xl font-bold tracking-tighter">
              {Math.round(main.temp)}°C
            </p>
            <p className="text-xl text-slate-300 capitalize">
              {weather[0].description}
            </p>
            <p className="text-sm text-slate-400">
              Feels like {Math.round(main.feels_like)}°C
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-400" />
              <span>Humidity: {main.humidity}%</span>
            </div>
            <div className="flex items-center">
              <Wind className="h-5 w-5 mr-2 text-sky-400" />
              <span>Wind: {wind.speed.toFixed(1)} kph</span>
            </div>
            <div className="flex items-center">
              <Gauge className="h-5 w-5 mr-2 text-purple-400" />
              <span>Pressure: {main.pressure} hPa</span>
            </div>
            <div className="flex items-center">
              <Thermometer className="h-5 w-5 mr-2 text-orange-400" />
              <span>
                Min/Max: {Math.round(main.temp_min)}°/{Math.round(main.temp_max)}°
              </span>
            </div>
            <div className="flex items-center">
              <Sunrise className="h-5 w-5 mr-2 text-yellow-400" />
              <span>
                Sunrise: {sunrise}
              </span>
            </div>
            <div className="flex items-center">
              <Sunset className="h-5 w-5 mr-2 text-orange-500" />
              <span>
                Sunset: {sunset}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
