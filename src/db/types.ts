// ============================================================
// 「今晚吃啥」— 数据模型类型定义
// ============================================================
// 所有实体预留云同步字段：id (UUID), createdAt, updatedAt, syncedAt
// 为后续 IndexedDB → 云端同步做准备
// ============================================================

/** 菜谱难度 */
export type Difficulty = '简单' | '中等' | '困难'

/** 菜谱分类 */
export type Category =
  | '家常菜'
  | '硬菜'
  | '汤'
  | '凉菜'
  | '蒸菜'
  | '主食'
  | '配菜'

/** 口味标签 */
export type Flavor =
  | '辣'
  | '清淡'
  | '酸甜'
  | '鲜香'
  | '酱香'
  | '蒜香'
  | '麻辣'
  | '酸辣'
  | '葱香'
  | '清甜'
  | '孜然香'

/** 季节标签 */
export type Season = '春' | '夏' | '秋' | '冬' | '四季'

// ============================================================
// 1. 菜谱 (Recipe)
// ============================================================
export interface Recipe {
  /** UUID 唯一标识 */
  id: string
  /** 菜名 */
  name: string
  /** 主图 URL */
  image: string
  /** 食材列表 */
  ingredients: string[]
  /** 步骤（有序） */
  steps: string[]
  /** 用时（分钟） */
  cookTime: number
  /** 难度 */
  difficulty: Difficulty
  /** 适合几人份 */
  servings: number
  /** 口味标签 */
  flavors: Flavor[]
  /** 季节标签 */
  season: Season[]
  /** 分类 */
  category: Category
  /** 是否内置菜谱（内置不可删除，仅可编辑） */
  isBuiltIn: boolean
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 同步时间（预留，null=未同步） */
  syncedAt: Date | null
}

// ============================================================
// 2. 收藏 (Favorite)
// ============================================================
export interface Favorite {
  /** UUID 唯一标识 */
  id: string
  /** 关联菜谱 ID */
  recipeId: string
  /** 收藏时间 */
  addedAt: Date
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 同步时间（预留） */
  syncedAt: Date | null
}

// ============================================================
// 3. 历史记录 (HistoryRecord)
// ============================================================
export interface HistoryRecord {
  /** UUID 唯一标识 */
  id: string
  /** 当天选择的菜谱 ID 列表 */
  recipeIds: string[]
  /** 日期 (YYYY-MM-DD) */
  date: string
  /** 当天做了几个菜 */
  dinnerCount: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 同步时间（预留） */
  syncedAt: Date | null
}

// ============================================================
// 4. 设置项 (SettingsEntry)
// ============================================================
export interface SettingsEntry {
  /** UUID 唯一标识 */
  id: string
  /** 设置键名 */
  key: string
  /** 设置值（任意类型，Dexie 自动序列化） */
  value: unknown
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 同步时间（预留） */
  syncedAt: Date | null
}

// ============================================================
// 抽选配置（Settings 中存储的结构）
// ============================================================
export interface PickSettings {
  /** 防重复推荐（默认开启） */
  antiRepeat: boolean
  /** 防重复天数（默认 7） */
  antiRepeatDays: number
  /** 收藏优先（默认关闭） */
  favoritePriority: boolean
  /** 口味偏好（默认关闭） */
  flavorPreference: boolean
  /** 口味偏好列表 */
  preferredFlavors: Flavor[]
  /** 用时限制（默认关闭） */
  timeLimit: boolean
  /** 用时上限（分钟，默认 30） */
  maxCookTime: number
  /** 包含主食（默认开启） */
  includeStaple: boolean
  /** 冰箱食材模式（默认关闭） */
  fridgeMode: boolean
  /** 冰箱现有食材列表 */
  fridgeIngredients: string[]
  /** 常备食材预设（家里常备的食材，冰箱模式可一键导入） */
  stapleIngredients: string[]
  /** 默认菜数（1-5，默认 2） */
  defaultDishCount: number
}

/** 默认抽选配置 */
export const DEFAULT_PICK_SETTINGS: PickSettings = {
  antiRepeat: true,
  antiRepeatDays: 7,
  favoritePriority: false,
  flavorPreference: false,
  preferredFlavors: [],
  timeLimit: false,
  maxCookTime: 30,
  includeStaple: true,
  fridgeMode: false,
  fridgeIngredients: [],
  stapleIngredients: [],
  defaultDishCount: 2,
}

// ============================================================
// 标签引用
// ============================================================
export const INGREDIENT_CATEGORIES: Record<string, string[]> = {
  '肉类': [
    '猪肉', '鸡肉', '牛肉', '排骨', '鸭肉', '鸡翅', '鸡腿',
    '肉末', '五花肉', '瘦肉', '腊肉', '羊肉',
  ],
  '海鲜水产': ['虾', '草鱼', '鲈鱼', '鱼头', '虾皮'],
  '蛋类': ['鸡蛋', '皮蛋', '变蛋'],
  '豆制品': ['豆腐', '老豆腐', '嫩豆腐', '豆腐干', '腐竹'],
  '蔬菜': [
    '番茄', '土豆', '茄子', '青椒', '白菜', '生菜', '黄瓜',
    '西葫芦', '豆角', '四季豆', '西兰花', '冬瓜', '白萝卜',
    '胡萝卜', '木耳', '菌菇', '洋葱', '蒜苗', '豆芽', '圆白菜',
    '蒜苔', '韭菜', '油菜', '荷兰豆', '花菜', '丝瓜', '海带',
    '香菇', '尖椒',
  ],
  '调味': ['葱', '姜', '蒜', '干辣椒', '香菜', '孜然', '剁椒'],
  '主食类': ['米饭', '面条', '面粉', '饺子', '河粉', '粉丝', '米粉'],
  '干货': ['紫菜', '花生', '八角', '冰糖', '红薯'],
}

/** 所有食材的扁平列表 */
export const ALL_INGREDIENTS = Object.values(INGREDIENT_CATEGORIES).flat()
