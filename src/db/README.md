# 数据层 — Dexie.js IndexedDB

## 位置

```
src/db/
├── types.ts       # 类型定义
├── database.ts    # CRUD 操作
└── index.ts       # 统一导出
```

## 使用方式

```ts
import { db, getAllRecipes, addFavorite, addHistory, getSetting, setSetting } from '../db'

// 读取所有菜谱
const recipes = await getAllRecipes()

// 收藏 / 取消收藏
await addFavorite('recipe-uuid')
await removeFavorite('recipe-uuid')

// 记录历史
await addHistory(['recipe-id-1', 'recipe-id-2'], 2)

// 读写设置
const settings = await getSetting<PickSettings>('pickSettings')
await setSetting('pickSettings', { antiRepeat: true, antiRepeatDays: 7 })
```

## 四个数据表

| 表名 | 主键 | 索引 |
|------|------|------|
| `recipes` | id | name, category, difficulty, cookTime, isBuiltIn, ingredients*, flavors*, season* |
| `favorites` | id | recipeId, addedAt |
| `history` | id | date, createdAt, recipeIds* |
| `settings` | id | key (唯一) |

> `*` 表示多值索引 (multi-entry)，可对数组字段进行包含查询。

## 抽选配置（PickSettings）

存储在 settings 表中，key = `'pickSettings'`。

```ts
interface PickSettings {
  antiRepeat: boolean       // 防重复推荐（默认 true）
  antiRepeatDays: number    // 防重复天数（默认 7）
  favoritePriority: boolean // 收藏优先（默认 false）
  flavorPreference: boolean // 口味偏好（默认 false）
  preferredFlavors: Flavor[]
  timeLimit: boolean        // 用时限制（默认 false）
  maxCookTime: number       // 用时上限分钟（默认 30）
  includeStaple: boolean    // 包含主食（默认 true）
  fridgeMode: boolean       // 冰箱食材模式（默认 false）
  fridgeIngredients: string[]
  defaultDishCount: number  // 默认菜数（1-5，默认 2）
}
```

## 数据库版本记录

- 版本 1 (初始): 四表 + 所有索引

## 数据导入/导出

```ts
// 导出所有数据
const backup = await exportAllData()

// 导入数据（防重复，按 id 去重）
const { imported, skipped } = await importData(backup)

// 清空所有数据
await clearAllData()
```

## 云同步预留

所有实体表均包含 `syncedAt: Date | null` 字段，为后续添加云同步功能提供时间戳标记。同步时读取 syncedAt 为 null 或早于云端版本的记录进行双向同步。
