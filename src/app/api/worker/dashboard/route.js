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

    // Pastikan user adalah worker
    const worker = await prisma.worker.findUnique({
      where: { userId: user.id },
    });

    if (!worker) {
      const stats = {
        totalProjects: 0,
        pendingProjects: 0,
        canceledProjects: 0,
        completedProjects: 0,
      };
      return NextResponse.json({ message: 'User is not a worker', stats });
    }

    const [totalProjects, pendingProjects, canceledProjects, completedProjects] = await Promise.all([
      prisma.order.count({
        where: {
          workerId: worker.id,
        },
      }),
      prisma.order.count({
        where: {
          workerId: worker.id,
          status: 'PENDING',
        },
      }),
      prisma.order.count({
        where: {
          workerId: worker.id,
          status: 'CANCELLED',
        },
      }),
      prisma.order.count({
        where: {
          workerId: worker.id,
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

    return NextResponse.json({ message: 'Worker dashboard data successfully fetched!', stats });
  } catch (error) {
    console.error('Error fetching worker dashboard data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
