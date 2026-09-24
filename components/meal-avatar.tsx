"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

export function MealAvatar({ className, label = "Marmita do Sabor no Ponto" }: { className?: string; label?: string }) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border-2 border-background bg-primary/10 shadow-[0_8px_20px_-8px_hsl(var(--primary))] ring-1 ring-primary/25 sm:size-12">
        <Image
          src="/images/marmita-avatar.png"
          alt={label}
          fill
          sizes="(min-width: 640px) 48px, 44px"
          className="object-cover"
          priority
        />
      </span>
      <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] text-primary-foreground shadow-sm" aria-hidden="true">
        <span className="leading-none">M</span>
      </span>
    </span>
  )
}

export function MealNavIcon({ className }: { className?: string }) {
  return <MealAvatar className={cn("[&>span]:size-8 sm:[&>span]:size-9", className)} label="Cardápio de marmitas" />
}
