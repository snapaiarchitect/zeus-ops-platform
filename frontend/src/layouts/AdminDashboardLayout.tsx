import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/Sidebar'

export function AdminDashboardLayout() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const adminNavItems = [
    { label: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Leads', href: '/admin/leads', icon: 'Target' },
    { label: 'Contacts', href: '/admin/contacts', icon: 'Users' },
    { label: 'Bookings', href: '/admin/bookings', icon: 'Calendar' },
    { label: 'Tasks', href: '/admin/tasks', icon: 'CheckSquare' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
    { label: 'Team', href: '/admin/team', icon: 'UserCog' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <Sidebar items={adminNavItems} user={user} />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
