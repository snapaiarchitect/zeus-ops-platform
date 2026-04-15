import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Public Pages
import { LandingPage } from '@/pages/landing/LandingPage'
import { PricingPage } from '@/pages/pricing/PricingPage'
import { CaseStudiesPage } from '@/pages/case-studies/CaseStudiesPage'
import { CaseStudyDetailPage } from '@/pages/case-studies/CaseStudyDetailPage'
import { BlogPage } from '@/pages/blog/BlogPage'
import { BlogPostPage } from '@/pages/blog/BlogPostPage'
import { AboutPage } from '@/pages/about/AboutPage'
import { ContactPage } from '@/pages/contact/ContactPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// Client Dashboard
import { ClientDashboardLayout } from '@/layouts/ClientDashboardLayout'
import { ClientOverviewPage } from '@/pages/client-dashboard/OverviewPage'
import { ClientTasksPage } from '@/pages/client-dashboard/TasksPage'
import { ClientBillingPage } from '@/pages/client-dashboard/BillingPage'
import { ClientSupportPage } from '@/pages/client-dashboard/SupportPage'

// Admin Dashboard
import { AdminDashboardLayout } from '@/layouts/AdminDashboardLayout'
import { AdminOverviewPage } from '@/pages/admin-dashboard/OverviewPage'
import { LeadsPage } from '@/pages/admin-dashboard/LeadsPage'
import { ContactsPage } from '@/pages/admin-dashboard/ContactsPage'
import { BookingsPage } from '@/pages/admin-dashboard/BookingsPage'
import { AdminTasksPage } from '@/pages/admin-dashboard/TasksPage'
import { AnalyticsPage } from '@/pages/admin-dashboard/AnalyticsPage'
import { TeamPage } from '@/pages/admin-dashboard/TeamPage'

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/case-studies" element={<CaseStudiesPage />} />
      <Route path="/case-studies/:id" element={<CaseStudyDetailPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Client Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <ClientDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientOverviewPage />} />
        <Route path="tasks" element={<ClientTasksPage />} />
        <Route path="billing" element={<ClientBillingPage />} />
        <Route path="support" element={<ClientSupportPage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="tasks" element={<AdminTasksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
