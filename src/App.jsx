import './App.css'
import MapView from './mapView'
import { useCallback, useRef, useState } from 'react'

function ForkKnifeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Fork (left) */}
      <path d="M5 2v7.5l2 2V2H5zm2 0v9.5l2-2V2H7zm2 0v7.5h1V2h-1z" />
      {/* Knife (right, crossing) */}
      <path d="M19 2v20h-1V11l-4 4V2h5z" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M9 1.5 10.4 5l3.6 1.4L10.4 7.8 9 11.5 7.6 7.8 4 6.4 7.6 5 9 1.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13.5 4L6 11.5 2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 1C5.24 1 3 3.24 3 6c0 3.5 5 9 5 9s5-5.5 5-9c0-2.76-2.24-5-5-5zm0 6.75a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5z" fill="currentColor" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 2h5.5l7 7-6 6L2 8.5V2zm2 2v3.5l5 5 4-4-5-5H4z" fill="currentColor" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M9 2.25a2.25 2.25 0 0 0-2.25 2.25v4a2.25 2.25 0 1 0 4.5 0v-4A2.25 2.25 0 0 0 9 2.25Z"
        fill="currentColor"
      />
      <path
        d="M5.25 8.5a.75.75 0 0 0-1.5 0A5.25 5.25 0 0 0 8.5 13.67v1.08H6.75a.75.75 0 1 0 0 1.5h4.5a.75.75 0 1 0 0-1.5H9.75V13.67A5.25 5.25 0 0 0 14.25 8.5a.75.75 0 0 0-1.5 0 3.75 3.75 0 1 1-7.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M3.22 14.78 14.25 9 3.22 3.22a.75.75 0 0 0-1.06.82l1.42 5a.75.75 0 0 1 0 .38l-1.42 5a.75.75 0 0 0 1.06.82Z"
        fill="currentColor"
      />
    </svg>
  )
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const PRICE_RANGE_LABELS = {
  0: 'Budget (under $10)',
  1: 'Moderate ($10–25)',
  2: 'Upscale ($25–50)',
  3: 'Premium ($50–100)',
  4: 'Fine dining ($100+)',
}

function getPriceRangeLabel(priceLevel) {
  if (priceLevel == null || priceLevel < 0) return '—'
  return PRICE_RANGE_LABELS[Math.min(4, priceLevel)] ?? '—'
}

function isPlaceOpenNow(place) {
  const hours = place?.opening_hours
  if (!hours || hours.open_now === undefined) return null
  return hours.open_now === true
}

