import Image from "next/image";
import FAQSection from '@/components/FAQSection';
import prisma from '@/lib/prisma';


export default async function Home({ user }) {
  // kita akan ambil data kategori
  const categories = await prisma.category.findMany();
  return (
    <>
      <section className="section banner relative">
        <div className="container">
          <div className="row items-center">
            <div className="lg:col-6">
              <h1 className="banner-title">
                Selamat Datang {user}!
              </h1>
              <p className="mt-6 text-2xl">
                Sedang mencari tukang profesional dengan mudah, cepat dan tanpa ribet?<br/>Tenang Aja, Solusinya
              </p>
            </div>
            <div className="lg:col-6">
              <img
                className="w-full object-cover"
                src="images/how-it-work/image-2.png"
                width="603"
                height="396"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row items-center justify-between">
            <div className="md:col-5">
              <h2 className="text-center md:text-left">Layanan Kami</h2>
            </div>
          </div>
          <div className="row mt-14">
            {categories.map((item)=>(
              <div className="mb-8 sm:col-6 lg:col-3" key={item.id}>
                <div className="rounded-xl bg-white p-6 shadow-lg lg:p-8 flex flex-col h-full">
                  <div className="text-4xl text-blue-600 mb-4">
                    <i className={item.image}></i>
                  </div>
                  <h4 className="my-4">{item.name}</h4>
                  <p className="mb-6">
                    {item.description}
                  </p>
                  <a href={'/explore?categoryId='+item.id+'&q='} className="mt-auto inline-block bg-blue-600 text-white py-2 px-4 rounded-[20px] hover:bg-blue-700 transition flex items-center justify-center space-x-2">
                    <span>Mulai</span>
                    <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-hero pb-14 pt-16">
        <div className="container">
          <div className="page-hero-content mx-auto max-w-[883px] text-center">
            <h1 className="mb-5 mt-8">
              Mengetahui masalahnya tapi bingung mengatasinya?
            </h1>
            <p>
              Jika anda mengetahui masalahnya tetapi bingung cara menyelesaikannya, segera hubungi ahli yang tepat!
            </p>
          </div>

          <div className="row mt-14">
            <div className="mt-10 text-center sm:col-6 md:col-4 md:mb-0">
              <div className="relative mx-auto mb-8 flex h-[184px] w-[184px] items-center justify-center rounded-xl bg-white p-4 shadow-lg after:absolute after:-right-4 after:-z-[1] after:hidden after:w-full after:translate-x-full after:border-b-2 after:border-dashed after:border-primary/50 after:content-[''] md:after:block">
                <i className="fas fa-tachometer-alt text-7xl text-blue-600"></i>
              </div>
              <h2 className="h5">Pengerjaan Lebih Cepat</h2>
              <p className="mt-4">
                Mempercepat proses pengerjaan dengan sistem yang lebih efisien dan terintegrasi.
              </p>
            </div>

            <div className="mt-10 text-center sm:col-6 md:col-4 md:mb-0">
              <div className="relative mx-auto mb-8 flex h-[184px] w-[184px] items-center justify-center rounded-xl bg-white p-4 shadow-lg after:absolute after:-right-4 after:-z-[1] after:hidden after:w-full after:translate-x-full after:border-b-2 after:border-dashed after:border-primary/50 after:content-[''] md:after:block">
                <i className="fas fa-shield-alt text-7xl text-blue-600"></i>
              </div>
              <h2 className="h5">Minim Resiko</h2>
              <p className="mt-4">
                Meminimalkan risiko dengan sistem yang dapat memantau dan mengelola potensi masalah dengan cepat.
              </p>
            </div>

            <div className="mt-10 text-center sm:col-6 md:col-4 md:mb-0">
              <div className="mx-auto mb-8 flex h-[184px] w-[184px] items-center justify-center rounded-xl bg-white p-4 shadow-lg">
                <i className="fas fa-check-circle text-7xl text-blue-600"></i>
              </div>
              <h2 className="h5">Langsung Teratasi</h2>
              <p className="mt-4">
                Solusi langsung diberikan dengan sistem otomatis yang mengatasi masalah secara instan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {<FAQSection/>}

      <section className="px-5 py-20 xl:py-[120px]">
        <div className="container">
          <div
            className="bg-gradient-to-b from-blue-500 to-blue-900 row justify-center rounded-b-[80px] rounded-t-[20px] px-[30px] pb-[75px] pt-16"
          >
            <div className="lg:col-11">
              <div className="col">
                <div className="text-center">
                  <h2 className="h1 text-white">Tenang aja, serahin ke ahlinya! Setiap masalah pasti ada solusinya, dan kami siap bantu tanpa ribet!</h2>
                </div>
                <div className="mt-8">
                  <a href="#" className="mt-auto inline-block bg-blue-600 text-white py-2 px-4 rounded-[20px] hover:bg-blue-700 transition flex items-center justify-center space-x-2">
                    <span>Mulai</span>
                    <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
