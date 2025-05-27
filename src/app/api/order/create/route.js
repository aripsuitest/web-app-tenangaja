import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userData) {
      return NextResponse.json(
        { message: 'User data not found' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const workerId = formData.get('workerId');
    const notes = formData.get('notes');
    const budget = formData.get('budget');
    const deadline = formData.get('deadline');
    const paymentMethod = formData.get('paymentMethod') || 'transfer';

    // Validate required fields
    if (!workerId || !budget) {
      return NextResponse.json(
        { message: 'Worker ID and budget are required' },
        { status: 400 }
      );
    }

    // Convert budget to number
    const budgetAmount = parseFloat(budget);
    if (isNaN(budgetAmount)) {
      return NextResponse.json(
        { message: 'Budget must be a valid number' },
        { status: 400 }
      );
    }

    // Verify worker exists
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { user: true }
    });

    if (!worker) {
      return NextResponse.json(
        { message: 'Worker not found' },
        { status: 404 }
      );
    }

    // Create order first
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        workerId: workerId,
        notes: notes,
        status: 'PENDING',
        budget: budgetAmount,
        deadline: Number(deadline)
      },
      include: {
        worker: {
          include: {
            user: true
          }
        }
      }
    });

    // Then create payment associated with the order
    // const newPayment = await prisma.payment.create({
    //   data: {
    //     orderId: newOrder.id,
    //     userId: user.id,
    //     method: paymentMethod,
    //     status: 'PENDING',
    //     amount: budgetAmount
    //   }
    // });

    // Create notification for worker
    await prisma.notification.create({
      data: {
        userId: worker.userId,
        message: `Anda memiliki order baru dari ${userData.name}`,
        workerId: worker.id
      }
    });

    return NextResponse.json({ 
      message: 'Order created successfully',
      order: newOrder,
      // payment: newPayment
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}