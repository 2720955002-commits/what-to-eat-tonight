// ============================================================
// 页面过渡动画组件
// ============================================================
// 支持 5 种动画类型：fade | slide-up | slide-down | slide-left | slide-right
// 通过 Route 切换时自动触发 tailwindcss-animate 动画
// ============================================================

import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ============================================================
// Props
// ============================================================

interface PageTransitionProps {
  children: ReactNode
  className?: string
  /**
   * 动画方向：
   * - 'fade': 淡入（默认）
   * - 'slide-up': 上滑进入（首页、列表页）
   * - 'slide-down': 下滑进入（搜索、筛选页）
   * - 'slide-left': 左滑进入（进入详情页）
   * - 'slide-right': 右滑进入（返回列表页）
   */
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
}

// ============================================================
// 动画映射表
// ============================================================

const ANIMATION_MAP: Record<
  NonNullable<PageTransitionProps['animation']>,
  string
> = {
  'fade': 'animate-in fade-in duration-300 ease-out',
  'slide-up': 'animate-in slide-in-from-bottom-4 fade-in duration-350 ease-out',
  'slide-down': 'animate-in slide-in-from-top-4 fade-in duration-350 ease-out',
  'slide-left': 'animate-in slide-in-from-right-4 fade-in duration-350 ease-out',
  'slide-right': 'animate-in slide-in-from-left-4 fade-in duration-350 ease-out',
}

// ============================================================
// 组件
// ============================================================

function PageTransition({ children, className, animation = 'fade' }: PageTransitionProps) {
  const location = useLocation()

  return (
    <div
      key={location.pathname}
      className={cn(ANIMATION_MAP[animation], className)}
    >
      {children}
    </div>
  )
}

export default PageTransition