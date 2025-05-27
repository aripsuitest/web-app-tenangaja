import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();

    const id = formData.get('id');
    const name = formData.get('name');

    await prisma.subCategory.update({
        where: { id },
        data: {
          name
        },
      });

    const categories = await prisma.category.findMany({
        include: {
          subcategories: true,
        }
      });

    return NextResponse.json({ message: 'Category successfully updated!', categories});
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
