'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiHome,
  FiUser,
  FiSettings,
  FiCalendar,
  FiMessageSquare,
  FiFileText,
  FiLogOut,
  FiBell,
  FiDollarSign,
  FiPieChart,
  FiList,
  FiUsers,
  FiEdit, FiTrash, FiPlus, FiSearch
} from 'react-icons/fi';

import { useDropzone } from 'react-dropzone';

import DataTable from 'react-data-table-component';

export default function WorkerDashboard() {
  const [kategoriList, setKategoriList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [newKategoriName, setNewKategoriName] = useState('');
  const [newKategoriImage, setNewKategoriImage] = useState('');
  const [newKategoriDeskripsi, setNewKategoriDeskripsi] = useState('');
  const [newSubKategori, setNewSubKategori] = useState('');
  const [subKategoriEditIndex, setSubKategoriEditIndex] = useState(null);

  const handleAddKategori = async () => {
    const formData = new FormData();
    formData.append('name', newKategoriName);
    formData.append('image', newKategoriImage);
    formData.append('description', newKategoriDeskripsi);

    try {
      const response = await (await fetch('/api/admin/category/add', {
              method: 'POST',
              body: formData,
            })).json();
      setKategoriList([...kategoriList, response.data]);
      setNewKategoriName('');
      setNewKategoriImage('');
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  };

  const handleDeleteKategori = async (id) => {
    try {
      await fetch('/api/admin/category/delete?id='+id);
      setKategoriList(kategoriList.filter(k => k.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete category');
    }
  };

  const handleEditKategori = (kategori) => {
    setSelectedKategori({ ...kategori });
    setModalOpen(true);
  };

  const handleSaveKategori = async () => {
    const formData = new FormData();
    formData.append('id', selectedKategori.id);
    formData.append('name', selectedKategori.nama);
    formData.append('image', selectedKategori.gambar);
    formData.append('description', selectedKategori.deskripsi);
    try {
      const response = await (await fetch('/api/admin/category/update', {
              method: 'POST',
              body: formData,
            })).json();
      setKategoriList(response.categories.map(({ name, image, description, subcategories, ...rest }) => ({
        ...rest,
        nama: name,
        gambar: image,
        deskripsi: description,
        subKategori: subcategories.map(({ name, ...rest })=>({...rest, nama: name}))
      })));
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update category');
    }
    
  };

  const handleAddSubKategori = async () => {
    const updated = { ...selectedKategori };
    const formData = new FormData();
    formData.append('name', newSubKategori);
    formData.append('categoryId', updated.id);
    try {
      const response = await (await fetch('/api/admin/subcategories/add', {
              method: 'POST',
              body: formData,
            })).json();
      updated.subKategori.push({ id: response.data.id, nama: newSubKategori });
      setSelectedKategori(updated);
      setNewSubKategori('');
    } catch (err) {
      console.error(err);
      alert('Failed to add subcategory');
    }
    
  };

  const handleDeleteSubKategori = async (id) => {
    const updated = { ...selectedKategori };
    try {
      await fetch('/api/admin/subcategories/delete?id='+id);
      updated.subKategori = updated.subKategori.filter(s => s.id !== id);
      setSelectedKategori(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to delete subcategory');
    }
  };

  const handleEditSubKategori = (id) => {
    const target = selectedKategori.subKategori.find(s => s.id === id);
    setNewSubKategori(target.nama);
    setSubKategoriEditIndex(id);
  };

  const handleSaveSubKategori = async () => {
    const updated = { ...selectedKategori };

    const formData = new FormData();
    formData.append('id', subKategoriEditIndex);
    formData.append('name', newSubKategori);
    try {
      const response = await (await fetch('/api/admin/subcategories/update', {
              method: 'POST',
              body: formData,
            })).json();
      setKategoriList(response.categories.map(({ name, image, description, subcategories, ...rest }) => ({
        ...rest,
        nama: name,
        gambar: image,
        deskripsi: description,
        subKategori: subcategories.map(({ name, ...rest })=>({...rest, nama: name}))
      })));
      updated.subKategori = updated.subKategori.map(s =>
        s.id === subKategoriEditIndex ? { ...s, nama: newSubKategori } : s
      );
      setSelectedKategori(updated);
      setNewSubKategori('');
      setSubKategoriEditIndex(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update category');
    }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [workSchedule, setWorkSchedule] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [earnings, setEarnings] = useState(null);

  const [kategori, setKategori] = useState('');

  const [deskripsi, setDeskripsi] = useState(profileData?.deskripsi || '');
  const [isActive, setIsActive] = useState(profileData?.status === 'active');
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const fileInputRef = useRef();

  // dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalWorkers: '-',
    totalUsers: '-',
    totalProjects: '-',
    totalCategories: '-'
  });

  // management user
  const [userList, setUserList] = useState([]);
  const [workerList, setWorkerList] = useState([]);

  const handleUpdateProfile = async () => {
    
    const formData = new FormData();
    formData.append('banner', bannerFile);
    formData.append('deskripsi', deskripsi);
    formData.append('status', isActive ? 'active' : 'inactive');

    try {
      await fetch('/api/worker/profile-update', {
        method: 'POST',
        body: formData,
      });
      alert('Succesfuly updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update banner');
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  // Using dropzone's onDrop callback
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });


  const handleBannerSubmit = () => {
    if (bannerFile) {
      setProfileData((prevProfileData) => ({
        ...prevProfileData,
        banner: URL.createObjectURL(bannerFile),
      }));
      setShowBannerModal(false);
      setBannerPreview(null);
    }
  };

  const handleCancelBanner = () => {
    setShowBannerModal(false);
    setBannerFile(null);
    setBannerPreview(null);
  };

  // Fetch initial data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case 'dashboard':
            // Fetch dashboard summary data
            const dashboardRes = await (await fetch('/api/admin/dashboard')).json();
            // setNotifications(dashboardData.notifications);
            setDashboardStats(dashboardRes.stats);
            break;
          
          case 'users':
            // Fetch profile data
            const userRes = await (await fetch('/api/admin/users/show')).json();
            setUserList(userRes.users);
            break;
            
          case 'workers':
            // Fetch work schedule
            const workerRes = await (await fetch('/api/admin/users/workers')).json();
            setWorkerList(workerRes.workers);
            break;
            
          case 'messages':
            // Fetch messages
            const messagesRes = await fetch('/api/worker/messages');
            const messagesData = await messagesRes.json();
            setMessages(messagesData);
            break;
            
          case 'documents':
            // Fetch documents
            const docsRes = await fetch('/api/worker/documents');
            const docsData = await docsRes.json();
            setDocuments(docsData);
            break;
            
          case 'category':
            const categoryData = await (await fetch('/api/admin/category/show')).json();
            setKategoriList(categoryData.categories.map(({ name, image, description, subcategories, ...rest }) => ({
              ...rest,
              nama: name,
              gambar: image,
              deskripsi: description,
              subKategori: subcategories.map(({ name, ...rest })=>({...rest, nama: name}))
            })));
            break;
            
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [activeTab]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Table columns
  const [userFilterText, setUserFilterText] = useState("");
  const [workerFilterText, setWorkerFilterText] = useState("");
  const [categoryFilterText, setCategoryFilterText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalEditUserOpen, setModalEditUserOpen] = useState(false);
  const [modalAddUserOpen, setModalAddUserOpen] = useState(false);

  const handleEditUser = (user)=>{
    setSelectedUser(user);
    setModalEditUserOpen(true);
  }

  const handleDeleteUser = async (id)=>{
    try {
      const response = await (await fetch('/api/admin/users/delete?id='+id)).json();
      setUserList(response.users);
      alert('Succesfuly deleted!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  }

  const handleAddUser = ()=>{
    setSelectedUser({});
    setModalAddUserOpen(true);
  }

  const handleSaveNewUser = async ()=>{
    const formData = new FormData();
    formData.append('id', selectedUser.id);
    formData.append('name', selectedUser.name);
    formData.append('email', selectedUser.email);
    formData.append('phone', selectedUser.phone);
    formData.append('gender', selectedUser.gender);
    formData.append('address', selectedUser.address);
    formData.append('role', selectedUser.role);
    formData.append('password', selectedUser.new_password);

    try {
      const response = await (await fetch('/api/admin/users/add', {
        method: 'POST',
        body: formData,
      })).json();
      setUserList(response.users);
      setModalAddUserOpen(false);
      setSelectedUser(null);
      alert('Succesfuly added!');
    } catch (err) {
      console.error(err);
      alert('Failed to add user');
    }
  }

  const handleSaveUser = async ()=>{
    const formData = new FormData();
    formData.append('id', selectedUser.id);
    formData.append('name', selectedUser.name);
    formData.append('email', selectedUser.email);
    formData.append('phone', selectedUser.phone);
    formData.append('gender', selectedUser.gender);
    formData.append('address', selectedUser.address);
    formData.append('role', selectedUser.role);
    let new_password = null;
    if(selectedUser.new_password)
      new_password = selectedUser.new_password;
    formData.append('new_password', new_password);

    try {
      const response = await (await fetch('/api/admin/users/update', {
        method: 'POST',
        body: formData,
      })).json();
      setUserList(response.users);
      setWorkerList(response.workers);
      setModalEditUserOpen(false);
      setSelectedUser(null);
      alert('Succesfuly updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  }


  const columnsUser = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'Foto',
      cell: row => (
        <div className="min-w-24 h-24 m-4">
          <img
            src={row.profile_pic || '/images/user_default_profile.webp'}
            alt="User"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      ),
      sortable: false,
    },
    {
      name: 'Nama',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Phone',
      selector: row => row.phone,
    },
    {
      name: 'Address',
      selector: row => row.address,
    },
    {
      name: 'Gender',
      selector: row => row.gender,
    },
    {
      name: 'Role',
      selector: row => row.role,
    },
    {
      name: 'Aksi',
      cell: row => (
        <div className="flex gap-2 justify-center">
          <button onClick={() => handleEditUser(row)} className="text-blue-600">
            <FiEdit />
          </button>
          <button onClick={() => handleDeleteUser(row.id)} className="text-red-600">
            <FiTrash />
          </button>
        </div>
      ),
      center: "true",
    },
  ];

  const columnsWorker = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'Foto',
      cell: row => (
        <div className="min-w-24 h-24 m-4">
          <img
            src={row.profile_pic || '/images/user_default_profile.webp'}
            alt="User"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      ),
      sortable: false,
    },
    {
      name: 'Nama',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Phone',
      selector: row => row.phone,
    },
    {
      name: 'Address',
      selector: row => row.address,
      sortable: true,
    },
    {
      name: 'Gender',
      selector: row => row.gender,
      sortable: true,
    },
    {
      name: 'Role',
      selector: row => row.role,
      sortable: true,
    },
    {
      name: 'Working Status',
      selector: row => row.worker?.status ?? '-',
      sortable: true,
    },
    {
      name: 'Aksi',
      cell: row => (
        <div className="flex gap-2 justify-center">
          <button onClick={() => handleEditUser(row)} className="text-blue-600">
            <FiEdit />
          </button>
          <button onClick={() => handleDeleteUser(row.id)} className="text-red-600">
            <FiTrash />
          </button>
        </div>
      ),
      center: "true",
    },
  ];

  const columnsCategory = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'Nama',
      selector: row => row.nama,
      sortable: true,
    },
    {
      name: 'Icon',
      cell: row => (
        <i className={row.gambar}></i>
      )
    },
    {
      name: 'Deskripsi',
      selector: row => row.deskripsi,
    },
    {
      name: 'Sub Kategori',
      cell: row => (
        <ul className="list-disc ml-2 w-50">
          {row.subKategori && row.subKategori.map((sub, i) => (
            <li key={sub.id}>{i + 1}. {sub.nama}</li>
          ))}
          {(!row.subKategori || row.subKategori.length === 0) && (<div>-</div>)}
        </ul>
      ),
      center: "true",
    },
    {
      name: 'Aksi',
      cell: row => (
        <div className="flex gap-2 justify-center">
          <button onClick={() => handleEditKategori(row)} className="text-blue-600">
            <FiEdit />
          </button>
          <button onClick={() => handleDeleteKategori(row.id)} className="text-red-600">
            <FiTrash />
          </button>
        </div>
      ),
      center: "true",
    },
  ];

  const filteredDataUsers = userList.filter(item =>
    item.name.toLowerCase().includes(userFilterText.toLowerCase())
  );
  const filteredDataWorkers = workerList.filter(item =>
    item.name.toLowerCase().includes(workerFilterText.toLowerCase())
  );
  const filteredDataCategories = kategoriList.filter(item =>
    item.nama.toLowerCase().includes(categoryFilterText.toLowerCase())
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-users text-blue-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalUsers}</p>
                </div>
              </div>

              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-user-cog text-green-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Workers</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalWorkers}</p>
                </div>
              </div>

              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-calendar text-yellow-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalProjects}</p>
                </div>
              </div>

              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-tasks text-purple-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Categories</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalCategories}</p>
                </div>
              </div>
            </div>

          </div>

        );
        
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-4">Manajemen User</h2>
              <button onClick={handleAddUser} className="flex gap-2 item-center p-2 text-white" style={{backgroundColor:'black', borderRadius:'10px', padding: '10px 15px', alignItems:'center'}}>
                <FiPlus /> Tambah User
              </button>
            </div>

            <div className="mb-4 flex items-center border border-gray-300 rounded overflow-hidden focus-within:ring focus-within:ring-blue-200 w-full">
              <span className="px-3 text-gray-500">
                <FiSearch />
              </span>
              <input
                type="text"
                placeholder="Cari nama..."
                className="flex-1 p-2 outline-none"
                onChange={(e) => setUserFilterText(e.target.value)}
                style={{border: 'none'}}
                value={userFilterText}
              />
            </div>

            <DataTable
              columns={columnsUser}
              data={filteredDataUsers}
              pagination
              highlightOnHover
              responsive

              noDataComponent="Belum ada data users"
            />


            {/* Modal edit user */}
            {modalEditUserOpen && selectedUser && (
              <div className="fixed inset-0 bg-[#000000b3] flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow w-full max-w-lg">
                  <h2 className="text-2xl font-bold mb-3">Edit User</h2>

                  <label>Nama</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, email: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Phone</label>
                  <input
                    type="number"
                    value={selectedUser.phone}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, phone: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Address</label>
                  <input
                    type="text"
                    value={selectedUser.address}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, address: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Gender</label>
                  <select
                    value={selectedUser.gender}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, gender: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  >
                    <option value="">Pilih Role</option>
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>

                  <label>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>

                  <label>Password (opsional)</label>
                  <input
                    type="password"
                    value={selectedUser.new_password || ''}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, new_password: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                    placeholder="Masukan password baru..."
                  />

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setModalEditUserOpen(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveUser}
                      className="text-white px-4 py-2 rounded"
                      style={{ backgroundColor: 'black' }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

            )}
            {modalAddUserOpen && selectedUser && (
              <div className="fixed inset-0 bg-[#000000b3] flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow w-full max-w-lg">
                  <h2 className="text-2xl font-bold mb-3">Add New User</h2>

                  <label>Nama</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, email: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Phone</label>
                  <input
                    type="number"
                    value={selectedUser.phone}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, phone: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Address</label>
                  <input
                    type="text"
                    value={selectedUser.address}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, address: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Gender</label>
                  <select
                    value={selectedUser.gender}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, gender: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  >
                    <option value="">Pilih Role</option>
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>

                  <label>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>

                  <label>Password</label>
                  <input
                    type="password"
                    value={selectedUser.new_password || ''}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, new_password: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                    placeholder="Masukan password..."
                  />

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setModalAddUserOpen(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveNewUser}
                      className="text-white px-4 py-2 rounded"
                      style={{ backgroundColor: 'black' }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

            )}
          </div>
        );

      case 'workers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold mb-4">Manajemen Workers</h2>
            </div>

            <div className="mb-4 flex items-center border border-gray-300 rounded overflow-hidden focus-within:ring focus-within:ring-blue-200 w-full">
              <span className="px-3 text-gray-500">
                <FiSearch />
              </span>
              <input
                type="text"
                placeholder="Cari nama..."
                className="flex-1 p-2 outline-none"
                onChange={(e) => setWorkerFilterText(e.target.value)}
                style={{border: 'none'}}
                value={workerFilterText}
              />
            </div>

            <DataTable
              columns={columnsWorker}
              data={filteredDataWorkers}
              pagination
              highlightOnHover
              responsive

              noDataComponent="Belum ada data workers"
            />


            {/* Modal edit user */}
            {modalEditUserOpen && selectedUser && (
              <div className="fixed inset-0 bg-[#000000b3] flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow w-full max-w-lg">
                  <h2 className="text-2xl font-bold mb-3">Edit Workers</h2>

                  <label>Nama</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, email: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Phone</label>
                  <input
                    type="number"
                    value={selectedUser.phone}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, phone: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Address</label>
                  <input
                    type="text"
                    value={selectedUser.address}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, address: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  />

                  <label>Gender</label>
                  <select
                    value={selectedUser.gender}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, gender: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  >
                    <option value="">Pilih Role</option>
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>

                  <label>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                  >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>

                  <label>Password (opsional)</label>
                  <input
                    type="password"
                    value={selectedUser.new_password || ''}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, new_password: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{ border: '1px solid gainsboro' }}
                    placeholder="Masukan password baru..."
                  />

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setModalEditUserOpen(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveUser}
                      className="text-white px-4 py-2 rounded"
                      style={{ backgroundColor: 'black' }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

            )}
          </div>
        );
        
      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Work Schedule</h2>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm flex items-center">
                <FiCalendar className="mr-1" /> Request Time Off
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              {workSchedule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workSchedule.map((shift, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{shift.date}</div>
                            <div className="text-sm text-gray-500">{shift.day}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{shift.startTime} - {shift.endTime}</div>
                            <div className="text-sm text-gray-500">{shift.hours} hours</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {shift.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${shift.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 
                                shift.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {shift.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No scheduled shifts found.</p>
              )}
            </div>
          </div>
        );
        
      case 'messages':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Messages</h2>
            
            <div className="bg-white p-6 rounded-lg shadow">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            {message.sender.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{message.sender}</p>
                            <p className="text-sm text-gray-500">{message.subject}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{message.time}</span>
                      </div>
                      <p className="mt-2 text-gray-700">{message.preview}...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No messages found.</p>
              )}
            </div>
          </div>
        );
        
      case 'documents':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Documents</h2>
            
            <div className="bg-white p-6 rounded-lg shadow">
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-2">
                        <FiFileText className="text-blue-500 text-xl mr-2" />
                        <h3 className="font-medium">{doc.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Uploaded: {doc.uploadDate}</p>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-blue-50 text-blue-600 py-1 px-3 rounded">
                          View
                        </button>
                        <button className="text-sm bg-gray-50 text-gray-600 py-1 px-3 rounded">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents found.</p>
              )}
            </div>
          </div>
        );
        
      case 'earnings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Earnings</h2>
            
            {earnings ? (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <FiDollarSign className="mr-2" /> Current Pay Period
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Hours Worked</p>
                      <p className="text-2xl font-bold">{earnings.currentPeriod.hours} hrs</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Gross Pay</p>
                      <p className="text-2xl font-bold">${earnings.currentPeriod.grossPay}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Net Pay</p>
                      <p className="text-2xl font-bold">${earnings.currentPeriod.netPay}</p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2">Upcoming Payday</h4>
                  <p className="text-gray-700">{earnings.nextPayday.date} (in {earnings.nextPayday.daysUntil} days)</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-4">Payment History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {earnings.paymentHistory.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.period}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.hours}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${payment.grossPay}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${payment.netPay}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading earnings data...</p>
            )}
          </div>
        );
        
      case 'category':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Manajemen Kategori</h2>

            {/* Form tambah kategori */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nama kategori"
                value={newKategoriName}
                onChange={(e) => setNewKategoriName(e.target.value)}
                className="border p-2 rounded w-1/3"
                style={{border:'1px solid gainsboro'}}
              />
              <input
                type="text"
                placeholder="Icon Category"
                value={newKategoriImage}
                onChange={(e) => setNewKategoriImage(e.target.value)}
                className="border p-2 rounded w-1/3"
                style={{border:'1px solid gainsboro'}}
              />
              <input
                type="text"
                placeholder="Deskripsi kategori"
                value={newKategoriDeskripsi}
                onChange={(e) => setNewKategoriDeskripsi(e.target.value)}
                className="border p-2 rounded w-1/3"
                style={{border:'1px solid gainsboro'}}
              />
              <button
                onClick={handleAddKategori}
                className="text-white px-4 py-2 rounded"
                style={{backgroundColor:'black', display:'flex', gap:'5px', alignItems:'center'}}
              >
                <FiPlus/> Tambah
              </button>
            </div>

            {/* Tabel kategori */}
            <DataTable
              columns={columnsCategory}
              data={filteredDataCategories}
              pagination
              highlightOnHover
              responsive
              noDataComponent="Belum ada data category"
            />


            {/* Modal edit kategori */}
            {modalOpen && selectedKategori && (
              <div className="fixed inset-0 bg-[#000000b3] flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow w-full max-w-lg">
                  <h2 className="text-2xl font-bold mb-3">Edit Kategori</h2>
                  <label>Kategori</label>
                  <input
                    type="text"
                    value={selectedKategori.nama}
                    onChange={(e) =>
                      setSelectedKategori({ ...selectedKategori, nama: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{border:'1px solid gainsboro'}}
                  />

                  <label>Ikon Kategori</label>
                  <input
                    type="text"
                    value={selectedKategori.gambar}
                    onChange={(e) =>
                      setSelectedKategori({ ...selectedKategori, gambar: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{border:'1px solid gainsboro'}}
                  />

                  <label>Deskripsi Kategori</label>
                  <input
                    type="text"
                    value={selectedKategori.deskripsi}
                    onChange={(e) =>
                      setSelectedKategori({ ...selectedKategori, deskripsi: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-4"
                    style={{border:'1px solid gainsboro'}}
                  />

                  <label className="mb-2">Sub Kategori</label>
                  <div className="flex gap-2 mb-4 mt-2">
                    <input
                      type="text"
                      placeholder="Nama sub kategori"
                      value={newSubKategori}
                      onChange={(e) => setNewSubKategori(e.target.value)}
                      className="border p-2 rounded w-full"
                      style={{border:'1px solid gainsboro'}}
                    />
                    {subKategoriEditIndex ? (
                      <button
                        onClick={handleSaveSubKategori}
                        className="text-white px-4 py-2 rounded"
                        style={{backgroundColor:'black'}}
                      >
                        Simpan
                      </button>
                    ) : (
                      <button
                        onClick={handleAddSubKategori}
                        className="bg-black text-white px-4 py-2 rounded"
                        style={{backgroundColor:'black'}}
                      >
                        Tambah
                      </button>
                    )}
                  </div>
                  <table className="w-full table-auto border border-collapse mb-3">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2">No</th>
                        <th className="border px-2">Nama</th>
                        <th className="border px-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedKategori.subKategori.map((s,i) => (
                        <tr key={s.id}>
                          <td className="border p-2 text-center">{i+1}</td>
                          <td className="border p-2 text-center">{s.nama}</td>
                          <td className="border p-2">
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              justifyContent:'center',
                              width:'100%'
                            }}>
                              <button onClick={() => handleEditSubKategori(s.id)} className="text-blue-600">
                                <FiEdit/>
                              </button>
                              <button onClick={() => handleDeleteSubKategori(s.id)} className="text-red-600">
                                <FiTrash/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {selectedKategori.subKategori.length === 0 && (
                        <tr>
                          <td className="border p-2 text-center" colspan="3">Belum ada data subkategori</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveKategori}
                      className="text-white px-4 py-2 rounded"
                      style={{backgroundColor:'black'}}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-row w-full max-w-screen-xl mx-auto p-4 md:p-6 gap-6">
        {/* Navigation Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden" style={{border: '1px solid gainsboro'}}>
            <nav className="p-2">
              <ul className="space-y-1">
                <li style={{borderBottom:'1px solid gainsboro', marginBottom: '0', backgroundColor: `${activeTab === 'dashboard' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiHome className="mr-3" />
                    <span>Dashboard</span>
                  </button>
                </li>
                
                <li style={{borderBottom:'1px solid gainsboro', marginBottom: '0', backgroundColor: `${activeTab === 'users' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiUsers className="mr-3" />
                    <span>Users</span>
                  </button>
                </li>
                
                <li style={{borderBottom:'1px solid gainsboro', marginBottom: '0', backgroundColor: `${activeTab === 'workers' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('workers')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiUsers className="mr-3" />
                    <span>Workers</span>
                  </button>
                </li>
                
                {/*<li style={{borderBottom:'1px solid gainsboro', marginBottom: '0', backgroundColor: `${activeTab === 'projects' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiCalendar className="mr-3" />
                    <span>Projects</span>
                  </button>
                </li>*/}

                <li style={{marginBottom: '0', backgroundColor: `${activeTab === 'category' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('category')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiList className="mr-3" />
                    <span>Category</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow" style={{width: 'calc(100% - 256px - 1.5rem)'}}>
          <div className="bg-white rounded-lg shadow p-6" style={{border: '1px solid gainsboro', width: '100%'}}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}