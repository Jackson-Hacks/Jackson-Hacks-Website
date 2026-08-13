// @ts-nocheck -- Thin DOM primitive wrappers; public props are intentionally passthrough.
import * as React from "react"

import { cn } from "@/lib/utils"

/** @type {any} */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props} />
))
Card.displayName = "Card"

/** @type {any} */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

/** @type {any} */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

/** @type {any} */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

/** @type {any} */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/** @type {any} */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

const PublicCard = /** @type {any} */ (Card)
const PublicCardHeader = /** @type {any} */ (CardHeader)
const PublicCardFooter = /** @type {any} */ (CardFooter)
const PublicCardTitle = /** @type {any} */ (CardTitle)
const PublicCardDescription = /** @type {any} */ (CardDescription)
const PublicCardContent = /** @type {any} */ (CardContent)

export {
  PublicCard as Card,
  PublicCardHeader as CardHeader,
  PublicCardFooter as CardFooter,
  PublicCardTitle as CardTitle,
  PublicCardDescription as CardDescription,
  PublicCardContent as CardContent,
}
