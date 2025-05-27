// components/FAQSection.jsx
'use client';
import { useState } from 'react';

const faqs = [
  {
    question: "Apa itu layanan kami?",
    answer: "Kami menyediakan solusi digital seperti pengembangan website, aplikasi, dan layanan konsultasi IT.",
  },
  {
    question: "Bagaimana cara memulai project?",
    answer: "Hubungi kami lewat halaman kontak, dan kami akan bantu mulai dari analisa kebutuhan hingga peluncuran.",
  },
  {
    question: "Apakah ada garansi atau maintenance?",
    answer: "Ya, kami menyediakan garansi perbaikan bug dan opsi maintenance bulanan sesuai kebutuhan.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Pertanyaan Umum
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left font-semibold text-gray-800 hover:text-blue-500 focus:outline-none"
              >
                {faq.question}
              </button>
              <div className={`mt-4 text-gray-600 transition-all duration-300 ease-in-out ${openIndex === index ? "block" : "hidden"}`}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
