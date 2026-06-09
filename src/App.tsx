// ============================================================
// App — 根组件
// ============================================================
// 集成：ToastProvider + ErrorBoundary + 页面过渡动画 + 404
// ============================================================

import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/hooks/useToast'
import ErrorBoundary from '@/components/ErrorBoundary'
import PageTransition from '@/components/PageTransition'
import BottomNav from '@/components/BottomNav'
import { seedDatabase } from '@/db/seed'
import { RefreshCw } from 'lucide-react'

// ============================================================
// 懒加载页面组件 — 按需加载，减小首屏 JS 体积
// ============================================================

const HomePage = lazy(() => import('@/pages/HomePage'))
const RecipePage = lazy(() => import('@/pages/RecipePage'))
const RecipeDetailPage = lazy(() => import('@/pages/RecipeDetailPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const RecipeFormPage = lazy(() => import('@/pages/RecipeFormPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// ============================================================
// Suspense 降级骨架屏
// ============================================================

function PageSkeleton() {
  return (
    <div className="px-4 pt-6 animate-pulse">
      <div className="mb-4 h-7 w-28 rounded bg-divider/60" />
      <div className="space-y-3">
        <div className="h-32 w-full rounded-card bg-divider/40" />
        <div className="h-24 w-full rounded-card bg-divider/40" />
        <div className="h-28 w-4/5 rounded-card bg-divider/40" />
      </div>
    </div>
  )
}

// ============================================================
// 应用根组件
// ============================================================

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    seedDatabase()
      .then((count) => {
        if (count > 0) {
          console.log(`[App] 已导入 ${count} 道内置菜谱`)
        }
      })
      .catch((err) => console.error('[App] 数据初始化失败:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-surface">
        <RefreshCw className="mb-4 h-8 w-8 animate-spin text-primary-main" />
        <p className="text-text-secondary">数据初始化中...</p>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="mx-auto min-h-screen max-w-lg bg-surface">
        <div className="pb-20">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PageTransition animation="slide-up">
                      <HomePage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/recipes"
                  element={
                    <PageTransition animation="slide-up">
                      <RecipePage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/recipes/add"
                  element={
                    <PageTransition animation="slide-up">
                      <RecipeFormPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/recipes/:id/edit"
                  element={
                    <PageTransition animation="slide-up">
                      <RecipeFormPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/recipes/:id"
                  element={
                    <PageTransition animation="slide-left">
                      <RecipeDetailPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <PageTransition animation="slide-down">
                      <SearchPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <PageTransition animation="slide-up">
                      <FavoritesPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <PageTransition animation="slide-up">
                      <HistoryPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PageTransition animation="slide-up">
                      <SettingsPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="*"
                  element={
                    <PageTransition animation="fade">
                      <NotFoundPage />
                    </PageTransition>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
        <BottomNav />
      </div>
    </ToastProvider>
  )
}

export default App
