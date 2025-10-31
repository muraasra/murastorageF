// Types pour NuxtApp extensions
import type { NuxtApp } from '#app'

declare module '#app' {
  interface NuxtApp {
    $invalidateCacheByPattern: (pattern: string) => void
    $invalidateCache: (url: string) => void
  }
}




