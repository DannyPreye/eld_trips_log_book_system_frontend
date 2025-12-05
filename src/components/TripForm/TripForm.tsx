import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGeocoding } from '@/hooks/useGeocoding'
import type { TripInputRequest } from '@/lib/api'

interface LocationInput {
  address: string
  lat?: number
  lng?: number
}

interface TripFormProps {
  onSubmit: (data: TripInputRequest) => void
  isLoading?: boolean
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationInput>({ address: '' })
  const [pickupLocation, setPickupLocation] = useState<LocationInput>({ address: '' })
  const [dropoffLocation, setDropoffLocation] = useState<LocationInput>({ address: '' })
  const [currentCycleHours, setCurrentCycleHours] = useState<string>('0')
  const [currentSuggestions, setCurrentSuggestions] = useState<any[]>([])
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([])

  const { searchAddress, isLoading: isGeocoding } = useGeocoding()

  const handleLocationSearch = async (
    query: string,
    setSuggestions: (suggestions: any[]) => void,
    setLocation: (location: LocationInput) => void
  ) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    const results = await searchAddress(query)
    setSuggestions(results)
  }

  const handleLocationSelect = (
    result: { lat: number; lng: number; display_name: string },
    setLocation: (location: LocationInput) => void,
    setSuggestions: (suggestions: any[]) => void
  ) => {
    setLocation({
      address: result.display_name,
      lat: result.lat,
      lng: result.lng,
    })
    setSuggestions([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentLocation.lat || !pickupLocation.lat || !dropoffLocation.lat) {
      return
    }

    const request: TripInputRequest = {
      current_location: {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      },
      pickup_location: {
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
      },
      dropoff_location: {
        lat: dropoffLocation.lat,
        lng: dropoffLocation.lng,
      },
      current_cycle_used_hours: parseFloat(currentCycleHours) || 0,
    }

    onSubmit(request)
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Plan Trip</CardTitle>
        <CardDescription>Enter trip details to generate route and ELD logs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-location">Current Location</Label>
            <div className="relative">
              <Input
                id="current-location"
                value={currentLocation.address}
                onChange={(e) => {
                  const value = e.target.value
                  setCurrentLocation({ address: value })
                  handleLocationSearch(value, setCurrentSuggestions, setCurrentLocation)
                }}
                placeholder="Enter address or coordinates"
                disabled={isLoading}
              />
              {currentSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-sm">
                  {currentSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                      onClick={() =>
                        handleLocationSelect(suggestion, setCurrentLocation, setCurrentSuggestions)
                      }
                    >
                      {suggestion.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-location">Pickup Location</Label>
            <div className="relative">
              <Input
                id="pickup-location"
                value={pickupLocation.address}
                onChange={(e) => {
                  const value = e.target.value
                  setPickupLocation({ address: value })
                  handleLocationSearch(value, setPickupSuggestions, setPickupLocation)
                }}
                placeholder="Enter address or coordinates"
                disabled={isLoading}
              />
              {pickupSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-sm">
                  {pickupSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                      onClick={() =>
                        handleLocationSelect(suggestion, setPickupLocation, setPickupSuggestions)
                      }
                    >
                      {suggestion.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff-location">Dropoff Location</Label>
            <div className="relative">
              <Input
                id="dropoff-location"
                value={dropoffLocation.address}
                onChange={(e) => {
                  const value = e.target.value
                  setDropoffLocation({ address: value })
                  handleLocationSearch(value, setDropoffSuggestions, setDropoffLocation)
                }}
                placeholder="Enter address or coordinates"
                disabled={isLoading}
              />
              {dropoffSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-sm">
                  {dropoffSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                      onClick={() =>
                        handleLocationSelect(suggestion, setDropoffLocation, setDropoffSuggestions)
                      }
                    >
                      {suggestion.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycle-hours">Current Cycle Hours Used</Label>
            <Input
              id="cycle-hours"
              type="number"
              min="0"
              max="70"
              step="0.1"
              value={currentCycleHours}
              onChange={(e) => setCurrentCycleHours(e.target.value)}
              placeholder="0.0"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              isGeocoding ||
              !currentLocation.lat ||
              !pickupLocation.lat ||
              !dropoffLocation.lat
            }
          >
            {isLoading ? 'Planning Trip...' : 'Plan Trip'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


