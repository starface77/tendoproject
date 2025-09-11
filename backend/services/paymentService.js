/**
 * 💳 PAYMENT SERVICE FOR UZBEKISTAN
 * Integrations with Payme, Click, and other payment systems
 */

const crypto = require('crypto');
const axios = require('axios');

// Payment Methods Configuration
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  PAYME: 'payme',
  CLICK: 'click',
  UZCARD: 'uzcard',
  HUMO: 'humo'
};

// Payment Statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

class PaymentService {
  constructor() {
    this.payme = {
      merchantId: process.env.PAYME_MERCHANT_ID,
      secretKey: process.env.PAYME_SECRET_KEY,
      endpoint: process.env.PAYME_ENDPOINT || 'https://checkout.paycom.uz'
    };
    
    this.click = {
      merchantId: process.env.CLICK_MERCHANT_ID,
      secretKey: process.env.CLICK_SECRET_KEY,
      serviceId: process.env.CLICK_SERVICE_ID,
      endpoint: process.env.CLICK_ENDPOINT || 'https://api.click.uz/v2'
    };
  }

  /**
   * 🎯 PAYME INTEGRATION
   */
  
  // Generate Payme payment URL
  generatePaymeUrl(order) {
    const { _id, pricing, totalAmount, customer } = order;
    const amount = Math.round((pricing?.total || totalAmount || 0) * 100); // Payme expects amount in tiyin (1 sum = 100 tiyin)
    
    const params = {
      'm': this.payme.merchantId,
      'ac.order_id': _id.toString(),
      'a': amount,
      'c': customer?.phone || customer?.email || '',
      'l': 'ru', // Language
      'cr': 'uzs' // Currency
    };

    console.log('🔗 Payme URL params:', {
      merchantId: this.payme.merchantId,
      orderId: _id.toString(),
      amount: amount,
      customer: customer?.phone || customer?.email
    });

    const queryString = new URLSearchParams(params).toString();
    return `${this.payme.endpoint}?${queryString}`;
  }

