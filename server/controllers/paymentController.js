const Registration = require('../models/Registration');
const Event = require('../models/Event');
const razorpayService = require('../services/razorpayService');

const incrementEventRegistrations = async (eventId) => {
  await Event.findByIdAndUpdate(eventId, {
    $inc: { totalRegistrations: 1 },
  });
};

// Create Razorpay order
const createCheckoutSession = async (req, res) => {
  try {
    const { eventSlug, teamName, leaderContactNo, teamMembers } = req.body;
    const participantId = req.user.id;
    const participantEmail = req.user.email;
    const participantName = req.user.name;

    if (
      !eventSlug ||
      !teamName ||
      !leaderContactNo ||
      !teamMembers ||
      teamMembers.length === 0
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const event = await Event.findOne({ slug: eventSlug, isPublished: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    if (
      teamMembers.length < event.teamMinSize ||
      teamMembers.length > event.teamMaxSize
    ) {
      return res.status(400).json({
        message: `Team size must be between ${event.teamMinSize} and ${event.teamMaxSize}`,
      });
    }

    const existingRegistration = await Registration.findOne({
      event: event._id,
      participant: participantId,
    });

    if (existingRegistration) {
      return res.status(409).json({ message: 'Already registered for this event' });
    }

    const registration = new Registration({
      event: event._id,
      participant: participantId,
      teamName,
      leaderContactNo: leaderContactNo.trim(),
      teamMembers,
      registrationFee: event.registrationFee,
      paymentStatus: 'Pending',
      approvalStatus: 'Pending',
    });

    await registration.save();

    const orderResult = await razorpayService.createOrder({
      eventTitle: event.title,
      eventId: event._id.toString(),
      participantName,
      participantEmail,
      teamName,
      registrationFee: event.registrationFee,
      teamMembers,
    });

    if (!orderResult.success) {
      await Registration.findByIdAndDelete(registration._id);

      return res.status(500).json({
        message: 'Failed to create Razorpay order: ' + (orderResult.error || 'Unknown error'),
        error: orderResult.error,
      });
    }

    registration.razorpayOrderId = orderResult.order.id;
<<<<<<< HEAD

    if (orderResult.mockOrder) {
      registration.paymentStatus = 'Completed';
      registration.razorpayPaymentId = `mock_payment_${Date.now()}`;
      registration.razorpaySignature = 'mock_signature';
      await registration.save();
      await incrementEventRegistrations(registration.event._id);

      return res.json({
        message: 'Demo payment mode enabled. Registration completed without Razorpay.',
        mockPayment: true,
        orderId: orderResult.order.id,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'demo',
        registrationId: registration._id,
        eventTitle: event.title,
        participant: {
          name: participantName,
          email: participantEmail,
        },
      });
    }

=======
>>>>>>> 71867d3cf50f05bb533d8b39897b37395560e685
    await registration.save();

    res.json({
      message: 'Razorpay order created',
      orderId: orderResult.order.id,
      amount: orderResult.order.amount,
      currency: orderResult.order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      registrationId: registration._id,
      eventTitle: event.title,
      participant: {
        name: participantName,
        email: participantEmail,
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      message: 'Error creating Razorpay order: ' + error.message,
      error: error.message,
    });
  }
};

// Verify successful Razorpay payment
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;
    const participantId = req.user.id;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'Missing Razorpay payment details' });
    }

    const registration = await Registration.findOne({
      razorpayOrderId: orderId,
      participant: participantId,
    })
      .populate('event', 'title slug')
      .populate('participant', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.paymentStatus === 'Completed') {
      return res.json({
        message: 'Payment already verified',
        registration,
      });
    }

<<<<<<< HEAD
    if (orderId?.startsWith('mock_order_')) {
      registration.paymentStatus = 'Completed';
      registration.razorpayPaymentId = paymentId || `mock_payment_${Date.now()}`;
      registration.razorpaySignature = signature || 'mock_signature';
      await registration.save();
      await incrementEventRegistrations(registration.event._id);
      return res.json({
        message: 'Demo payment verified successfully',
        registration,
      });
    }

=======
>>>>>>> 71867d3cf50f05bb533d8b39897b37395560e685
    const isValidSignature = razorpayService.verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValidSignature) {
      registration.paymentStatus = 'Failed';
      await registration.save();
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const paymentResult = await razorpayService.fetchPayment(paymentId);
    if (!paymentResult.success || paymentResult.payment.status !== 'captured') {
      registration.paymentStatus = 'Failed';
      await registration.save();
      return res.status(400).json({ message: 'Payment is not captured yet' });
    }

    registration.paymentStatus = 'Completed';
    registration.razorpayPaymentId = paymentId;
    registration.razorpaySignature = signature;
    await registration.save();

    await incrementEventRegistrations(registration.event._id);

    res.json({
      message: 'Payment verified successfully',
      registration,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Error verifying payment: ' + error.message });
  }
};

// Get payment/order details
const getPaymentSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const registration = await Registration.findOne({
      razorpayOrderId: sessionId,
      participant: req.user.id,
    })
      .populate('event', 'title slug')
      .populate('participant', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const orderResult = await razorpayService.fetchOrder(sessionId);
    if (!orderResult.success) {
      return res.status(500).json({ message: orderResult.error });
    }

    res.json({
      message: 'Payment details retrieved',
      session: {
        id: orderResult.order.id,
        status: registration.paymentStatus,
        amount_total: orderResult.order.amount,
        currency: orderResult.order.currency,
      },
      registration: {
        id: registration._id,
        teamName: registration.teamName,
        teamMembers: registration.teamMembers,
        event: registration.event,
        paymentStatus: registration.paymentStatus,
        approvalStatus: registration.approvalStatus,
      },
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ message: 'Error retrieving payment details' });
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
  getPaymentSessionDetails,
};
