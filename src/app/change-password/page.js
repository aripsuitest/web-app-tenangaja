'use client';

import { useState } from 'react';
import { FiLogOut, FiEdit, FiUpload, FiKey } from 'react-icons/fi';

import Swal from 'sweetalert2';

export default function Page() {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateProfile = async () => {
    const data = new FormData();
    data.append('old_password', formData.old_password);
    data.append('new_password', formData.new_password);
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
      const res = await fetch('/api/profile/update-password', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if(res.ok){
        return Swal.fire({
            icon: "success",
            title: "Password Updated!",
            text: "Your password has been successfully updated",
          });
      }
      Swal.fire({
          icon: "error",
          title: "Failed!",
          text: result.message || "Something went wrong!",
        });
    } catch (err) {
      console.error('Gagal update profile:', err);
      Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Something went wrong!",
        });
    }
  };

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col sm:flex-row gap-6 w-full p-5 mt-5 mb-5 max-w-screen-xl mx-auto">
        {/* Left Panel - Profile Form */}
        <div className="w-full md:w-2/3 bg-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-gray-600 font-medium">Change Password</h2>
            <button onClick={handleUpdateProfile} className="flex items-center gap-2 bg-white text-gray-700 p-4 rounded-md text-sm">
              <FiEdit /> Update Password
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-500 mb-1 text-sm">Password Lama</label>
              <input
                type="text"
                name="old_password"
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Masukan password lama kamu..."
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-sm">Password Baru</label>
              <input
                type="text"
                name="new_password"
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Masukan password baru kamu..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
