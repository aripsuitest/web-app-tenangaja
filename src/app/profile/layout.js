import { cookies } from 'next/headers';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import UserNavMenu from '@/components/UserNavMenu';
import SearchInput from '@/components/SearchInput';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TenangAja.com - Solusi Profesional untuk Masalah Anda",
  description: "Tenang aja, serahin ke ahlinya! Setiap masalah pasti ada solusinya, dan kami siap bantu tanpa ribet!",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  const user = userCookie ? JSON.parse(userCookie.value) : null;
  
  return (
    <html lang="id">
      <head>
        <link rel="shortcut icon" href="/images/favicon.png" />
        <meta name="theme-name" content="Pinwheel" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#000"
        />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="TenangAja.com" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tenangaja.com" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />

        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&display=swap"
          rel="stylesheet"
        />

        <link rel="stylesheet" href="/plugins/swiper/swiper-bundle.css" />
        <link rel="stylesheet" href="/plugins/font-awesome/v6/brands.css" />
        <link rel="stylesheet" href="/plugins/font-awesome/v6/solid.css" />
        <link rel="stylesheet" href="/plugins/font-awesome/v6/fontawesome.css" />
        <link href="styles/main.css" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="header border-b">
          <nav className="navbar container flex flex-col lg:flex-row">
            {/* Top bar */}
            <div className="w-full flex justify-between items-center py-3 px-4 lg:px-0">
              {/* Logo */}
              <div className="order-0">
                <a href="/" className="text-2xl font-bold">
                  <span className="text-blue-600">Tenang</span>Aja.com
                </a>
              </div>

              {/* Search input - Hidden on mobile */}
              <div className="hidden lg:flex flex-grow justify-center order-1 px-10">
                <SearchInput/>
              </div>

              {/* User menu */}
              <UserNavMenu user={user} />
            </div>

            {/* Mobile search - Only shown on mobile */}
            <div className="w-full px-4 lg:hidden mt-2 mb-4">
              <SearchInput/>
            </div>
          </nav>
        </header>
        
        {children}
        
        <footer className="footer bg-theme-light/50">
          <div className="container px-4 lg:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 pt-12">
              <div className="col-span-1">
                <a href="/" className="text-2xl font-bold">
                  <span className="text-blue-600">Tenang</span>Aja.com
                </a>
                <p className="mt-4 text-gray-600">
                  Tenang aja, serahin ke ahlinya! Setiap masalah pasti ada solusinya, dan kami siap bantu tanpa ribet!
                </p>
              </div>
              
              <div className="col-span-1">
                <h6 className="font-bold text-lg mb-4">Socials</h6>
                <p className="text-gray-600">contact@tenangaja.com</p>
                <div className="flex space-x-4 mt-4">
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
              
              <div className="col-span-1">
                <h6 className="font-bold text-lg mb-4">Quick Links</h6>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-600 hover:text-blue-600">Tentang Kami</a></li>
                  <li><a href="/categories" className="text-gray-600 hover:text-blue-600">Kategori</a></li>
                  <li><a href="/testimonials" className="text-gray-600 hover:text-blue-600">Testimoni</a></li>
                  <li><a href="/contact" className="text-gray-600 hover:text-blue-600">Kontak</a></li>
                </ul>
              </div>
              
              <div className="col-span-1">
                <h6 className="font-bold text-lg mb-4">Lokasi & Kontak</h6>
                <p className="text-gray-600">2118 Thornridge Cir. Syracuse, Connecticut 35624</p>
                <p className="text-gray-600 mt-2">(704) 555-0127</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 py-6 text-center">
              <p className="text-gray-600">Copyright © {new Date().getFullYear()} TenangAja.com All Right Reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}