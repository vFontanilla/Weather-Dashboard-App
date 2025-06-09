"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"
import type { CitySuggestion } from "@/types/weather"

interface SearchBarProps {
  onSearch: (city: string) => void
  onGeolocate: () => void
  loading: boolean
  onAutocomplete: (query: string) => void
  suggestions: CitySuggestion[]
  showSuggestions: boolean
  setSuggestions: React.Dispatch<React.SetStateAction<CitySuggestion[]>>
}

export default function SearchBar({ onSearch, onGeolocate, loading, onAutocomplete, suggestions, showSuggestions, setSuggestions }: SearchBarProps) {
  const [city, setCity] = useState("")
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [typing, setTyping] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

   // Handle debounce typing
  useEffect(() => {
    if (city.trim()) {
      setTyping(true)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onAutocomplete(city.trim())
        setTyping(false)
      }, 400)
    } else {
      setSuggestions([])
    }
  }, [city])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSuggestions([])
        setHighlightIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
      setSuggestions([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightIndex((prev) => (prev + 1) % suggestions.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault()
        const selected = suggestions[highlightIndex]
        setCity(selected.name)
        onSearch(selected.name)
        setSuggestions([])
        setHighlightIndex(-1)
      }
    }
  }

  // Highlight matching part
  const getHighlightedText = (text: string, query: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text
    return (
      <>
        {text.substring(0, index)}
        <strong>{text.substring(index, index + query.length)}</strong>
        {text.substring(index + query.length)}
      </>
    )
  }


  return (
    <div className="relative w-full max-w-xl mb-4" ref={containerRef}>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full">
        <Input
          type="text"
          placeholder="Enter City Name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-slate-800 border-slate-700 placeholder-slate-500 text-white"
          disabled={loading}
        />
        <div className="flex gap-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onGeolocate}
            className="bg-slate-800 hover:bg-slate-700 text-white"
            disabled={loading}
          >
            <MapPin className="mr-2 h-4 w-4" /> Use My Location
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white text-black mt-1 max-h-64 overflow-auto rounded-b-md shadow-lg">
          {suggestions.map((s, index) => (
            <li
              key={`${s.name}-${s.lat}-${s.lon}`}
              className={`p-2 cursor-pointer hover:bg-gray-200 ${
                index === highlightIndex ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => {
                setCity(s.name)
                onSearch(s.name)
                setSuggestions([])
                setHighlightIndex(-1)
              }}
            >
              {getHighlightedText(`${s.name}, ${s.region}, ${s.country}`, city)}
            </li>
          ))}
        </ul>
      )}

      {/* Spinner */}
      {typing && (
        <div className="absolute right-3 top-[50%] translate-y-[-50%] text-slate-400 animate-spin">
          <Search className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}