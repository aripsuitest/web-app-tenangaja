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
    const password = formData.get('password') ?? null;

    const hashedPassword = await bcrypt.hash(password ? password : 'root', 10);

    await prisma.user.create({
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

    return NextResponse.json({ message: 'User successfully added!', users});
  } catch (error) {
    console.error('Add user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
