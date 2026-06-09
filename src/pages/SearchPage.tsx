// ============================================================
// 「今晚吃啥」— 筛选页面
// ============================================================
// 双模式筛选：
//   1. 我有食材 — 根据冰箱里的食材筛选可做的菜
//   2. 我想吃 — 按口味/用时/难度/季节组合筛选
// ============================================================

import { useState, useCallback, useEffect } from 'react'
import { getAllRecipes } from '@/db'
import {
  filterRecipes,
  type FilterParams,
  type FilterResult,
  DEFAULT_FILTER_PARAMS,
} from '@/lib/filter'
import {
  INGREDIENT_CATEGORIES,
  type Flavor,
  type Difficulty,
  type Season,
} from '@/db/types'
import {
  Search,
  CookingPot,
  ChefHat,
  Clock,
  BarChart3,
  Sun,
  Salad,
  X,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'

// ============================================================
// 常量
// ============================================================

const ALL_FLAVORS: Flavor[] = [
  '辣', '清淡', '酸甜', '鲜香', '酱香',
  '蒜香', '麻辣', '酸辣', '葱香', '清甜', '孜然香',
]

const ALL_DIFFICULTIES: Difficulty[] = ['简单', '中等', '困难']

const ALL_SEASONS: Season[] = ['春', '夏', '秋', '冬']

const COOK_TIME_OPTIONS = [
  { label: '不限', value: 0 },
  { label: '≤15分钟', value: 15 },
  { label: '≤30分钟', value: 30 },
  { label: '≤60分钟', value: 60 },
]

// ============================================================
// 组件
// ============================================================

function SearchPage() {
  // 菜谱数据
  const [allRecipes, setAllRecipes] = useState<FilterResult['recipes']>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // 筛选参数
  const [params, setParams] = useState<FilterParams>(DEFAULT_FILTER_PARAMS)

  // 筛选结果
  const [result, setResult] = useState<FilterResult | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // 食材分类折叠状态
  const [expandedCategories, setExpandedCategories] = useState<
    Set<string>
  >(new Set(Object.keys(INGREDIENT_CATEGORIES)))

  // 自定义食材输入
  const [customIngredient, setCustomIngredient] = useState('')

  // 加载数据
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    getAllRecipes()
      .then((recipes) => {
        setAllRecipes(recipes)
        setDataLoaded(true)
      })
      .catch((err) => {
        console.error('[Search] 加载菜谱失败:', err)
        setDataError('加载菜谱数据失败，请重试')
        setDataLoaded(true)
      })
  }, [])

  /** 执行筛选 */
  const handleSearch = useCallback(() => {
    const filtered = filterRecipes(allRecipes, params)
    setResult(filtered)
    setHasSearched(true)
  }, [allRecipes, params])

  /** 重置所有筛选条件 */
  const handleReset = useCallback(() => {
    setParams(DEFAULT_FILTER_PARAMS)
    setResult(null)
    setHasSearched(false)
    setCustomIngredient('')
  }, [])

  /** 更新筛选参数 */
  const updateParam = useCallback(
    <K extends keyof FilterParams>(
      key: K,
      value: FilterParams[K],
    ) => {
      setParams((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  /** 切换口味标签 */
  const toggleFlavor = useCallback((flavor: Flavor) => {
    setParams((prev) => {
      const current = prev.flavors
      const next = current.includes(flavor)
        ? current.filter((f) => f !== flavor)
        : [...current, flavor]
      return { ...prev, flavors: next }
    })
  }, [])

  /** 切换难度标签 */
  const toggleDifficulty = useCallback((diff: Difficulty) => {
    setParams((prev) => {
      const current = prev.difficulties
      const next = current.includes(diff)
        ? current.filter((d) => d !== diff)
        : [...current, diff]
      return { ...prev, difficulties: next }
    })
  }, [])

  /** 切换季节标签 */
  const toggleSeason = useCallback((season: Season) => {
    setParams((prev) => {
      const current = prev.seasons
      const next = current.includes(season)
        ? current.filter((s) => s !== season)
        : [...current, season]
      return { ...prev, seasons: next }
    })
  }, [])

  /** 添加自定义食材 */
  const addCustomIngredient = useCallback(() => {
    const trimmed = customIngredient.trim()
    if (!trimmed) return
    setParams((prev) => {
      if (prev.selectedIngredients.includes(trimmed)) return prev
      return {
        ...prev,
        selectedIngredients: [...prev.selectedIngredients, trimmed],
      }
    })
    setCustomIngredient('')
  }, [customIngredient])

  /** 移除已选食材 */
  const removeIngredient = useCallback((ingredient: string) => {
    setParams((prev) => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.filter(
        (i) => i !== ingredient,
      ),
    }))
  }, [])

  /** 切换食材分类折叠 */
  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }, [])

  /** 从分类标签中选择食材 */
  const toggleCategoryIngredient = useCallback(
    (ingredient: string) => {
      setParams((prev) => {
        const current = prev.selectedIngredients
        const next = current.includes(ingredient)
          ? current.filter((i) => i !== ingredient)
          : [...current, ingredient]
        return { ...prev, selectedIngredients: next }
      })
    },
    [],
  )

  // 已选择的食材数量
  const selectedCount = params.selectedIngredients.length

  // 是否有任何筛选条件
  const hasAnyFilter =
    params.flavors.length > 0 ||
    params.maxCookTime > 0 ||
    params.difficulties.length > 0 ||
    params.seasons.length > 0 ||
    (params.mode === 'ingredients' && selectedCount > 0)

  // 数据加载错误态
  if (dataError) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
          <Search className="h-5 w-5 text-primary" />
          筛选菜品
        </h2>
        <div className="rounded-card border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{dataError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 w-full rounded-button border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-[0.97]"
          >
            重新加载页面
          </button>
        </div>
      </div>
    )
  }

  if (!dataLoaded) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
          <Search className="h-5 w-5 text-primary" />
          筛选菜品
        </h2>
        {/* 骨架屏：模式切换区 */}
        <div className="mb-6 overflow-hidden rounded-card bg-card shadow-sm">
          <div className="flex">
            <div className="flex-1 animate-pulse py-3.5">
              <div className="mx-auto h-4 w-16 rounded bg-divider" />
            </div>
            <div className="flex-1 animate-pulse py-3.5">
              <div className="mx-auto h-4 w-16 rounded bg-divider" />
            </div>
          </div>
        </div>
        {/* 骨架屏：分类区 */}
        <div className="rounded-card bg-card p-4 shadow-sm">
          <div className="mb-3 animate-pulse">
            <div className="h-4 w-20 rounded bg-divider" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-16 animate-pulse rounded-[8px] bg-divider" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 pt-6">
      {/* 页面标题 */}
      <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary md:text-2xl">
        <Search className="h-5 w-5 text-primary" />
        筛选菜品
      </h2>

      {/* ========== 双模式切换 ========== */}
      <div className="overflow-hidden rounded-card bg-card shadow-sm">
        <div className="flex">
          <button
            onClick={() => updateParam('mode', 'ingredients')}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200 ${
              params.mode === 'ingredients'
                ? 'bg-primary text-white'
                : 'bg-card text-text-secondary hover:text-text-primary active:scale-[0.97]'
            }`}
          >
            <CookingPot className="h-4 w-4" />
            我有食材
          </button>
          <button
            onClick={() => updateParam('mode', 'craving')}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200 ${
              params.mode === 'craving'
                ? 'bg-primary text-white'
                : 'bg-card text-text-secondary hover:text-text-primary active:scale-[0.97]'
            }`}
          >
            <ChefHat className="h-4 w-4" />
            我想吃
          </button>
        </div>
      </div>

      {/* ========== 食材选择（仅我有食材模式） ========== */}
      {params.mode === 'ingredients' && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <Salad className="h-4 w-4 text-primary" />
            选择食材
            {selectedCount > 0 && (
              <span className="rounded-[8px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {selectedCount}
              </span>
            )}
          </h3>

          {/* 已选食材标签 */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {params.selectedIngredients.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-[8px] bg-primary/10 px-2.5 py-1 text-xs text-primary"
                >
                  {item}
                  <button
                    onClick={() => removeIngredient(item)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 自定义输入 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入食材名称，如：牛肉"
              value={customIngredient}
              onChange={(e) => setCustomIngredient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomIngredient()
                }
              }}
              className="h-9 flex-1 rounded-input border border-divider bg-surface px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary"
            />
            <button
              onClick={addCustomIngredient}
              disabled={!customIngredient.trim()}
              className="flex h-9 items-center gap-1 rounded-input bg-primary px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-dark disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              添加
            </button>
          </div>

          {/* 分类食材列表 */}
          <div className="overflow-hidden rounded-card bg-card shadow-sm">
            {Object.entries(INGREDIENT_CATEGORIES).map(
              ([category, items], catIndex) => {
                const isExpanded = expandedCategories.has(category)
                return (
                  <div key={category}>
                    {/* 分类标题 */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-divider/30"
                    >
                      <span>{category}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-text-secondary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-text-secondary" />
                      )}
                    </button>

                    {/* 食材标签 */}
                    {isExpanded && (
                      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                        {items.map((ingredient) => {
                          const isSelected =
                            params.selectedIngredients.includes(
                              ingredient,
                            )
                          return (
                            <button
                              key={ingredient}
                              onClick={() =>
                                toggleCategoryIngredient(ingredient)
                              }
                              className={`rounded-[8px] px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                                isSelected
                                  ? 'bg-primary text-white shadow-sm'
                              : 'border border-divider bg-surface text-text-secondary hover:border-primary/30 hover:text-primary active:scale-95'
                            }`}
                            >
                              {ingredient}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* 分割线 */}
                    {catIndex <
                      Object.keys(INGREDIENT_CATEGORIES).length - 1 && (
                      <div className="ml-4 mr-4 border-t border-divider" />
                    )}
                  </div>
                )
              },
            )}
          </div>
        </div>
      )}

      {/* ========== 口味筛选 ========== */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <ChefHat className="h-4 w-4 text-primary" />
          口味
        </h3>
        <div className="overflow-hidden rounded-card bg-card p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {ALL_FLAVORS.map((flavor) => {
              const isActive = params.flavors.includes(flavor)
              return (
                <button
                  key={flavor}
                  onClick={() => toggleFlavor(flavor)}
                  className={`rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                              : 'border border-divider bg-surface text-text-secondary hover:border-primary/30 hover:text-primary active:scale-95'
                            }`}
                >
                  {flavor}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== 用时筛选 ========== */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <Clock className="h-4 w-4 text-primary" />
          烹饪用时
        </h3>
        <div className="overflow-hidden rounded-card bg-card p-4 shadow-sm">
          <div className="flex gap-2">
            {COOK_TIME_OPTIONS.map((opt) => {
              const isActive = params.maxCookTime === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => updateParam('maxCookTime', opt.value)}
                  className={`flex-1 rounded-[8px] px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                              : 'border border-divider bg-surface text-text-secondary hover:border-primary/30 hover:text-primary active:scale-95'
                            }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== 难度筛选 ========== */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <BarChart3 className="h-4 w-4 text-primary" />
          难度
        </h3>
        <div className="overflow-hidden rounded-card bg-card p-4 shadow-sm">
          <div className="flex gap-2">
            {ALL_DIFFICULTIES.map((diff) => {
              const isActive = params.difficulties.includes(diff)
              return (
                <button
                  key={diff}
                  onClick={() => toggleDifficulty(diff)}
                  className={`flex-1 rounded-[8px] px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                              : 'border border-divider bg-surface text-text-secondary hover:border-primary/30 hover:text-primary active:scale-95'
                            }`}
                >
                  {diff}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== 季节筛选 ========== */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <Sun className="h-4 w-4 text-primary" />
          季节
        </h3>
        <div className="overflow-hidden rounded-card bg-card p-4 shadow-sm">
          <div className="flex gap-2">
            {ALL_SEASONS.map((season) => {
              const isActive = params.seasons.includes(season)
              return (
                <button
                  key={season}
                  onClick={() => toggleSeason(season)}
                  className={`flex-1 rounded-[8px] px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                              : 'border border-divider bg-surface text-text-secondary hover:border-primary/30 hover:text-primary active:scale-95'
                            }`}
                >
                  {season}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== 操作按钮 ========== */}
      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          disabled={!hasAnyFilter}
          className="flex flex-1 items-center justify-center gap-2 rounded-button bg-primary py-3.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:bg-primary-dark active:scale-[0.97] disabled:opacity-40"
        >
          <Search className="h-4 w-4" />
          筛选
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-button border border-divider px-5 py-3.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-divider active:scale-[0.97]"
        >
          <RotateCcw className="h-4 w-4" />
          重置
        </button>
      </div>

      {/* ========== 筛选结果 ========== */}
      {hasSearched && result && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <Search className="h-4 w-4 text-primary" />
            筛选结果
            <span className="rounded-[8px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {result.matchCount}/{result.totalCount}
            </span>
          </h3>

          {result.matchCount === 0 ? (
            <EmptyState
              type="search"
              title="没有找到匹配的菜品"
              description="试试调整筛选条件"
            />
          ) : (
            <div className="space-y-2.5">
              {result.recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="rounded-xl bg-card px-4 py-3.5 shadow-sm"
                >
                  <h4 className="mb-1.5 text-base font-semibold text-text-primary">
                    {recipe.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 text-xs text-text-secondary">
                    <span className="rounded-[6px] bg-primary/10 px-2 py-0.5 text-primary">
                      {recipe.category}
                    </span>
                    <span className="rounded-[6px] bg-divider px-2 py-0.5">
                      {recipe.difficulty}
                    </span>
                    <span className="rounded-[6px] bg-divider px-2 py-0.5">
                      {recipe.cookTime} 分钟
                    </span>
                    {recipe.flavors.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="rounded-[6px] bg-divider px-2 py-0.5"
                      >
                        {f}
                      </span>
                    ))}
                    {recipe.season.length > 0 && (
                      <span className="rounded-[6px] bg-divider px-2 py-0.5">
                        {recipe.season.join(' / ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchPage
