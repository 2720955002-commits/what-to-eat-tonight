// ============================================================
// 「今晚吃啥」— 数据种子导入
// ============================================================
// 负责将 73 道内置菜谱写入 IndexedDB，仅在首次运行时执行
// ============================================================

import { createRecipes, setSetting, getSetting } from './database'
import { SEED_RECIPES } from './seed-data'

const SEED_VERSION_KEY = 'seed_version'
const CURRENT_SEED_VERSION = '1.0'

/**
 * 检查是否已经执行过种子导入
 */
export async function isSeeded(): Promise<boolean> {
  const version = await getSetting<string>(SEED_VERSION_KEY)
  return version === CURRENT_SEED_VERSION
}

/**
 * 执行种子数据导入（自动跳过已导入）
 * @returns 导入的菜谱数量，0 表示跳过（已导入）
 */
export async function seedDatabase(): Promise<number> {
  // 跳过已导入
  if (await isSeeded()) {
    console.log('[Seed] 数据已导入（v' + CURRENT_SEED_VERSION + '），跳过')
    return 0
  }

  console.log('[Seed] 开始导入 ' + SEED_RECIPES.length + ' 道内置菜谱...')

  // 批量写入
  const recipes = await createRecipes(SEED_RECIPES)

  // 标记已导入
  await setSetting(SEED_VERSION_KEY, CURRENT_SEED_VERSION)

  console.log('[Seed] 导入完成：' + recipes.length + ' 道菜谱')
  return recipes.length
}

/**
 * 清除所有数据并重新导入种子数据
 * 用于调试或版本升级时重置
 */
export async function clearAndSeedDatabase(): Promise<number> {
  const { db } = await import('./database')
  await db.recipes.clear()
  await db.favorites.clear()
  await db.history.clear()
  await db.settings.clear()

  console.log('[Seed] 数据已清空，重新导入...')
  return seedDatabase()
}
