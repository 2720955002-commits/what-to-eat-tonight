// ============================================================
// NotFoundPage — 404 页面
// ============================================================
// 匹配未定义的路由时展示
// ============================================================

import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-surface px-6">
      {/* 404 图标 */}
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-surface shadow-sm">
        <span className="text-5xl font-bold text-primary/30">404</span>
      </div>

      <h1 className="mb-2 text-center text-xl font-bold text-text-primary">
        页面未找到
      </h1>

      <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-text-secondary">
        你访问的页面不存在，可能已被移除或链接有误
      </p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          返回上页
        </Button>
        <Button onClick={() => navigate('/')}>
          <Home className="mr-1.5 h-4 w-4" />
          回到首页
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
