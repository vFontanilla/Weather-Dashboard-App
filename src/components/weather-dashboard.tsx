"use client"

import { useState, useEffect, useCallback } from "react"
import SearchBar from "./search-bar"
import CurrentWeather from "./current-weather"
import HourlyForecast from "./hourly-forecast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info, Loader2 } from "lucide-react"
import { fetchCurrentWeatherByCity, fetchHourlyForecastByCity, fetchWeatherByCoords } from "@/lib/weather-service"
import type { CurrentWeatherResponse, HourlyForecastResponse, Coordinates } from "@/types/weather"

export default function WeatherDashboard() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherResponse | null>(null)
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)

  const fetchWeatherData = useCallback(async (city?: string, coords?: Coordinates) => {
    setLoading(true)
    setError(null)
    setGeoError(null)
    try {
      if (coords) {
        const { current, forecast } = await fetchWeatherByCoords(coords)
        setCurrentWeather(current)
        setHourlyForecast(forecast)
      } else if (city) {
        const [current, forecast] = await Promise.all([
          fetchCurrentWeatherByCity(city),
          fetchHourlyForecastByCity(city),
        ])
        setCurrentWeather(current)
        setHourlyForecast(forecast)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
      setCurrentWeather(null)
      setHourlyForecast(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (city: string) => {
    fetchWeatherData(city)
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.")
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherData(undefined, {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (err) => {
        setGeoError(`Geolocation failed: ${err.message}`)
        setLoading(false)
      },
    )
  }

  useEffect(() => {
    // Fetch weather for a default city on initial load
    fetchWeatherData("London")
  }, [fetchWeatherData])

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center w-full">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
        Track the Weather Today in Just a Few Minutes
      </h1>

      <SearchBar onSearch={handleSearch} onGeolocate={handleGeolocate} loading={loading} />

      {loading && (
        <div className="flex items-center justify-center my-10 text-xl">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-sky-400" />
          Loading weather data...
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="w-full max-w-xl mb-4 bg-red-900/30 border-red-700 text-red-300">
          <AlertTriangle className="h-4 w-4 !text-red-400" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {geoError && (
        <Alert variant="default" className="w-full max-w-xl mb-4 bg-yellow-900/30 border-yellow-700 text-yellow-300">
          <Info className="h-4 w-4 !text-yellow-400" />
          <AlertTitle>Geolocation Info</AlertTitle>
          <AlertDescription>{geoError}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <CurrentWeather data={currentWeather}  data2={hourlyForecast}/>
          <HourlyForecast data={hourlyForecast} />
        </>
      )}

      <div className="mt-12 p-4 bg-slate-800/50 rounded-lg text-center text-sm text-slate-400 max-w-xl">
        <p>
          <strong>Note:</strong> This is a demo application using mock weather data.
        </p>
        <p>
          To use real weather data, you need to sign up for an API key from a provider like OpenWeatherMap and update
          the <code>lib/weather-service.ts</code> file.
        </p>
      </div>
    </div>
  )
}
