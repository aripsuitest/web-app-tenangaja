import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const worker = await prisma.worker.findUnique({where: {userId:user.id}});

    const orders = await prisma.order.findMany({
      where: {
        workerId: worker.id,
        status: 'COMPLETED',
        userConfirmed: true,
        payment: {
          status: 'PAID'
        }
      },
      select: {
        payment: {
          select: {
            amount: true
          }
        }
      }
    });

    // Sum up the payment amounts
    const balance = orders.reduce((total, order) => {
      return total + (order.payment?.amount || 0);
    }, 0);

    return NextResponse.json({ userId: user.id, balance });
  } catch (error) {
    console.error('Error fetching data user id:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}