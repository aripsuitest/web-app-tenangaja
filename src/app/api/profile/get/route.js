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

    const UserData = await prisma.user.findUnique({ where: { id:user.id } });

    console.log(UserData);

    return NextResponse.json({ message: 'Successfully get the user data', data: {
      nama: UserData.name,
      gender: UserData.gender,
      address: UserData.address,
      phone: UserData.phone,
      profile_pic: UserData.profile_pic,
      email: UserData.email
    } });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
