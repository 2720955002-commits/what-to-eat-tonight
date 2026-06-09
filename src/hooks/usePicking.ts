// ============================================================
// 「今晚吃啥」— 抽选 Hook
// ============================================================
// 连接 IndexedDB 数据层与抽选算法
// 供页面组件调用，处理 loading / error / empty 等状态
// ============================================================

import { useState, useCallback } from 'react'
import {
  getAllRecipes,
  getSetting,
  getAllFavoriteIds,
  getRecentRecipeIds,
} from '@/db'
import {
  pickDishes,
  type PickInput,
  type PickResult,
} from '@/lib/picking'
import type { PickSettings } from '@/db/types'
import { DEFAULT_PICK_SETTINGS } from '@/db/types'

const SETTINGS_KEY = 'pickSettings'

export interface UsePickReturn {
  /** 当前结果 */
  result: PickResult | null
  /** 是否加载中 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 执行抽选 */
  pick: (countOverride?: number) => Promise<void>
  /** 重置结果 */
  reset: () => void
}

/**
 * 抽选 Hook
 *
 * 每次调用 pick()：
 *   1. 从 IndexedDB 加载设置
 *   2. 用设置中的防重复天数加载历史
 *   3. 加载菜谱与收藏
 *   4. 调用 picking 算法
 *   5. 返回结果
 */
export function usePick(): UsePickReturn {
  const [result, setResult] = useState<PickResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = useCallback(async (countOverride?: number) => {
    setLoading(true)
    setError(null)

    try {
      // 1. 先加载设置（需要知道防重复天数）
      const savedSettings = await getSetting<PickSettings>(SETTINGS_KEY)
      const settings = savedSettings
        ? { ...savedSettings, ...(countOverride !== undefined ? { defaultDishCount: countOverride } : {}) }
        : { ...DEFAULT_PICK_SETTINGS, ...(countOverride !== undefined ? { defaultDishCount: countOverride } : {}) }

      // 2. 根据设置并行加载数据
      const days = settings.antiRepeat ? settings.antiRepeatDays : 0

      const [recipes, favIds, recentIds] = await Promise.all([
        getAllRecipes(),
        getAllFavoriteIds(),
        days > 0 ? getRecentRecipeIds(days) : Promise.resolve(new Set<string>()),
      ])

      // 3. 调用算法
      const input: PickInput = {
        allRecipes: recipes,
        settings,
        favoriteIds: new Set(favIds),
        recentRecipeIds: recentIds,
      }

      const pickResult = pickDishes(input)

      // 4. 处理空结果
      if (pickResult.recipes.length === 0) {
        setError('当前条件下没有可选的菜，试试调整设置吧')
        setResult(null)
      } else {
        setResult(pickResult)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '抽选出错了'
      setError(msg)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, pick, reset }
}
