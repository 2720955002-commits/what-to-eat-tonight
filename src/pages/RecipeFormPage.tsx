// ============================================================
// 「今晚吃啥」— 自定义菜谱表单页
// ============================================================
// 支持添加/编辑/删除自定义菜谱
// 双模式：/recipes/add（新增） 和 /recipes/:id/edit（编辑）
// 内置菜谱可编辑但不可删除
// ============================================================

import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '@/db'
import type { Recipe, Difficulty, Category, Flavor, Season } from '@/db/types'
import {
  ALL_INGREDIENTS,
  INGREDIENT_CATEGORIES,
} from '@/db/types'
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Upload,
  Save,
  ImageOff,
  GripVertical,
  X,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// 常量
// ============================================================

const CATEGORIES: Category[] = [
  '家常菜', '硬菜', '汤', '凉菜', '蒸菜', '主食', '配菜',
]

const DIFFICULTIES: Difficulty[] = ['简单', '中等', '困难']

const ALL_FLAVORS: Flavor[] = [
  '辣', '清淡', '酸甜', '鲜香', '酱香',
  '蒜香', '麻辣', '酸辣', '葱香', '清甜', '孜然香',
]

const ALL_SEASONS: Season[] = ['春', '夏', '秋', '冬', '四季']

const DEFAULT_IMAGE = 'https://picsum.photos/seed/dinner-default/400/300'

// ============================================================
// 基础输入组件（避免引入 shadcn/ui 额外标签组件）
// ============================================================

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-text-primary">
      {children}
      {required && <span className="ml-0.5 text-accent">*</span>}
    </label>
  )
}

function FormInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  min,
  max,
  className,
}: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  min?: number
  max?: number
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      className={cn(
        'w-full rounded-input border border-divider bg-card px-3.5 py-2.5 text-sm text-text-primary',
        'placeholder:text-text-secondary/60',
        'transition-colors focus:border-primary focus:outline-none',
        className,
      )}
    />
  )
}

function FormSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { label: string; value: T }[]
  onChange: (v: T) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        'w-full rounded-input border border-divider bg-card px-3.5 py-2.5 text-sm text-text-primary',
        'transition-colors focus:border-primary focus:outline-none',
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ============================================================
// 标签选择器（多选 tags）
// ============================================================

function TagSelector<T extends string>({
  options,
  selected,
  onChange,
  colorMap,
}: {
  options: T[]
  selected: T[]
  onChange: (v: T[]) => void
  colorMap?: Record<string, string>
}) {
  const toggle = (tag: T) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const isSelected = selected.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              isSelected
                ? colorMap?.[tag] ?? 'bg-primary text-white'
                : 'border border-divider bg-card text-text-secondary hover:border-primary/40',
            )}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}

// ============================================================
// 食材分类选择面板（从 INGREDIENT_CATEGORIES 渲染）
// ============================================================

