// components/Pagination.js

import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handleClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      {/* Previous Button */}
      <button
        onClick={() => handleClick(currentPage - 1)}
        className="btn btn-sm px-4 py-2 text-white rounded-md disabled:bg-gray-400"
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          onClick={() => handleClick(page)}
          className={`px-4 py-2 rounded-md ${
            page === currentPage
              ? 'bg-blue-500 text-white btn btn-sm'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handleClick(currentPage + 1)}
        className="btn btn-sm px-4 py-2 text-white rounded-md disabled:bg-gray-400"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
