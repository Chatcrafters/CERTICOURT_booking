import { format, differenceInDays, parseISO } from 'date-fns'
import { de, es } from 'date-fns/locale'

export function formatDate(date: string | Date, lang = 'es') {
  const d = typeof date === 'string' ? parseISO(date) : date
  const locale = lang === 'de' ? de : es
  return format(d, 'EEEE, d MMMM yyyy', { locale })
}

export function formatDateShort(date: string | Date, lang = 'es') {
  const d = typeof date === 'string' ? parseISO(date) : date
  const locale = lang === 'de' ? de : es
  return format(d, 'd MMM yyyy', { locale })
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date())
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function generateTimeSlots(openTime: string, closeTime: string, durationMin = 90): string[] {
  const slots: string[] = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let minutes = oh * 60 + om
  const closeMinutes = ch * 60 + cm
  while (minutes + durationMin <= closeMinutes) {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0')
    const m = (minutes % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    minutes += durationMin
  }
  return slots
}

export function isPeakSlot(time: string, rule: { is_peak: boolean; peak_days?: number[]; peak_time_start?: string; peak_time_end?: string }, dayOfWeek: number): boolean {
  if (!rule.is_peak) return false
  if (rule.peak_days && !rule.peak_days.includes(dayOfWeek)) return false
  if (rule.peak_time_start && rule.peak_time_end) {
    return time >= rule.peak_time_start && time < rule.peak_time_end
  }
  return true
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
