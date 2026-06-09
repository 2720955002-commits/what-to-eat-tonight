import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    // Layout
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    // Sizing
    'rounded-button text-sm font-medium',
    // Transitions
    'transition-all duration-150',
    // Accessibility
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    // Disabled
    'disabled:pointer-events-none disabled:opacity-50',
    // SVG sizing inside buttons
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    // ===== 触摸反馈区域 =====
    // Ripple 容器
    'relative overflow-hidden',
    // 按下缩放（全站统一）
    'active:scale-[0.95]',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
        destructive: 'bg-accent text-white hover:bg-accent/90 shadow-sm',
        outline: 'border border-divider bg-card hover:bg-divider/50',
        secondary: 'bg-divider/70 text-text-primary hover:bg-divider',
        // ghost 和 link 使用更淡的反馈
        ghost: 'hover:bg-divider/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-[10px] px-3',
        lg: 'h-12 rounded-button px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
