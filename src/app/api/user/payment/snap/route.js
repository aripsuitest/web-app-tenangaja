import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { snap } from '@/lib/midtrans';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project with payment information
    const project = await prisma.order.findUnique({
      where: { id: projectId },
      include: {
        worker: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        payment: true // Include payment information
      }
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.payment) {
      if (project.payment.status === 'PENDING') {
        return NextResponse.json({
          message: 'Existing payment found',
          snapToken: project.payment.snapToken,
          snapRedirectUrl: project.payment.redirectUrl,
          paymentId: project.payment.id,
          isExisting: true
        });
      }
      return NextResponse.json(
        { message: 'Payment already completed for this project' },
        { status: 400 }
      );
    }

    // Validate project status and ownership
    if (project.userId !== user.id || project.status !== 'ACCEPTED') {
      return NextResponse.json(
        { message: 'Project not eligible for payment' },
        { status: 400 }
      );
    }

    // Validate and format price
    const grossAmount = Math.round(Number(project.budget));
    if (isNaN(grossAmount) || grossAmount <= 0) {
      return NextResponse.json(
        { message: 'Invalid project price' },
        { status: 400 }
      );
    }

    // Get complete user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userData) {
      return NextResponse.json(
        { message: 'User data not found' },
        { status: 404 }
      );
    }

    const midtransOrderId = `PRJ-${projectId.slice(0, 8)}-${Date.now()}`;

    // Prepare Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: userData.name.split(' ')[0] || 'Customer',
        last_name: userData.name.split(' ')[1] || '',
        email: userData.email,
        phone: userData.phone || ''
      },
      item_details: [
        {
          id: projectId.slice(0, 50),
          price: grossAmount,
          quantity: 1,
          name: `Project: ${(project.notes || 'Untitled').slice(0, 50)}`,
          category: 'Services'
        }
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}?payment=success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}?payment=failed`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/projects/${projectId}?payment=pending`
      },
      expiry: {
        unit: 'hours',
        duration: 24 // Payment expires in 24 hours
      }
    };

    // Create Snap transaction
    const transaction = await snap.createTransaction(parameter);

    // Save payment record to database
    const payment = await prisma.payment.create({
      data: {
        orderId: projectId,
        userId: user.id,
        method: 'MIDTRANS',
        amount: grossAmount,
        status: 'PENDING',
        paymentReference: midtransOrderId,
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url
      }
    });

    return NextResponse.json({
      message: 'Payment token generated',
      snapToken: transaction.token,
      snapRedirectUrl: transaction.redirect_url,
      paymentId: payment.id,
      isExisting: false
    });

  } catch (error) {
    console.error('Midtrans error:', error);
    
    // Handle Midtrans-specific errors
    const errorMessage = error.ApiResponse?.error_messages?.[0] || 
                        error.message || 
                        'Payment processing failed';
    
    return NextResponse.json(
      { 
        message: 'Payment processing failed',
        error: errorMessage 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}