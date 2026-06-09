// ============================================================
// 「今晚吃啥」— 收藏列表页
// ============================================================
// 展示所有收藏的菜谱，支持：
//   - 列表卡片展示
//   - 取消收藏 / 跳转详情
//   - 空状态引导
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/EmptyState'
import { SkeletonCard } from '@/components/Skeleton'
import { getFavoritesWithRecipes, removeFavorite } from '@/db'
import type { Recipe, Favorite } from '@/db/types'
import { Heart, Clock, Bookmark, AlertCircle, ChefHat } from 'lucide-react'
import { getRecipeEmoji, getCategoryGradient } from '@/lib/recipe-visual'

// ============================================================
// 页面组件
// ============================================================

function FavoritesPage() {
  const navigate = useNavigate()

  // State
  const [favItems, setFavItems] = useState<
    { favorite: Favorite; recipe: Recipe | undefined }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // 加载收藏数据
  // ============================================================
  const loadFavorites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await getFavoritesWithRecipes()
      setFavItems(items)
    } catch (err) {
      console.error('[FavoritesPage] 加载失败:', err)
      setError('加载收藏失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // ============================================================
  // 取消收藏（乐观更新 UI）
  // ============================================================
  const handleUnfavorite = async (recipeId: string) => {
    try {
      await removeFavorite(recipeId)
      setFavItems((prev) =>
        prev.filter((item) => item.favorite.recipeId !== recipeId),
      )
    } catch (err) {
      console.error('[FavoritesPage] 取消收藏失败:', err)
      // 不显示 toast，静默失败即可
    }
  }

  // ============================================================
  // 过滤有效项（理论上不会有 undefined，防御性处理）
  // ============================================================
  const validItems = favItems.filter(
    (item): item is { favorite: Favorite; recipe: Recipe } =>
      item.recipe !== undefined,
  )

  // ============================================================
  // 加载态
  // ============================================================
  if (loading) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">我的收藏</h2>
        <div className="space-y-3">
        <SkeletonCard hasImage />
        <SkeletonCard hasImage />
        <SkeletonCard hasImage />
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
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">我的收藏</h2>
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-3 px-5 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={loadFavorites}
        >
          重新加载
        </Button>
      </div>
    )
  }

  // ============================================================
  // 空态 — 引导去菜谱库逛逛
  // ============================================================
  if (validItems.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">我的收藏</h2>
        <EmptyState
          type="favorite"
          title="还没有收藏菜谱"
          description="去菜谱库逛逛，把喜欢的菜收藏起来，下次抽选时它们会被优先考虑"
          action={
            <Button onClick={() => navigate('/recipes')}>
              去菜谱库逛逛
            </Button>
          }
        />
      </div>
    )
  }

  // ============================================================
  // 收藏列表（列表卡片式）
  // ============================================================
  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold md:text-2xl">我的收藏</h2>
        <span className="text-sm text-text-secondary">
          {validItems.length} 道
        </span>
      </div>

      <div className="space-y-3">
        {validItems.map(({ favorite, recipe }) => (
          <Card
            key={favorite.id}
            className="flex overflow-hidden transition-all active:scale-[0.99]"
            onClick={() => navigate(`/recipes/${recipe.id}`)}
          >
            {/* Emoji 缩略图 */}
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center bg-gradient-to-br ${getCategoryGradient(recipe.category)}`}>
              <span className="text-4xl">{getRecipeEmoji(recipe.name)}</span>
            </div>

            {/* 信息区 */}
            <div className="flex flex-1 flex-col justify-center px-4 py-3">
              <h3 className="mb-1 text-sm font-semibold leading-tight line-clamp-1">
                {recipe.name}
              </h3>
              <div className="mb-1 flex items-center gap-2 text-xs text-text-secondary">
                <span className="rounded-full bg-primary/[0.1] px-1.5 py-0.5 text-primary-dark">
                  {recipe.category}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {recipe.cookTime}分钟
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recipe.flavors.slice(0, 2).map((f) => (
                  <span
                    key={f}
                    className="rounded bg-primary/[0.1] px-1.5 py-0.5 text-[10px] text-primary-dark"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* 取消收藏按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleUnfavorite(recipe.id)
              }}
              className="flex w-14 shrink-0 items-center justify-center text-accent transition-colors hover:bg-red-50"
              aria-label={`取消收藏 ${recipe.name}`}
            >
              <Heart className="h-5 w-5 fill-accent" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FavoritesPage
