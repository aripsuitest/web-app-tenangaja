// app/api/admin/category/add/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    // 🔑 Ambil user dari token
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 🔥 Ambil formData
    const formData = await req.formData();
    const name = formData.get('name');
    const image = formData.get('image');
    const description = formData.get('description');

    // 🚨 Validasi data
    if (!name || !image || !description) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // 🔥 Simpan kategori ke database
    const category = await prisma.category.create({
      data: {
        name,
        image,
        description,
      },
    });

    // 🎉 Kirim respons sukses
    return NextResponse.json({
      message: 'Category successfully added!',
      data: {
        id: category.id,
        nama: name,
        gambar: image,
        deskripsi: description,
        subKategori: [],
      },
    });
  } catch (error) {
    console.error('Add category error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
