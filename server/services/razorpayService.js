const crypto = require('crypto');
const Razorpay = require('razorpay');

const hasRazorpayKeys =
  Boolean(process.env.RAZORPAY_KEY_ID) &&
  Boolean(process.env.RAZORPAY_KEY_SECRET);

if (!hasRazorpayKeys) {
  console.error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined in .env file');
}

const razorpay = hasRazorpayKeys
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const razorpayService = {
  createOrder: async (registrationData) => {
    try {
      if (!hasRazorpayKeys || !razorpay) {
        throw new Error(
          'Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file'
        );
      }

      const {
        eventTitle,
        eventId,
        participantName,
        participantEmail,
        teamName,
        registrationFee,
        teamMembers,
      } = registrationData;

      const order = await razorpay.orders.create({
        amount: Math.round(registrationFee * 100),
        currency: 'INR',
        receipt: `event_${eventId}_${Date.now()}`.slice(0, 40),
        notes: {
          eventId,
          eventTitle,
          participantName,
          participantEmail,
          teamName,
          teamMembersCount: String(teamMembers.length),
        },
      });

      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  verifyPaymentSignature: (orderId, paymentId, signature) => {
    try {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay secret key is not configured');
      }

      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      console.error('Razorpay signature verification error:', error);
      return false;
    }
  },

  fetchPayment: async (paymentId) => {
    try {
      if (!hasRazorpayKeys || !razorpay) {
        throw new Error(
          'Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file'
        );
      }

      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error('Razorpay fetch payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  fetchOrder: async (orderId) => {
    try {
      if (!hasRazorpayKeys || !razorpay) {
        throw new Error(
          'Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file'
        );
      }

      const order = await razorpay.orders.fetch(orderId);
      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('Razorpay fetch order error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

module.exports = razorpayService;
