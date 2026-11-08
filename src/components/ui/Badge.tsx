import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "team"
  size?: "sm" | "md" | "lg"
  dot?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot, children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      team: "bg-bursa-green text-white",
    }

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 font-medium rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
        {children}
      </span>
    )
  }
)

const dotColors = {
  default: "bg-gray-400",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  team: "bg-white",
}

Badge.displayName = "Badge"

export interface MatchStatusBadgeProps {
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled"
  size?: "sm" | "md" | "lg"
}

export function MatchStatusBadge({ status, size = "md" }: MatchStatusBadgeProps) {
  const config = {
    scheduled: { label: "Planlandı", variant: "info" as const, dot: true },
    live: { label: "CANLI", variant: "danger" as const, dot: true },
    finished: { label: "Bitti", variant: "default" as const, dot: false },
    postponed: { label: "Ertelendi", variant: "warning" as const, dot: false },
    cancelled: { label: "İptal", variant: "danger" as const, dot: false },
  }

  const { label, variant, dot } = config[status]

  return <Badge variant={variant} size={size} dot={dot}>{label}</Badge>
}