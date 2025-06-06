import WeatherDashboard from "@/components/weather-dashboard"

function App() {

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100 p-4 flex flex-col items-center selection:bg-sky-500 selection:text-white">
      <WeatherDashboard />
    </div>
    </>
  )
}

export default App
