'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const SearchInput = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const [q, setQ] = useState(searchParams.get('q')??'');

  return (
    <form action="/explore" method="GET" className="relative w-full max-w-xl">
      {categoryId && (
        <input
          type="text"
          name="categoryId"
          className="hidden"
          value={categoryId}
          readOnly
        />
      )}
      <input
        type="text"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari layanan atau pekerja..."
        className="w-full rounded-full border border-gray-300 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        type="submit"
        className="absolute right-2 flex justify-center items-center top-0 w-[30px] h-full text-gray-500 hover:text-black"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16 10a6 6 0 1 0-12 0 6 6 0 0 0 12 0z" />
        </svg>
      </button>
    </form>    
  );
};

export default SearchInput;
