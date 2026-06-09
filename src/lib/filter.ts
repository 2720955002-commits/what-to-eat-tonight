// ============================================================
// 「今晚吃啥」— 筛选引擎
// ============================================================
// 支持双模式筛选：
//   1. 我有食材模式 — 按食材 + 口味/用时/难度/季节组合筛选
//   2. 我想吃模式 — 按口味/用时/难度/季节组合筛选
// ============================================================

import type { Recipe, Flavor, Difficulty, Season } from '@/db/types'

// ============================================================
// 类型定义
// ============================================================

export interface FilterParams {
  /** 筛选模式 */
  mode: 'ingredients' | 'craving'
  /** 已有食材列表（仅 ingredients 模式使用） */
  selectedIngredients: string[]
  /** 口味偏好 */
  flavors: Flavor[]
  /** 最大烹饪时间（分钟），0=不限 */
  maxCookTime: number
  /** 难度筛选 */
  difficulties: Difficulty[]
  /** 季节筛选 */
  seasons: Season[]
}

export const DEFAULT_FILTER_PARAMS: FilterParams = {
  mode: 'ingredients',
  selectedIngredients: [],
  flavors: [],
  maxCookTime: 0,
  difficulties: [],
  seasons: [],
}

export interface FilterResult {
  /** 匹配的菜谱 */
  recipes: Recipe[]
  /** 总菜谱数 */
  totalCount: number
  /** 匹配数 */
  matchCount: number
}

// ============================================================
// 匹配辅助函数
// ============================================================

/**
 * 检查菜谱是否可以用给定的食材制作
 * 匹配逻辑：菜谱的任一食材在已选食材列表中
 */
function matchesIngredients(recipe: Recipe, selected: string[]): boolean {
  if (selected.length === 0) return true
  return recipe.ingredients.some((ing) =>
    selected.some(
      (s) => ing.includes(s) || s.includes(ing),
    ),
  )
}

/**
 * 检查菜谱口味是否匹配筛选条件
 * 匹配逻辑：菜谱的任一口味在筛选口味列表中
 */
function matchesFlavors(recipe: Recipe, flavors: Flavor[]): boolean {
  if (flavors.length === 0) return true
  return recipe.flavors.some((f) => flavors.includes(f))
}

/**
 * 检查菜谱烹饪时间是否在限制内
 */
function matchesCookTime(recipe: Recipe, maxMinutes: number): boolean {
  if (maxMinutes <= 0) return true
  return recipe.cookTime <= maxMinutes
}

/**
 * 检查菜谱难度是否匹配
 */
function matchesDifficulty(recipe: Recipe, difficulties: Difficulty[]): boolean {
  if (difficulties.length === 0) return true
  return difficulties.includes(recipe.difficulty)
}

/**
 * 检查菜谱季节是否匹配
 */
function matchesSeason(recipe: Recipe, seasons: Season[]): boolean {
  if (seasons.length === 0) return true
  return recipe.season.some((s) => seasons.includes(s))
}

// ============================================================
// 核心筛选函数
// ============================================================

/**
 * 对菜谱列表执行组合筛选
 *
 * 流程：
 * 1. ingredients 模式下按食材过滤
 * 2. 按口味/用时/难度/季节逐层过滤
 * 3. 返回匹配结果
 */
export function filterRecipes(
  recipes: Recipe[],
  params: FilterParams,
): FilterResult {
  let filtered = [...recipes]

  // 食材筛选（仅 ingredients 模式）
  if (params.mode === 'ingredients' && params.selectedIngredients.length > 0) {
    filtered = filtered.filter((r) =>
      matchesIngredients(r, params.selectedIngredients),
    )
  }

  // 口味筛选
  filtered = filtered.filter((r) => matchesFlavors(r, params.flavors))

  // 用时筛选
  filtered = filtered.filter((r) => matchesCookTime(r, params.maxCookTime))

  // 难度筛选
  filtered = filtered.filter((r) => matchesDifficulty(r, params.difficulties))

  // 季节筛选
  filtered = filtered.filter((r) => matchesSeason(r, params.seasons))

  return {
    recipes: filtered,
    totalCount: recipes.length,
    matchCount: filtered.length,
  }
}