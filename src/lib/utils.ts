import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 根据菜谱分类返回对应的 Emoji 图标
 */
export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    '家常菜': '🍳',
    '硬菜': '🥩',
    '汤': '🍲',
    '凉菜': '🥗',
    '蒸菜': '🥟',
    '主食': '🍚',
    '配菜': '🥬',
  }
  return emojiMap[category] ?? '🍽️'
}
