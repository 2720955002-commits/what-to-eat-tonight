// ============================================================
// 「今晚吃啥」— 抽选配置面板
// ============================================================
// iOS 原生风格的分组配置面板
// - 加载 / 保存 PickSettings 到 Dexie settings 表
// - 所有开关使用 @radix-ui/react-switch
// - 所有输入即时保存（300ms 防抖）
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import * as Switch from '@radix-ui/react-switch'
import {
  Shuffle,
  RotateCcw,
  Heart,
  ChefHat,
  Clock,
  Utensils,
  Refrigerator,
  Salad,
  List,
  Import,
} from 'lucide-react'
import { getSetting, setSetting } from '@/db'
import type { PickSettings, Flavor } from '@/db'
import { DEFAULT_PICK_SETTINGS } from '@/db'

// ============================================================
// 口味选择列表
// ============================================================

const ALL_FLAVORS: Flavor[] = [
  '辣', '清淡', '酸甜', '鲜香', '酱香',
  '蒜香', '麻辣', '酸辣', '葱香', '清甜', '孜然香',
]

// ============================================================
// 配置项定义
// ============================================================

interface SettingRow {
  key: keyof PickSettings
  label: string
  description: string
  icon: React.ReactNode
  type: 'switch'
}

const SETTING_ROWS: SettingRow[] = [
  {
    key: 'antiRepeat',
    label: '防重复推荐',
    description: '避免最近吃过的菜再次出现',
    icon: <RotateCcw className="h-5 w-5 text-primary" />,
    type: 'switch',
  },
  {
    key: 'favoritePriority',
    label: '收藏优先',
    description: '优先从收藏夹中抽选',
    icon: <Heart className="h-5 w-5 text-accent" />,
    type: 'switch',
  },
  {
    key: 'flavorPreference',
    label: '口味偏好',
    description: '按喜好的口味筛选推荐',
    icon: <ChefHat className="h-5 w-5 text-primary" />,
    type: 'switch',
  },
  {
    key: 'timeLimit',
    label: '用时限制',
    description: '只推荐烹饪时间以内的菜',
    icon: <Clock className="h-5 w-5 text-primary" />,
    type: 'switch',
  },
  {
    key: 'includeStaple',
    label: '包含主食',
    description: '抽选结果中总有一道主食',
    icon: <Utensils className="h-5 w-5 text-primary" />,
    type: 'switch',
  },
  {
    key: 'fridgeMode',
    label: '冰箱食材模式',
    description: '根据冰箱里有的食材推荐',
    icon: <Refrigerator className="h-5 w-5 text-primary" />,
    type: 'switch',
  },
]

// ============================================================
// 组件
// ============================================================

function PickSettingsPanel() {
  const [settings, setSettings] = useState<PickSettings>(DEFAULT_PICK_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 从 Dexie 加载设置
  useEffect(() => {
    getSetting<PickSettings>('pickSettings').then((saved) => {
      if (saved) {
        setSettings({ ...DEFAULT_PICK_SETTINGS, ...saved })
      }
      setLoaded(true)
    })
  }, [])

  // 保存到 Dexie（防抖）
  const saveSettings = useCallback((newSettings: PickSettings) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      setSetting('pickSettings', newSettings)
    }, 300)
  }, [])

  /** 更新某个字段 */
  const updateField = useCallback(
    <K extends keyof PickSettings>(key: K, value: PickSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        saveSettings(next)
        return next
      })
    },
    [saveSettings],
  )

  /** 切换口味标签 */
  const toggleFlavor = useCallback(
    (flavor: Flavor) => {
      setSettings((prev) => {
        const current = prev.preferredFlavors
        const next = current.includes(flavor)
          ? current.filter((f) => f !== flavor)
          : [...current, flavor]
        const newSettings = { ...prev, preferredFlavors: next }
        saveSettings(newSettings)
        return newSettings
      })
    },
    [saveSettings],
  )

  if (!loaded) {
    return (
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Shuffle className="h-5 w-5 text-primary" />
          抽选配置
        </h3>
        <div className="overflow-hidden rounded-card bg-card p-4 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-[10px] bg-divider" />
                  <div>
                    <div className="mb-1 h-4 w-24 animate-pulse rounded bg-divider" />
                    <div className="h-3 w-40 animate-pulse rounded bg-divider" />
                  </div>
                </div>
                <div className="h-6 w-11 animate-pulse rounded-full bg-divider" />
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
        <Shuffle className="h-5 w-5 text-primary" />
        抽选配置
      </h3>

      {/* 开关配置组 */}
      <div className="overflow-hidden rounded-card bg-card shadow-sm">
        {SETTING_ROWS.map((row, index) => (
          <div key={row.key}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10">
                  {row.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {row.label}
                  </p>
                  <p className="text-xs text-text-secondary">{row.description}</p>
                </div>
              </div>
              <Switch.Root
                checked={!!settings[row.key]}
                onCheckedChange={(checked) => updateField(row.key, checked)}
                className="relative h-6 w-11 rounded-full border border-divider bg-divider transition-colors duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-[21px]" />
              </Switch.Root>
            </div>
            {/* 扩展参数：每个开关下方可能有额外输入 */}
            {renderExtraInput(row.key, settings, updateField)}
            {/* 口味标签选择 */}
            {row.key === 'flavorPreference' && settings.flavorPreference && (
              <div className="border-t border-divider px-4 py-3">
                <FlavorSelector
                  selected={settings.preferredFlavors}
                  onToggle={toggleFlavor}
                />
              </div>
            )}
            {/* 分割线（最后一项不加） */}
            {index < SETTING_ROWS.length - 1 && (
              <div className="ml-14 mr-4 border-t border-divider" />
            )}
          </div>
        ))}
      </div>

      {/* 默认菜数 */}
      <div className="overflow-hidden rounded-card bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">默认菜数</p>
              <p className="text-xs text-text-secondary">每次抽选几道菜（1-5）</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const val = Math.max(1, settings.defaultDishCount - 1)
                updateField('defaultDishCount', val)
              }}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-divider text-text-primary transition-colors hover:bg-divider/80 active:scale-95"
          >
            -
          </button>
          <span className="flex h-8 w-10 items-center justify-center text-base font-semibold text-text-primary">
            {settings.defaultDishCount}
          </span>
          <button
            onClick={() => {
              const val = Math.min(5, settings.defaultDishCount + 1)
              updateField('defaultDishCount', val)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-divider text-text-primary transition-colors hover:bg-divider/80 active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 重置按钮 */}
      <button
          onClick={() => {
            setSettings(DEFAULT_PICK_SETTINGS)
            setSetting('pickSettings', DEFAULT_PICK_SETTINGS)
          }}
          className="flex w-full items-center justify-center gap-2 rounded-button py-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-divider active:scale-[0.97]"
        >
          <RotateCcw className="h-4 w-4" />
          恢复默认设置
      </button>
    </div>
  )
}

