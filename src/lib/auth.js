import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET;

export async function getUserFromToken(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) return null;

    const encoder = new TextEncoder();
    const key = encoder.encode(SECRET_KEY);

    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return payload; // payload.id dan payload.email
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
}
