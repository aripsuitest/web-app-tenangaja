import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const path = req.nextUrl.pathname;

  // handle slash '/'
  if(path === '/'){
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (!token) {
    if(path === '/profile' || path === '/user' || path === '/worker'){
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  try {
    if(!token){
      console.log('User login data: Null');
      return NextResponse.next();  
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
    const res = NextResponse.next();
    // admin handler
    console.log(payload);
    if(path === '/admin'){
      if(payload.role !== 'admin'){
        return NextResponse.redirect(new URL('/home', req.url));
      }
    }
    if(path === '/home'){
      if(payload.role === 'admin'){
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    if(path === '/user'){
      if(payload.role === 'admin'){
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    if(path === '/worker'){
      if(payload.role === 'admin'){
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    if(path === '/explore'){
      if(payload.role === 'admin'){
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    res.cookies.set('user', JSON.stringify(payload), { path: '/' });
    return res;
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    '/',
    '/home',
    '/explore',
    '/admin',
    '/worker',
    '/user'
  ]
};
