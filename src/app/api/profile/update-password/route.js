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

    const old_password = formData.get('old_password');
    const new_password = formData.get('new_password');
    

    // Fetch current user's hashed password
    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });

    // Check if old_password matches
    const isMatch = await bcrypt.compare(old_password, currentUser.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Old password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = new_password ? await bcrypt.hash(new_password, 10) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
      ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

