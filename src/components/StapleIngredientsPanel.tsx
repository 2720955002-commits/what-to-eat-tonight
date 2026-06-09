// ============================================================
// 「今晚吃啥」— 常备食材预设面板
// ============================================================
// 按分类展示所有食材，用户可勾选家里常备的食材
// 抽选时可在冰箱模式下一键导入
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ShoppingBag,
  Search,
  Check,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { getSetting, setSetting } from '@/db'
import type { PickSettings } from '@/db'
import { INGREDIENT_CATEGORIES, DEFAULT_PICK_SETTINGS, ALL_INGREDIENTS } from '@/db'
import { cn } from '@/lib/utils'

// ============================================================
// 组件
// ============================================================

function StapleIngredientsPanel() {
  const [stapleIngredients, setStapleIngredients] = useState<string[]>([])
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loaded, setLoaded] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 加载
  useEffect(() => {
    getSetting<PickSettings>('pickSettings').then((saved) => {
      const merged = { ...DEFAULT_PICK_SETTINGS, ...saved }
      setStapleIngredients(merged.stapleIngredients)
      setLoaded(true)
    })
  }, [])

  // 保存（防抖 300ms）
  const saveStapleIngredients = useCallback((list: string[]) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(async () => {
      const saved = await getSetting<PickSettings>('pickSettings')
      const merged = { ...DEFAULT_PICK_SETTINGS, ...saved, stapleIngredients: list }
      await setSetting('pickSettings', merged)
    }, 300)
  }, [])

  /** 切换食材勾选 */
  const toggleIngredient = useCallback(
    (ingredient: string) => {
      setStapleIngredients((prev) => {
        const next = prev.includes(ingredient)
          ? prev.filter((i) => i !== ingredient)
          : [...prev, ingredient]
        saveStapleIngredients(next)
        return next
      })
    },
    [saveStapleIngredients],
  )

  /** 清空所有常备食材 */
  const clearAll = useCallback(() => {
    setStapleIngredients([])
    saveStapleIngredients([])
  }, [saveStapleIngredients])

  /** 切换分类折叠 */
  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  /** 搜索过滤 */
  const query = searchQuery.trim().toLowerCase()
  const filteredCategories = query
    ? Object.entries(INGREDIENT_CATEGORIES)
        .map(([cat, items]) => [cat, items.filter((i) => i.includes(query))] as [string, string[]])
        .filter(([, items]) => items.length > 0)
    : Object.entries(INGREDIENT_CATEGORIES)

  if (!loaded) {
    return (
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <ShoppingBag className="h-5 w-5 text-primary" />
          常备食材
        </h3>
        <div className="overflow-hidden rounded-card bg-card p-4 shadow-sm">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-5 w-5 animate-pulse rounded bg-divider" />
                <div className="h-4 flex-1 animate-pulse rounded bg-divider" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
        <ShoppingBag className="h-5 w-5 text-primary" />
        常备食材
      </h3>

      {/* 已选摘要 */}
      <div className="overflow-hidden rounded-card bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm text-text-primary">
            当前已设置{' '}
            <span className="font-semibold text-primary">{stapleIngredients.length}</span>
            {' '}种常备食材
          </p>
          {stapleIngredients.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空
            </button>
          )}
        </div>
        {stapleIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-divider px-4 py-3">
            {stapleIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-[8px] bg-primary/10 px-2.5 py-1 text-xs text-primary"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="搜索食材..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-card border border-divider bg-card pl-9 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary"
        />
      </div>

      {/* 食材分类勾选列表 */}
      <div className="overflow-hidden rounded-card bg-card shadow-sm">
        {filteredCategories.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-secondary">
            没有找到匹配的食材
          </div>
        ) : (
          filteredCategories.map(([cat, items], catIndex) => {
            const isCollapsed = collapsedCategories.has(cat)
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-text-primary transition-all duration-200 hover:bg-divider/50 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-secondary" />
                    )}
                    <span>{cat}</span>
                    <span className="text-xs text-text-secondary">
                      {items.filter((i) => stapleIngredients.includes(i)).length}/{items.length}
                    </span>
                  </div>
                </button>
                {/* 食材网格 */}
                {!isCollapsed && (
                  <div className="grid grid-cols-4 gap-2 px-4 pb-3 sm:grid-cols-5">
                    {items.map((item) => {
                      const isStaple = stapleIngredients.includes(item)
                      return (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
                          className={cn(
                            'flex items-center justify-center gap-1 rounded-[8px] px-2 py-1.5 text-xs font-medium transition-all duration-200',
                            isStaple
                              ? 'bg-primary text-white active:scale-95'
                              : 'border border-divider bg-surface text-text-secondary hover:border-primary/30 hover:text-primary active:scale-95',
                          )}
                        >
                          {isStaple && <Check className="h-3 w-3 shrink-0" />}
                          <span className="truncate">{item}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {/* 分割线 */}
                {catIndex < filteredCategories.length - 1 && (
                  <div className="ml-4 mr-4 border-t border-divider" />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 说明 */}
      <p className="px-1 text-xs text-text-secondary">
        勾选家里常备的食材，抽选时可在「冰箱食材模式」下一键导入
      </p>
    </div>
  )
}

export default StapleIngredientsPanel
