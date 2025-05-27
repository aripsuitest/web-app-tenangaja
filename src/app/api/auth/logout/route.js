import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL('/auth/login', req.url);
  const response = NextResponse.redirect(url);

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });

  response.cookies.set('user', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });

  return response;
}