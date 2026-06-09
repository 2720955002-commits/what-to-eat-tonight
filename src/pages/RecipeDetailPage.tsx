import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getRecipe, isFavorited, addFavorite, removeFavorite } from '@/db'
import type { Recipe, Flavor } from '@/db/types'
import { getRecipeEmoji, getCategoryGradient } from '@/lib/recipe-visual'
import {
  ArrowLeft,
  Heart,
  Clock,
  ChefHat,
  Users,
  Star,
  Edit3,
  Bookmark,
  RefreshCw,
} from 'lucide-react'
import { SkeletonHero } from '@/components/Skeleton'
import { cn } from '@/lib/utils'

// ============================================================
// 难度徽标颜色
// ============================================================
const DIFFICULTY_COLORS: Record<string, string> = {
  '简单': 'bg-green-100 text-green-700',
  '中等': 'bg-amber-100 text-amber-700',
  '困难': 'bg-red-100 text-red-700',
}

// ============================================================
// 难度星标映射
// ============================================================
const DIFFICULTY_STARS: Record<string, number> = {
  '简单': 1,
  '中等': 2,
  '困难': 3,
}

// ============================================================
// 口味标签颜色
// ============================================================
const FLAVOR_COLORS: Record<string, string> = {
  '辣': 'bg-red-50 text-red-600',
  '麻辣': 'bg-red-50 text-red-600',
  '酸辣': 'bg-orange-50 text-orange-600',
  '酸甜': 'bg-pink-50 text-pink-600',
  '清淡': 'bg-green-50 text-green-600',
  '鲜香': 'bg-amber-50 text-amber-600',
  '酱香': 'bg-brown-50 text-amber-700',
  '蒜香': 'bg-purple-50 text-purple-600',
  '清甜': 'bg-rose-50 text-rose-600',
  '葱香': 'bg-lime-50 text-lime-600',
  '孜然香': 'bg-yellow-50 text-yellow-600',
}

