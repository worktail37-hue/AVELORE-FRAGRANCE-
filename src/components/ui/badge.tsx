import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-amber-500/30 bg-[#FFD482]/15 text-[#FFD482] shadow-sm",
        secondary:
          "border-white/10 bg-white/5 text-stone-300 hover:bg-white/10",
        destructive:
          "border-transparent bg-red-900/60 text-red-200 shadow hover:bg-red-900/80",
        outline: "text-[#FAF2E1] border-white/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
