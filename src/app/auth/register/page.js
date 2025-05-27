'use client';

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
// Import Swiper styles and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import Swal from 'sweetalert2';

export default function Register() {
  const router = useRouter();
  
  const handleRegister = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const data = {
      name: form.get("name"),
      gender: form.get("gender"),
      phone: form.get("phone"),
      address: form.get("address"),
      email: form.get("email"),
      password: form.get("password"),
      confirm_password: form.get("confirm_password")
    };

    Swal.fire({
      title: "Processing...",
      text: "Please wait while we complete your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // sukses daftar, redirect login
        Swal.fire({
          icon: "success",
          title: "Register Succes!",
          text: "Redirecting to login...",
        }).then(()=>{
          router.push('/auth/login');
        })
      } else {
        // gagal daftar
        const result = await response.json();
        Swal.fire({
          icon: "error",
          title: "Register Failed",
          text: result.message || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
          icon: "error",
          title: "Register Failed",
          text: result.message || "Something went wrong!",
        });
    }
  };
  return (
    <section className="absolute h-full w-full">
      <div className="container max-w-full h-full">
        <div className="row h-full">
          <div className="min-h-[100%] bg-white py-10 lg:col-6 lg:py-[114px] max-h-[100%] overflow-auto">
            <div className="mx-auto w-full max-w-[480px]">
              <h1 className="mb-4">Sign Up</h1>
              <p className="mb-4">Selangkah lagi anda akan mendapatkan akun anda!</p>
              <form action="#" onSubmit={handleRegister}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    placeholder="Your Full Name"
                  />
                </div>
                <div className="form-group mt-4">
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <select className="form-select" name="gender" id="gender">
                    <option value="">Choose Your Gender</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div className="form-group mt-4">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="number"
                    id="phone"
                    name="phone"
                    className="form-control"
                    placeholder="Your Phone Number"
                  />
                </div>
                <div className="form-group mt-4">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    placeholder="Your Address"
                  />
                </div>
                <div className="form-group mt-4">
                  <label htmlFor="email" className="form-label">Email Adrdess</label>
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
                <div className="form-group mt-4">
                  <label htmlFor="password" className="form-label">Konfirmasi Password</label>
                  <input
                    type="password"
                    id="password"
                    name="confirm_password"
                    className="form-control"
                    placeholder="Your Password"
                  />
                </div>
                <button
                  className="btn bg-blue-600 text-white mt-10 w-full rounded-full" style={{background:'#2b7cff'}}
                >Sign Up</button>
                <p className="mt-6 text-center">
                  Sudah memiliki akun? <a className="text-dark" href="/auth/login">Sign In</a> untuk masuk ke akun
                </p>
              </form>
            </div>
          </div>

          <div
            className="auth-banner bg-gradient-to-b from-blue-500 to-blue-900 flex flex-col items-center justify-center py-16 lg:col-6"
          >
            <img
              className="absolute top-0 left-0 h-full w-full"
              src="/images/login-banner-bg.svg"
              alt=""
            />
            <div className="w-full text-center">
              <h2 className="h3 text-white">
                Mari Bergabung dengan TenangAja!
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