function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingFav, setTogglingFav] = useState(false)

  // ============================================================
  // 加载菜谱
  // ============================================================
  const loadRecipe = useCallback(async () => {
    if (!id) {
      setError('缺少菜谱 ID')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [recipeData, favStatus] = await Promise.all([
        getRecipe(id),
        isFavorited(id),
      ])
      if (!recipeData) {
        setError('菜谱不存在')
        return
      }
      setRecipe(recipeData)
      setFavorited(favStatus)
    } catch (err) {
      console.error('[RecipeDetail] 加载失败:', err)
      setError('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadRecipe()
  }, [loadRecipe])

  // ============================================================
  // 收藏切换
  // ============================================================
  const toggleFavorite = async () => {
    if (!recipe || togglingFav) return
    setTogglingFav(true)
    try {
      if (favorited) {
        await removeFavorite(recipe.id)
        setFavorited(false)
      } else {
        await addFavorite(recipe.id)
        setFavorited(true)
      }
    } catch (err) {
      console.error('[RecipeDetail] 收藏操作失败:', err)
    } finally {
      setTogglingFav(false)
    }
  }

  // ============================================================
  // 加载态
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        {/* 顶部渐变占位 */}
        <SkeletonHero />
        <div className="-mt-6 rounded-t-[24px] bg-surface px-4 pt-6">
          <div className="mb-4 h-7 w-2/3 animate-pulse rounded bg-divider" />
          <div className="mb-6 h-4 w-1/3 animate-pulse rounded bg-divider" />
          <div className="mb-4 h-40 animate-pulse rounded-card bg-divider" />
          <div className="h-60 animate-pulse rounded-card bg-divider" />
        </div>
      </div>
    )
  }

  // ============================================================
  // 错误态 — 区分「不存在」和「加载失败」
  // ============================================================
  if (error && !loading) {
    if (error === '菜谱不存在' || error === '缺少菜谱 ID') {
      return (
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-surface px-4">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-surface shadow-sm">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="mb-2 text-center text-lg font-semibold text-text-primary">
            {error === '缺少菜谱 ID' ? '无效请求' : '菜谱不存在'}
          </h3>
          <p className="mb-6 max-w-xs text-center text-sm leading-relaxed text-text-secondary">
            {error === '缺少菜谱 ID'
              ? '页面参数有误'
              : '该菜谱可能已被删除或链接有误'}
          </p>
          <Button variant="outline" onClick={() => navigate('/recipes')}>
            返回菜谱库
          </Button>
        </div>
      )
    }

    // 加载失败 — 可重试
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-surface px-4">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 shadow-sm">
          <span className="text-3xl">😅</span>
        </div>
        <h3 className="mb-2 text-center text-lg font-semibold text-text-primary">
          加载失败
        </h3>
        <p className="mb-6 max-w-xs text-center text-sm leading-relaxed text-text-secondary">
          {error}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/recipes')}>
            返回菜谱库
          </Button>
          <Button onClick={loadRecipe}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            重试
          </Button>
        </div>
      </div>
    )
  }

  // ============================================================
  // 主渲染
  // ============================================================
  // TypeScript 保护：理论上不可达（error 或 !recipe 已拦截）
  if (!recipe) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ============================================
          顶部：英雄图 + 返回按钮 + 收藏按钮
          ============================================ */}
      <div className={`relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br ${getCategoryGradient(recipe.category)}`}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-7xl">{getRecipeEmoji(recipe.name)}</span>
          <span className="rounded-full bg-white/30 px-3 py-0.5 text-sm text-white backdrop-blur-sm">
            {recipe.category}
          </span>
        </div>
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-12 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* 收藏按钮 */}
        <button
          onClick={toggleFavorite}
          disabled={togglingFav}
          className="absolute right-4 top-12 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-all',
              favorited && 'fill-accent text-accent',
            )}
          />
        </button>

        {/* 菜名（在渐变上） */}
        <div className="absolute bottom-5 left-4 right-4">
          <h1 className="mb-1.5 text-2xl font-bold text-white drop-shadow-sm md:text-3xl">
            {recipe.name}
          </h1>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.cookTime}分钟
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="h-3.5 w-3.5" />
              {recipe.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recipe.servings}人份
            </span>
          </div>
        </div>
      </div>

      {/* ============================================
          内容区（上拉卡片效果）
          ============================================ */}
      <div className="relative -mt-6 rounded-t-[24px] bg-surface px-4 pt-6">
        {/* 摘要信息 */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              DIFFICULTY_COLORS[recipe.difficulty] ?? 'bg-gray-100 text-gray-600',
            )}
          >
            {recipe.difficulty}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-primary/[0.1] px-3 py-1 text-xs text-primary-dark">
            <Clock className="h-3 w-3" />
            {recipe.cookTime}分钟
          </span>
          <span className="flex items-center gap-1 rounded-full bg-primary/[0.1] px-3 py-1 text-xs text-primary-dark">
            <Users className="h-3 w-3" />
            {recipe.servings}人份
          </span>
          <span className="rounded-full bg-primary/[0.1] px-3 py-1 text-xs text-primary-dark">
            {recipe.category}
          </span>
        </div>

        {/* ============================================
            食材清单
            ============================================ */}
        <section className="mb-6">
          <h2 className="mb-3 text-base font-semibold">
            食材清单
          </h2>
          <Card>
            <ul className="divide-y divide-divider px-4 py-2">
              {recipe.ingredients.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 py-2.5 text-sm"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/[0.1] text-[10px] text-primary-dark">
                    {index + 1}
                  </span>
                  <span className="text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ============================================
            烹饪步骤
            ============================================ */}
        <section className="mb-6">
          <h2 className="mb-3 text-base font-semibold">
            烹饪步骤
          </h2>
          <Card>
            <ol className="space-y-4 px-4 py-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed text-text-primary">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* ============================================
            标签区
            ============================================ */}
        <section className="mb-6">
          <h2 className="mb-3 text-base font-semibold">
            标签
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* 口味标签 */}
            {recipe.flavors.map((flavor) => (
              <span
                key={flavor}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  FLAVOR_COLORS[flavor] ?? 'bg-gray-100 text-gray-600',
                )}
              >
                {flavor}
              </span>
            ))}
            {/* 季节标签 */}
            {recipe.season.map((s) => (
              <span
                key={s}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"
              >
                {s}季
              </span>
            ))}
          </div>
        </section>

        {/* ============================================
            底部操作
            ============================================ */}
        <div className="mb-24 flex gap-3">
          <Button
            variant="default"
            className="flex-1"
            onClick={toggleFavorite}
            disabled={togglingFav}
          >
            <Heart
              className={cn(
                'h-4 w-4',
                favorited && 'fill-white',
              )}
            />
            {favorited ? '已收藏' : '收藏'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
          >
            <Edit3 className="h-4 w-4" />
            编辑
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetailPage
