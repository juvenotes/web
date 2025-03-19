import MpesaService from '#services/mpesa_service'
// import PaystackService from '#services/paystack_service' // Will add later
import { PaymentServiceInterface } from '#services/payment_service_interface'

export class PaymentServiceFactory {
  static getPaymentService(provider: string): PaymentServiceInterface {
    switch (provider.toLowerCase()) {
      case 'mpesa':
        return new MpesaService()
      // case 'paystack':
      //   return new PaystackService()
      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }
  }
}
