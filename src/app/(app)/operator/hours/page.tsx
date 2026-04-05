import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IconCalendar } from '@/components/icons'

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

export default async function OperatorHoursPage() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: centers } = await supabase.from('centers')
    .select('*')
    .eq('is_active', true)
    .limit(5)

  const { data: hours } = await supabase.from('operating_hours')
    .select('*, center:centers(name)')
    .order('center_id')
    .order('day_of_week')

  const hoursByCenter = centers?.map(center => ({
    center,
    hours: hours?.filter(h => h.center_id === center.id) || [],
  })) || []

  return (
    <div className="pt-14 min-h-screen bg-gray-50">
      <div className="bg-white px-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/operator" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">&larr;</Link>
          <h1 className="text-lg font-bold text-cc-dark">Horarios</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {hoursByCenter.map(({ center, hours: centerHours }) => (
          <div key={center.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-cc-blue-light border-b border-blue-100">
              <div className="font-bold text-sm text-cc-blue">{center.name}</div>
              <div className="text-xs text-blue-600">{center.city}, {center.country}</div>
            </div>

            {centerHours.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {dayNames.map((day, i) => {
                  const h = centerHours.find((ch: any) => ch.day_of_week === i)
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-xs font-semibold text-gray-500">{dayNamesShort[i]}</span>
                        <span className="text-sm font-medium text-cc-dark">{day}</span>
                      </div>
                      {h ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-cc-blue">
                            {h.open_time?.slice(0, 5)} - {h.close_time?.slice(0, 5)}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Cerrado</span>
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="text-gray-300 mb-2"><IconCalendar size={32} /></div>
                <p className="text-sm text-gray-400">Sin horarios configurados</p>
                <p className="text-xs text-gray-300 mt-1">Configura los horarios de apertura para este centro</p>
              </div>
            )}
          </div>
        ))}

        {hoursByCenter.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-3 flex justify-center"><IconCalendar size={48} /></div>
            <p className="text-sm text-gray-500 font-medium">No hay centros activos</p>
            <p className="text-xs text-gray-400 mt-1">Activa un centro para configurar sus horarios</p>
          </div>
        )}
      </div>
    </div>
  )
}
