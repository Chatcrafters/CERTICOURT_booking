export const translations = {
  de: {
    nav: { home: 'Start', discover: 'Entdecken', book: 'Buchen', agenda: 'Agenda', account: 'Konto' },
    home: { welcome: 'Willkommen,', bookings: 'Buchungen', wallet: 'Guthaben', bookNow: 'Jetzt buchen', myCourts: 'Meine Buchungen', available: 'Verfügbare Courts' },
    booking: { selectDate: 'Datum wählen', selectTime: 'Zeit wählen', selectTariff: 'Tarif wählen', summary: 'Zusammenfassung', confirm: 'Jetzt buchen', available: 'Verfügbar', taken: 'Belegt', peak: 'Peak', from: 'ab', pay: 'Bezahlen' },
    pin: { title: 'Buchung bestätigt!', yourPin: 'Dein Zugangscode', valid: 'Gültig', court: 'Court', backHome: 'Zurück zum Start' },
    auth: { login: 'Anmelden', register: 'Registrieren', email: 'E-Mail', password: 'Passwort', name: 'Name' },
    operator: { dashboard: 'Dashboard', courts: 'Courts', bookings: 'Buchungen', members: 'Mitglieder', sponsoring: 'Sponsoring', revenue: 'Einnahmen', occupancy: 'Auslastung', today: 'Heute' },
    sponsoring: { contracts: 'Verträge', available: 'Verfügbar', expiresIn: 'läuft ab in', days: 'Tagen', renew: 'Verlängern' },
    common: { loading: 'Laden...', error: 'Fehler', save: 'Speichern', cancel: 'Abbrechen', back: 'Zurück', next: 'Weiter', confirm: 'Bestätigen' }
  },
  es: {
    nav: { home: 'Inicio', discover: 'Descubrir', book: 'Reservar', agenda: 'Agenda', account: 'Mi cuenta' },
    home: { welcome: 'Bienvenido,', bookings: 'Reservas', wallet: 'Monedero', bookNow: 'Reservar ahora', myCourts: 'Mis reservas', available: 'Courts disponibles' },
    booking: { selectDate: 'Seleccionar fecha', selectTime: 'Seleccionar hora', selectTariff: 'Seleccionar tarifa', summary: 'Resumen', confirm: 'Confirmar reserva', available: 'Disponible', taken: 'No disponible', peak: 'Peak', from: 'desde', pay: 'Pagar' },
    pin: { title: '¡Reserva confirmada!', yourPin: 'Tu PIN de acceso', valid: 'Válido', court: 'Court', backHome: 'Volver al inicio' },
    auth: { login: 'Iniciar sesión', register: 'Registrarse', email: 'Correo electrónico', password: 'Contraseña', name: 'Nombre' },
    operator: { dashboard: 'Panel', courts: 'Pistas', bookings: 'Reservas', members: 'Miembros', sponsoring: 'Patrocinios', revenue: 'Ingresos', occupancy: 'Ocupación', today: 'Hoy' },
    sponsoring: { contracts: 'Contratos', available: 'Disponible', expiresIn: 'vence en', days: 'días', renew: 'Renovar' },
    common: { loading: 'Cargando...', error: 'Error', save: 'Guardar', cancel: 'Cancelar', back: 'Volver', next: 'Siguiente', confirm: 'Confirmar' }
  }
}

export type Lang = keyof typeof translations

export function t(lang: Lang) {
  return translations[lang] ?? translations['es']
}