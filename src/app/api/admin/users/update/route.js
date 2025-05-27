import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getUserFromToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    const email = formData.get('email');
    const phone = formData.get('phone');
    const address = formData.get('address');
    const gender = formData.get('gender');
    const role = formData.get('role');
    const new_password = formData.get('new_password') ?? null;

    const hashedPassword = new_password !== 'null' ? await bcrypt.hash(new_password, 10) : null;

    await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          address,
          gender,
          role,
          ...(hashedPassword && { password: hashedPassword }),
        },
      });

    const users = await prisma.user.findMany();
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

    return NextResponse.json({ message: 'Category successfully updated!', users, workers});
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
