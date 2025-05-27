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

    const [totalProjects, pendingProjects, canceledProjects, completedProjects] = await Promise.all([
      prisma.order.count({
        where: {
          userId: user.id,
        },
      }),
      prisma.order.count({
        where: {
          userId: user.id,
          status: 'PENDING',
        },
      }),
      prisma.order.count({
        where: {
          userId: user.id,
          status: 'CANCELLED',
        },
      }),
      prisma.order.count({
        where: {
          userId: user.id,
          status: 'COMPLETED',
        },
      }),
    ]);

    const stats = {
      totalProjects,
      pendingProjects,
      canceledProjects,
      completedProjects,
    };

    return NextResponse.json({ message: 'User dashboard data successfully fetched!', stats });
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
