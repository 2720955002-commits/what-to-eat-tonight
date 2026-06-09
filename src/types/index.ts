export interface Recipe {
  id: string
  name: string
  image: string
  ingredients: string[]
  steps: string[]
  cookTime: number
  difficulty: 'simple' | 'medium' | 'hard'
  servings: number
  flavors: string[]
  season: string[]
  category: string
  isBuiltIn: boolean
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
  syncedAt?: string
}

export interface DinnerHistory {
  id: string
  recipes: string[]
  date: string
  dinnerCount: number
  createdAt: string
}

export interface SelectionConfig {
  antiRepeatDays: number
  favoriteWeight: boolean
  flavorTags: string[]
  maxCookTime: number
  includeStaples: boolean
  excludeCategories: string[]
}
