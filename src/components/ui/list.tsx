
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const List = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("divide-y divide-border rounded-md border", className)}
    {...props}
  />
))
List.displayName = "List"

const ListItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'li';
    return (
        <Comp
            ref={ref}
            className={cn(
                "block p-4 transition-colors hover:bg-secondary cursor-pointer",
                className
            )}
            {...props}
        />
    )
})
ListItem.displayName = "ListItem"

export { List, ListItem }
