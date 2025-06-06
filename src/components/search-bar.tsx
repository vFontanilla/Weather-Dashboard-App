"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"

interface SearchBarProps {
  onSearch: (city: string) => void
  onGeolocate: () => void
  loading: boolean
}

export default function SearchBar({ onSearch, onGeolocate, loading }: SearchBarProps) {
  const [city, setCity] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full max-w-xl mb-8">
      <Input
        type="text"
        placeholder="Enter City Name..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-grow bg-slate-800 border-slate-700 placeholder-slate-500 text-white"
        disabled={loading}
      />
      <div className="flex gap-2">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto" disabled={loading}>
          <Search className="mr-2 h-4 w-4" /> Search City
        </Button>
        <Button type="button" variant="outline" onClick={onGeolocate} className="bg-slate-800 hover:bg-slate-700 text-white w-full sm:w-auto" disabled={loading}>
          <MapPin className="mr-2 h-4 w-4" /> Use My Location
        </Button>
      </div>
    </form>
  )
}