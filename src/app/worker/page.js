'use client';

import { useState, useEffect, useRef } from 'react';
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
  FiCheck,
  FiX,
  FiClock,
  FiChevronLeft,
  FiSend } from 'react-icons/fi';

import { useDropzone } from 'react-dropzone';

import { db, auth } from '@/lib/firebase-config';
import { ref, push, set, child, get, onValue } from 'firebase/database';

import Swal from 'sweetalert2';

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [earnings, setEarnings] = useState(null);

  const [kategori, setKategori] = useState('');
  const [subKategori, setSubKategori] = useState('');
  const [kategoriList, setKategoriList] = useState([]);
  const [deskripsi, setDeskripsi] = useState(profileData?.deskripsi || '');
  const [isActive, setIsActive] = useState(profileData?.status === 'active');
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');

  const [workerBalance, setWorkerBalance] = useState(0);
  
  const fileInputRef = useRef();

  // messages
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [clients, setClients] = useState({}); // To store client details
  const messagesBoxRef = useRef(null);

  const [workerId, setWorkerId] = useState(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if(messagesBoxRef.current)
      messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (workerId) {
      fetchConversations();
    }
  }, [workerId]);

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      
      if (!workerId) {
        return;
      }
      

      const convRef = ref(db, `workerConversations/${workerId}`);
      
      onValue(convRef, (snapshot) => {
        const data = snapshot.val() || {};
        console.log(data);
        const convList = Object.entries(data).map(([clientId, convData]) => ({
          clientId,
          conversationId: convData.conversationId,
          lastMessage: convData.lastMessage,
          timestamp: convData.timestamp,
          unreadCount: convData.unreadCount || 0,
          senderType: convData.senderType
        }));
        
        setConversations(convList);
        
        // Fetch client details for each conversation
        fetchClientDetails(convList.map(c => c.clientId));
      });

      setLoadingConversations(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoadingConversations(false);
    }
  };

  const fetchClientDetails = async (clientIds) => {
    try {
      const clientDetails = {};
      for(let i=0;i<clientIds.length;i++){
        const id = clientIds[i];
        const userRes = await fetch('/api/inbox/get-user-details?userId='+id);
        const userDetails = await userRes.json();
        if(userDetails){
          clientDetails[id] = {
            name: userDetails.user.name,
            photoURL: userDetails.user.profile_pic || '/images/user_default_profile.webp'
          }; 
        }
      }
      setClients(clientDetails);
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation.conversationId);
    setLoadingMessages(true);
    
    // Mark as read
    if (conversation.unreadCount > 0) {
      const workerId = auth.currentUser?.uid;
      const convRef = ref(db, `workerConversations/${workerId}/${conversation.clientId}/unreadCount`);
      set(convRef, 0);
    }
    
    // Load messages
    const messagesRef = ref(db, `conversations/${conversation.conversationId}/messages`);
    
    onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val() || {};
      const messagesList = Object.entries(messagesData).map(([id, msg]) => ({
        id,
        ...msg
      })).sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(messagesList);
      setLoadingMessages(false);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    if (!workerId) return;

    // return console.log('conversation id: ',selectedConversation);

    const messageData = {
      text: newMessage,
      senderId: workerId,
      senderType: 'worker',
      timestamp: Date.now(),
      status: 'sent'
    };

    try {
      // Add message to conversation
      const messagesRef = ref(db, `conversations/${selectedConversation}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, messageData);

      console.log('message sended');

      const userIDS = selectedConversation.split('_');
      // Update last message in worker's conversation list
      // const clientId = conversations.find(c => c.conversationId === selectedConversation)?.clientId;
      // if (clientId) {
      const workerConvRef = ref(db, `workerConversations/${userIDS[1]}/${userIDS[0]}`);
      await set(workerConvRef, {
        conversationId: selectedConversation,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 0,
        senderType: 'worker'
      });

      // Update client's conversation list (mark as unread)
      const clientConvRef = ref(db, `clientConversations/${userIDS[0]}/${userIDS[1]}`);
      await set(clientConvRef, {
        conversationId: selectedConversation,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 1,
        senderType: 'worker'
      });
      // }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const goBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
  };
  // messages end


  // dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: '-',
    pendingProjects: '-',
    canceledProjects: '-',
    completedProjects: '-'
  });

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('banner', bannerFile);
    const deskripsi_end = `${deskripsi} [${subKategori}]`;
    formData.append('deskripsi', deskripsi_end);
    formData.append('status', isActive ? 'active' : 'inactive');
    formData.append('categoryId', kategori);
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
      await fetch('/api/worker/profile-update', {
        method: 'POST',
        body: formData,
      });
      Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been successfully updated",
        });
    } catch (err) {
      console.error(err);
      Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Something went wrong!",
        });
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

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

  // Project related functions
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleUpdateProjectStatus = async (projectId, status) => {
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
      const response = await fetch('/api/worker/projects/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          status
        }),
      });

      if (response.ok) {
        // Update the local state to reflect the change
        setProjects(projects.map(project => 
          project.id === projectId ? { ...project, status } : project
        ));
        
        if (selectedProject?.id === projectId) {
          setSelectedProject({ ...selectedProject, status });
        }
        
        Swal.fire({
          icon: "success",
          title: "Project Updated!",
          text: "Your project has been successfully updated",
        });
      } else {
        throw new Error('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Something went wrong!",
        });
    }
  };

  const filteredProjects = projects.filter(project => {
    if (projectStatusFilter === 'all') return true;
    return project.status === projectStatusFilter;
  });

  const extractArrayFromDescription = (text) => {
    const match = text.match(/\[(.*?)\]/);
    return match ? match[1].split(',').map(item => item.trim()) : [];
  };

  // Fetch initial data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case 'dashboard':
            const dashboardRes = await (await fetch('/api/worker/dashboard')).json();
            setDashboardStats(dashboardRes.stats);
            break;
          
          case 'profile':
            const profileRes = await fetch('/api/worker/profile');
            const profileData = await profileRes.json();
            const kategoriRes = await (await fetch('/api/category/list')).json();
            setProfileData(profileData.data);
            setDeskripsi(profileData.data.worker?.description.replace(/\[.*?\]/g, '').trim() || '');
            setIsActive(profileData.data.worker?.status === 'active' || false);
            setKategoriList(kategoriRes.categories);
            setSubKategori(extractArrayFromDescription(profileData.data.worker?.description || '').join(', '))
            setKategori(kategoriRes.userCategory || '');
            break;
            
          case 'projects':
            const projectsRes = await fetch('/api/worker/projects');
            const projectsData = await projectsRes.json();
            setProjects(projectsData);
            break;
            
          case 'messages':
            if(!workerId){
              const worker = await (await fetch('/api/inbox/get-worker-id')).json();
              setWorkerId(worker.workerId);
            }
            console.log('fetching the conversations data');
            break;

          case 'balance':
            const res = await (await fetch('/api/profile/get-balance')).json();
            console.log(res);
            setWorkerBalance(res.balance);
            break;
            
          default:
            if (selectedConversation) {
              const messagesRef = ref(db, `conversations/${selectedConversation}/messages`);
              off(messagesRef);
            }
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatChatTimestamp = (timestamp) => {
    const time = new Date(timestamp);
    const now = new Date();

    const dateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffTime = dateOnly(now) - dateOnly(time);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const timeString = time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (diffDays === 0) return `Hari Ini, ${timeString}`;
    if (diffDays === 1) return `Kemarin, ${timeString}`;
    if (diffDays <= 7) return `${diffDays} hari yang lalu, ${timeString}`;

    return `${time.toLocaleDateString()}, ${timeString}`;
  }

  function balanceParse(number){
    return number
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-tasks text-blue-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalProjects}</p>
                </div>
              </div>

              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-hourglass-start text-green-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Pending</p>
                  <p className="text-2xl font-bold">{dashboardStats.pendingProjects}</p>
                </div>
              </div>

              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-times text-yellow-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Canceled</p>
                  <p className="text-2xl font-bold">{dashboardStats.canceledProjects}</p>
                </div>
              </div>

              <div className="bg-white border border-[gainsboro] rounded-[10px] p-4 flex items-center">
                <i className="fas fa-check text-green-500 text-3xl mr-4"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Completed</p>
                  <p className="text-2xl font-bold">{dashboardStats.completedProjects}</p>
                </div>
              </div>
            </div>

          </div>

        );
        
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-3">Worker Profile</h2>
            {profileData ? (
              <>
                <div className="relative bg-gray-200 h-48 rounded-lg overflow-hidden">
                  <img
                    src={profileData.banner || '/images/default-banner.jpg'}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex justify-center items-center flex-col">
                    <img
                      src={profileData.profile_pic || '/images/user_default_profile.webp'}
                      alt="Profile"
                      className="w-18 h-18 rounded-full border-4 border-white object-cover bg-white"
                      style={{border:'2px solid white'}}
                    />
                    <div className="text-white mt-2">@{profileData.nama} ({isActive ? 'active' : 'inactive'})</div>
                    <div className="text-white">{deskripsi || '-'}</div>
                  </div>
                  <button
                    onClick={() => setShowBannerModal(true)}
                    className="absolute bottom-2 right-2 bg-white w-8 h-8 p-2 rounded-full shadow hover:bg-gray-100"
                    title="Edit Banner"
                  >
                    ✏️
                  </button>
                </div>

                <div className="bg-white p-2 rounded-lg shadow mt-4 space-y-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Deskripsi</label>
                    <textarea
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      className="w-full p-2 rounded-md"
                      style={{border: '1px solid gainsboro'}}
                      placeholder="Masukan deskripsi kamu..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Kategori Worker</label>
                    <select
                      value={kategori}
                      onChange={(e) => {setKategori(e.target.value);setSubKategori('')}}
                      className="w-full p-2 rounded-md"
                      style={{ border: '1px solid gainsboro' }}
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoriList.map((item)=>(
                        <option value={item.id} key={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>

                  {kategori && (
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Sub Kategori</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {kategoriList
                          .find(cat => cat.id === kategori)?.subcategories
                          ?.map(sub => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                // Tambah atau hapus subkategori
                                const currentSubs = subKategori.split(', ').filter(s => s);
                                if (currentSubs.includes(sub.name)) {
                                  setSubKategori(currentSubs.filter(s => s !== sub.name).join(', '));
                                } else {
                                  setSubKategori([...currentSubs, sub.name].join(', '));
                                }
                              }}
                              className={`text-sm rounded-full ${
                                subKategori.includes(sub.name)
                                  ? 'bg-black text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                              style={{padding: '5px 10px'}}
                            >
                              {sub.name}
                            </button>
                          ))}
                      </div>
                      <input
                        value={subKategori}
                        onChange={(e) => setSubKategori(e.target.value)}
                        className="w-full rounded-md outline-none"
                        style={{border: '1px solid gainsboro', padding: '10px 15px'}}
                        placeholder="Pilih sub kategori di atas"
                        readOnly
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Status Worker</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isActive}
                        onChange={() => setIsActive(!isActive)}
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300 relative">
                        <span
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300"
                          style={{
                            transform: isActive ? 'translateX(22px)' : 'translateX(3px)',
                          }}
                        ></span>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={handleUpdateProfile}
                    className="text-white py-2 px-4 rounded-md text-sm"
                    style={{backgroundColor: 'black'}}
                  >
                    Update Profile
                  </button>
                </div>

                {showBannerModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000b3] bg-opacity-[50]">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
                      <h3 className="text-lg font-bold mb-4">Update Banner</h3>
                      <div
                        {...getRootProps()}
                        className="border-2 border-dashed p-4 mb-4 rounded-md text-center text-gray-600"
                        style={{ backgroundColor: '#f9f9f9' }}
                      >
                        <input {...getInputProps()} />
                        <p>Drag & Drop your file here, or click to select</p>
                      </div>

                      {bannerPreview && (
                        <img
                          src={bannerPreview}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-md mb-4"
                        />
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelBanner}
                          className="px-4 py-2 text-sm bg-gray-300 rounded-md"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleBannerSubmit}
                          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md"
                          style={{ backgroundColor: 'black' }}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>Loading profile data...</p>
            )}
          </div>
        );
        
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  className="p-2 rounded-md border border-gray-300 text-sm"
                >
                  <option value="all">All Projects</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              {filteredProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProjects.map((project) => (
                        <tr key={project.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500">{project.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={project.client.avatar || '/images/user_default_profile.webp'} 
                                alt={project.client.name}
                                className="w-8 h-8 rounded-full mr-2"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{project.client.name}</div>
                                <div className="text-sm text-gray-500">{project.client.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.duration} days
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rp. {project.budget.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${project.payment_status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                project.payment_status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                project.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {project.payment_status.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewProject(project)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </button>
                            {project.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateProjectStatus(project.id, 'accepted')}
                                  className="text-green-600 hover:text-green-900 mr-2"
                                  title="Accept Project"
                                >
                                  <FiCheck />
                                </button>
                                <button
                                  onClick={() => handleUpdateProjectStatus(project.id, 'cancelled')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject Project"
                                >
                                  <FiX />
                                </button>
                              </>
                            )}
                            {project.status === 'in_progress' && (
                              <button
                                onClick={() => handleUpdateProjectStatus(project.id, 'completed')}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Completed"
                              >
                                <FiCheck />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No projects found.</p>
              )}
            </div>

            {/* Project Detail Modal */}
            {showProjectModal && selectedProject && (
              <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#000000b3] bg-opacity-[50] overflow-y-auto">
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-2xl mt-[30px] mb-[30px]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{selectedProject.title}</h3>
                    <button 
                      onClick={() => setShowProjectModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1gap-6 mb-6">
                    <div className="col-span-2 p-4 rounded-lg mb-4" style={{border: '1px solid gainsboro'}}>
                      <h6 className="font-semibold mb-2">Project Description</h6>
                      <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                      
                      <h6 className="font-semibold mb-2">Requirements</h6>
                      <ul className="list-disc pl-5 text-gray-600 mb-4">
                        {selectedProject.requirements.map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-4 col-span-2">
                      <div className="bg-gray-50 p-4 rounded-lg" style={{border: '1px solid gainsboro'}}>
                        <h6 className="font-semibold mb-2">Project Details</h6>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${selectedProject.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                selectedProject.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                selectedProject.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {selectedProject.status.replace('_', ' ')}
                            </span>
                          </div>
                          {selectedProject.status === 'completed' && (
                            <div>
                              <span className="text-sm text-gray-500">Komfirmasi Client:</span>
                              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}>
                                {selectedProject.userConfirmed ? 'Terkonfirmasi' : 'Belum Dikonfirmasi'}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-sm text-gray-500">Budget:</span>
                            <span className="ml-2 font-medium">${selectedProject.budget.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Timeline:</span>
                            <span className="ml-2">
                              {new Date(selectedProject.start_date).toLocaleDateString()} - {new Date(selectedProject.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Created:</span>
                            <span className="ml-2">
                              {new Date(selectedProject.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg" style={{border: '1px solid gainsboro'}}>
                        <h6 className="font-semibold mb-2">Client Information</h6>
                        <div className="flex items-center mb-2">
                          <img 
                            src={selectedProject.client.avatar || '/images/user_default_profile.webp'} 
                            alt={selectedProject.client.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="font-medium">{selectedProject.client.name}</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="mb-1">
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-2">{selectedProject.client.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <span className="ml-2">{selectedProject.client.phone || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                      {selectedProject.rating && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h6 className="font-semibold mb-2">Client Feedback</h6>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-500">Rating:</span>
                            <span className="ml-2 font-medium">{selectedProject.rating.rating.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Comment:</span>
                            <span className="ml-2">
                              {selectedProject.rating.comment}
                            </span>
                          </div>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    {selectedProject.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleUpdateProjectStatus(selectedProject.id, 'accepted');
                            setShowProjectModal(false);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
                        >
                          <FiCheck className="mr-1" /> Accept Project
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateProjectStatus(selectedProject.id, 'cancelled');
                            setShowProjectModal(false);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
                        >
                          <FiX className="mr-1" /> Reject Project
                        </button>
                      </>
                    )}
                    {selectedProject.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          handleUpdateProjectStatus(selectedProject.id, 'completed');
                          setShowProjectModal(false);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
                      >
                        <FiCheck className="mr-1" /> Mark as Completed
                      </button>
                    )}
                    <button
                      onClick={() => setShowProjectModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6 h-full">
            {!selectedConversation && (
              <h2 className="text-2xl font-bold mb-4">Messages</h2>
            )}
            
            {selectedConversation ? (
              <div className="flex flex-col h-[500px]">
                {/* Chat header */}
                <div className="flex items-center p-4 pt-0 border-b border-gray-200">
                  <button 
                    onClick={goBackToList}
                    className="mr-2 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiChevronLeft className="text-lg" />
                  </button>
                  
                  {conversations.find(c => c.conversationId === selectedConversation) && (
                    <div className="flex items-center">
                      <img 
                        src={clients[conversations.find(c => c.conversationId === selectedConversation).clientId]?.photoURL || '/images/user_default_profile.webp'} 
                        alt="Client" 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h6 className="font-medium">
                          {clients[conversations.find(c => c.conversationId === selectedConversation).clientId]?.name || 'Client'}
                        </h6>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesBoxRef}>
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.senderType === 'worker' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div>
                          <div 
                            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 ${message.senderType === 'worker' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            style={{
                              borderRadius:`${message.senderType === 'worker' ? '15px 15px 0 15px' : '0 15px 15px 15px'}`
                            }}
                          >
                            <p>{message.text}</p>
                          </div>
                          <p className={`text-xs mt-1 text-gray-500`} style={{textAlign:message.senderType === 'worker' ? 'right' : 'left'}}>
                            {formatChatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 pb-0 border-t border-gray-200 bg-white">
                  <div className="flex items-center rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik pesan..."
                      aria-label="Tulis pesan"
                      className="flex-1 px-4 py-2 text-sm"
                      style={{
                        border: 'none',
                        backgroundColor: 'whitesmoke',
                      }}
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex items-center justify-center transition"
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              <div className="space-y-4">
                {loadingConversations ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No conversations yet. When clients message you, they&apos;ll appear here.
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.conversationId}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${conversation.unreadCount > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center">
                        <img 
                          src={clients[conversation.clientId]?.photoURL || '/images/user_default_profile.webp'} 
                          alt="Client" 
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h6>
                              {clients[conversation.clientId]?.name || 'Client'}
                            </h6>
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm ${conversation.unreadCount > 0 ? 'text-gray-800' : 'text-gray-600'}`}>
                            {`${conversation.senderType === 'client' ? 'Client: ' : 'Anda: '}${
                              conversation.lastMessage?.length > 50
                                ? conversation.lastMessage.substring(0, 50) + '...'
                                : conversation.lastMessage
                            }`}
                          </p>

                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );

      case 'balance':
        return (
          <div className="space-y-6 h-full">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold">Balance</h2>
            </div>

            <div className="bg-white shadow-md rounded-2xl">
              <p className="text-gray-500 text-sm">Your Current Balance</p>
              <h3 className="text-3xl font-semibold text-gray-800 mt-1">Rp {balanceParse(workerBalance)}</h3>
            </div>
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
                
                <li style={{borderBottom:'1px solid gainsboro', marginBottom: '0', backgroundColor: `${activeTab === 'profile' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiUser className="mr-3" />
                    <span>My Profile</span>
                  </button>
                </li>
                
                <li style={{borderBottom:'1px solid gainsboro', marginBottom: '0', backgroundColor: `${activeTab === 'projects' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiCalendar className="mr-3" />
                    <span>Projects</span>
                  </button>
                </li>
                
                <li style={{borderBottom:'1px solid gainsboro', marginBottom: '0', backgroundColor: `${activeTab === 'messages' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiMessageSquare className="mr-3" />
                    <span>Messages</span>
                  </button>
                </li>
                <li style={{marginBottom: '0', backgroundColor: `${activeTab === 'balance' ? 'whitesmoke' : 'white'}`}}>
                  <button
                    onClick={() => setActiveTab('balance')}
                    className={`w-full flex items-center p-3 rounded-lg`}
                  >
                    <FiDollarSign className="mr-3" />
                    <span>Balance</span>
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