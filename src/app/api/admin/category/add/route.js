import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
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
    const image = formData.get('image');
    const description = formData.get('description');

    const category = await prisma.category.create({
        data: {
          name,
          image,
          description
        },
      });

    return NextResponse.json({ message: 'Category successfully added!', data: {
      nama: name, gambar: image, id: category.id, subKategori: [], deskripsi: description
    }});
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
