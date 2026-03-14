import './App.css'
import MapView from './mapView'
import { useState } from 'react'
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
      <path d="M9 1l1.5 4.5L15 7l-4.5 1.5L9 13l-1.5-4.5L3 7l4.5-1.5L9 1z" fill="currentColor" />
    </svg>
  )
}

const deals = [
  {
    name: 'Bento Bloom',
    details: 'Japanese · $ · 4 min walk',
    badge: 'Late-night',
    location: { lat: 37.7755, lng: -122.4185 },
  },
  {
    name: 'College Slice House',
    details: 'Pizza · $ · 6 min walk',
    badge: 'Combo',
    location: { lat: 37.7738, lng: -122.4212 },
  },
  {
    name: 'Maple Curry Kitchen',
    details: 'Indian · $$ · 8 min walk',
    badge: 'Bonus item',
    location: { lat: 37.7763, lng: -122.423 },
  },
]

function App() {
  const [selectedDestination, setSelectedDestination] = useState(null)

  return (
    <div className="fdf-app">
      <header className="fdf-header">
        <div className="fdf-brand">
          <div className="fdf-logo">
            <ForkKnifeIcon />
          </div>
          <div className="fdf-brand-text">
            <h1 className="fdf-title">Food Discount Finder</h1>
            <p className="fdf-tagline">Helping students find affordable, yet delicious food nearby</p>
          </div>
        </div>
        <nav className="fdf-nav">
          <button type="button" className="fdf-btn fdf-btn-primary">Home</button>
          <button type="button" className="fdf-btn fdf-btn-secondary">App</button>
        </nav>
      </header>

      <main className="fdf-main">
        <div className="fdf-card">
          <div className="fdf-hero">
            <span className="fdf-badge">Student budget finder</span>
            <h2 className="fdf-headline">Find food deals near you in seconds.</h2>
            <p className="fdf-desc">
              A responsive website that helps users quickly compare nearby food options by deal, price, distance, and ratings.
            </p>
            <div className="fdf-cta">
              <button type="button" className="fdf-btn fdf-btn-primary fdf-cta-primary">
                Find Deals Near Me →
              </button>
              <button type="button" className="fdf-btn fdf-btn-secondary">Demo Mode</button>
            </div>
          </div>

          <aside className="fdf-deals">
            <h3 className="fdf-deals-title">
              <SparkleIcon /> Best value nearby
            </h3>
            <ul className="fdf-deal-list">
              {deals.map((deal) => (
                <li key={deal.name} className="fdf-deal-item">
                  <div className="fdf-deal-info">
                    <strong className="fdf-deal-name">{deal.name}</strong>
                    <span className="fdf-deal-details">{deal.details}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="fdf-deal-badge">{deal.badge}</span>
                    <button
                      type="button"
                      className="fdf-btn fdf-btn-secondary"
                      onClick={() => setSelectedDestination(deal.location)}
                    >
                      Show Route
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div
            style={{
              marginTop: '1rem',
              width: '100%',
              gridColumn: '1 / -1',
            }}
          >
            <MapView destination={selectedDestination} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
