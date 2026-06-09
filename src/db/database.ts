// ============================================================
// 「今晚吃啥」— Dexie.js 数据库层
// ============================================================
// 使用 Dexie.js 封装 IndexedDB 操作，提供类型安全的 CRUD
// 所有表预留 syncedAt 字段为后续云同步做准备
// ============================================================

import Dexie, { type EntityTable, type IndexableType } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import type { Recipe, Favorite, HistoryRecord, SettingsEntry } from './types'

// ============================================================
// 数据库定义
// ============================================================

export class DinnerDB extends Dexie {
  /** 菜谱表 */
  recipes!: EntityTable<Recipe, 'id'>
  /** 收藏表 */
  favorites!: EntityTable<Favorite, 'id'>
  /** 历史记录表 */
  history!: EntityTable<HistoryRecord, 'id'>
  /** 设置表 */
  settings!: EntityTable<SettingsEntry, 'id'>

  constructor() {
    super('DinnerDB')

    // 版本 1：初始表结构
    this.version(1).stores({
      recipes: 'id, name, category, difficulty, cookTime, isBuiltIn, *ingredients, *flavors, *season, createdAt',
      favorites: 'id, recipeId, addedAt, createdAt',
      history: 'id, date, createdAt, *recipeIds',
      settings: 'id, key, createdAt',
    })
  }
}

/** 全局数据库实例 */
export const db = new DinnerDB()

// ============================================================
// 菜谱 CRUD
// ============================================================

/** 创建菜谱 */
export async function createRecipe(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt'>): Promise<Recipe> {
  const now = new Date()
  const recipe: Recipe = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  }
  await db.recipes.add(recipe)
  return recipe
}

/** 批量创建菜谱 */
export async function createRecipes(dataList: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'syncedAt'>[]): Promise<Recipe[]> {
  const now = new Date()
  const recipes: Recipe[] = dataList.map((data) => ({
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  }))
  await db.recipes.bulkAdd(recipes)
  return recipes
}

/** 根据 ID 获取菜谱 */
export async function getRecipe(id: string): Promise<Recipe | undefined> {
  return db.recipes.get(id)
}

/** 获取所有菜谱 */
export async function getAllRecipes(): Promise<Recipe[]> {
  return db.recipes.toArray()
}

/** 更新菜谱（部分更新） */
export async function updateRecipe(id: string, changes: Partial<Omit<Recipe, 'id' | 'createdAt' | 'syncedAt'>>): Promise<number> {
  return db.recipes.update(id, { ...changes, updatedAt: new Date() })
}

/** 删除菜谱（仅自定义菜谱可删） */
export async function deleteRecipe(id: string): Promise<void> {
  await db.recipes.delete(id)
}

/** 搜索菜谱（按名称模糊匹配） */
export async function searchRecipes(query: string): Promise<Recipe[]> {
  return db.recipes
    .filter((r) => r.name.includes(query))
    .toArray()
}

/** 按分类获取菜谱 */
export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  return db.recipes.where('category').equals(category).toArray()
}

// ============================================================
// 收藏 CRUD
// ============================================================

/** 添加收藏 */
export async function addFavorite(recipeId: string): Promise<Favorite> {
  const now = new Date()
  const fav: Favorite = {
    id: uuidv4(),
    recipeId,
    addedAt: now,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  }
  await db.favorites.add(fav)
  return fav
}

/** 取消收藏 */
export async function removeFavorite(recipeId: string): Promise<void> {
  await db.favorites.where('recipeId').equals(recipeId).delete()
}

/** 检查是否已收藏 */
export async function isFavorited(recipeId: string): Promise<boolean> {
  const count = await db.favorites.where('recipeId').equals(recipeId).count()
  return count > 0
}

/** 获取所有收藏（含完整菜谱信息） */
export async function getFavoritesWithRecipes(): Promise<{ favorite: Favorite; recipe: Recipe | undefined }[]> {
  const favorites = await db.favorites.toArray()
  const recipeIds = [...new Set(favorites.map((f) => f.recipeId))]
  const recipes = await db.recipes.bulkGet(recipeIds)
  const recipeMap = new Map(recipeIds.map((id, i) => [id, recipes[i]]))
  return favorites.map((favorite) => ({
    favorite,
    recipe: recipeMap.get(favorite.recipeId),
  }))
}

/** 获取所有收藏的菜谱 ID */
export async function getAllFavoriteIds(): Promise<string[]> {
  const favorites = await db.favorites.toArray()
  return favorites.map((f) => f.recipeId)
}

// ============================================================
// 历史记录 CRUD
// ============================================================

/** 添加历史记录 */
export async function addHistory(recipeIds: string[], dinnerCount: number, date?: string): Promise<HistoryRecord> {
  const now = new Date()
  const dateStr = date ?? now.toISOString().slice(0, 10) // YYYY-MM-DD
  const record: HistoryRecord = {
    id: uuidv4(),
    recipeIds,
    date: dateStr,
    dinnerCount,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  }
  await db.history.add(record)
  return record
}

