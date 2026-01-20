import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { usePageMeta } from '@/contexts/PageMetaContext'
import {
  useBreadcrumbs,
  useBackNavigation,
  usePageTitle,
  getBackFallback,
  parseRoute,
} from '@/lib/navigation'
import { useLocation } from 'react-router-dom'

export function Header() {
  const { pathname } = useLocation()
  const { meta } = usePageMeta()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const breadcrumbs = useBreadcrumbs(meta.entityLabel)
  const { title, subtitle } = usePageTitle()
  const fallback = getBackFallback(pathname)
  const goBack = useBackNavigation(fallback)

  const { pageType } = parseRoute(pathname)
  const showBreadcrumbs = pageType !== 'list' && pageType !== 'dashboard'
  const showBackButton = breadcrumbs.length > 1

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={goBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
          )}

          <div>
            {showBreadcrumbs && breadcrumbs.length > 1 && (
              <nav className="flex items-center gap-1 text-sm text-slate-500 mb-0.5">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-3 h-3" />}
                    {crumb.path ? (
                      <Link to={crumb.path} className="hover:text-slate-700">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-700">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {!showBreadcrumbs && subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setNotifOpen(!notifOpen)
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-slate-500" />
            </button>

            {/* Notification Dropdown */}
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all',
                notifOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              )}
            >
              <div className="p-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">System Alerts</h3>
              </div>
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">No alerts at this time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
