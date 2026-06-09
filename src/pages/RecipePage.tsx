import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getAllRecipes,
  searchRecipes,
  getAllFavoriteIds,
} from '@/db'
import type { Recipe, Category } from '@/db/types'
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Clock,
  ChefHat,
  Heart,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

// ============================================================
// 分类定义（含「全部」）
// ============================================================
const CATEGORIES: { label: string; value: Category | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '家常菜', value: '家常菜' },
  { label: '硬菜', value: '硬菜' },
  { label: '汤', value: '汤' },
  { label: '凉菜', value: '凉菜' },
  { label: '蒸菜', value: '蒸菜' },
  { label: '主食', value: '主食' },
  { label: '配菜', value: '配菜' },
]

// ============================================================
// 难度徽标颜色映射
// ============================================================
const DIFFICULTY_COLORS: Record<string, string> = {
  '简单': 'bg-green-100 text-green-700',
  '中等': 'bg-amber-100 text-amber-700',
  '困难': 'bg-red-100 text-red-700',
}

// ============================================================
// 分类背景色映射
// ============================================================
const CATEGORY_COLORS: Record<string, string> = {
  '家常菜': 'bg-primary/[0.08]',
  '硬菜': 'bg-red-50',
  '汤': 'bg-blue-50',
  '凉菜': 'bg-green-50',
  '蒸菜': 'bg-purple-50',
  '主食': 'bg-amber-50',
  '配菜': 'bg-gray-50',
}

function RecipePage() {
  const navigate = useNavigate()

  // State
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // ============================================================
  // 加载菜谱数据
  // ============================================================
  const loadRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [allRecipes, favIds] = await Promise.all([
        getAllRecipes(),
        getAllFavoriteIds(),
      ])
      setRecipes(allRecipes)
      setFavoriteIds(new Set(favIds))
    } catch (err) {
      console.error('[RecipePage] 加载菜谱失败:', err)
      setError('加载菜谱失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  // ============================================================
  // 搜索（防抖）
  // ============================================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      loadRecipes()
      return
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchRecipes(searchQuery.trim())
        setRecipes(results)
      } catch (err) {
        console.error('[RecipePage] 搜索失败:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, loadRecipes])

  // ============================================================
  // 过滤
  // ============================================================
  const filteredRecipes = recipes.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false
    return true
  })

  // ============================================================
  // 渲染：加载态
  // ============================================================
  if (loading && recipes.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">菜谱库</h2>
        <SkeletonList count={4} hasImage className="space-y-4" />
      </div>
    )
  }

  // ============================================================
  // 渲染：错误态
  // ============================================================
  if (error) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold md:text-2xl">菜谱库</h2>
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-3 px-5 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={loadRecipes}
        >
          重新加载
        </Button>
      </div>
    )
  }

  // ============================================================
  // 渲染：空态
  // ============================================================
  if (filteredRecipes.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h2 className="mb-4 text-xl font-semibold">菜谱库</h2>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="搜索菜名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-input border border-divider bg-card py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 分类筛选 */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-divider active:scale-95',
                selectedCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-divider/70 text-text-secondary',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <EmptyState
          type={searchQuery ? 'search' : 'empty'}
          title={searchQuery ? '没有找到匹配的菜谱' : '暂无菜谱'}
          description={searchQuery ? '试试其他关键词' : '点击右下角 + 添加你的拿手菜'}
        />

        {/* FAB */}
        <button
          onClick={() => navigate('/recipes/add')}
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary-dark active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      {/* 标题栏 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold md:text-2xl">菜谱库</h2>
        <span className="text-sm text-text-secondary">
          共 {filteredRecipes.length} 道
        </span>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="搜索菜名..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-input border border-divider bg-card py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* 分类筛选 + 视图切换 */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-divider active:scale-95',
                selectedCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-divider/70 text-text-secondary',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 视图切换 */}
        <div className="flex shrink-0 rounded-lg border border-divider bg-card p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-[6px] p-1.5 transition-all duration-200 active:scale-95',
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-[6px] p-1.5 transition-all duration-200 active:scale-95',
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ============================================
          网格视图
          ============================================ */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="overflow-hidden transition-all active:scale-[0.98]"
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            >
              {/* 图片 */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                />
                {/* 收藏角标 */}
                {favoriteIds.has(recipe.id) && (
                  <div className="absolute right-2 top-2 rounded-full bg-white/80 p-1">
                    <Heart className="h-3.5 w-3.5 fill-accent text-accent" />
                  </div>
                )}
                {/* 时长 */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                  <Clock className="h-3 w-3" />
                  {recipe.cookTime}分钟
                </div>
              </div>

              {/* 信息 */}
              <div className="p-3">
                <h3 className="mb-1 text-sm font-semibold leading-tight line-clamp-2">
                  {recipe.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px]',
                      DIFFICULTY_COLORS[recipe.difficulty] ?? 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* ============================================
           列表视图
           ============================================ */
        <div className="space-y-3">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="flex overflow-hidden transition-all active:scale-[0.99]"
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            >
              {/* 缩略图 */}
              <div className="h-24 w-24 shrink-0 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* 信息 */}
              <div className="flex flex-1 flex-col justify-center px-4 py-3">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-sm font-semibold leading-tight line-clamp-1">
                    {recipe.name}
                  </h3>
                  {favoriteIds.has(recipe.id) && (
                    <Heart className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />
                  )}
                </div>
                <div className="mb-1 flex items-center gap-2 text-xs text-text-secondary">
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[11px]',
                      DIFFICULTY_COLORS[recipe.difficulty] ?? 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {recipe.difficulty}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {recipe.cookTime}分钟
                  </span>
                  <span>{recipe.category}</span>
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
            </Card>
          ))}
        </div>
      )}

      {/* FAB 添加按钮 */}
      <button
        onClick={() => navigate('/recipes/add')}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary-dark active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}

export default RecipePage
