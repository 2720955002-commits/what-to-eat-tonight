// ============================================================
// 「今晚吃啥」— 数据层统一导出
// ============================================================

export { db, DinnerDB } from './database'
export {
  createRecipe,
  createRecipes,
  getRecipe,
  getAllRecipes,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  getRecipesByCategory,
} from './database'
export {
  addFavorite,
  removeFavorite,
  isFavorited,
  getFavoritesWithRecipes,
  getAllFavoriteIds,
} from './database'
export {
  addHistory,
  getTodayHistory,
  getHistoryByDate,
  getAllHistory,
  getRecentHistory,
  getRecentRecipeIds,
  clearAllHistory,
} from './database'
export {
  getSetting,
  setSetting,
  getAllSettings,
  deleteSetting,
} from './database'
export {
  exportAllData,
  importData,
  clearAllData,
  getDBStats,
} from './database'
export type { DBStats } from './database'

export type {
  Recipe,
  Favorite,
  HistoryRecord,
  SettingsEntry,
  Difficulty,
  Category,
  Flavor,
  Season,
  PickSettings,
} from './types'
export {
  DEFAULT_PICK_SETTINGS,
  INGREDIENT_CATEGORIES,
  ALL_INGREDIENTS,
} from './types'
