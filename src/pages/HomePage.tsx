// ============================================================
// 「今晚吃啥」— 首页（抽选页）
// ============================================================
// 包含：摇一摇大按钮、菜数选择器、配置入口、
// 结果卡片列表、确定/重摇、冰箱食材弹窗
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  RotateCw,
  Settings,
  Heart,
  Refrigerator,
  Minus,
  Plus,
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { usePick, type UsePickReturn } from '@/hooks/usePicking'
import {
  getAllFavoriteIds,
  addFavorite,
  removeFavorite,
  addHistory,
  getSetting,
} from '@/db'
import { setSetting } from '@/db'
import type { PickSettings } from '@/db/types'
import FridgeSelector from '@/components/FridgeSelector'
import { getCategoryEmoji } from '@/lib/utils'

const SETTINGS_KEY = 'pickSettings'

// ============================================================
// 子组件：菜数选择器
// ============================================================

interface DishCountSelectorProps {
  value: number
  onChange: (val: number) => void
}

function DishCountSelector({ value, onChange }: DishCountSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-button border border-divider bg-surface text-text-primary transition-all hover:bg-divider/70 active:scale-95 disabled:opacity-40"
        aria-label="减少菜数"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="flex items-baseline gap-1">
        <span className="min-w-[2ch] text-center text-3xl font-bold text-primary">
          {value}
        </span>
        <span className="text-sm text-text-secondary">个菜</span>
      </div>
      <button
        onClick={() => onChange(Math.min(5, value + 1))}
        disabled={value >= 5}
        className="flex h-9 w-9 items-center justify-center rounded-button bg-primary text-white shadow-sm transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-40"
        aria-label="增加菜数"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================

function HomePage() {
  const navigate = useNavigate()
  const { result, loading, error, pick, reset }: UsePickReturn = usePick()

  // 状态
  const [dishCount, setDishCount] = useState(2)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [fridgeOpen, setFridgeOpen] = useState(false)
  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>([])
  const [fridgeMode, setFridgeMode] = useState(false)
  const [hasPicked, setHasPicked] = useState(false)

  // 摇一摇动画
  const shakeBtnRef = useRef<HTMLButtonElement>(null)

  // ============================================================
  // 加载收藏 & 冰箱配置
  // ============================================================
  const loadInitialData = useCallback(async () => {
    try {
      const [ids, settings] = await Promise.all([
        getAllFavoriteIds(),
        getSetting<PickSettings>(SETTINGS_KEY),
      ])
      setFavoriteIds(new Set(ids))
      if (settings) {
        setDishCount(settings.defaultDishCount)
        setFridgeIngredients(settings.fridgeIngredients ?? [])
        setFridgeMode(settings.fridgeMode ?? false)
      }
    } catch (err) {
      console.error('[HomePage] 加载数据失败:', err)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // ============================================================
  // 抽选点击 — 带动画
  // ============================================================
  const handlePick = async () => {
    reset()

    // 摇一摇动画
    const btn = shakeBtnRef.current
    if (btn) {
      btn.style.transform = 'rotate(15deg) scale(0.9)'
      btn.style.transition = 'transform 0.15s'
      setTimeout(() => {
        btn.style.transform = ''
      }, 200)
    }

    try {
      // 确保 settings 中的菜数与当前一致
      const savedSettings = await getSetting<PickSettings>(SETTINGS_KEY)
      if (savedSettings && savedSettings.defaultDishCount !== dishCount) {
        await setSetting(SETTINGS_KEY, {
          ...savedSettings,
          defaultDishCount: dishCount,
        })
      }

      await pick(dishCount)
      setHasPicked(true)
    } catch (err) {
      console.error('[HomePage] 抽选失败:', err)
    }
  }

  // ============================================================
  // 收藏切换
  // ============================================================
  const handleToggleFavorite = async (
    recipeId: string,
    currentlyFavorited: boolean,
  ) => {
    const newFavIds = new Set(favoriteIds)
    if (currentlyFavorited) {
      newFavIds.delete(recipeId)
    } else {
      newFavIds.add(recipeId)
    }
    setFavoriteIds(newFavIds)

    try {
      if (currentlyFavorited) {
        await removeFavorite(recipeId)
      } else {
        await addFavorite(recipeId)
      }
    } catch (err) {
      console.error('[HomePage] 收藏操作失败:', err)
      setFavoriteIds(favoriteIds)
    }
  }

  // ============================================================
  // 确定选择 — 写入历史
  // ============================================================
  const handleConfirm = useCallback(async () => {
    if (!result || result.recipes.length === 0) return

    try {
      await addHistory(result.recipes.map((r) => r.id), result.recipes.length)
    } catch (err) {
      console.error('[HomePage] 写入历史失败:', err)
    }
  }, [result])

  // ============================================================
  // 冰箱食材更新
  // ============================================================
  const handleFridgeIngredientsChange = useCallback(
    (ingredients: string[]) => {
      setFridgeIngredients(ingredients)
      setFridgeMode(ingredients.length > 0)
    },
    [],
  )

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div className="flex flex-col items-center px-5 pb-6 pt-8">
      {/* 顶部标题 + 配置入口 */}
      <div className="mb-2 flex w-full items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">今晚吃啥</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            纠结终结者
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-10 w-10 items-center justify-center rounded-button bg-surface text-text-secondary transition-all hover:bg-divider/70 active:scale-95"
          aria-label="设置"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* 菜数选择器 */}
      <div className="mb-6 mt-2">
        <DishCountSelector value={dishCount} onChange={setDishCount} />
      </div>

      {/* 摇一摇大按钮 */}
      <button
        ref={shakeBtnRef}
        onClick={handlePick}
        disabled={loading}
        className="mb-6 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 disabled:opacity-70"
        style={{
          boxShadow: '0 6px 24px rgba(232, 168, 124, 0.35)',
        }}
      >
        {loading ? (
          <>
            <RotateCw className="mb-1 h-7 w-7 animate-spin" />
            <span className="text-xs font-medium">抽选中</span>
          </>
        ) : (
          <>
            <span className="mb-1 text-3xl">🎲</span>
            <span className="text-sm font-semibold">摇一摇</span>
          </>
        )}
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 w-full rounded-card border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* 结果区域 */}
      <div className="w-full">
        {hasPicked && result && result.recipes.length > 0 && (
          <>
            {/* 结果标题 */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-base font-semibold text-text-primary">
                🍽️ 今天吃这些
              </h2>
              <span className="text-xs text-text-secondary">
                不满意？重新摇
              </span>
            </div>

            {/* 结果卡片列表 */}
            <div className="space-y-3">
              {result.recipes.map((recipe) => {
                const isFav = favoriteIds.has(recipe.id)
                const emoji = getCategoryEmoji(recipe.category)
                return (
                  <div
                    key={recipe.id}
                    className="flex items-center gap-3 rounded-card bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md"
                    style={{ border: '0.5px solid #F0EBE6' }}
                  >
                    {/* Emoji 缩略图 */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-input bg-gradient-to-br from-[#F5F0EB] to-[#EDE5DC] text-2xl">
                      {emoji}
                    </div>

                    {/* 菜谱信息 */}
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                    >
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {recipe.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-[#FAF5F0] px-2 py-0.5 text-[11px] text-text-secondary">
                          {recipe.cookTime}min
                        </span>
                        <span className="inline-flex items-center rounded-md bg-[#FAF5F0] px-2 py-0.5 text-[11px] text-text-secondary">
                          {recipe.difficulty === '简单'
                            ? '⭐'
                            : recipe.difficulty === '中等'
                              ? '⭐⭐'
                              : '⭐⭐⭐'}
                        </span>
                        {recipe.flavors.slice(0, 2).map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center rounded-md bg-[#FAF5F0] px-2 py-0.5 text-[11px] text-text-secondary"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 收藏按钮 */}
                    <button
                      onClick={() =>
                        handleToggleFavorite(recipe.id, isFav)
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF5F0] transition-all hover:bg-divider"
                      aria-label={isFav ? '取消收藏' : '收藏'}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all ${
                          isFav
                            ? 'fill-accent text-accent'
                            : 'text-text-secondary'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* 操作按钮：重摇 + 确定 */}
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handlePick}
                disabled={loading}
              >
                <RotateCw className="mr-1.5 h-4 w-4" />
                重新摇
              </Button>
              <Button
                size="lg"
                className="flex-1 shadow-md"
                onClick={handleConfirm}
                disabled={loading}
              >
                ✅ 就吃这些
              </Button>
            </div>

            {/* 抽选统计 */}
            <p className="mt-3 text-center text-xs text-text-secondary">
              从 {result.candidateCount} 道菜中选出 {result.recipes.length} 道
              {result.dedupRemoved > 0 &&
                `（跳过 ${result.dedupRemoved} 道最近吃过的）`}
            </p>
          </>
        )}

        {!hasPicked && !loading && !error && (
          <>
            {/* 冰箱模式开关 */}
            <div className="mb-4 overflow-hidden rounded-card bg-white shadow-sm"
              style={{ border: '0.5px solid #F0EBE6' }}>
              {/* 开关行 */}
              <div className="flex items-center justify-between px-4 py-3">
                <label className="flex cursor-pointer items-center gap-2"
                  onClick={() => {
                    const newMode = !fridgeMode
                    setFridgeMode(newMode)
                    if (newMode && fridgeIngredients.length === 0) {
                      setFridgeOpen(true)
                    } else if (!newMode) {
                      getSetting<PickSettings>(SETTINGS_KEY).then((s) => {
                        if (s) { setSetting(SETTINGS_KEY, { ...s, fridgeMode: false }) }
                      }).catch(() => {})
                    }
                  }}>
                  <Refrigerator className={`h-4 w-4 ${fridgeMode ? 'text-primary' : 'text-text-secondary'}`} />
                  <span className="text-sm text-text-primary">冰箱里有啥菜</span>
                </label>
                <div className="flex items-center gap-2">
                  {fridgeMode && (
                    <button
                      onClick={() => setFridgeOpen(true)}
                      className={`rounded-button px-3 py-1.5 text-xs font-medium transition-all ${
                        fridgeIngredients.length > 0
                          ? 'bg-primary text-white'
                          : 'border border-dashed border-primary/50 bg-surface text-primary'
                      }`}
                    >
                      {fridgeIngredients.length > 0
                        ? `${fridgeIngredients.length} 种`
                        : '选择食材'}
                    </button>
                  )}
                  {/* iOS 风格 Toggle */}
                  <button
                    onClick={() => {
                      const newMode = !fridgeMode
                      setFridgeMode(newMode)
                      if (newMode && fridgeIngredients.length === 0) {
                        setFridgeOpen(true)
                      } else if (!newMode) {
                        getSetting<PickSettings>(SETTINGS_KEY).then((s) => {
                          if (s) { setSetting(SETTINGS_KEY, { ...s, fridgeMode: false }) }
                        }).catch(() => {})
                      }
                    }}
                    className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-all ${
                      fridgeMode ? 'bg-primary' : 'bg-divider'
                    }`}
                    role="switch"
                    aria-checked={fridgeMode}
                    aria-label={fridgeMode ? '关闭冰箱模式' : '开启冰箱模式'}
                  >
                    <span
                      className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-sm transition-all ${
                        fridgeMode ? 'translate-x-[17px]' : 'translate-x-[1px]'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 展开的食材详情 */}
              {fridgeMode && fridgeIngredients.length > 0 && (
                <div className="border-t border-divider/50 px-4 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {fridgeIngredients.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <EmptyState
              type="default"
              emoji="🎲"
              title="点击上方摇一摇开始抽选"
              description="或在设置中配置加权偏好"
            />
          </>
        )}

        {hasPicked && !result && !loading && !error && (
          <EmptyState
            type="empty"
            emoji="😅"
            title="没有抽到菜，再试试？"
          />
        )}
      </div>

      {/* 冰箱食材选择器弹窗 */}
      <FridgeSelector
        open={fridgeOpen}
        onOpenChange={setFridgeOpen}
        onIngredientsChange={handleFridgeIngredientsChange}
      />
    </div>
  )
}

export default HomePage
