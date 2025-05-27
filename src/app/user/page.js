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

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  // messages
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [clients, setClients] = useState({}); // To store client details
  const messagesBoxRef = useRef(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

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
      

      const convRef = ref(db, `clientConversations/${workerId}`);
      
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
        const workerRes = await fetch('/api/inbox/get-worker-details?workerId='+id);
        const workerDetails = await workerRes.json();
        if(workerDetails){
          clientDetails[id] = {
            name: workerDetails.worker.user.name,
            photoURL: workerDetails.worker.user.profile_pic || '/images/user_default_profile.webp'
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
      senderType: 'client',
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
      const workerConvRef = ref(db, `workerConversations/${userIDS[1]}/${userIDS[0]}`);
      await set(workerConvRef, {
        conversationId: selectedConversation,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 1,
        senderType: 'client'
      });

      // Update client's conversation list (mark as unread)
      const clientConvRef = ref(db, `clientConversations/${userIDS[0]}/${userIDS[1]}`);
      await set(clientConvRef, {
        conversationId: selectedConversation,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 1,
        senderType: 'client'
      });

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

  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: '-',
    pendingProjects: '-',
    canceledProjects: '-',
    completedProjects: '-'
  });

  const filteredProjects = projects.filter(project => {
    if (projectStatusFilter === 'all') return true;
    return project.status === projectStatusFilter;
  });

  // Fetch initial data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case 'dashboard':
            const dashboardRes = await (await fetch('/api/user/dashboard')).json();
            setDashboardStats(dashboardRes.stats);
            break;
            
          case 'profile':
            const profileRes = await fetch('/api/user/profile');
            const profileData = await profileRes.json();
            setProfileData(profileData);
            break;
            
          case 'projects':
            const projectsRes = await fetch('/api/user/projects');
            const projectsData = await projectsRes.json();
            setProjects(projectsData);
            break;
            
          case 'messages':
            if(!workerId){
              const worker = await (await fetch('/api/inbox/get-user-id')).json();
              setWorkerId(worker.userId);
            }
            console.log('fetching the conversations data');
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

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleCreateProject = () => {
    return location.href = '/';
  };

  const handleCancelProject = async (projectId) => {
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
      const response = await fetch('/api/user/projects/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        setProjects(projects.map(project => 
          project.id === projectId ? { ...project, status: 'cancelled' } : project
        ));
        
        if (selectedProject?.id === projectId) {
          setSelectedProject({ ...selectedProject, status: 'cancelled' });
        }
        
        Swal.fire({
          icon: "success",
          title: "Project Canceled!",
          text: "Your project has been successfully canceled",
        });
      } else {
        throw new Error('Failed to cancel project');
      }
    } catch (error) {
      console.error('Error cancelling project:', error);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong!",
      });
    }
  };

  const handleInitiatePayment = (project) => {
    setSelectedProject(project);
    setPaymentAmount(project.budget);
    setShowPaymentModal(true);
  };

  const renewProjectList = async ()=>{
    console.log('renewing the project list');
    const projectsRes = await fetch('/api/user/projects');
    const projectsData = await projectsRes.json();
    setProjects(projectsData);
  }

  const handleSubmitPayment = async () => {
    const projectId = selectedProject.id;
    try {
      const response = await fetch('/api/user/payment/snap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId })
      });

      const data = await response.json();
      
      if (data.snapToken) {
        // Buka Snap Popup
        window.snap.pay(data.snapToken, {
          onSuccess: (result) => {
            console.log('Payment success', result);
            renewProjectList();
          },
          onPending: (result) => {
            console.log('Payment pending', result);
            renewProjectList();
          },
          onError: (error) => {
            console.error('Payment error', error);
            renewProjectList();
          },
          onClose: () => {
            console.log('Payment popup closed');
            renewProjectList();
          }
        });
      }
      setSelectedProject(null);
      setPaymentAmount(0);
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleConfirmCompletion = async (projectId) => {
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
      const response = await fetch('/api/user/projects/confirm-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        ));
        
        if (selectedProject?.id === updatedProject.id) {
          setSelectedProject(updatedProject);
        }
        Swal.fire({
          icon: "success",
          title: "Project Confirmed!",
          text: "Your project has been successfully confirmed",
        });
        renewProjectList();
      } else {
        throw new Error('Failed to confirm completion');
      }
    } catch (error) {
      console.error('Error confirming completion:', error);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong!",
      });
    }
  };

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

  const handleRateProject = (project) => {
    setSelectedProject(project);
    setRating(0);
    setReviewText('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      return Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Rating cannot be empty!",
      });
    }

    setIsSubmittingRating(true);
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

      const response = await fetch('/api/user/projects/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: reviewText,
          projectId: selectedProject.id
        })
      });
      
      // refreshProjects();
      
      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        ));
        
        if (selectedProject?.id === updatedProject.id) {
          setSelectedProject(updatedProject);
        }
        Swal.fire({
          icon: "success",
          title: "Rating Submited!",
          text: "Thankyou for your rating",
        });
        renewProjectList();
        setShowRatingModal(false);
      } else {
        throw new Error('Failed to rate the project');
      }
    } catch (error) {
      console.error('Error rate the project:', error);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong!",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

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
        
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <div className="flex items-center gap-3">
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
                <button
                  onClick={handleCreateProject}
                  className="text-white py-2 px-4 rounded-md text-sm"
                  style={{backgroundColor:'black'}}
                >
                  + New Project
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              {filteredProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
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
                            {project.worker ? (
                              <div className="flex items-center">
                                <img 
                                  src={project.worker.avatar || '/images/user_default_profile.webp'} 
                                  alt={project.worker.name}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{project.worker.name}</div>
                                  <div className="text-sm text-gray-500">{project.worker.rating} ★</div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Not assigned</div>
                            )}
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
                                'bg-gray-100 text-gray-800'}`}>
                              {project.payment_status ? project.payment_status.toLowerCase() : 'unpaid'}
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
                            {project.status === 'completed' && project.user_confirmed && !project.rating && (
                              <button
                                onClick={() => handleRateProject(project)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Rate
                              </button>
                            )}
                            {project.status === 'pending' && (
                              <button
                                onClick={() => handleCancelProject(project.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            )}
                            {project.status === 'accepted' && project.payment_status !== 'PAID' && (
                              <button
                                onClick={() => handleInitiatePayment(project)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No projects found</p>
                </div>
              )}
            </div>

            {/* Project Detail Modal */}
            {showProjectModal && selectedProject && (
              <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#0000008c] overflow-y-auto">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="col-span-2 p-4 rounded-lg border border-gray-200 mb-4">
                      <h6 className="font-semibold mb-2">Project Description</h6>
                      <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                      
                      <h6 className="font-semibold mb-2">Requirements</h6>
                      <ul className="list-disc pl-5 text-gray-600 mb-4">
                        {selectedProject.requirements.map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                            <span className="ml-2 font-medium">Rp. {selectedProject.budget.toLocaleString()}</span>
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
                    
                    <div className="space-y-4">
                      {selectedProject.worker && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h6 className="font-semibold mb-2">Worker Information</h6>
                          <div className="flex items-center mb-2">
                            <img 
                              src={selectedProject.worker.avatar || '/images/user_default_profile.webp'} 
                              alt={selectedProject.worker.name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <div className="font-medium">{selectedProject.worker.name}</div>
                              <div className="text-sm text-gray-500">{selectedProject.worker.rating} ★ ({selectedProject.worker.reviews} reviews)</div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="mb-1">
                              <span className="text-gray-500">Skills:</span>
                              <span className="ml-2">{selectedProject.worker.skills.join(', ')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Joined:</span>
                              <span className="ml-2">{new Date(selectedProject.worker.joined_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h6 className="font-semibold mb-2">Payment Information</h6>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${selectedProject.payment_status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                selectedProject.payment_status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                selectedProject.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {selectedProject.payment_status ? selectedProject.payment_status.toLowerCase() : 'unpaid'}
                            </span>
                          </div>
                          {selectedProject.payment_date && (
                            <div>
                              <span className="text-sm text-gray-500">Payment Date:</span>
                              <span className="ml-2">
                                {new Date(selectedProject.payment_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    {selectedProject.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleCancelProject(selectedProject.id);
                          setShowProjectModal(false);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                      >
                        Cancel Project
                      </button>
                    )}
                    
                    {selectedProject.status === 'in_progress' && selectedProject.payment_status !== 'PAID' && (
                      <button
                        onClick={() => {
                          setShowProjectModal(false);
                          handleInitiatePayment(selectedProject);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-md"
                      >
                        Make Payment
                      </button>
                    )}
                    
                    {selectedProject.status === 'completed' && selectedProject.user_confirmed === false && (
                      <button
                        onClick={() => {
                          handleConfirmCompletion(selectedProject.id);
                          setShowProjectModal(false);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      >
                        Confirm Completion
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
            
            {/* Payment Modal */}
            {showPaymentModal && selectedProject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000008c]">
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">Make Payment</h3>
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Project</label>
                      <input
                        type="text"
                        value={selectedProject.title}
                        className="w-full p-2 rounded-md border border-gray-300"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Amount</label>
                      <input
                        type="text"
                        value={`Rp. ${paymentAmount.toLocaleString()}`}
                        className="w-full p-2 rounded-md border border-gray-300"
                        readOnly
                      />
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      <p className="text-sm text-yellow-700">
                        Please complete your payment within 24 hours to avoid project cancellation.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitPayment}
                      className="px-4 py-2 bg-green-500 text-white rounded-md"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/*rating modal*/}
            {showRatingModal && selectedProject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0000008c]">
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">Rate Project</h3>
                    <button 
                      onClick={() => setShowRatingModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-medium mb-2">{selectedProject.title}</h4>
                      {selectedProject.worker && (
                        <p className="text-gray-600">{selectedProject.worker.name}</p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                            style={{fontSize:'32px'}}
                          >
                            {star <= rating ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Review
                      </label>
                      <textarea
                        id="review"
                        rows={4}
                        className="w-full p-2 rounded-md border border-gray-300"
                        placeholder="Share your experience with this project..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowRatingModal(false)}
                        className="px-4 py-2 bg-gray-300 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitRating}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        disabled={isSubmittingRating}
                      >
                        {isSubmittingRating ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
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
                        className={`flex ${message.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div>
                          <div 
                            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 ${message.senderType !== 'worker' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            style={{
                              borderRadius:`${message.senderType !== 'worker' ? '15px 15px 0 15px' : '0 15px 15px 15px'}`
                            }}
                          >
                            <p>{message.text}</p>
                          </div>
                          <p className={`text-xs mt-1 text-gray-500`} style={{textAlign:message.senderType !== 'worker' ? 'right' : 'left'}}>
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
                    No conversations yet. You can send a message to worker on explore page.
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
                            {`${conversation.senderType === 'worker' ? 'Worker: ' : 'Anda: '}${
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
        
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-row w-full max-w-screen-xl mx-auto p-4 md:p-6 gap-6">
        {/* Navigation Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <nav className="p-2">
              <ul className="space-y-1">
                <li className={`m-0 ${activeTab === 'dashboard' ? 'bg-gray-100' : ''} border-b border-gray-200`}>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50"
                  >
                    <FiHome className="mr-3" />
                    <span>Dashboard</span>
                  </button>
                </li>
                
                <li className={`m-0 ${activeTab === 'projects' ? 'bg-gray-100' : ''} border-b border-gray-200`}>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50"
                  >
                    <FiCalendar className="mr-3" />
                    <span>Projects</span>
                  </button>
                </li>
                
                <li className={`m-0 ${activeTab === 'messages' ? 'bg-gray-100' : ''}`}>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50"
                  >
                    <FiMessageSquare className="mr-3" />
                    <span>Messages</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow" style={{width: 'calc(100% - 256px - 1.5rem)'}}>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 w-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}