export async function sendBookingEmail(params: {
  to: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  centerName: string
  totalPrice: number
  pin: string
}) {
  const html = `
    <h2>CERTICOURT - Reserva confirmada</h2>
    <p><strong>Court:</strong> ${params.courtName}</p>
    <p><strong>Centro:</strong> ${params.centerName}</p>
    <p><strong>Fecha:</strong> ${params.date}</p>
    <p><strong>Hora:</strong> ${params.startTime} - ${params.endTime}</p>
    <p><strong>Precio:</strong> ${params.totalPrice.toFixed(2)} EUR</p>
    <h1 style="color:#1E54D0;letter-spacing:8px">${params.pin}</h1>
    <p>Presenta este PIN en la puerta del court.</p>
  `
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'reservas@certicourt.com',
      to: params.to,
      subject: 'CERTICOURT - Reserva confirmada - PIN: ' + params.pin,
      html,
    }),
  })
}
