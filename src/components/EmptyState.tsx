// ============================================================
// 空状态插图组件
// ============================================================
// 统一的空状态展示：插图 + 主文案 + 副文案 + 操作按钮
// ============================================================

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ============================================================
// 内置插图类型
// ============================================================

export type EmptyStateType = 'default' | 'empty' | 'search' | 'history' | 'favorite' | 'error'

const ILLUSTRATIONS: Record<EmptyStateType, { emoji: string; color: string }> = {
  default: { emoji: '📭', color: 'from-primary/10 to-primary/5' },
  empty: { emoji: '📭', color: 'from-primary/10 to-primary/5' },
  search: { emoji: '🔍', color: 'from-blue-50 to-blue-100' },
  history: { emoji: '📅', color: 'from-primary/10 to-primary/5' },
  favorite: { emoji: '❤️', color: 'from-accent/10 to-accent/5' },
  error: { emoji: '😅', color: 'from-red-50 to-red-100' },
}

// ============================================================
// 组件 Props
// ============================================================

interface EmptyStateProps {
  /** 插图类型，决定 emoji 和配色 */
  type?: EmptyStateType
  /** 自定义 Emoji（覆盖 type） */
  emoji?: string
  /** 主标题 */
  title: string
  /** 副说明 */
  description?: string
  /** 操作按钮 */
  action?: ReactNode
  /** 容器 className */
  className?: string
}

// ============================================================
// 组件
// ============================================================

function EmptyState({
  type = 'default',
  emoji,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const illustration = ILLUSTRATIONS[type]
  const displayEmoji = emoji ?? illustration.emoji

  return (
    <div className={cn('flex flex-col items-center px-4 py-16', className)}>
      {/* 插图容器 */}
      <div
        className={cn(
          'mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-sm',
          illustration.color,
        )}
      >
        <span className="text-3xl leading-none">{displayEmoji}</span>
      </div>

      {/* 主标题 */}
      <h3 className="mb-1.5 text-center text-base font-semibold text-text-primary">
        {title}
      </h3>

      {/* 副说明 */}
      {description && (
        <p className="mb-6 max-w-[260px] text-center text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState