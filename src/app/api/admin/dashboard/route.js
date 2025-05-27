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

    const [totalUsers, totalWorkers, totalProjects, totalCategories] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          worker: {
            isNot: null,
          },
        },
      }),
      prisma.order.count(),
      prisma.category.count(),
    ]);

    const stats = {
      totalUsers,
      totalWorkers,
      totalProjects,
      totalCategories,
    };

    return NextResponse.json({ message: 'Dashboard data successfully showed!', stats });
  } catch (error) {
    console.error('Showing users error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
