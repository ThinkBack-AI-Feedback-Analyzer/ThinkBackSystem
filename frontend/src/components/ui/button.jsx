import * as React from "react"

const Button = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
