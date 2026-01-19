import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { FloatingNav } from './FloatingNav'
import { GamificationAnimations } from '@/components/gamification/GamificationAnimations'
import { LayoutErrorBoundary } from '@/components/error-boundaries/LayoutErrorBoundary'
import { cn } from '@/utils/cn'

export function StudentLayout() {
  const [isNavHidden, setIsNavHidden] = useState(false)

  const toggleNav = () => setIsNavHidden(!isNavHidden)

  return (
    <div className="min-h-screen bg-background">
      {/* Header - visible on all screens */}
      <Header isNavHidden={isNavHidden} toggleNav={toggleNav} />

      {/* Floating Pills Navigation */}
      <FloatingNav isHidden={isNavHidden} />

      {/* Main content */}
      <main className={cn(
        'pb-24 md:pb-6 transition-all duration-300',
        !isNavHidden && 'md:pl-36'
      )}>
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
          <LayoutErrorBoundary>
            <Outlet />
          </LayoutErrorBoundary>
        </div>
      </main>

      {/* Gamification animations (global) */}
      <GamificationAnimations />
    </div>
  )
}