// ============================================================
// 扩展参数输入
// ============================================================

function renderExtraInput(
  key: keyof PickSettings,
  settings: PickSettings,
  updateField: <K extends keyof PickSettings>(key: K, value: PickSettings[K]) => void,
) {
  switch (key) {
    case 'antiRepeat':
      if (!settings.antiRepeat) return null
      return (
        <div className="ml-14 mr-4 border-t border-divider px-0 py-2.5">
          <label className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">防重复天数</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={30}
                value={settings.antiRepeatDays}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(30, Number(e.target.value) || 1))
                  updateField('antiRepeatDays', val)
                }}
                className="h-8 w-16 rounded-input border border-divider bg-surface px-2 text-center text-sm text-text-primary outline-none transition-colors focus:border-primary"
              />
              <span className="ml-1 text-xs text-text-secondary">天</span>
            </div>
          </label>
        </div>
      )

    case 'timeLimit':
      if (!settings.timeLimit) return null
      return (
        <div className="ml-14 mr-4 border-t border-divider px-0 py-2.5">
          <label className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">烹饪时间上限</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={settings.maxCookTime}
                onChange={(e) => {
                  const val = Math.max(5, Math.min(180, Number(e.target.value) || 5))
                  updateField('maxCookTime', val)
                }}
                className="h-8 w-16 rounded-input border border-divider bg-surface px-2 text-center text-sm text-text-primary outline-none transition-colors focus:border-primary"
              />
              <span className="ml-1 text-xs text-text-secondary">分钟</span>
            </div>
          </label>
        </div>
      )

    case 'fridgeMode':
      if (!settings.fridgeMode) return null
      return (
        <div className="ml-14 mr-4 border-t border-divider px-0 py-2.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-text-secondary">冰箱现有食材</span>
            <input
              type="text"
              placeholder="输入食材，用逗号分隔（如：鸡蛋,番茄,牛肉）"
              value={settings.fridgeIngredients.join('，')}
              onChange={(e) => {
                const list = e.target.value
                  .split(/[,，]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
                updateField('fridgeIngredients', list)
              }}
              className="h-9 w-full rounded-input border border-divider bg-surface px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary"
            />
            {/* 从常备食材导入 */}
            {settings.stapleIngredients && settings.stapleIngredients.length > 0 && (
              <button
                onClick={() => {
                  const merged = [
                    ...new Set([
                      ...settings.fridgeIngredients,
                      ...settings.stapleIngredients,
                    ]),
                  ]
                  updateField('fridgeIngredients', merged)
                }}
                className="flex items-center gap-1 self-start rounded-[8px] bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Import className="h-3.5 w-3.5" />
                从常备食材导入（{settings.stapleIngredients.length}种）
              </button>
            )}
            {settings.fridgeIngredients.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {settings.fridgeIngredients.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-[8px] bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    <Salad className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>
            )}
          </label>
        </div>
      )

    default:
      return null
  }
}

// ============================================================
// 口味标签选择器
// ============================================================

function FlavorSelector({
  selected,
  onToggle,
}: {
  selected: Flavor[]
  onToggle: (flavor: Flavor) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-text-secondary">选择你喜欢的口味</p>
      <div className="flex flex-wrap gap-2">
        {ALL_FLAVORS.map((flavor) => {
          const isActive = selected.includes(flavor)
          return (
            <button
              key={flavor}
              onClick={() => onToggle(flavor)}
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
  )
}

export default PickSettingsPanel
