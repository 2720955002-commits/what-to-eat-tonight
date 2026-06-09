import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Search, Heart, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/recipes', label: '菜谱', icon: BookOpen },
  { to: '/search', label: '筛选', icon: Search },
  { to: '/favorites', label: '收藏', icon: Heart },
  { to: '/history', label: '历史', icon: Clock },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex h-16 w-full max-w-lg -translate-x-1/2 items-center justify-around border-t border-divider bg-card/90 px-2 pb-safe backdrop-blur-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
