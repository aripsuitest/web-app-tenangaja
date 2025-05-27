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

    const fullName = formData.get('nama');
    const gender = formData.get('gender');
    const phone = formData.get('phone');
    const address = formData.get('address');
    const file = formData.get('image');

    let imageUrl = null;

    if (file && typeof file.name === 'string') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: fullName,
        gender,
        phone,
        address,
        ...(imageUrl && { profile_pic: imageUrl }),
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
