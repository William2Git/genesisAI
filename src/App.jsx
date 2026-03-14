import './App.css'
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

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 1l1.5 4.5L15 7l-4.5 1.5L9 13l-1.5-4.5L3 7l4.5-1.5L9 1z" fill="currentColor" />
    </svg>
  )
}

const deals = [
  { name: 'Bento Bloom', details: 'Japanese · $ · 4 min walk', badge: 'Late-night' },
  { name: 'College Slice House', details: 'Pizza · $ · 6 min walk', badge: 'Combo' },
  { name: 'Maple Curry Kitchen', details: 'Indian · $$ · 8 min walk', badge: 'Bonus item' },
]

function App() {
  return (
    <div className="fdf-app">
      <header className="fdf-header">
        <div className="fdf-brand">
          <div className="fdf-logo">
            <ForkKnifeIcon />
          </div>
          <div className="fdf-brand-text">
            <h1 className="fdf-title">Food Discount Finder</h1>
            <p className="fdf-tagline">Helping students find affordable, yet delicious food near them</p>
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
              A responsive website that helps users quickly compare nearby food options by deal, price, distance, and rating — perfect for a 2-day demo build.
            </p>
            <div className="fdf-cta">
              <button type="button" className="fdf-btn fdf-btn-primary fdf-cta-primary">
                Find Deals Near Me →
              </button>
              <button type="button" className="fdf-btn fdf-btn-secondary">Demo Mode</button>
            </div>
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
                  <span className="fdf-deal-badge">{deal.badge}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
