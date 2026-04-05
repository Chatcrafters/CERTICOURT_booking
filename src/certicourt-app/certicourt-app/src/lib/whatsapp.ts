const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID!
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN!
const TWILIO_FROM = process.env.TWILIO_WHATSAPP_FROM!

export async function sendBookingConfirmation({
  to,
  pin,
  courtName,
  date,
  startTime,
  endTime,
  centerName,
  totalPrice,
}: {
  to: string
  pin: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  centerName: string
  totalPrice: number
}) {
  const message = 
`*CERTICOURT — Reserva confirmada*

*Court:* ${courtName}
*Centro:* ${centerName}
*Fecha:* ${date}
*Horario:* ${startTime} - ${endTime}
*Pagado:* ${totalPrice.toFixed(2)} EUR

*Tu PIN de acceso:*
*${pin}*

Introduce el PIN en el teclado de la puerta para acceder. El PIN se desactiva automaticamente al finalizar tu sesion.

certicourt-booking.vercel.app`

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`

  const body = new URLSearchParams({
    From: `whatsapp:${TWILIO_FROM}`,
    To: `whatsapp:${to}`,
    Body: message,
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('WhatsApp send error:', data)
    return { success: false, error: data }
  }

  return { success: true, sid: data.sid }
}
