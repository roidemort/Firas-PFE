import { NextFunction, Request, Response } from "express";
import { 
  createSubscription, 
  findSubscriptionById,
  saveSubscription 
} from "@/services/subscription.service";
import { findUserById } from "@/services/user.service";
import { findPackageById } from "@/services/package.service";
import { createNotification } from "@/services/notification.service";

/**
 * TEMPORARY: Payment notification from bank
 */
export const handlePaymentNotification = async (req: Request, res: Response, next: NextFunction) => {
  console.log('=== PAYMENT NOTIFICATION FROM BANK ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Method:', req.method);
  console.log('======================================');
  
  // IMPORTANT: Log this to a file for debugging
  // Tunisie Monétique will call this with payment results
  
  // ALWAYS return 200 OK to bank
  return res.status(200).send('OK');
};

/**
 * Create a subscription (pharmacien calls this)
 */
export const createSubscriptionWithPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { packageId, durationMonths = 1 } = req.body;
    
    // Get user ID from JWT payload (not req.user!)
    const buyerId = req.jwtPayload.id;
    
    if (!buyerId) {
      return res.customSuccess(401, 'Authentication required', {}, false);
    }

    // Verify user is pharmacien titulaire
    const user = await findUserById(buyerId);
    if (!user || user.role !== 'PHARMACIST_HOLDER') {
      return res.customSuccess(403, 'Only pharmacy owners can purchase subscriptions', {}, false);
    }

    // Get package
    const packageItem = await findPackageById(packageId);
    if (!packageItem) {
      return res.customSuccess(404, 'Package not found', {}, false);
    }

    // Create subscription with PENDING status (0)
    const subscription = await createSubscription({
      status: 0, // 0 = pending payment
      startedAt: null,
      endedAt: null,
      usersNumber: 1,
      paymentMethod: 'TUNISIE_MONETIQUE',
      buyer: user,
      package: packageItem,
      users: [user],
      secure_url: null,
      public_id: null
    });

    // For now, just return subscription info
    // When we get Tunisie Monétique API, we'll generate payment URL here
    
    return res.customSuccess(200, 'Subscription created. Payment integration pending.', {
      subscriptionId: subscription.id,
      status: 'pending_payment',
      package: packageItem.name,
      price: packageItem.price,
      message: 'Waiting for Tunisie Monétique API integration',
      nextSteps: [
        '1. Submit bank form with notification URLs',
        '2. Get API credentials from Tunisie Monétique',
        '3. Implement payment redirection'
      ]
    }, true);

  } catch (error: any) {
    console.error('Create subscription error:', error);
    return res.customSuccess(500, 'Error creating subscription: ' + error.message, {}, false);
  }
};

/**
 * Check subscription payment status
 */
export const getSubscriptionPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.jwtPayload.id;

    const subscription = await findSubscriptionById(subscriptionId, ['buyer', 'package']);
    if (!subscription) {
      return res.customSuccess(404, 'Subscription not found', {}, false);
    }

    // Verify ownership
    if (subscription.buyer.id !== userId) {
      return res.customSuccess(403, 'Access denied', {}, false);
    }

    // Status mapping
    const statusText = {
      0: 'pending_payment',
      1: 'active',
      2: 'expired', 
      3: 'cancelled'
    }[subscription.status] || 'unknown';

    return res.customSuccess(200, 'Subscription status', {
      subscriptionId: subscription.id,
      status: statusText,
      numericStatus: subscription.status,
      paymentMethod: subscription.paymentMethod,
      packageName: subscription.package?.name,
      startedAt: subscription.startedAt,
      endedAt: subscription.endedAt,
      createdAt: subscription.createdAt
    }, true);

  } catch (error: any) {
    console.error('Get status error:', error);
    return res.customSuccess(500, 'Error: ' + error.message, {}, false);
  }
};

/**
 * Test endpoint to simulate bank notification (for development)
 */
export const testPaymentNotification = async (req: Request, res: Response, next: NextFunction) => {
  // This is ONLY for testing - simulate what Tunisie Monétique will send
  
  const testData = {
    TransactionId: `test_${Date.now()}`,
    Amount: '70.000',
    Currency: '788',
    ResponseCode: '00', // 00 = success
    ApprovalCode: 'TEST123',
    MerchantID: 'TEST_MERCHANT',
    CustomerEmail: 'test@example.com',
    Signature: 'test_signature'
  };

  console.log('=== TEST PAYMENT NOTIFICATION ===');
  console.log('Simulating bank callback with:', testData);
  
  // You can add logic here to test updating a subscription
  // For now, just return success
  
  return res.customSuccess(200, 'Test notification received', {
    simulatedData: testData,
    note: 'This is just a test. Real bank integration pending.'
  }, true);
};