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
    const deskripsi = formData.get('deskripsi');
    const status = formData.get('status');
    const file = formData.get('banner');
    const categoryId = formData.get('categoryId');

    // Validasi categoryId
    if (!categoryId) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    // Verifikasi category ada di database
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
    }

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

    const existingWorker = await prisma.worker.findUnique({
      where: { userId: user.id },
      include: { categories: true },
    });

    if (existingWorker) {
      // Update worker
      const worker = await prisma.worker.update({
        where: { userId: user.id },
        data: {
          description: deskripsi,
          status,
          ...(imageUrl && { banner: imageUrl }),
        },
      });

      // Update atau buat worker category
      if (existingWorker.categories.length > 0) {
        await prisma.workerCategory.update({
          where: { id: existingWorker.categories[0].id },
          data: { categoryId },
        });
      } else {
        await prisma.workerCategory.create({
          data: {
            workerId: worker.id,
            categoryId,
          },
        });
      }
    } else {
      // Buat worker baru
      const worker = await prisma.worker.create({
        data: {
          userId: user.id,
          description: deskripsi,
          status,
          ...(imageUrl && { banner: imageUrl }),
          categories: {
            create: {
              categoryId,
            },
          },
        },
      });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}