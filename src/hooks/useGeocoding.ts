import { useState, useCallback } from 'react'

export interface GeocodeResult {
  lat: number
  lng: number
  display_name: string
}

export function useGeocoding() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchAddress = useCallback(async (query: string): Promise<GeocodeResult[]> => {
    if (!query || query.length < 3) {
      return []
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ELD Trip Planner',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      const data = await response.json()
      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode address'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    const results = await searchAddress(address)
    return results.length > 0 ? results[0] : null
  }, [searchAddress])

  return {
    searchAddress,
    geocodeAddress,
    isLoading,
    error,
  }
}


