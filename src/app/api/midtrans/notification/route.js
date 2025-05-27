import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Verify notification with Midtrans
    const status = await snap.transaction.notification(body);

    const orderId = status.order_id;
    const transactionStatus = status.transaction_status;
    const fraudStatus = status.fraud_status;

    // Update payment status based on notification
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        await updatePaymentStatus(orderId, 'PAID');
      } else if (fraudStatus === 'accept') {
        await updatePaymentStatus(orderId, 'PAID');
      }
    } else if (transactionStatus === 'settlement') {
      await updatePaymentStatus(orderId, 'PAID');
    } else if (transactionStatus === 'cancel' ||
               transactionStatus === 'deny' ||
               transactionStatus === 'expire') {
      await updatePaymentStatus(orderId, 'FAILED');
    } else if (transactionStatus === 'pending') {
      await updatePaymentStatus(orderId, 'PENDING');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Notification handler error:', error);
    return NextResponse.json(
      { message: 'Notification processing failed', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function updatePaymentStatus(orderId, status) {
  await prisma.payment.updateMany({
    where: { paymentReference: orderId },
    data: { 
      status,
      paidAt: status === 'PAID' ? new Date() : undefined
    }
  });

  if (status === 'PAID') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' }
    });

    // adding the notification to the user and worker
    const payment_ = await prisma.payment.findMany({
      where:{
        paymentReference: orderId
      }
    })

    if(payment_.length > 0){
      const order = await prisma.order.findUnique({
        where:{
          id: payment_[0].orderId
        }
      });
      if(order){
        await prisma.notification.create({
          data: {
            userId: order.userId,
            message: `Your payment for project ${order.notes} succesfuly created!`,
            read: false
          }
        });

        await prisma.notification.create({
          data: {
            workerId: order.workerId,
            message: `Your client succesfuly completed the payment for project ${order.notes}!`,
            read: false
          }
        });
      }
    }
  }
}