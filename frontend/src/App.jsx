import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Programs from './pages/Programs'
import Clients from './pages/Clients'
import DataQuality from './pages/DataQuality'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-surface">

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Backdrop — mobile only, closes sidebar on tap */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content column */}
        <div className="flex flex-col flex-1 md:ml-60 min-h-screen">

          {/* Mobile top bar */}
          <header className="sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-ink/5 px-4 py-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-ink/50 hover:text-ink transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-ink tracking-tight">
              Settlement Insights
            </span>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Routes>
              <Route path="/"         element={<Overview />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/clients"  element={<Clients />} />
              <Route path="/quality"  element={<DataQuality />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  )
}
