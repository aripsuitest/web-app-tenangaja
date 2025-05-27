'use client';

import { useState, useEffect } from 'react';
import { FiLogOut, FiEdit, FiUpload, FiKey } from 'react-icons/fi';

import Swal from 'sweetalert2';

export default function Page() {
  const [formData, setFormData] = useState({
    nama: '',
    gender: '',
    phone: '',
    address: '',
    profile_pic: '',
    email: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Fetch data dari server
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile/get');
        if (!res.ok) throw new Error('Gagal ambil data user');
        const data = await res.json();
        setFormData({
          nama: data.data.nama || '',
          gender: data.data.gender || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          profile_pic: data.data.profile_pic || '',
          email: data.data.email || '',
        });
        if (data.data.profile_pic) setPreviewImage(data.data.profile_pic);
      } catch (err) {
        console.error('Error saat ambil profil:', err);
        alert('Gagal mengambil data profil');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('gender', formData.gender);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    if (profileImage) data.append('image', profileImage);
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
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      console.log('Update berhasil:', result);
      Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been successfully updated",
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
        {/* Right Panel - User Info */}
        <div className="w-full md:w-1/3">
          <div className="bg-gray-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16">
                  <img
                    src={previewImage || '/images/user_default_profile.webp'}
                    alt="Foto Profil"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="ml-3 text-white text-2xl">{formData.nama || 'Username'}</span>
                  <span className="ml-3 text-white text-sm">{formData.email || '-'}</span>
                </div>
              </div>
            </div>



            <div className="flex gap-2 mb-4">
              <a href="/change-password" className="flex items-center gap-2 bg-white text-gray-800 p-4 rounded-md text-sm">
                <FiKey /> Ubah password
              </a>
              <a href="/api/auth/logout" className="flex items-center gap-2 bg-white text-gray-800 p-4 rounded-md text-sm">
                <FiLogOut /> Keluar
              </a>
            </div>
          </div>
        </div>

        {/* Left Panel - Profile Form */}
        <div className="w-full md:w-2/3 bg-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-gray-600 font-medium">Profile</h2>
            <button onClick={handleUpdateProfile} className="flex items-center gap-2 bg-white text-gray-700 p-4 rounded-md text-sm">
              <FiEdit /> Update Profile
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-500 mb-1 text-sm">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-sm">Jenis Kelamin</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-sm">Nomor Telepon</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-sm">Alamat</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-2 text-sm">Foto Profil</label>
              {previewImage && (
                <img src={previewImage} alt="Preview" className="mt-3 rounded-md w-40 h-40 object-cover border" />
              )}
              <input
                type="file"
                onChange={handleImageChange}
                className="p-3 border border-gray-300 rounded-md bg-white mt-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