function App() {
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [routeViewActive, setRouteViewActive] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [foodWish, setFoodWish] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [speechLang, setSpeechLang] = useState('en-US')
  const [yelpRestaurants, setYelpRestaurants] = useState(null)
  const [yelpLoading, setYelpLoading] = useState(false)
  const [yelpError, setYelpError] = useState(null)
  const [comparisonResult, setComparisonResult] = useState(null)
  const [comparedPlaces, setComparedPlaces] = useState([])
  const [isComparing, setIsComparing] = useState(false)

  const recognitionRef = useRef(null)
  const transcriptRef = useRef(null)
  const mapViewRef = useRef(null)

  const requestUserLocation = useCallback(() => {
    setYelpRestaurants(null)
    setYelpError(null)
    mapViewRef.current?.requestUserLocation?.()
  }, [])

  const apiUrl = import.meta.env.VITE_RECOMMENDATIONS_API_URL
  const searchApiUrl = import.meta.env.VITE_SEARCH_API_URL || 'http://localhost:5000'

  const submitQueryToAI = async (query) => {
    const q = (typeof query === 'string' ? query : foodWish).trim()
    if (!q) return
    setYelpError(null)
    setYelpLoading(true)
    setYelpRestaurants(null)
    try {
      const res = await fetch(`${searchApiUrl}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (!res.ok) {
        setYelpError(data.error || 'Search failed')
        setYelpRestaurants([])
        return
      }
      setYelpRestaurants(data.restaurants || [])
    } catch (err) {
      setYelpError(err.message || 'Could not reach the server. Is the Python backend running?')
      setYelpRestaurants([])
    } finally {
      setYelpLoading(false)
    }
  }

  const handleGetRecommendations = async () => {
    const query = foodWish.trim()
    if (!query) return
    if (!apiUrl) {
      console.warn('VITE_RECOMMENDATIONS_API_URL is not set. Add it to .env to use Yelp recommendations.')
      return
    }
    setRecommendationsLoading(true)
    setRecommendations([])
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, userLocation: userLocation || undefined }),
      })
      if (!res.ok) throw new Error('Recommendations request failed')
      const data = await res.json()
      const results = data.results ?? data.recommendations ?? []
      setRecommendations(Array.isArray(results) ? results : [])
    } catch (err) {
      console.error(err)
      setRecommendations([])
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      // Graceful fallback when browser doesn't support voice input
      alert('Voice input is not supported in this browser.')
      return
    }

    // If already recording, stop and let onend handler append text
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = speechLang
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition
    transcriptRef.current = ''

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null

      const transcript = transcriptRef.current.trim()
      if (transcript) {
        setFoodWish((prev) => (prev ? `${prev} ${transcript}` : transcript))
        submitQueryToAI(transcript)
      }
      transcriptRef.current = ''
    }

    recognition.onerror = () => {
      setIsRecording(false)
      recognitionRef.current = null
      transcriptRef.current = ''
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      transcriptRef.current = transcript
    }

    recognition.start()
  }

  const exitRouteView = () => {
    setRouteViewActive(false)
    setSelectedPlace(null)
    setSelectedDestination(null)
    setComparisonResult(null)
    setComparedPlaces([])
    setIsComparing(false)
  }

  const fetchComparison = async (selected, allPlaces, skipFilter = false) => {
    const others = skipFilter
      ? allPlaces
      : allPlaces.filter(p => (p.place_id || p.id) !== (selected.place_id || selected.id));

    if (others.length === 0) return;

    setComparedPlaces(others);
    setIsComparing(true);
    setComparisonResult(null);

    try {
      const baseUrl = apiUrl ? apiUrl.replace('/api/recommendations', '') : 'http://localhost:4000';
      const compareUrl = `${baseUrl}/api/compare`;

      const res = await fetch(compareUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant: {
            name: selected.name,
            details: selected.details || selected.vicinity || selected.address || '',
            price_level: selected.price_level ?? -1,
            rating: selected.rating ?? 0
          },
          otherRestaurants: others.map(o => ({
            name: o.name,
            details: o.details || o.vicinity || o.address || '',
            price_level: o.price_level ?? -1,
            rating: o.rating ?? 0
          }))
        })
      });

      if (!res.ok) throw new Error('Comparison failed');
      const data = await res.json();
      if (data.comparison) setComparisonResult(data.comparison);
    } catch (err) {
      console.error(err);
      setComparisonResult('Failed to load comparison.');
    } finally {
      setIsComparing(false);
    }
  };

  const yelpToPlace = (r, index) => ({
    id: `yelp-${index}-${r.name}`,
    place_id: `yelp-${index}-${r.name}`,
    name: r.name,
    vicinity: r.address,
    rating: r.rating,
  
    price_level: r.price_level ?? null,
  
    photoUrl: r.image_url,
  
    location: {
      lat: r.latitude,
      lng: r.longitude
    },
  
    opening_hours: {
      open_now: r.open_now
    },
  
    is_closed: r.is_closed
  })

  const isYelpSource = yelpRestaurants != null && yelpRestaurants.length > 0;
  let displayPlaces = nearbyPlaces;
  if (recommendations.length > 0) displayPlaces = recommendations;
  else if (yelpRestaurants != null) displayPlaces = yelpRestaurants;

  let normalizedDisplayPlaces = isYelpSource
    ? displayPlaces.map((r, i) => yelpToPlace(r, i))
    : displayPlaces;

  if (isYelpSource && Array.isArray(yelpRestaurants)) {
    normalizedDisplayPlaces = normalizedDisplayPlaces.filter((p) => {
      if (p.open_now === false || p.is_closed === true) return false
      return true
    })
  }

  if (!isYelpSource && Array.isArray(normalizedDisplayPlaces) && normalizedDisplayPlaces.length > 0) {
    const withMeta = normalizedDisplayPlaces.map((p) => {
      const loc = p.geometry?.location
      const lat = typeof loc?.lat === 'function' ? loc.lat() : loc?.lat
      const lng = typeof loc?.lng === 'function' ? loc.lng() : loc?.lng
      const dist = userLocation && lat != null && lng != null
        ? haversineKm(userLocation.lat, userLocation.lng, lat, lng)
        : Infinity
      const open = isPlaceOpenNow(p)
      return { place: p, distanceKm: dist, isOpen: open }
    })
    withMeta.sort((a, b) => {
      const aOpen = a.isOpen === true ? 0 : a.isOpen === false ? 1 : 0
      const bOpen = b.isOpen === true ? 0 : b.isOpen === false ? 1 : 0
      if (aOpen !== bOpen) return aOpen - bOpen
      return a.distanceKm - b.distanceKm
    })
    normalizedDisplayPlaces = withMeta.map((m) => m.place)
  }

  const handleShowRoute = (place) => {
    let lat, lng
    if (place.location && typeof place.location.lat === 'number' && typeof place.location.lng === 'number') {
      lat = place.location.lat
      lng = place.location.lng
    } else {
      const location = place.geometry?.location
      lat = typeof location?.lat === 'function' ? location.lat() : location?.lat
      lng = typeof location?.lng === 'function' ? location.lng() : location?.lng
    }
    if (lat != null && lng != null) {
      setSelectedPlace(place)
      setSelectedDestination({ lat, lng })
      setRouteViewActive(true)

      fetchComparison(place, normalizedDisplayPlaces)
    }
  }

  const handleShowRouteYelp = (restaurant, index) => {
    const place = yelpToPlace(restaurant, index)
    handleShowRoute(place)
  }

  const handleDirectCompare = (otherPlace) => {
    if (!selectedPlace) return;

    // Pass skipFilter=true to avoid filtering out the only place
    fetchComparison(selectedPlace, [otherPlace], true);
  };

  const remainingPlaces = selectedPlace
    ? normalizedDisplayPlaces.filter((p) => (p.place_id || p.id) !== (selectedPlace.place_id || selectedPlace.id))
    : normalizedDisplayPlaces;

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    const query = foodWish.trim()
    if (!query) return
    await submitQueryToAI(query)
  }

  return (
    <div className={`fdf-app${routeViewActive ? ' fdf-app--route-view' : ''}`}>
      <header className="fdf-header">
        <div className="fdf-brand">
          <div className="fdf-logo">
            <ForkKnifeIcon />
          </div>
          <div className="fdf-brand-text">
            <h1 className="fdf-title">Friends2Go</h1>
            <p className="fdf-tagline">Getting the plans out of the group chat.</p>
          </div>
        </div>
        <nav className="fdf-nav">
          <button type="button" className="fdf-btn fdf-btn-primary">Home</button>
        </nav>
      </header>

      <main className="fdf-main fdf-main--compact">
        <div className="fdf-card">
          <div className="fdf-hero fdf-hero--centered">
            <span className="fdf-badge">AI Plan Generator</span>
            <h2 className="fdf-headline">Get the plans out of the group chat.</h2>
            <p className="fdf-desc">
              Friends2Go parses arbitrary ideas from your friend group and turns them into concrete, comparable plans—starting with the perfect food spots near you.
            </p>
            <div className="fdf-cta">
              <button
                type="button"
                className="fdf-btn fdf-btn-primary fdf-cta-primary"
                onClick={requestUserLocation}
              >
                Find Deals Near Me →
              </button>
            </div>
          </div>

          <div className="fdf-ai-input">
            <div className="fdf-ai-header-row">
              <p className="fdf-ai-label">Tell our AI what you feel like eating</p>
              <select
                className="fdf-ai-lang-select"
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value)}
                aria-label="Voice input language"
              >
                <option value="en-US">English</option>
                <option value="zh-CN">中文（普通话）</option>
                <option value="zh-HK">中文（粤语）</option>
                <option value="ja-JP">日本語</option>
                <option value="ko-KR">한국어</option>
                <option value="ru-RU">Русский</option>
              </select>
            </div>
            <form className="fdf-chatbar" aria-label="Ask the food AI" onSubmit={handleSearchSubmit}>
              <input
                id="food-wish"
                className="fdf-chatbar-input"
                placeholder="e.g. tacos, cheap and fast, sushi..."
                value={foodWish}
                onChange={(e) => setFoodWish(e.target.value)}
                disabled={yelpLoading}
              />
              <button
                type="submit"
                className="fdf-chatbar-icon-button"
                aria-label="Search restaurants"
                disabled={yelpLoading || !foodWish.trim()}
              >
                <SendIcon />
              </button>
              <button
                type="button"
                className={`fdf-chatbar-mic${isRecording ? ' fdf-chatbar-mic--active' : ''}`}
                onClick={() => {
                  if (isRecording) handleVoiceInput()
                  else handleVoiceInput()
                }}
                disabled={recommendationsLoading}
                aria-label={isRecording ? 'Stop and send to AI' : 'Start voice input'}
              >
                <MicIcon />
              </button>
            </form>
            <p className="fdf-ai-helper">
              This will power a real-time Q&A assistant to suggest nearby deals based on your cravings.
            </p>
          </div>

          <div className="fdf-map-wrap">
            <MapView
              ref={mapViewRef}
              destination={selectedDestination}
              onNearbyPlaces={setNearbyPlaces}
              onUserLocationChange={setUserLocation}
            />
          </div>

          <section className="fdf-deals">
            <h3 className="fdf-deals-title">{recommendations.length > 0 ? 'Search results' : 'Restaurants near you'}</h3>
            <p className="fdf-deals-hint">
              Click &quot;Find Deals Near Me&quot; above to load restaurants near you.
            </p>
            <ul className="fdf-deal-list">
              {(recommendationsLoading || yelpLoading) && (
                <li className="fdf-deal-item fdf-deal-item--empty">Searching…</li>
              )}
              {!(recommendationsLoading || yelpLoading) && normalizedDisplayPlaces.length === 0 && (
                <li className="fdf-deal-item fdf-deal-item--empty">
                  {yelpRestaurants !== null
                    ? 'No restaurants found. Try a different search.'
                    : 'No nearby restaurants yet. Click "Find Deals Near Me" above to load restaurants near you.'}
                </li>
              )}
              {!(recommendationsLoading || yelpLoading) && normalizedDisplayPlaces.map((place) => {
                const isApiResult = place.location && typeof place.location.lat === 'number'
                const location = place.geometry?.location
                let lat, lng
                if (isApiResult) {
                  lat = place.location.lat
                  lng = place.location.lng
                } else {
                  lat = typeof location?.lat === 'function' ? location.lat() : location?.lat
                  lng = typeof location?.lng === 'function' ? location.lng() : location?.lng
                }
                const priceStr = getPriceRangeLabel(place.price_level) || (place.badge || '—')
                const hours = place.opening_hours
                const openNow = hours?.open_now
                const weekdayText = hours?.weekday_text || []
                const dayIndex = (new Date().getDay() + 6) % 7
                const todayHours = weekdayText[dayIndex] ? weekdayText[dayIndex].replace(/^\w+\s*:\s*/, '') : null
                const hoursLabel = openNow !== undefined ? (openNow ? 'Open now' : 'Closed') : '—'
                const distanceKm = userLocation && lat != null && lng != null
                  ? haversineKm(userLocation.lat, userLocation.lng, lat, lng)
                  : null
                const distanceStr = distanceKm != null
                  ? `${distanceKm < 1 ? (distanceKm * 1000).toFixed(0) + ' m' : distanceKm.toFixed(1) + ' km'} · ~${Math.round(distanceKm * 12)} min walk`
                  : '—'
                const isClosed = isPlaceOpenNow(place) === false
                return (
                  <li key={place.place_id || place.id} className="fdf-deal-item">
                    {place.photoUrl && (
                      <div className="fdf-deal-photo-wrap fdf-deal-photo-wrap--always">
                        <img src={place.photoUrl} alt="" className="fdf-deal-photo" />
                      </div>
                    )}
                    <div className="fdf-deal-info">
                      <strong className="fdf-deal-name">{place.name}</strong>
                      <span className="fdf-deal-details">{place.vicinity || place.details || 'Address not available'}</span>
                      <span className="fdf-deal-price">{priceStr}</span>
                      <span className="fdf-deal-distance">{distanceStr}</span>
                      <span className="fdf-deal-hours">{hoursLabel}{todayHours ? ` · ${todayHours}` : ''}</span>
                    </div>
                    <button
                      type="button"
                      className={`fdf-btn fdf-btn-secondary${isClosed ? ' fdf-btn-unavailable' : ''}`}
                      disabled={lat == null || lng == null || isClosed}
                      onClick={() => !isClosed && handleShowRoute(place)}
                    >
                      {isClosed ? 'Unavailable' : 'Show Route'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <div className="fdf-features">
            <span className="fdf-feature">
              <CheckIcon /> stable demo fallback
            </span>
            <span className="fdf-feature">
              <PinIcon /> interactive map
            </span>
            <span className="fdf-feature">
              <TagIcon /> deal badges
            </span>
          </div>
        </div>
      </main>

      {routeViewActive && selectedPlace && (
        <div className="fdf-route-view" role="dialog" aria-label="Route view">
          <div className="fdf-route-view-left">
            <button
              type="button"
              className="fdf-btn fdf-btn-secondary fdf-route-back"
              onClick={exitRouteView}
            >
              ← Back
            </button>
            <div className="fdf-route-selected-card">
              {selectedPlace.photoUrl && (
                <img src={selectedPlace.photoUrl} alt="" className="fdf-route-selected-photo" />
              )}
              <h3 className="fdf-route-selected-name">{selectedPlace.name}</h3>
              <p className="fdf-route-selected-address">{selectedPlace.vicinity || selectedPlace.details || 'Address not available'}</p>
              <p className="fdf-route-selected-price">
                {getPriceRangeLabel(selectedPlace.price_level)}
              </p>
              {(() => {
                const loc = selectedPlace.geometry?.location
                const lat = typeof loc?.lat === 'function' ? loc?.lat() : loc?.lat
                const lng = typeof loc?.lng === 'function' ? loc?.lng() : loc?.lng
                const dist = userLocation && lat != null && lng != null
                  ? haversineKm(userLocation.lat, userLocation.lng, lat, lng)
                  : null
                const distStr = dist != null ? (dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`) + ` · ~${Math.round(dist * 12)} min walk` : null
                return distStr ? <p className="fdf-route-selected-distance">{distStr}</p> : null
              })()}
              {selectedPlace.opening_hours && (
                <p className="fdf-route-selected-hours">
                  {selectedPlace.opening_hours.open_now ? 'Open now' : 'Closed'}
                  {selectedPlace.opening_hours.weekday_text && selectedPlace.opening_hours.weekday_text[(new Date().getDay() + 6) % 7] && (
                    <> · {selectedPlace.opening_hours.weekday_text[(new Date().getDay() + 6) % 7].replace(/^\w+\s*:\s*/, '')}</>
                  )}
                </p>
              )}

              <div className="fdf-route-selected-comparison">
                <div className="fdf-comparison-header">
                  <SparkleIcon />
                  <h4>AI Insight</h4>
                </div>
                {isComparing ? (
                  <p className="fdf-comparison-text fdf-comparison-loading">Analyzing how this compares to nearby options...</p>
                ) : comparisonResult ? (
                  <p className="fdf-comparison-text">{comparisonResult}</p>
                ) : null}
                {comparedPlaces.length > 0 && (
                  <div className="fdf-compared-with">
                    <p className="fdf-compared-with-title">Compared with</p>
                    <div className="fdf-compared-with-list">
                      {comparedPlaces.map((place) => (
                        <div key={place.place_id || place.id} className="fdf-compared-with-item">
                          {place.photoUrl && (
                            <img src={place.photoUrl} alt="" className="fdf-compared-with-photo" />
                          )}
                          <span className="fdf-compared-with-name">{place.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="fdf-route-view-map">
            <MapView destination={selectedDestination} onNearbyPlaces={() => { }} fullScreen />
            <div className="fdf-route-view-right">
              <div className="fdf-route-view-right-tab" aria-label="Show more restaurants">
                <span className="fdf-route-view-arrow">‹</span>
              </div>
              <div className="fdf-route-view-right-list">
                <p className="fdf-route-view-right-title">More nearby</p>
                {remainingPlaces.map((place) => {
                  const loc = place.geometry?.location
                  const lat = typeof loc?.lat === 'function' ? loc.lat() : loc?.lat
                  const lng = typeof loc?.lng === 'function' ? loc.lng() : loc?.lng
                  const priceStr = getPriceRangeLabel(place.price_level)
                  const dist = userLocation && lat != null && lng != null ? haversineKm(userLocation.lat, userLocation.lng, lat, lng) : null
                  const distStr = dist != null ? (dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`) : '—'
                  return (
                    <div key={place.place_id || place.id} className="fdf-route-other-item">
                      <strong>{place.name}</strong>
                      <span>{place.vicinity || place.details || ''}</span>
                      <span>{priceStr} · {distStr}</span>
                      <div className="fdf-other-actions">
                        <button
                          type="button"
                          className="fdf-other-btn fdf-other-btn-view"
                          onClick={() => handleShowRoute(place)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="fdf-other-btn fdf-other-btn-compare"
                          onClick={() => handleDirectCompare(place)}
                        >
                          Compare
                        </button>
                      </div>
                    </div>
                  )
                })}
                {remainingPlaces.length === 0 && <p className="fdf-route-view-right-empty">No others</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
