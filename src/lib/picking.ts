// ============================================================
// 「今晚吃啥」— 核心抽选算法
// ============================================================
// 加权随机抽选引擎：
//   1. 基础权重 → 1.0
//   2. 分类权重调节 → 凉菜×0.5、配菜×0.5
//   3. 收藏优先 → 收藏菜品权重×2
//   4. 口味偏好 → 匹配口味每项+0.5权重
//   5. 防重复 → 联动历史记录剔除
//   6. 用时限制、主食排除 → 过滤器
// ============================================================

import type { Recipe, PickSettings } from '@/db/types'

// ============================================================
// 类型
// ============================================================

export interface PickInput {
  /** 所有可用菜谱 */
  allRecipes: Recipe[]
  /** 抽选配置 */
  settings: PickSettings
  /** 已收藏的菜谱 ID 集合 */
  favoriteIds: Set<string>
  /** 最近吃过的菜谱 ID 集合（防重复） */
  recentRecipeIds: Set<string>
}

export interface PickResult {
  /** 被选中的菜谱 */
  recipes: Recipe[]
  /** 抽选时的候选池大小（调试用） */
  candidateCount: number
  /** 候选池是否被防重复筛选影响 */
  dedupRemoved: number
}

// ============================================================
// 分类权重调节映射
// ============================================================
// 凉菜/配菜 → ×0.5，其余保持 ×1.0

const CLASSIFICATION_WEIGHTS: Record<string, number> = {
  凉菜: 0.5,
  配菜: 0.5,
}

// ============================================================
// 核心算法
// ============================================================

/**
 * 执行加权随机抽选
 *
 * 流程：
 * 1. 过滤：排除主食、用时超限、防重复
 * 2. 加权：基础权重 → 分类调节 → 收藏优先 → 口味偏好
 * 3. 无放回加权随机抽取
 */
export function pickDishes(input: PickInput): PickResult {
  const { allRecipes, settings, favoriteIds, recentRecipeIds } = input
  const count = settings.defaultDishCount

  // ------------------------------
  // Step 1: 过滤候选池
  // ------------------------------

  let candidates = [...allRecipes]

  // ① 主食排除
  if (!settings.includeStaple) {
    candidates = candidates.filter((r) => r.category !== '主食')
  }

  // ② 用时限制
  if (settings.timeLimit) {
    candidates = candidates.filter((r) => r.cookTime <= settings.maxCookTime)
  }

  // ③ 防重复推荐
  const beforeDedup = candidates.length
  if (settings.antiRepeat && recentRecipeIds.size > 0) {
    candidates = candidates.filter((r) => !recentRecipeIds.has(r.id))
  }
  const dedupRemoved = beforeDedup - candidates.length

  // ④ 冰箱食材模式（有则过滤）
  if (settings.fridgeMode && settings.fridgeIngredients.length > 0) {
    const fridgeSet = new Set(settings.fridgeIngredients)
    candidates = candidates.filter((r) =>
      r.ingredients.some((ing) => fridgeSet.has(ing))
    )
  }

  // ------------------------------
  // Step 2: 计算权重
  // ------------------------------

  const weighted = candidates.map((recipe) => {
    let weight = 1.0

    // ① 分类权重调节：凉菜/配菜 ×0.5
    const catWeight = CLASSIFICATION_WEIGHTS[recipe.category]
    if (catWeight !== undefined) {
      weight *= catWeight
    }

    // ② 收藏优先：权重 ×2
    if (settings.favoritePriority && favoriteIds.has(recipe.id)) {
      weight *= 2.0
    }

    // ③ 口味偏好：匹配每项 +0.5
    if (
      settings.flavorPreference &&
      settings.preferredFlavors.length > 0
    ) {
      const matchedCount = recipe.flavors.filter((f) =>
        (settings.preferredFlavors as readonly string[]).includes(f)
      ).length
      if (matchedCount > 0) {
        weight *= 1 + matchedCount * 0.5
      }
    }

    return { recipe, weight }
  })

  // ------------------------------
  // Step 3: 加权随机抽选
  // ------------------------------

  const selected = weightedRandomSelect(weighted, count)

  return {
    recipes: selected.map((item) => item.recipe),
    candidateCount: candidates.length,
    dedupRemoved,
  }
}

// ============================================================
// 加权随机抽选（无放回）
// ============================================================

/**
 * 从带权重的数组中，无放回地随机抽取 N 项
 *
 * 使用累积分布函数（CDF）方法：
 *   1. 计算总权重
 *   2. 生成 [0, totalWeight) 之间的随机数
 *   3. 遍历累减，落入区间即选中
 *   4. 移除选中项，重复直到取满或池空
 *
 * 当所有权重 ≤ 0 时，退化为均匀分布
 */
function weightedRandomSelect<T extends { weight: number }>(
  items: T[],
  count: number
): T[] {
  if (items.length === 0) return []
  if (items.length <= count) return items

  const result: T[] = []
  const pool = [...items]

  for (let i = 0; i < count; i++) {
    if (pool.length === 0) break

    const totalWeight = pool.reduce((sum, item) => sum + Math.max(0, item.weight), 0)

    // 所有权重为 0 → 退化为均匀随机
    if (totalWeight <= 0) {
      const idx = Math.floor(Math.random() * pool.length)
      result.push(pool[idx])
      pool.splice(idx, 1)
      continue
    }

    // CDF 选择
    let random = Math.random() * totalWeight
    let selectedIdx = 0

    for (let j = 0; j < pool.length; j++) {
      random -= Math.max(0, pool[j].weight)
      if (random <= 0) {
        selectedIdx = j
        break
      }
    }

    result.push(pool[selectedIdx])
    pool.splice(selectedIdx, 1)
  }

  return result
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 获取分类权重调节因子
 */
export function getCategoryWeightMultiplier(category: string): number {
  return CLASSIFICATION_WEIGHTS[category] ?? 1.0
}

/**
 * 计算单个菜谱的完整权重（不含随机）
 */
export function calculateRecipeWeight(
  recipe: Recipe,
  settings: PickSettings,
  favoriteIds: Set<string>
): number {
  let weight = 1.0

  // 分类调节
  const catWeight = CLASSIFICATION_WEIGHTS[recipe.category]
  if (catWeight !== undefined) {
    weight *= catWeight
  }

  // 收藏优先
  if (settings.favoritePriority && favoriteIds.has(recipe.id)) {
    weight *= 2.0
  }

  // 口味偏好
  if (settings.flavorPreference && settings.preferredFlavors.length > 0) {
    const matchedCount = recipe.flavors.filter((f) =>
      (settings.preferredFlavors as readonly string[]).includes(f)
    ).length
    if (matchedCount > 0) {
      weight *= 1 + matchedCount * 0.5
    }
  }

  return weight
}

/**
 * 对菜谱排序（权重降序），用于预览抽选倾向
 */
export function sortRecipesByWeight(
  recipes: Recipe[],
  settings: PickSettings,
  favoriteIds: Set<string>
): { recipe: Recipe; weight: number }[] {
  return recipes
    .map((recipe) => ({
      recipe,
      weight: calculateRecipeWeight(recipe, settings, favoriteIds),
    }))
    .sort((a, b) => b.weight - a.weight)
}
