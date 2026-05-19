import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

const NAV_LINKS = [
  { to: '/',         label: 'Overview',     icon: '◉' },
  { to: '/programs', label: 'Programs',     icon: '▦' },
  { to: '/clients',  label: 'Clients',      icon: '≡' },
  { to: '/quality',  label: 'Data Quality', icon: '✓' },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={[
        'fixed top-0 left-0 h-screen w-60 bg-primary text-white flex flex-col z-40',
        'transform transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      ].join(' ')}
    >
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/40 hover:text-white md:hidden"
        aria-label="Close menu"
      >
        <X size={18} />
      </button>

      {/* App name */}
      <div className="px-6 py-7 border-b border-white/10">
        <p className="text-xs font-semibold tracking-widest text-white/50 uppercase mb-1">
          Settlement
        </p>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Insights
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-100',
                isActive
                  ? 'bg-accent text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/30">Portfolio · 2024</p>
      </div>
    </aside>
  )
}
