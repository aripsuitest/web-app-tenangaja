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

    const workerIds = await prisma.worker.findMany({
      where:{
        userId: user.id
      }
    })

    let workerId = null;

    if(workerIds.length > 0){
      workerId = workerIds[0].id;
    }

    return NextResponse.json({ workerId });
  } catch (error) {
    console.error('Error fetching data worker id:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}