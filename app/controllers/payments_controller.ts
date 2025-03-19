import type { HttpContext } from '@adonisjs/core/http'
import { PaymentServiceFactory } from '#services/payment_service_factory'

export default class PaymentsController {
  /**
   * Show test page for M-Pesa
   */
  async showMpesaTestPage({ inertia }: HttpContext) {
    return inertia.render('test/mpesa')
  }

  /**
   * Process M-Pesa payment
   */
  async processMpesaPayment({ request, response }: HttpContext) {
    const { phone, amount } = request.only(['phone', 'amount'])

    try {
      const paymentService = PaymentServiceFactory.getPaymentService('mpesa')
      const result = await paymentService.initiatePayment({ phone, amount })

      return response.status(201).json({
        message: 'Success',
        data: result,
      })
    } catch (error: any) {
      return response.status(500).json({
        message: 'Failed',
        error: error.message,
      })
    }
  }

  /**
   * Verify M-Pesa payment status
   */
  async verifyMpesaPayment({ request, response }: HttpContext) {
    const { checkoutRequestID } = request.only(['checkoutRequestID'])

    try {
      const paymentService = PaymentServiceFactory.getPaymentService('mpesa')
      const result = await paymentService.verifyPayment(checkoutRequestID)

      return response.status(200).json({
        message: 'Success',
        data: result,
      })
    } catch (error: any) {
      return response.status(500).json({
        message: 'Failed',
        error: error.message,
      })
    }
  }
}
