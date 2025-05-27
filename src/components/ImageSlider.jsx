'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useState } from 'react';

// Komponen bintang sederhana
const StarIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    className={filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
    />
  </svg>
);

export default function TestimonialSlider() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch('/api/workers');
        if (!response.ok) {
          throw new Error('Failed to fetch workers');
        }
        const data = await response.json();
        setWorkers(data.workers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (workers.length === 0) return <div className="text-center py-8">No workers found</div>;

  const testimonials = workers.map(worker => ({
    name: worker.name,
    role: worker.categories.map(cat => cat.name).join(', '),
    rating: worker.rating,
    reviewCount: worker.reviewCount,
    testimonial: worker.description,
    banner: worker.banner || '/images/default-banner.jpg',
    avatar: worker.image || '/images/default-banner.jpg'
  }));

  return (
    <section className="mt-8 mb-8">
      <div className="container">
        <div className="relative w-full max-h-[500px] mx-auto overflow-hidden rounded-2xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={1}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
            }}
            autoplay={{
              delay: 10000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="max-h-[500px]"
          >
            {testimonials.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-full max-h-[500px] relative">
                  {/* Banner Image */}
                  <Image
                    src={item.banner}
                    alt={`Banner ${item.name}`}
                    width={1200}
                    height={500}
                    className="w-full h-full object-cover max-h-[500px] min-h-[500px]"
                  />
                  
                  {/* Profile Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent p-6">
                    <div className="flex items-start gap-4 max-w-5xl mx-auto mb-4 mt-4">
                      <div className="relative">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          width={80}
                          height={80}
                          style={{border:'2px dashed #2b7fff'}}
                          className="rounded-full object-cover w-20 min-w-20 h-20"
                        />
                      </div>
                      <div className="text-black">
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        <p className="text-sm">{item.role}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i}
                              filled={i < Math.floor(item.rating)}
                            />
                          ))}
                          <span className="ml-2 text-sm">{item.rating} ({item.reviewCount || '-'} reviews)</span>
                        </div>
                        <p className="mt-2">{item.testimonial}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            <div className="swiper-pagination absolute bottom-2 left-1/2 z-10 transform -translate-x-1/2 flex gap-2 justify-center" />
          </Swiper>
        </div>
      </div>
    </section>
  );
}