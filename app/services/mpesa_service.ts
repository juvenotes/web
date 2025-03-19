import axios from 'axios'
import env from '#start/env'
import { DateTime } from 'luxon'
import { PaymentServiceInterface } from './payment_service_interface.js'

export default class MpesaService implements PaymentServiceInterface {
  /**
   * Generate access token for M-Pesa API
   */
  async generateToken(): Promise<string> {
    const CONSUMER_KEY = env.get('MPESA_CONSUMER_KEY')
    const CONSUMER_SECRET = env.get('MPESA_CONSUMER_SECRET')
    const URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')

    try {
      const response = await axios(URL, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      })
      return response.data.access_token
    } catch (error: any) {
      throw new Error(`Failed to generate access token: ${error.message}`)
    }
  }

  /**
   * Generate timestamp in format YYYYMMDDHHMMSS
   */
  generateTimestamp(): string {
    const now = DateTime.now()
    return now.toFormat('yyyyMMddHHmmss')
  }

  /**
   * Initiate payment with M-Pesa
   */
  async initiatePayment(options: { phone: string; amount: number }): Promise<any> {
    try {
      const token = await this.generateToken()
      const timestamp = this.generateTimestamp()
      const BUSINESS_SHORT_CODE = env.get('MPESA_BUSINESS_SHORT_CODE')
      const PASS_KEY = env.get('MPESA_PASS_KEY')

      const password = Buffer.from(BUSINESS_SHORT_CODE + PASS_KEY + timestamp).toString('base64')

      const payload = {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: options.amount,
        PartyA: options.phone,
        PartyB: BUSINESS_SHORT_CODE,
        PhoneNumber: options.phone,
        CallBackURL: env.get('MPESA_CALLBACK_URL'),
        AccountReference: 'Juvenotes',
        TransactionDesc: 'Payment',
      }

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      return response.data
    } catch (error: any) {
      throw new Error(`Failed to initiate M-Pesa payment: ${error.message}`)
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(checkoutRequestID: string): Promise<any> {
    try {
      const token = await this.generateToken()
      const timestamp = this.generateTimestamp()
      const BUSINESS_SHORT_CODE = env.get('MPESA_BUSINESS_SHORT_CODE')
      const PASS_KEY = env.get('MPESA_PASS_KEY')

      const password = Buffer.from(BUSINESS_SHORT_CODE + PASS_KEY + timestamp).toString('base64')

      const payload = {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      }

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      return response.data
    } catch (error: any) {
      throw new Error(`Failed to verify M-Pesa payment: ${error.message}`)
    }
  }
}
