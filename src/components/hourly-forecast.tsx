"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Clock } from "lucide-react"
import type { HourlyForecastResponse } from "@/types/weather"

interface HourlyWeatherProps {
  data: HourlyForecastResponse | null
}

const chartConfig = {
  temperature: {
    label: "Temp (°C)",
    color: "hsl(var(--chart-1))",
  },
}

// Format UNIX timestamp + timezoneOffset to local hour string (e.g., "3 PM")
const formatHour = (timestamp: number, timezoneOffset: number): string => {
  if (!timestamp || !Number.isFinite(timezoneOffset)) {
    return "N/A";
  }

  const date = new Date((timestamp + timezoneOffset) * 1000)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  })
}

export default function CurrentWeather({ data }: HourlyWeatherProps) {
  if (!data || !data.list || data.list.length === 0) return null

  const timezoneOffset = data.city.timezone || 0
  const now = Date.now() / 1000 // current time in seconds

  // Get the next 8 future 3-hour interval forecasts (approx. 24 hours)
  const chartData = data.list
    .filter((item) => item.dt >= now)
    .slice(0, 8)
    .map((item) => ({
      time: formatHour(item.dt, timezoneOffset),
      temperature: Math.round(item.main.temp),
      icon: item.weather?.[0]?.icon ?? "",
      description: item.weather?.[0]?.description ?? "",
  }));

  return (
    <Card className="w-full max-w-4xl bg-slate-800/70 border-slate-700 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Clock className="mr-2 h-6 w-6 text-sky-400" /> Hourly Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ChartContainer config={chartConfig} className="aspect-[9/4] w-full">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}°C`}
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value, payload) => {
                        const item = payload?.[0]?.payload
                        return (
                          <div className="flex items-center">
                            {item?.icon && (
                              <img
                                src={item.icon}
                                alt={item.description || "weather icon"}
                                width={24}
                                height={24}
                                className="mr-1"
                              />
                            )}
                            {value} - {item?.description}
                          </div>
                        )
                      }}
                      className="bg-slate-900 text-white border-slate-700"
                    />
                  }
                />
                <Line
                  dataKey="temperature"
                  type="monotone"
                  stroke="var(--color-temperature)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-temperature)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-sm">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center p-2 bg-slate-700/50 rounded-lg">
              <p className="font-medium">{item.time}</p>
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.description || "weather icon"}
                  width={40}
                  height={40}
                />
              )}
              <p className="text-lg font-semibold">{item.temperature}°C</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
