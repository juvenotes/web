export interface PaymentServiceInterface {
  initiatePayment(options: Record<string, any>): Promise<any>
  verifyPayment(reference: string): Promise<any>
}
