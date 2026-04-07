import { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const defaults = (size = 24): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
})

export function IconHome({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/></svg>
}

export function IconSearch({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
}

export function IconRacket({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><circle cx="12" cy="9" r="7"/><path d="M12 16v5"/><path d="M8 5l8 8M8 13l8-8"/></svg>
}

export function IconCalendar({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
}

export function IconUser({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

export function IconKey({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
}

export function IconCreditCard({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
}

export function IconMap({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3V6z"/><path d="M8 3v15M16 6v15"/></svg>
}

export function IconCourt({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><circle cx="12" cy="9" r="7"/><path d="M12 16v5"/><path d="M9 6a6 6 0 006 6"/></svg>
}

export function IconPin({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
}

export function IconTicket({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M2 9a3 3 0 013 3 3 3 0 01-3 3v4h20v-4a3 3 0 010-6V5H2v4z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>
}

export function IconBuilding({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>
}

export function IconGear({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
}

export function IconLogout({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
}

export function IconStar({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
}

export function IconWarning({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
}

export function IconClipboard({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
}

export function IconUsers({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
}

export function IconMoney({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
}

export function IconMegaphone({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>
}

export function IconCheck({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M20 6L9 17l-5-5"/></svg>
}

export function IconBell({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
}

export function IconClock({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
}

export function IconRepeat({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
}

export function IconWallet({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/><circle cx="18" cy="15" r="1"/></svg>
}

export function IconGift({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18"/><path d="M12 8a4 4 0 00-4-4c-1.5 0-3 1.5-3 3s3 1 7 1"/><path d="M12 8a4 4 0 014-4c1.5 0 3 1.5 3 3s-3 1-7 1"/></svg>
}

export function IconRefund({ size, ...p }: IconProps) {
  return <svg {...defaults(size)} {...p}><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 010 8h-1"/></svg>
}
