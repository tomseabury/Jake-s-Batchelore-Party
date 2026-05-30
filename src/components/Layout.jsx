// App shell: sticky nav, CRT overlay effects, animated route transitions, footer.
import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy, Gamepad2, Users, Crown, Menu, X, Home } from 'lucide-react'
import { generatedAt } from '../lib/data.js'

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/leaderboard', label: 'Ultimate Gamer', icon: Crown },
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/players', label: 'Players', icon: Users },
]

function NavItem({ item, onClick }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
          isActive
            ? 'bg-neon-cyan/10 text-neon-cyan shadow-neon'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon size={16} />
      <span>{item.label}</span>
    </NavLink>
  )
}

export default function Layout({ children }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="crt-lines crt-beam relative min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-edge/80 bg-void/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neon-amber/50 bg-neon-amber/10 text-neon-amber shadow-[0_0_14px_rgba(255,182,39,0.4)]">
              <Trophy size={18} />
            </span>
            <div className="leading-tight">
              <div className="font-display text-[0.7rem] text-white sm:text-xs">
                THE BACHELOR PARTY
              </div>
              <div className="font-pixel text-sm uppercase tracking-[0.25em] text-neon-pink">
                The Tournament
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </nav>

          <button
            className="rounded-lg border border-edge p-2 text-slate-300 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-edge bg-carbon/95 md:hidden"
            >
              <div className="flex flex-col gap-1 p-3">
                {NAV.map((item) => (
                  <NavItem key={item.to} item={item} onClick={() => setMenuOpen(false)} />
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Routed content with transition */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-edge/70 bg-void/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <span>
            Built for the legends of the weekend. <span className="text-neon-pink">GG.</span>
          </span>
          <span className="font-pixel tracking-wider">
            Data snapshot {new Date(generatedAt).toLocaleDateString('en-US')}
          </span>
        </div>
      </footer>
    </div>
  )
}
