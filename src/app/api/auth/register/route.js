import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // buat hashing password, jangan simpan password polos!

const prisma = new PrismaClient();

export async function POST(request) {
  try{
    const body = await request.json();

    if(body.password !== body.confirm_password){
      return new Response(JSON.stringify({ message: "Password dan Confirmation Password didnt match!" }), {
        status: 400,
      });
    }

    const { name, gender, phone, address, email, password } = body;

    // validasi sederhana
    if (!email || !password || !name || !gender || !address || !phone) {
      return new Response(JSON.stringify({ message: "Name, Gender, Address, Phone, Email Dan Password are required." }), {
        status: 400,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ message: "Email already registered." }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    await prisma.user.create({
      data: {
        name,
        gender,
        phone,
        address,
        email,
        password: hashedPassword,
      },
    });

    return new Response(JSON.stringify({ message: "Register berhasil." }), {
      status: 200,
    });
  }catch(error){
    console.error(error);
    return new Response(JSON.stringify({ message: "Server error." }), { status: 500 });
  }
}
