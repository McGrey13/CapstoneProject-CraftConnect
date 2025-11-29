import * as React from "react"
import { cn } from "../../lib/utils"

// Simple Progress component fallback
const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-[#d5bfae]",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-[#a4785a] transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
