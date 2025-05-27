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

    const users = await prisma.user.findMany();

    return NextResponse.json({ message: 'Users successfully showed!', users});
  } catch (error) {
    console.error('Showing users error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