  // Verify Payme transaction
  async verifyPaymeTransaction(transactionId, orderId) {
    try {
      const response = await axios.post(`${this.payme.endpoint}/api`, {
        method: 'CheckTransaction',
        params: {
          id: transactionId
        }
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`Paycom:${this.payme.secretKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.data.result ? true : false,
        data: response.data.result,
        error: response.data.error
      };
    } catch (error) {
      console.error('Payme verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 💎 CLICK INTEGRATION
   */
  
  // Generate Click payment URL
  generateClickUrl(order) {
    const { _id, pricing, totalAmount, customer } = order;
    const amount = pricing?.total || totalAmount || 0;
    
    const params = {
      service_id: this.click.serviceId,
      merchant_id: this.click.merchantId,
      amount: amount,
      transaction_param: _id.toString(),
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      merchant_user_id: customer?._id?.toString() || 'guest'
    };

    console.log('🔗 Click URL params:', {
      serviceId: this.click.serviceId,
      merchantId: this.click.merchantId,
      orderId: _id.toString(),
      amount: amount
    });

    const queryString = new URLSearchParams(params).toString();
    return `${this.click.endpoint}/services/pay?${queryString}`;
  }

  // Verify Click transaction signature
  verifyClickSignature(params) {
    const { click_trans_id, service_id, click_paydoc_id, merchant_trans_id, amount, action, error, error_note, sign_time, sign_string } = params;
    
    const signString = `${click_trans_id}${service_id}${this.click.secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
    const md5Hash = crypto.createHash('md5').update(signString).digest('hex');
    
    return md5Hash === sign_string;
  }

  // Process Click payment
  async processClickPayment(params) {
    const { action, merchant_trans_id, amount, error } = params;
    
    try {
      if (action === 0) {
        // Prepare transaction
        return {
          click_trans_id: params.click_trans_id,
          merchant_trans_id: merchant_trans_id,
          merchant_prepare_id: Date.now(),
          error: error || 0,
          error_note: error ? 'Transaction error' : 'Success'
        };
      } else if (action === 1) {
        // Complete transaction
        return {
          click_trans_id: params.click_trans_id,
          merchant_trans_id: merchant_trans_id,
          merchant_confirm_id: Date.now(),
          error: error || 0,
          error_note: error ? 'Transaction error' : 'Success'
        };
      }
    } catch (error) {
      console.error('Click payment processing error:', error);
      return {
        error: -1,
        error_note: 'Internal server error'
      };
    }
  }

  /**
   * 🔧 UTILITY METHODS
   */

  // Get available payment methods
  getAvailablePaymentMethods() {
    return [
      {
        id: PAYMENT_METHODS.CASH,
        name: {
          ru: 'Наличный расчет при доставке',
          uz: 'Yetkazib berishda naqd to\'lov',
          en: 'Cash on Delivery'
        },
        icon: '💵',
        fee: 0,
        enabled: true
      },
      {
        id: PAYMENT_METHODS.PAYME,
        name: {
          ru: 'Payme',
          uz: 'Payme',
          en: 'Payme'
        },
        icon: '📱',
        fee: 0,
        enabled: !!(this.payme.merchantId && this.payme.secretKey)
      },
      {
        id: PAYMENT_METHODS.CLICK,
        name: {
          ru: 'Click',
          uz: 'Click',
          en: 'Click'
        },
        icon: '💳',
        fee: 0,
        enabled: !!(this.click.merchantId && this.click.secretKey)
      },
      {
        id: PAYMENT_METHODS.UZCARD,
        name: {
          ru: 'UzCard',
          uz: 'UzCard',
          en: 'UzCard'
        },
        icon: '💳',
        fee: 0,
        enabled: true
      },
      {
        id: PAYMENT_METHODS.HUMO,
        name: {
          ru: 'Humo',
          uz: 'Humo',
          en: 'Humo'
        },
        icon: '💳',
        fee: 0,
        enabled: true
      }
    ];
  }

  // Calculate payment fee
  calculatePaymentFee(amount, paymentMethod) {
    const fees = {
      [PAYMENT_METHODS.CASH]: 0,
      [PAYMENT_METHODS.PAYME]: 0, // Payme usually doesn't charge customers
      [PAYMENT_METHODS.CLICK]: amount * 0.01, // 1% fee for Click
      [PAYMENT_METHODS.UZCARD]: 0,
      [PAYMENT_METHODS.HUMO]: 0,
      [PAYMENT_METHODS.CARD]: amount * 0.015 // 1.5% for generic cards
    };

    return fees[paymentMethod] || 0;
  }

  // Create payment session
  async createPaymentSession(order, paymentMethod) {
    try {
      let paymentUrl = null;
      let sessionData = {
        orderId: order._id,
        paymentMethod,
        amount: order.pricing.total,
        currency: 'UZS',
        status: PAYMENT_STATUS.PENDING,
        createdAt: new Date()
      };

      switch (paymentMethod) {
        case PAYMENT_METHODS.PAYME:
          paymentUrl = this.generatePaymeUrl(order);
          break;
          
        case PAYMENT_METHODS.CLICK:
          paymentUrl = this.generateClickUrl(order);
          break;
          
        case PAYMENT_METHODS.CASH:
          // No URL needed for cash payments
          sessionData.status = PAYMENT_STATUS.PENDING;
          break;
          
        default:
          // For other methods, create a generic payment session
          sessionData.status = PAYMENT_STATUS.PENDING;
      }

      return {
        success: true,
        session: sessionData,
        paymentUrl,
        paymentMethod: this.getPaymentMethodInfo(paymentMethod)
      };
      
    } catch (error) {
      console.error('Payment session creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get payment method information
  getPaymentMethodInfo(paymentMethod) {
    const methods = this.getAvailablePaymentMethods();
    return methods.find(method => method.id === paymentMethod) || null;
  }

  // Process webhook notification
  async processWebhookNotification(provider, data) {
    try {
      switch (provider) {
        case 'payme':
          return await this.processPaymeWebhook(data);
          
        case 'click':
          return await this.processClickWebhook(data);
          
        default:
          return {
            success: false,
            error: 'Unknown payment provider'
          };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process Payme webhook
  async processPaymeWebhook(data) {
    // Implement Payme webhook processing logic
    const { method, params } = data;
    
    switch (method) {
      case 'CheckPerformTransaction':
        // Check if transaction can be performed
        return { result: { allow: true } };
        
      case 'CreateTransaction':
        // Create transaction
        return { result: { transaction: params.id, state: 1 } };
        
      case 'PerformTransaction':
        // Perform transaction
        return { result: { transaction: params.id, state: 2 } };
        
      case 'CancelTransaction':
        // Cancel transaction
        return { result: { transaction: params.id, state: -1 } };
        
      default:
        return { error: { code: -32601, message: 'Method not found' } };
    }
  }

  // Process Click webhook
  async processClickWebhook(data) {
    if (!this.verifyClickSignature(data)) {
      return {
        success: false,
        error: 'Invalid signature'
      };
    }

    return await this.processClickPayment(data);
  }
}

// Export payment statuses and methods for use in other modules
module.exports = {
  PaymentService,
  PAYMENT_METHODS,
  PAYMENT_STATUS
};

