// ============================================================
// 「今晚吃啥」— 历史记录页
// ============================================================
// 展示每次确认的抽选结果，按月日分组（今天/昨天/更早）
// 支持：
//   - 按日期分组展示卡片
//   - 查看历史详情（跳转菜谱详情页）
//   - 清空历史功能
//   - 空状态引导
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import EmptyState from '@/components/EmptyState'
import { SkeletonCard } from '@/components/Skeleton'
import {
  getAllHistory,
  clearAllHistory,
  getRecipe,
  db,
} from '@/db'
import type { HistoryRecord, Recipe } from '@/db/types'
import { getCategoryEmoji } from '@/lib/utils'
import {
  Clock,
  Trash2,
  AlertCircle,
  ChefHat,
  X,
  RotateCcw,
} from 'lucide-react'

// ============================================================
// Helper: 格式化日期显示
// ============================================================

function formatDateLabel(dateStr: string): string {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  if (dateStr === todayStr) return '今天'

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (dateStr === yesterdayStr) return '昨天'

  // 今年内显示 "MM月DD日"，跨年显示 "YYYY年MM月DD日"
  const thisYear = today.getFullYear()
  const date = new Date(dateStr + 'T00:00:00')
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  if (y === thisYear) {
    return `${m}月${d}日`
  }
  return `${y}年${m}月${d}日`
}

/** 获取星期几 */
function getWeekday(dateStr: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(dateStr + 'T00:00:00')
  return weekdays[d.getDay()]
}

// ============================================================
// 类型：分组后的历史
// ============================================================

interface HistoryGroup {
  /** 分组标签：今天 / 昨天 / 6月8日 */
  label: string
  /** 日期字符串 YYYY-MM-DD */
  dateStr: string
  /** 当天所有记录 */
  records: HistoryRecord[]
}

// ============================================================
// 页面组件
// ============================================================

function HistoryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // State
  const [groups, setGroups] = useState<HistoryGroup[]>([])
  const [recipeNames, setRecipeNames] = useState<
    Map<string, { name: string; category: string }>
  >(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // ============================================================
  // 加载历史数据 & 菜谱名称
  // ============================================================
  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await getAllHistory()

      // 按日期分组
      const dateMap = new Map<string, HistoryRecord[]>()
      for (const record of records) {
        const existing = dateMap.get(record.date) ?? []
        existing.push(record)
        dateMap.set(record.date, existing)
      }

      // 构建分组（按日期倒序）
      const sortedDates = [...dateMap.keys()].sort(
        (a, b) => b.localeCompare(a), // YYYY-MM-DD 字符串可直接比
      )

      const grouped: HistoryGroup[] = sortedDates.map((dateStr) => ({
        label: formatDateLabel(dateStr),
        dateStr,
        records: dateMap.get(dateStr)!,
      }))

      setGroups(grouped)

      // 收集所有菜谱 ID，批量加载名称
      const allRecipeIds = [
        ...new Set(records.flatMap((r) => r.recipeIds)),
      ]
      const recipes = await db.recipes.bulkGet(allRecipeIds)
      const nameMap = new Map<
        string,
        { name: string; category: string }
      >()
      for (const recipe of recipes) {
        if (recipe) {
          nameMap.set(recipe.id, {
            name: recipe.name,
            category: recipe.category,
          })
        }
      }
      setRecipeNames(nameMap)
    } catch (err) {
      console.error('[HistoryPage] 加载失败:', err)
      setError('加载历史记录失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // ============================================================
  // 清空历史
  // ============================================================
  const handleClear = async () => {
    try {
      await clearAllHistory()
      setGroups([])
      setShowClearConfirm(false)
      toast({ title: '历史记录已清空', variant: 'success' })
    } catch (err) {
      toast({ title: '清空失败', description: '请稍后重试', variant: 'error' })
    }
  }

  // ============================================================
  // 加载态
  // ============================================================

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold">历史记录</h2>
        <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        </div>
      </div>
    )
  }

  // ============================================================
  // 错误态
  // ============================================================

  if (error) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold">历史记录</h2>
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-3 px-5 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={loadHistory}
        >
          重新加载
        </Button>
      </div>
    )
  }

  // ============================================================
  // 空态
  // ============================================================

  if (groups.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold">历史记录</h2>
        <EmptyState
          type="history"
          title="还没有历史记录"
          description="完成一次抽选并确认后，历史记录会展示在这里"
          action={
            <Button variant="outline" onClick={() => navigate('/')}>
              去做个决定
            </Button>
          }
        />
      </div>
    )
  }

  // ============================================================
  // 主内容：分组列表
  // ============================================================

  // 统计总记录数
  const totalCount = groups.reduce(
    (sum, g) => sum + g.records.length,
    0,
  )

  return (
    <div className="px-4 pt-6">
      {/* 标题栏 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">历史记录</h2>
          <p className="mt-0.5 text-xs text-text-secondary">
            累计 {totalCount} 条记录
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-text-secondary hover:text-red-500"
          onClick={() => setShowClearConfirm(true)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          清空
        </Button>
      </div>

      {/* 分组列表 */}
      <div className="space-y-6 pb-4">
        {groups.map((group) => {
          return (
            <section key={group.dateStr}>
              {/* 日期标题 */}
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-base font-semibold text-text-primary">
                  {group.label}
                </h3>
                <span className="rounded-full bg-primary/[0.08] px-2.5 py-0.5 text-xs text-primary-dark">
                  {getWeekday(group.dateStr)}
                </span>
              </div>

              {/* 当天记录 */}
              <div className="space-y-2.5">
                {group.records.map((record) => {
                  return (
                    <div key={record.id}>
                      {/* 当日时间戳 */}
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-text-secondary/50" />
                        <span className="text-[11px] text-text-secondary/60">
                          {new Date(
                            record.createdAt,
                          ).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[11px] text-text-secondary/40">
                          {record.dinnerCount} 道菜
                        </span>
                      </div>

                      {/* 菜谱卡片列表 */}
                      <div className="space-y-1.5">
                        {record.recipeIds.map((recipeId) => {
                          const info = recipeNames.get(recipeId)
                          return (
                            <Card
                              key={recipeId}
                              className="flex items-center gap-3 px-4 py-3 transition-all active:scale-[0.99]"
                              onClick={() => navigate(`/recipes/${recipeId}`)}
                            >
                              {/* Emoji 缩略图 */}
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-gradient-to-br from-[#F5F0EB] to-[#EDE5DC] text-xl">
                                {info
                                  ? getCategoryEmoji(info.category)
                                  : '❓'}
                              </div>
                              {/* 菜名 */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-text-primary">
                                  {info?.name ?? '未知菜谱'}
                                </p>
                                {info && (
                                  <p className="mt-0.5 text-[11px] text-text-secondary/60">
                                    {info.category}
                                  </p>
                                )}
                              </div>
                              {/* 箭头 */}
                              <svg
                                className="h-4 w-4 shrink-0 text-text-secondary/30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* 清空确认弹窗 */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 pb-12"
          onClick={() => setShowClearConfirm(false)}
        >
          <Card
            className="mx-4 w-full max-w-sm rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center px-6 pb-6 pt-8">
              {/* 关闭按钮 */}
              <button
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-divider/50 text-text-secondary active:scale-95"
                onClick={() => setShowClearConfirm(false)}
              >
                <X className="h-4 w-4" />
              </button>

              {/* 图标 */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                清空历史记录?
              </h3>
              <p className="mb-6 text-center text-sm text-text-secondary">
                此操作不可撤销
                <br />
                所有历史记录将被永久删除
              </p>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowClearConfirm(false)}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  onClick={handleClear}
                >
                  确认清空
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
