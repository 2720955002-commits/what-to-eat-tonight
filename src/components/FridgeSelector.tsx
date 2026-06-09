// ============================================================
// 「今晚吃啥」— 冰箱食材选择器弹窗
// ============================================================
// 分类标签 + 自定义输入 → 选择冰箱现有食材
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { INGREDIENT_CATEGORIES } from '@/db/types'
import { getSetting, setSetting } from '@/db'
import type { PickSettings } from '@/db/types'
import { DEFAULT_PICK_SETTINGS } from '@/db/types'
import { Search, X, Plus } from 'lucide-react'

const SETTINGS_KEY = 'pickSettings'

interface FridgeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onIngredientsChange: (ingredients: string[]) => void
}

function FridgeSelector({ open, onOpenChange, onIngredientsChange }: FridgeSelectorProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // 打开弹窗时加载已有食材
  useEffect(() => {
    if (open) {
      getSetting<PickSettings>(SETTINGS_KEY).then((s) => {
        const ingredients = s?.fridgeIngredients ?? []
        setSelected(ingredients)
      }).catch(() => setSelected([]))
    }
  }, [open])

  const toggleIngredient = useCallback((item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item],
    )
  }, [])

  const addCustomIngredient = useCallback(() => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed])
      setCustomInput('')
    }
  }, [customInput, selected])

  const removeIngredient = useCallback((item: string) => {
    setSelected((prev) => prev.filter((i) => i !== item))
  }, [])

  const handleConfirm = useCallback(async () => {
    // 持久化保存
    const savedSettings = await getSetting<PickSettings>(SETTINGS_KEY)
    const newSettings: PickSettings = {
      ...(savedSettings ?? DEFAULT_PICK_SETTINGS),
      fridgeIngredients: selected,
      fridgeMode: selected.length > 0,
    }
    await setSetting(SETTINGS_KEY, newSettings)
    onIngredientsChange(selected)
    onOpenChange(false)
  }, [selected, onIngredientsChange, onOpenChange])

  const handleClear = useCallback(() => {
    setSelected([])
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto p-6 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            🧊 冰箱里有什么
          </DialogTitle>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="搜索食材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-input border border-divider bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 自定义输入 */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="输入自定义食材..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomIngredient()
              }
            }}
            className="flex-1 rounded-input border border-divider bg-surface px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addCustomIngredient}
            disabled={!customInput.trim()}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* 已选择的食材 */}
        {selected.length > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium text-text-secondary">
                已选 {selected.length} 项
              </p>
              <button
                onClick={handleClear}
                className="text-xs text-text-secondary underline underline-offset-2 hover:text-primary"
              >
                清空
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white"
                >
                  {item}
                  <button
                    onClick={() => removeIngredient(item)}
                    className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 食材分类列表 */}
        <div className="space-y-4">
          {Object.entries(INGREDIENT_CATEGORIES).map(([category, items]) => {
            const filtered = searchQuery
              ? items.filter((i) => i.includes(searchQuery))
              : items
            if (filtered.length === 0) return null

            return (
              <div key={category}>
                <p className="mb-1.5 text-xs font-semibold text-text-secondary">
                  {category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {filtered.map((item) => {
                    const isSelected = selected.includes(item)
                    return (
                      <button
                        key={item}
                        onClick={() => toggleIngredient(item)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-divider bg-surface text-text-primary hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* 确定按钮 */}
        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={handleConfirm}
        >
          {selected.length > 0
            ? `✅ 确定（${selected.length} 种食材）`
            : '✅ 跳过，不做限制'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default FridgeSelector
