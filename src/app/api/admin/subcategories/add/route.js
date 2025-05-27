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

    const name = formData.get('name');
    const categoryId = formData.get('categoryId');

    const subcategory = await prisma.subCategory.create({
        data: {
          name,
          categoryId,
        },
      });

    console.log(subcategory);

    return NextResponse.json({ message: 'SubCategory successfully added!', data: subcategory});
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
