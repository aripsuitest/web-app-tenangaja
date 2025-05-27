// app/api/admin/category/add/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import formidable from 'formidable';
import { promisify } from 'util';
import fs from 'fs';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse form-data
    const form = formidable({ multiples: false, uploadDir: './public/uploads', keepExtensions: true });
    const parseForm = promisify(form.parse.bind(form));
    
    const [fields, files] = await parseForm(req);

    const { name, description } = fields;
    const imageFile = files.image;

    if (!name || !description || !imageFile) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // Simpan data ke database
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image: `/uploads/${imageFile.newFilename}`, // Sesuaikan path penyimpanan
      },
    });

    return NextResponse.json({
      message: 'Category successfully added!',
      data: {
        id: category.id,
        nama: name,
        gambar: `/uploads/${imageFile.newFilename}`,
        deskripsi: description,
        subKategori: [],
      },
    });
  } catch (error) {
    console.error('Add category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Jangan pakai Next.js bodyParser
  },
};
