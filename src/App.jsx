import './App.css'
import MapView from './mapView'
import { useRef, useState } from 'react'

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

function App() {
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [foodWish, setFoodWish] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [speechLang, setSpeechLang] = useState('en-US')

  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

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
            <div className="fdf-chatbar" aria-label="Ask the food AI">
              <button
                type="button"
                className="fdf-chatbar-icon-button"
                aria-label="Add more preferences"
              >
                +
              </button>
              <input
                id="food-wish"
                className="fdf-chatbar-input"
                placeholder="Ask anything about nearby food deals..."
                value={foodWish}
                onChange={(e) => setFoodWish(e.target.value)}
              />
              <button
                type="button"
                className={`fdf-chatbar-mic${isRecording ? ' fdf-chatbar-mic--active' : ''}`}
                onClick={handleVoiceInput}
                aria-label={isRecording ? 'Stop and use transcript' : 'Start voice input'}
              >
                {isRecording ? <SendIcon /> : <MicIcon />}
              </button>
            </div>
            <p className="fdf-ai-helper">
              This will power a real-time Q&A assistant to suggest nearby deals based on your cravings.
            </p>
          </div>

          <div
            style={{
              marginTop: '1rem',
              width: '100%',
              gridColumn: '1 / -1',
            }}
          >
            <MapView destination={selectedDestination} />
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
      </main>
    </div>
  )
}

export default App
