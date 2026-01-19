import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useSidebar } from '@/contexts/SidebarContext'
import { PageMetaProvider } from '@/contexts/PageMetaContext'
import { LayoutErrorBoundary } from '@/components/error-boundaries/LayoutErrorBoundary'
import { cn } from '@/utils/cn'

export function MainLayout() {
  const { isCollapsed } = useSidebar()

  return (
    <PageMetaProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main
          className={cn(
            'flex-1 transition-all duration-200',
            isCollapsed ? 'ml-[72px]' : 'ml-64'
          )}
        >
          <Header />
          <div className="p-6 animate-fade-in">
            <LayoutErrorBoundary>
              <Outlet />
            </LayoutErrorBoundary>
          </div>
        </main>
      </div>
    </PageMetaProvider>
  )
}
