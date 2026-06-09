// ============================================================
// Toast 通知系统 — Context + Hook
// ============================================================
// 使用方式：
//   const { toast } = useToast()
//   toast({ title: '成功', description: '已保存', variant: 'success' })
//   toast({ title: '警告', variant: 'warning' })
//   toast({ title: '错误', variant: 'error', duration: 5000 })
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'

// ============================================================
// 类型定义
// ============================================================

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number // ms，默认 3000
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: (item: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

// ============================================================
// Context
// ============================================================

const ToastContext = createContext<ToastContextValue | null>(null)

// ============================================================
// Provider
// ============================================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    // 清理计时器
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    // 标记为离场中
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    )
    // 离场动画结束后移除 DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const newToast: ToastItem = { ...item, id }
      setToasts((prev) => [...prev, newToast])

      // 自动消除
      const duration = item.duration ?? 3000
      const timer = setTimeout(() => dismiss(id), duration)
      timersRef.current.set(id, timer)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ============================================================
// Hook
// ============================================================

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast 必须在 ToastProvider 内使用')
  }
  return ctx
}

// ============================================================
// Toast 容器 & 单个 Toast 组件
// ============================================================

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; icon: string; border: string; text: string }
> = {
  success: {
    bg: 'bg-green-50',
    icon: '✅',
    border: 'border-green-200',
    text: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    icon: '❌',
    border: 'border-red-200',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: '⚠️',
    border: 'border-amber-200',
    text: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50',
    icon: '💡',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: (ToastItem & { exiting?: boolean })[]
  dismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed left-1/2 top-4 z-[999] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((item) => {
        const style = VARIANT_STYLES[item.variant]
        return (
          <div
            key={item.id}
            className={`${
              item.exiting ? 'animate-toast-out' : 'animate-toast-in'
            } rounded-card border ${style.border} ${style.bg} px-4 py-3 shadow-lg`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-base leading-none">{style.icon}</span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${style.text}`}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(item.id)}
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-secondary/50 transition-colors hover:bg-black/5 hover:text-text-secondary active:scale-[0.85]"
                aria-label="关闭通知"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
