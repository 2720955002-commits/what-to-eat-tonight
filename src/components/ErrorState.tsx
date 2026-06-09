// ============================================================
// ErrorState — 数据加载错误状态组件
// ============================================================
// 统一的错误展示与重试机制，覆盖：
//   1. 网络错误 / 数据加载失败
//   2. 操作失败（收藏/删除等）
//   3. 空数据引导
// ============================================================

import { AlertCircle, RefreshCw, WifiOff, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ============================================================
// 错误类型
// ============================================================

export type ErrorKind =
  | 'network'      // 网络错误 / offline
  | 'load'         // 数据加载失败
  | 'empty'        // 数据为空
  | 'not-found'    // 资源不存在（404）
  | 'operation'    // 操作失败（收藏/删除等）
  | 'generic'      // 通用错误

// ============================================================
// Props
// ============================================================

interface ErrorStateProps {
  /** 错误类型 */
  kind?: ErrorKind
  /** 主标题 */
  title?: string
  /** 描述文案 */
  description?: string
  /** 重试回调（不传则不显示重试按钮） */
  onRetry?: () => void
  /** 重试按钮文案 */
  retryLabel?: string
  /** 自定义操作按钮 */
  action?: ReactNode
  /** 附加说明（标题下，描述上） */
  hint?: string
  /** 容器 className */
  className?: string
  /** 是否紧凑模式（少 padding） */
  compact?: boolean
}

// ============================================================
// 默认文案映射
// ============================================================

const DEFAULT_CONTENT: Record<
  ErrorKind,
  { icon: ReactNode; title: string; description: string }
> = {
  network: {
    icon: <WifiOff className="h-8 w-8 text-text-secondary/50" />,
    title: '网络连接失败',
    description: '请检查网络连接后重试',
  },
  load: {
    icon: <AlertCircle className="h-8 w-8 text-red-400" />,
    title: '数据加载失败',
    description: '加载数据时遇到问题，请重试',
  },
  empty: {
    icon: <Frown className="h-8 w-8 text-text-secondary/50" />,
    title: '暂无数据',
    description: '这里还没有内容呢',
  },
  'not-found': {
    icon: <Frown className="h-8 w-8 text-text-secondary/50" />,
    title: '页面未找到',
    description: '你访问的页面不存在或已被移除',
  },
  operation: {
    icon: <AlertCircle className="h-8 w-8 text-red-400" />,
    title: '操作失败',
    description: '操作遇到了问题，请稍后重试',
  },
  generic: {
    icon: <AlertCircle className="h-8 w-8 text-red-400" />,
    title: '出了点问题',
    description: '请稍后重试',
  },
}

// ============================================================
// 组件
// ============================================================

function ErrorState({
  kind = 'generic',
  title,
  description,
  onRetry,
  retryLabel = '重新加载',
  action,
  hint,
  className,
  compact,
}: ErrorStateProps) {
  const defaults = DEFAULT_CONTENT[kind]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        compact ? 'px-4 py-8' : 'px-4 py-16',
        className,
      )}
    >
      {/* 错误图标 */}
      <div
        className={cn(
          'mb-4 flex items-center justify-center',
          compact ? 'h-14 w-14' : 'h-20 w-20',
        )}
      >
        <div
          className={cn(
            'flex h-full w-full items-center justify-center rounded-full',
            kind === 'network' && 'bg-amber-50',
            (kind === 'load' ||
              kind === 'operation' ||
              kind === 'generic') && 'bg-red-50',
            (kind === 'empty' || kind === 'not-found') && 'bg-surface',
          )}
        >
          {defaults.icon}
        </div>
      </div>

      {/* 标题 */}
      <h3
        className={cn(
          'text-center font-semibold text-text-primary',
          compact ? 'text-sm' : 'text-base',
        )}
      >
        {title ?? defaults.title}
      </h3>

      {/* 提示 */}
      {hint && (
        <p className="mt-1 max-w-[260px] text-center text-xs leading-relaxed text-text-secondary/70">
          {hint}
        </p>
      )}

      {/* 描述 */}
      <p
        className={cn(
          'max-w-[280px] text-center leading-relaxed text-text-secondary',
          hint ? 'mt-1.5' : 'mt-2',
          compact ? 'text-xs' : 'text-sm',
        )}
      >
        {description ?? defaults.description}
      </p>

      {/* 重试按钮 */}
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className={cn('mt-6', compact && 'h-9 text-xs')}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          {retryLabel}
        </Button>
      )}

      {/* 自定义操作 */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default ErrorState
