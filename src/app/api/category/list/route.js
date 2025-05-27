import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  try {

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
        include: {
          subcategories: true,
        }
      });

    let userCategory = null;

    const worker = await prisma.worker.findFirst({
      where:{
        userId:user.id
      }
    })

    if(worker){
      const workerCategory = await prisma.workerCategory.findFirst({
        where:{
          workerId: worker.id
        }
      })
      if(workerCategory){
        userCategory = workerCategory.categoryId
      }
    }

    return NextResponse.json({ message: 'Category successfully showed!', categories, userCategory});
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
