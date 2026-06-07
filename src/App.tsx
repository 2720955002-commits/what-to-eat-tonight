import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import RecipePage from '@/pages/RecipePage'
import FavoritesPage from '@/pages/FavoritesPage'
import HistoryPage from '@/pages/HistoryPage'
import SearchPage from '@/pages/SearchPage'
import SettingsPage from '@/pages/SettingsPage'
import BottomNav from '@/components/BottomNav'

function App() {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-surface">
      <div className="pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default App
