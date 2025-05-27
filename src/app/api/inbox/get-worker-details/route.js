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

    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');

    const worker = await prisma.worker.findUnique({
      where:{
        id: workerId
      },
      include: {
        user: {
          select: {
            profile_pic: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ worker });
  } catch (error) {
    console.error('Error fetching data worker:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}