const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

interface WhatsAppMessage {
  to: string
  template?: { name: string; language: string; components?: any[] }
  text?: string
}

async function sendRequest(endpoint: string, body: object) {
  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WhatsApp API error: ${res.status} ${err}`)
  }
  return res.json()
}

export async function sendBookingConfirmation(phone: string, params: {
  playerName: string
  courtName: string
  date: string
  time: string
  pinCode: string
  centerName: string
}) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'booking_confirmation',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.playerName },
            { type: 'text', text: params.courtName },
            { type: 'text', text: params.date },
            { type: 'text', text: params.time },
            { type: 'text', text: params.pinCode },
            { type: 'text', text: params.centerName },
          ],
        },
      ],
    },
  })
}

export async function sendBookingReminder(phone: string, params: {
  playerName: string
  courtName: string
  time: string
  pinCode: string
}) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'booking_reminder',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.playerName },
            { type: 'text', text: params.courtName },
            { type: 'text', text: params.time },
            { type: 'text', text: params.pinCode },
          ],
        },
      ],
    },
  })
}

export async function sendBookingCancellation(phone: string, params: {
  playerName: string
  courtName: string
  date: string
  time: string
}) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'booking_cancellation',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.playerName },
            { type: 'text', text: params.courtName },
            { type: 'text', text: params.date },
            { type: 'text', text: params.time },
          ],
        },
      ],
    },
  })
}

export async function sendTextMessage(phone: string, message: string) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { preview_url: false, body: message },
  })
}
