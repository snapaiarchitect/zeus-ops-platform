import { useAuth } from '@/hooks/useAuth'
import { AppRoutes } from '@/routes'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading ZEUS OPS...</p>
        </div>
      </div>
    )
  }

  return <AppRoutes />
}

export default App
