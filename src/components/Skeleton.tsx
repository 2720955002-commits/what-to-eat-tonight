// ============================================================
// 统一骨架屏组件
// ============================================================
// 使用 shimmer 动画模拟内容加载
// ============================================================

import { cn } from '@/lib/utils'

// ============================================================
// 基础骨架块
// ============================================================

interface SkeletonBlockProps {
  className?: string
}

function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[8px] bg-divider',
        className,
      )}
    />
  )
}

// ============================================================
// 骨架文本行
// ============================================================

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={cn(
            'h-3.5',
            i === lines - 1 ? 'w-2/3' : 'w-full',
          )}
        />
      ))}
    </div>
  )
}

// ============================================================
// 骨架卡片
// ============================================================

interface SkeletonCardProps {
  className?: string
  /** 是否显示缩略图区域 */
  hasImage?: boolean
}

export function SkeletonCard({ className, hasImage }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-card bg-card p-4 shadow-sm', className)}>
      <div className="flex items-start gap-3">
        {hasImage && (
          <SkeletonBlock className="h-16 w-16 shrink-0 rounded-lg" />
        )}
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="mb-2 h-4 w-3/4" />
          <SkeletonBlock className="mb-1.5 h-3 w-1/2" />
          <div className="flex gap-1.5">
            <SkeletonBlock className="h-5 w-14 rounded-[8px]" />
            <SkeletonBlock className="h-5 w-14 rounded-[8px]" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 骨架英雄图
// ============================================================

export function SkeletonHero() {
  return (
    <div className="h-64 animate-pulse bg-divider" />
  )
}

// ============================================================
// 骨架列表 — 页面通用
// ============================================================

interface SkeletonListProps {
  count?: number
  hasImage?: boolean
  className?: string
}

export function SkeletonList({ count = 3, hasImage, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} hasImage={hasImage} />
      ))}
    </div>
  )
}

// ============================================================
// 骨架页面 — 设置页
// ============================================================

export function SkeletonSettings() {
  return (
    <div className="space-y-6 px-4 pt-6">
      <SkeletonBlock className="h-7 w-16" />
      <div className="rounded-card bg-card p-4 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-8 w-8 rounded-[10px]" />
                <div>
                  <SkeletonBlock className="mb-1 h-4 w-24" />
                  <SkeletonBlock className="h-3 w-32" />
                </div>
              </div>
              <SkeletonBlock className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 导出默认的骨架块
// ============================================================

export default SkeletonBlock