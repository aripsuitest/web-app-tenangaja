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

    const workers = await prisma.user.findMany({
      where: {
        worker: {
          isNot: null,
        },
      },
      include: {
        worker: true,
      },
    });

    return NextResponse.json({ message: 'Workers successfully showed!', workers });
  } catch (error) {
    console.error('Showing workers error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
