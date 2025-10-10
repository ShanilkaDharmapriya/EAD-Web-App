import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const LocationMap = ({ 
  latitude = 6.9271, 
  longitude = 79.8612, 
  onLocationChange, 
  height = '400px',
  className = ''
}) => {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [position, setPosition] = useState([latitude, longitude])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Check if map is already initialized
    if (mapInstanceRef.current) {
      return
    }

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13)
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map)
    markerRef.current = marker

    // Add click event
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      marker.setLatLng([lat, lng])
      onLocationChange?.(lat, lng)
    })

    // Store map instance reference
    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([latitude, longitude])
      mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom())
      setPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setPosition([latitude, longitude])
        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([latitude, longitude])
          mapInstanceRef.current.setView([latitude, longitude], 15)
        }
        onLocationChange?.(latitude, longitude)
        setIsLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to retrieve your location. Please select manually on the map.')
        setIsLoading(false)
      }
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="mb-3 flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Select Location
        </label>
        <button
          type="button"
          onClick={handleMyLocation}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Getting...' : 'My Location'}
        </button>
      </div>
      
      <div 
        className="border border-gray-300 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <div 
          ref={mapContainerRef}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
        <p className="text-xs text-gray-500">Click on the map to select a location</p>
      </div>
    </div>
  )
}

export default LocationMap
