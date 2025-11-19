/**
 * Payment Integration Service
 *
 * This service provides payment processing for the Abuja Realty AI platform.
 *
 * FUTURE IMPLEMENTATION:
 * - Integrate with Paystack (Nigerian payment gateway)
 * - Support for card payments, bank transfers, USSD
 * - Recurring payments for subscriptions
 * - Escrow service for property transactions
 * - Transaction fee collection (0.5-1%)
 *
 * SETUP INSTRUCTIONS:
 * 1. Sign up for Paystack at https://paystack.com
 * 2. Get your API keys (test and live)
 * 3. Install Paystack SDK: npm install paystack-sdk
 * 4. Configure webhook for payment notifications
 * 5. Set PAYSTACK_SECRET_KEY in .env
 */

import axios from 'axios';
import logger from '../config/logger';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaymentInitialization {
  reference: string;
  authorization_url: string;
  access_code: string;
}

export interface TransactionData {
  amount: number; // in kobo (smallest currency unit)
  email: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export class PaymentService {
  /**
   * Initialize a payment transaction
   *
   * @param data Transaction data
   * @returns Payment initialization response
   */
  async initializeTransaction(data: TransactionData): Promise<PaymentInitialization> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          amount: data.amount,
          email: data.email,
          reference: data.reference,
          callback_url: data.callback_url,
          metadata: data.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Payment initialized', { reference: response.data.data.reference });
      return response.data.data;
    } catch (error: any) {
      logger.error('Payment initialization failed', {
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   *
   * @param reference Payment reference
   * @returns Transaction verification status
   */
  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      logger.info('Payment verified', { reference, status: response.data.data.status });
      return response.data.data;
    } catch (error: any) {
      logger.error('Payment verification failed', {
        error: error.response?.data || error.message,
        reference,
      });
      throw error;
    }
  }

  /**
   * Calculate platform transaction fee
   *
   * @param propertyPrice Property price in Naira
   * @param feePercentage Fee percentage (default 0.75%)
   * @returns Fee amount in Naira
   */
  calculateTransactionFee(propertyPrice: number, feePercentage: number = 0.75): number {
    return Math.round(propertyPrice * (feePercentage / 100));
  }

  /**
   * Create a payment plan for property purchase
   *
   * @param propertyPrice Total property price
   * @param downPaymentPercentage Down payment percentage
   * @returns Payment plan details
   */
  createPaymentPlan(propertyPrice: number, downPaymentPercentage: number = 30) {
    const downPayment = Math.round(propertyPrice * (downPaymentPercentage / 100));
    const platformFee = this.calculateTransactionFee(propertyPrice);
    const legalFees = Math.round(propertyPrice * 0.015); // 1.5% legal fees
    const governorConsent = Math.round(propertyPrice * 0.04); // 4% governor's consent

    const totalInitialPayment = downPayment + platformFee + legalFees + governorConsent;
    const balance = propertyPrice - downPayment;

    return {
      property_price: propertyPrice,
      down_payment: downPayment,
      platform_fee: platformFee,
      legal_fees: legalFees,
      governor_consent: governorConsent,
      total_initial_payment: totalInitialPayment,
      balance: balance,
      payment_breakdown: {
        'Property Down Payment': downPayment,
        'Abuja Realty AI Fee': platformFee,
        'Legal Fees': legalFees,
        "Governor's Consent": governorConsent,
      },
    };
  }
}

export default new PaymentService();

// TODO: Future enhancements
// - Subscription billing for premium features
// - Split payments (to multiple stakeholders)
// - Refund processing
// - Payment analytics dashboard
// - Multi-currency support (NGN, USD, GBP)
