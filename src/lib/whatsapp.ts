const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM!

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

export async function sendBookingConfirmation(params: {
  phone: string
  pin: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  centerName: string
  totalPrice: string
}) {
  const body = [
    `CertiCourt - Reserva confirmada`,
    ``,
    `Court: ${params.courtName}`,
    `Centro: ${params.centerName}`,
    `Fecha: ${fmtDate(params.date)}`,
    `Hora: ${params.startTime} - ${params.endTime}`,
    `Precio: ${params.totalPrice}`,
    ``,
    `Tu PIN de acceso: ${params.pin}`,
    ``,
    `Presenta este codigo en la puerta del court. Buen partido!`,
  ].join('\n')

  return sendWhatsApp(params.phone, body)
}

export async function sendBookingCancellation(params: {
  phone: string
  courtName: string
  date: string
  startTime: string
  centerName: string
}) {
  const body = [
    `CertiCourt - Reserva cancelada`,
    ``,
    `Court: ${params.courtName}`,
    `Centro: ${params.centerName}`,
    `Fecha: ${fmtDate(params.date)}`,
    `Hora: ${params.startTime}`,
    ``,
    `Tu reserva ha sido cancelada. Si fue un error, reserva de nuevo en la app.`,
  ].join('\n')

  return sendWhatsApp(params.phone, body)
}

export async function sendBookingReminder(params: {
  phone: string
  pin: string
  courtName: string
  startTime: string
  centerName: string
}) {
  const body = [
    `CertiCourt - Recordatorio`,
    ``,
    `Tu reserva en ${params.courtName} (${params.centerName}) empieza a las ${params.startTime}.`,
    ``,
    `PIN de acceso: ${params.pin}`,
    ``,
    `Nos vemos en la pista!`,
  ].join('\n')

  return sendWhatsApp(params.phone, body)
}

async function sendWhatsApp(phone: string, message: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`
  const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')

  const formBody = new URLSearchParams({
    From: `whatsapp:${FROM_NUMBER}`,
    To: `whatsapp:${phone}`,
    Body: message,
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Twilio error ${res.status}: ${err}`)
  }

  return res.json()
}
