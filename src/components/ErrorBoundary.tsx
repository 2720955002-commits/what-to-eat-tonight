// ============================================================
// ErrorBoundary — React 渲染错误边界
// ============================================================
// 捕获页面内的未处理 JS 错误，防止白屏
// 展示友好的错误提示 + 重新加载按钮
// ============================================================

import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'

// ============================================================
// Props & State
// ============================================================

interface ErrorBoundaryProps {
  children: ReactNode
  /** 自定义 fallback UI */
  fallback?: ReactNode
  /** 错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ============================================================
// 默认错误 UI
// ============================================================

function DefaultErrorFallback({
  error,
  onRetry,
}: {
  error: Error | null
  onRetry: () => void
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-surface px-6">
      {/* 错误图标 */}
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 shadow-sm">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>

      <h3 className="mb-2 text-center text-lg font-semibold text-text-primary">
        页面出现错误
      </h3>

      <p className="mb-6 max-w-xs text-center text-sm leading-relaxed text-text-secondary">
        页面渲染时遇到了问题，请尝试刷新页面
      </p>

      {error && (
        <details className="mb-6 w-full max-w-sm rounded-card border border-divider bg-card p-3">
          <summary className="cursor-pointer text-xs font-medium text-text-secondary">
            查看错误详情
          </summary>
          <pre className="mt-2 overflow-auto text-xs leading-relaxed text-red-600">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      <Button onClick={onRetry}>
        <RefreshCw className="mr-1.5 h-4 w-4" />
        重新加载
      </Button>
    </div>
  )
}

// ============================================================
// ErrorBoundary 类组件
// ============================================================

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] 捕获未处理错误:', error)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
