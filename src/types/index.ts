export type UserRole = 'player' | 'operator' | 'investor' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'
export type PaymentMode = 'online' | 'on_site'
export type CourtStatus = 'active' | 'inactive' | 'maintenance'
export type SponsorCategory = 'courtnaming' | 'bande' | 'digitalbande' | 'bodenaufdruck' | 'eingang' | 'trikot' | 'online' | 'other'

export interface Center {
  id: string
  slug: string
  name: string
  name_de?: string
  name_es?: string
  address: string
  city: string
  country: string
  lat?: number
  lng?: number
  phone?: string
  email?: string
  logo_url?: string
  payment_mode: PaymentMode
  wpc_certified: boolean
  is_active: boolean
}

export interface Court {
  id: string
  center_id: string
  name: string
  display_name?: string
  wpc_id?: string
  sport: string
  floor_type?: string
  width_m?: number
  length_m?: number
  status: CourtStatus
  sort_order: number
}

export interface PricingRule {
  id: string
  center_id: string
  court_id?: string
  name: string
  name_de?: string
  name_es?: string
  price_per_slot: number
  duration_min: number
  is_peak: boolean
  peak_days?: number[]
  peak_time_start?: string
  peak_time_end?: string
  requires_membership: boolean
  requires_trainer: boolean
}

export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  role: UserRole
  preferred_lang: string
  wallet_balance: number
  home_center_id?: string
}

export interface Booking {
  id: string
  center_id: string
  court_id: string
  profile_id: string
  date: string
  start_time: string
  end_time: string
  duration_min: number
  status: BookingStatus
  payment_status: PaymentStatus
  payment_mode: PaymentMode
  base_price: number
  discount_pct: number
  discount_amount: number
  total_price: number
  pin_code?: string
  pin_valid_from?: string
  pin_valid_until?: string
  created_at: string
  // joined
  court?: Court
  center?: Center
}

export interface MembershipPlan {
  id: string
  center_id: string
  name: string
  name_de?: string
  name_es?: string
  price_monthly: number
  hours_monthly?: number
  discount_pct: number
  perks?: string[]
}

export interface Membership {
  id: string
  profile_id: string
  plan_id: string
  center_id: string
  status: string
  starts_at: string
  ends_at?: string
  hours_used: number
  plan?: MembershipPlan
}

export interface SponsoringContract {
  id: string
  spot_id: string
  center_id: string
  sponsor_name: string
  contact_name?: string
  contact_email?: string
  price_yearly: number
  starts_at: string
  ends_at: string
  notes?: string
  spot?: { name: string; category: SponsorCategory; court?: Court }
}