function IngredientSelector({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [customInput, setCustomInput] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(INGREDIENT_CATEGORIES).slice(0, 3)),
  )

  const toggleIngredient = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item))
    } else {
      onChange([...selected, item])
    }
  }

  const addCustomIngredient = () => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed])
      setCustomInput('')
    }
  }

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {/* 已选食材 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-primary/[0.15] px-2.5 py-1 text-xs text-primary-dark"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(selected.filter((i) => i !== item))}
                className="hover:text-accent transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 自定义食材输入 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomIngredient())}
          placeholder="输入自定义食材..."
          className={cn(
            'flex-1 rounded-input border border-divider bg-card px-3 py-2 text-sm text-text-primary',
            'placeholder:text-text-secondary/60 focus:border-primary focus:outline-none',
          )}
        />
        <Button type="button" size="sm" variant="outline" onClick={addCustomIngredient}>
          <Plus className="h-3.5 w-3.5" />
          添加
        </Button>
      </div>

      {/* 食材分类 */}
      <div className="max-h-64 space-y-1 overflow-y-auto rounded-card border border-divider p-2">
        {Object.entries(INGREDIENT_CATEGORIES).map(([category, items]) => {
          const isExpanded = expandedCategories.has(category)
          const selectedCount = items.filter((i) => selected.includes(i)).length
          return (
            <div key={category}>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between rounded-button px-2.5 py-2 text-xs font-medium text-text-primary hover:bg-divider/60 transition-colors"
              >
                <span>{category}</span>
                <span className="text-text-secondary text-[11px]">
                  {isExpanded ? '收起' : `${items.length}种食材`}
                  {selectedCount > 0 && (
                    <span className="ml-1 text-primary-dark">(已选{selectedCount})</span>
                  )}
                </span>
              </button>
              {isExpanded && (
                <div className="ml-2 flex flex-wrap gap-1.5 pb-1.5">
                  {items.map((item) => {
                    const isSelected = selected.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleIngredient(item)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[11px] transition-all',
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-divider/60 text-text-secondary hover:bg-divider',
                        )}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// 主表单组件
// ============================================================

function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!id
  const isAddMode = !isEditMode

  // ============================================================
  // 表单状态
  // ============================================================
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [name, setName] = useState('')
  const [image, setImage] = useState(DEFAULT_IMAGE)
  const [category, setCategory] = useState<Category>('家常菜')
  const [difficulty, setDifficulty] = useState<Difficulty>('简单')
  const [cookTime, setCookTime] = useState(15)
  const [servings, setServings] = useState(2)
  const [ingredients, setIngredients] = useState<string[]>([])
  const [steps, setSteps] = useState<string[]>([''])
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [season, setSeason] = useState<Season[]>(['四季'])

  // 记录原始数据（用于判断是否为内置菜谱）
  const [originalRecipe, setOriginalRecipe] = useState<Recipe | null>(null)

  // ============================================================
  // 编辑模式：加载现有菜谱数据
  // ============================================================
  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    getRecipe(id)
      .then((recipe) => {
        if (!recipe) {
          setError('菜谱不存在')
          return
        }
        setOriginalRecipe(recipe)
        setName(recipe.name)
        setImage(recipe.image)
        setCategory(recipe.category)
        setDifficulty(recipe.difficulty)
        setCookTime(recipe.cookTime)
        setServings(recipe.servings)
        setIngredients(recipe.ingredients)
        setSteps(recipe.steps.length > 0 ? recipe.steps : [''])
        setFlavors(recipe.flavors)
        setSeason(recipe.season)
      })
      .catch((err) => {
        console.error('[RecipeForm] 加载失败:', err)
        setError('加载失败，请重试')
      })
      .finally(() => setLoading(false))
  }, [id])

  // ============================================================
  // 图片上传处理
  // ============================================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 限制文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
    }
    reader.onerror = () => {
      alert('图片读取失败，请重试')
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ============================================================
  // 食材操作
  // ============================================================
  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  // ============================================================
  // 步骤操作
  // ============================================================
  const addStep = () => setSteps((prev) => [...prev, ''])

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  const removeStep = (index: number) => {
    if (steps.length <= 1) return
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= steps.length) return
    setSteps((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  // ============================================================
  // 表单验证
  // ============================================================
  const validate = (): string | null => {
    if (!name.trim()) return '请输入菜名'
    if (cookTime < 1) return '烹饪时间至少 1 分钟'
    if (servings < 1) return '份数至少为 1'
    if (ingredients.length === 0) return '请至少添加一种食材'
    const nonEmptySteps = steps.filter((s) => s.trim())
    if (nonEmptySteps.length === 0) return '请至少填写一个烹饪步骤'
    return null
  }

  // ============================================================
  // 保存
  // ============================================================
  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      alert(validationError)
      return
    }

    setSaving(true)
    try {
      const filteredSteps = steps.filter((s) => s.trim())

      if (isEditMode && originalRecipe) {
        // 编辑模式
        await updateRecipe(originalRecipe.id, {
          name: name.trim(),
          image,
          category,
          difficulty,
          cookTime,
          servings,
          ingredients,
          steps: filteredSteps,
          flavors,
          season,
        })
        navigate(`/recipes/${originalRecipe.id}`)
      } else {
        // 添加模式
        const newRecipe = await createRecipe({
          name: name.trim(),
          image,
          category,
          difficulty,
          cookTime,
          servings,
          ingredients,
          steps: filteredSteps,
          flavors,
          season,
          isBuiltIn: false,
        })
        navigate(`/recipes/${newRecipe.id}`)
      }
    } catch (err) {
      console.error('[RecipeForm] 保存失败:', err)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // 删除
  // ============================================================
  const handleDelete = async () => {
    if (!originalRecipe || originalRecipe.isBuiltIn) return

    try {
      await deleteRecipe(originalRecipe.id)
      navigate('/recipes')
    } catch (err) {
      console.error('[RecipeForm] 删除失败:', err)
      alert('删除失败，请重试')
    }
  }

  // ============================================================
  // 加载态
  // ============================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // 错误态
  // ============================================================
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
        <p className="mb-4 text-lg font-medium text-text-primary">{error}</p>
        <Button variant="outline" onClick={() => navigate('/recipes')}>
          返回菜谱库
        </Button>
      </div>
    )
  }

  // ============================================================
  // 主渲染
  // ============================================================
  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 border-b border-divider bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-divider/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
          <h1 className="text-base font-semibold text-text-primary md:text-lg">
            {isAddMode ? '添加菜谱' : '编辑菜谱'}
          </h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-5 px-4 pt-5">
        {/* ============================================
            基本信息
            ============================================ */}
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">基本信息</h2>

          <div className="space-y-4">
            {/* 菜名 */}
            <div>
              <FormLabel required>菜名</FormLabel>
              <FormInput
                value={name}
                onChange={setName}
                placeholder="例：番茄炒蛋"
                required
              />
            </div>

            {/* 分类 */}
            <div>
              <FormLabel>分类</FormLabel>
              <FormSelect
                value={category}
                options={CATEGORIES.map((c) => ({ label: c, value: c }))}
                onChange={setCategory}
              />
            </div>

            {/* 难度 + 用时 + 份数（三列） */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <FormLabel>难度</FormLabel>
                <FormSelect
                  value={difficulty}
                  options={DIFFICULTIES.map((d) => ({ label: d, value: d }))}
                  onChange={setDifficulty}
                />
              </div>
              <div>
                <FormLabel required>用时（分钟）</FormLabel>
                <FormInput
                  type="number"
                  value={cookTime}
                  onChange={(v) => setCookTime(Math.max(1, Number(v) || 0))}
                  min={1}
                />
              </div>
              <div>
                <FormLabel required>份数</FormLabel>
                <FormInput
                  type="number"
                  value={servings}
                  onChange={(v) => setServings(Math.max(1, Number(v) || 0))}
                  min={1}
                />
              </div>
            </div>

            {/* 内置菜谱标识 */}
            {originalRecipe?.isBuiltIn && (
              <div className="rounded-button bg-blue-50 px-3 py-2 text-xs text-blue-600">
                这是内置菜谱，所有字段可编辑。内置菜谱不可删除。
              </div>
            )}
          </div>
        </Card>

        {/* ============================================
            图片
            ============================================ */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">菜谱图片</h2>

          {/* 图片预览 */}
          <div className="relative mb-3 overflow-hidden rounded-card bg-divider">
            {image ? (
              <>
                <img
                  src={image}
                  alt="菜谱预览"
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = DEFAULT_IMAGE
                  }}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <ImageOff className="h-8 w-8 text-text-secondary/40" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              上传图片
            </Button>
            {!image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImage(DEFAULT_IMAGE)}
              >
                使用默认图片
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-text-secondary">
            支持 JPG、PNG 格式，最大 5MB
          </p>
        </Card>

        {/* ============================================
            食材清单
            ============================================ */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">食材清单</h2>
          <IngredientSelector selected={ingredients} onChange={setIngredients} />
        </Card>

        {/* ============================================
            烹饪步骤
            ============================================ */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">烹饪步骤</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addStep}>
              <Plus className="h-3.5 w-3.5" />
              添加步骤
            </Button>
          </div>

          <div className="space-y-2.5">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                {/* 步骤序号 + 排序按钮 */}
                <div className="flex flex-col items-center gap-0.5 pt-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
                    {index + 1}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveStep(index, -1)}
                      disabled={index === 0}
                      className="flex h-4 w-4 items-center justify-center rounded text-text-secondary/60 hover:text-text-primary disabled:opacity-20"
                    >
                      <ChevronDown className="h-3 w-3 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, 1)}
                      disabled={index === steps.length - 1}
                      className="flex h-4 w-4 items-center justify-center rounded text-text-secondary/60 hover:text-text-primary disabled:opacity-20"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* 步骤输入框 */}
                <div className="flex-1">
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`步骤 ${index + 1}...`}
                    rows={2}
                    className={cn(
                      'w-full resize-none rounded-input border border-divider bg-card px-3 py-2 text-sm text-text-primary',
                      'placeholder:text-text-secondary/60',
                      'transition-colors focus:border-primary focus:outline-none',
                    )}
                  />
                </div>

                {/* 删除步骤按钮 */}
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="mt-2 flex h-6 w-6 items-center justify-center rounded-full text-text-secondary/60 hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ============================================
            口味标签
            ============================================ */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">口味标签</h2>
          <TagSelector
            options={ALL_FLAVORS}
            selected={flavors}
            onChange={setFlavors}
            colorMap={{
              '辣': 'bg-red-50 text-red-600',
              '麻辣': 'bg-red-50 text-red-600',
              '酸辣': 'bg-orange-50 text-orange-600',
              '酸甜': 'bg-pink-50 text-pink-600',
              '清淡': 'bg-green-50 text-green-600',
              '鲜香': 'bg-amber-50 text-amber-600',
              '酱香': 'bg-orange-100 text-amber-700',
              '蒜香': 'bg-purple-50 text-purple-600',
              '清甜': 'bg-rose-50 text-rose-600',
              '葱香': 'bg-lime-50 text-lime-600',
              '孜然香': 'bg-yellow-50 text-yellow-600',
            }}
          />
        </Card>

        {/* ============================================
            季节标签
            ============================================ */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">季节标签</h2>
          <TagSelector
            options={ALL_SEASONS}
            selected={season}
            onChange={setSeason}
            colorMap={{
              '春': 'bg-green-50 text-green-600',
              '夏': 'bg-yellow-50 text-yellow-600',
              '秋': 'bg-orange-50 text-orange-600',
              '冬': 'bg-blue-50 text-blue-600',
              '四季': 'bg-gray-50 text-gray-600',
            }}
          />
        </Card>

        {/* ============================================
            底部操作区
            ============================================ */}
        <div className="space-y-3">
          {/* 保存按钮 */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isAddMode ? '添加菜谱' : '保存修改'}
              </>
            )}
          </Button>

          {/* 删除按钮（仅自定义菜谱） */}
          {isEditMode && originalRecipe && !originalRecipe.isBuiltIn && (
            <Button
              variant="outline"
              className="w-full border-accent/30 text-accent hover:bg-accent/5"
              size="lg"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              删除此菜谱
            </Button>
          )}
        </div>
      </div>

      {/* ============================================
          删除确认弹窗
          ============================================ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除「{originalRecipe?.name}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false)
                handleDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RecipeFormPage
