import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
