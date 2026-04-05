import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BookingCard from '@/components/BookingCard'
import { IconRacket } from '@/components/icons'
import AgendaList from './AgendaList'

export default async function AgendaPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase.from('bookings')
    .select('*, court:courts(name, display_name, wpc_id), center:centers(name, city)')
    .eq('profile_id', user.id)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(20)

  return (
    <div className="pt-14 px-4">
      <h1 className="text-xl font-bold text-cc-dark mb-4">Mi agenda</h1>
      {bookings && bookings.length > 0 ? (
        <AgendaList bookings={bookings} />
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="flex justify-center mb-3"><IconRacket size={48} /></div>
          <p className="font-semibold">No hay reservas todavia</p>
          <p className="text-sm mt-1">Reserva tu primer court!</p>
        </div>
      )}
    </div>
  )
}