/** 获取今天的历史记录 */
export async function getTodayHistory(): Promise<HistoryRecord | undefined> {
  const today = new Date().toISOString().slice(0, 10)
  return db.history.where('date').equals(today).first()
}

/** 获取指定日期的历史记录 */
export async function getHistoryByDate(date: string): Promise<HistoryRecord | undefined> {
  return db.history.where('date').equals(date).first()
}

/** 获取所有历史记录（按日期倒序） */
export async function getAllHistory(): Promise<HistoryRecord[]> {
  return db.history
    .orderBy('createdAt')
    .reverse()
    .toArray()
}

/** 获取最近 N 天内的历史记录 */
export async function getRecentHistory(days: number): Promise<HistoryRecord[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  return db.history
    .where('date')
    .aboveOrEqual(cutoffStr)
    .reverse()
    .toArray()
}

/** 获取最近 N 天内吃过的菜谱 ID 集合（用于防重复） */
export async function getRecentRecipeIds(days: number): Promise<Set<string>> {
  const records = await getRecentHistory(days)
  const ids = new Set<string>()
  for (const record of records) {
    for (const recipeId of record.recipeIds) {
      ids.add(recipeId)
    }
  }
  return ids
}

/** 清空历史记录 */
export async function clearAllHistory(): Promise<void> {
  await db.history.clear()
}

// ============================================================
// 设置 CRUD
// ============================================================

/** 获取设置值 */
export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const entry = await db.settings.where('key').equals(key).first()
  return entry?.value as T | undefined
}

/** 设置值（创建或覆盖） */
export async function setSetting<T = unknown>(key: string, value: T): Promise<void> {
  const now = new Date()
  const existing = await db.settings.where('key').equals(key).first()

  if (existing) {
    await db.settings.update(existing.id, {
      value,
      updatedAt: now,
    })
  } else {
    await db.settings.add({
      id: uuidv4(),
      key,
      value,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
    })
  }
}

/** 获取所有设置 */
export async function getAllSettings(): Promise<SettingsEntry[]> {
  return db.settings.toArray()
}

/** 删除设置 */
export async function deleteSetting(key: string): Promise<void> {
  await db.settings.where('key').equals(key).delete()
}

// ============================================================
// 数据管理
// ============================================================

/** 导出所有数据（JSON） */
export async function exportAllData(): Promise<{
  recipes: Recipe[]
  favorites: Favorite[]
  history: HistoryRecord[]
  settings: SettingsEntry[]
  exportedAt: string
  version: string
}> {
  const [recipes, favorites, history, settings] = await Promise.all([
    db.recipes.toArray(),
    db.favorites.toArray(),
    db.history.toArray(),
    db.settings.toArray(),
  ])

  return {
    recipes,
    favorites,
    history,
    settings,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }
}

/** 导入数据（追加模式，防重复） */
export async function importData(data: {
  recipes?: Recipe[]
  favorites?: Favorite[]
  history?: HistoryRecord[]
  settings?: SettingsEntry[]
}): Promise<{ imported: number; skipped: number }> {
  let imported = 0
  let skipped = 0

  if (data.recipes) {
    for (const recipe of data.recipes) {
      const existing = await db.recipes.get(recipe.id)
      if (!existing) {
        await db.recipes.add(recipe)
        imported++
      } else {
        skipped++
      }
    }
  }

  if (data.favorites) {
    for (const fav of data.favorites) {
      const existing = await db.favorites.get(fav.id)
      if (!existing) {
        await db.favorites.add(fav)
        imported++
      } else {
        skipped++
      }
    }
  }

  if (data.history) {
    for (const record of data.history) {
      const existing = await db.history.get(record.id)
      if (!existing) {
        await db.history.add(record)
        imported++
      } else {
        skipped++
      }
    }
  }

  if (data.settings) {
    for (const entry of data.settings) {
      const existing = await db.settings.get(entry.id)
      if (!existing) {
        await db.settings.add(entry)
        imported++
      } else {
        skipped++
      }
    }
  }

  return { imported, skipped }
}

/** 清空所有数据 */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.recipes.clear(),
    db.favorites.clear(),
    db.history.clear(),
    db.settings.clear(),
  ])
}

// ============================================================
// 数据统计
// ============================================================

export interface DBStats {
  totalRecipes: number
  totalFavorites: number
  totalHistory: number
  builtInRecipes: number
  customRecipes: number
  categoryDistribution: Record<string, number>
}

/** 获取数据库统计信息 */
export async function getDBStats(): Promise<DBStats> {
  const [allRecipes, allFavorites, allHistory] = await Promise.all([
    db.recipes.toArray(),
    db.favorites.toArray(),
    db.history.toArray(),
  ])

  const categoryDistribution: Record<string, number> = {}
  for (const recipe of allRecipes) {
    categoryDistribution[recipe.category] = (categoryDistribution[recipe.category] || 0) + 1
  }

  return {
    totalRecipes: allRecipes.length,
    totalFavorites: allFavorites.length,
    totalHistory: allHistory.length,
    builtInRecipes: allRecipes.filter((r) => r.isBuiltIn).length,
    customRecipes: allRecipes.filter((r) => !r.isBuiltIn).length,
    categoryDistribution,
  }
}
