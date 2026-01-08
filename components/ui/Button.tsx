import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
}

// Wrapping HTMLButtonElement with framer-motion is tricky for types,
// so we'll use a simple motion.button wrapper or just apply classes.
// Let's use standard button with motion wrapper for interactions.

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref as any}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    'inline-flex items-center justify-center rounded-2xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
                    {
                        'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40': variant === 'primary',
                        'bg-white text-slate-900 shadow-sm hover:bg-slate-50': variant === 'secondary',
                        'glass hover:bg-white/40 text-white border-white/50': variant === 'glass',
                        'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900': variant === 'outline',
                        'hover:bg-slate-100/50 hover:text-slate-900': variant === 'ghost',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-12 px-6 text-base': size === 'md',
                        'h-14 px-8 text-lg': size === 'lg',
                        'h-10 w-10 p-0': size === 'icon',
                    },
                    className
                )}
                {...props as any}
            >
                {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </motion.button>
        )
    }
)
Button.displayName = 'Button'

export { Button }
