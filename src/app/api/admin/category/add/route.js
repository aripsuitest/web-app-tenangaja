import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import formidable from 'formidable';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

// Inisialisasi PrismaClient
const prisma = new PrismaClient();

// Nonaktifkan Next.js body parser agar formidable bisa bekerja
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

export async function POST(req) {
  try {
    // Cek autentikasi user dari token
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Tentukan direktori upload secara absolut (./public/uploads)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Siapkan formidable untuk parsing form-data
    const form = formidable({
      multiples: false,
      uploadDir: uploadDir,
      keepExtensions: true,
      filename: (name, ext, part) => {
        const timestamp = Date.now();
        const safeName = part.originalFilename.replace(/\s+/g, '_').replace(/[^\w\-\.]/g, '');
        return `${timestamp}_${safeName}`;
      },
    });

    const parseForm = promisify(form.parse.bind(form));
    const [fields, files] = await parseForm(req);

    // Ambil data dari form
    const { name, description } = fields;
    const imageFile = files.image;

    if (!name || !description || !imageFile) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Simpan ke database
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image: `/uploads/${imageFile.newFilename}`,
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