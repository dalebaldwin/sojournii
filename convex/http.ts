import { httpRouter } from 'convex/server'
import { resendWebhook } from './resend'

const http = httpRouter()

// Resend webhook endpoint
http.route({
  path: '/resend-webhook',
  method: 'POST',
  handler: resendWebhook,
})

export default http
