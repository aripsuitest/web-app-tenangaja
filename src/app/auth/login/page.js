'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Import Swiper styles and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Swal from 'sweetalert2';

export default function Login() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const data = {
      email: form.get("email"),
      password: form.get("password")
    };

    // showing the login process
    Swal.fire({
      title: "Processing...",
      text: "Please wait while we complete your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Login Succes!",
        text: "Redirecting to home...",
      }).then(()=>{
        router.push('/home');
      })
    } else {
      // login gagal
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Please check your credentials.",
      });
    }
  };

  return (
    <section className="absolute h-full w-full">
      <div className="container max-w-full h-full">
        <div className="row h-full">
          <div className="min-h-[100%] bg-white py-10 lg:col-6 lg:py-[114px]">
            <div className="mx-auto w-full max-w-[480px]">
              <h1 className="mb-4">Sign In</h1>
              <p className="mb-4">Masukan Email Address dan Password untuk masuk ke akun anda!</p>
              <form action="#" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="Your Email Address"
                  />
                </div>
                <div className="form-group mt-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Your Password"
                  />
                </div>
                <button
                  className="btn bg-blue-600 text-white mt-10 w-full rounded-full" style={{background:'#2b7cff'}}
                >Sign In</button>
                <p className="mt-6 text-center">
                  Belum memiliki akun? <a className="text-dark" href="/auth/register">Sign up</a> untuk membuat akun
                </p>
              </form>
            </div>
          </div>

          <div
            className="auth-banner bg-gradient-to-b from-blue-500 to-blue-900 flex flex-col items-center justify-center py-16 lg:col-6 relative"
          >
            <img
              className="absolute top-0 left-0 h-full w-full object-cover"
              src="/images/login-banner-bg.svg"
              alt="background"
            />
            <div className="w-full text-center relative z-10">
              <h2 className="h3 text-white">
                Selamat datang di TenangAja!
              </h2>
              <h4 className="h6 text-white mt-2">
                Tidak perlu kawatir tentang apa yang sedang terjadi, hanya perlu Anda hanya perlu Tenang.
              </h4>
              <div className="mt-8 max-w-[667px] mx-auto">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  spaceBetween={50}
                  slidesPerView={1}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  pagination={{ clickable: true }}
                  loop={true}
                >
                  <SwiperSlide>
                    <Image
                      width={667}
                      height={557}
                      className="mx-auto"
                      src="/images/login-carousel-img-1.png"
                      alt="Slide 1"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <Image
                      width={667}
                      height={557}
                      className="mx-auto"
                      src="/images/login-carousel-img-1.png"
                      alt="Slide 2"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <Image
                      width={667}
                      height={557}
                      className="mx-auto"
                      src="/images/login-carousel-img-1.png"
                      alt="Slide 3"
                    />
                  </SwiperSlide>
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}