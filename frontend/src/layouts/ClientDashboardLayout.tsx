import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/Sidebar'
import { cn } from '@/lib/utils'

export function ClientDashboardLayout() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const clientNavItems = [
    { label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Tasks', href: '/dashboard/tasks', icon: 'CheckSquare' },
    { label: 'Billing', href: '/dashboard/billing', icon: 'CreditCard' },
    { label: 'Support', href: '/dashboard/support', icon: 'HelpCircle' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar items={clientNavItems} user={user} />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
