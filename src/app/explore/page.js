"use client"
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ImageSlider from '@/components/ImageSlider';
import Pagination from '@/components/Pagination';
import { db, auth } from '@/lib/firebase-config';
import { ref, push, set, child, get } from 'firebase/database';
import WorkerReviews from '@/components/WorkerReviews'

import Swal from 'sweetalert2';

export default function Home() {
  const params = useSearchParams();
  const categoryId = params.get('categoryId');
  const q = params.get('q');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [processedWorkers, setProcessedWorkers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedWorker, setSelectedWorker] = useState(null); // Track selected worker for modal
  const [showModal, setShowModal] = useState(false); // Control modal visibility

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderBudget, setOrderBudget] = useState(0);
  const [projectDeadline, setProjectDeadline] = useState(7);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageWorker, setMessageWorker] = useState('');

  const handleSendMessageWorker = async ()=>{
    Swal.fire({
      title: "Processing...",
      text: "Please wait while we complete your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const user = await (await fetch('/api/inbox/get-user-id')).json();
    const userId = user.userId;
    const workerId = selectedWorker.id;

    if (!messageWorker.trim()) return;
    if (!workerId) return;

    const messageData = {
      text: messageWorker,
      senderId: userId,
      senderType: 'client',
      timestamp: Date.now(),
      status: 'sent'
    };

    const placeholder = `${userId}_${workerId}`;
    try {
      // Add message to conversation
      const messagesRef = ref(db, `conversations/${placeholder}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, messageData);

      // Update last message in worker's conversation list
      const clientId = userId;
      if (clientId) {
        const workerConvRef = ref(db, `workerConversations/${workerId}/${clientId}`);
        await set(workerConvRef, {
          conversationId: placeholder,
          lastMessage: messageData.text,
          timestamp: messageData.timestamp,
          unreadCount: 0
        });

        // Update client's conversation list (mark as unread)
        const clientConvRef = ref(db, `clientConversations/${clientId}/${workerId}`);
        await set(clientConvRef, {
          conversationId: placeholder,
          lastMessage: messageData.text,
          timestamp: messageData.timestamp,
          unreadCount: 1
        });
      }

      setMessageWorker('');
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Your message has been successfully sent",
      })
    }catch(e){
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong!",
      });
    }
  }


  // Process workers to extract sub-categories from description
  const processWorkerData = (workers) => {
    return workers.map(worker => {
      const matches = worker.description?.match(/\[(.*?)\]/);
      let subCategories = [];
      let cleanDescription = worker.description || '';
      
      if (matches && matches[1]) {
        subCategories = matches[1].split(',').map(item => item.trim());
        cleanDescription = worker.description.replace(/\[.*?\]/, '').trim();
      }
      
      return {
        ...worker,
        description: cleanDescription,
        subCategories
      };
    });
  };

  // Extract unique sub-categories from all workers
  const subCategories = useMemo(() => {
    const categories = new Set();
    processedWorkers.forEach(worker => {
      worker.subCategories.forEach(item => {
        if (item) categories.add(item);
      });
    });
    return ['All', ...Array.from(categories).sort()];
  }, [processedWorkers]);

  const fetchWorkersAndCategory = async () => {
    try {
      setIsLoading(true);
      
      if(categoryId){
        // Fetch category name
        const categoryRes = await fetch(`/api/category/fetch?id=${categoryId}`);
        const categoryData = await categoryRes.json();
        setCategoryName(categoryData?.name || '');
      }
      
      // Fetch workers
      const workersRes = await fetch(`/api/workers?categoryId=${categoryId}&page=${currentPage}&q=${q}`);
      const workersData = await workersRes.json();
      
      if (workersRes.ok) {
        const processed = processWorkerData(workersData.workers);
        console.log(processed);
        setAllWorkers(processed);
        setProcessedWorkers(processed);
        setWorkers(processed);
        setTotalPages(workersData.totalPages);
      } else {
        throw new Error(workersData.error || 'Failed to fetch workers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // if (categoryId) {
      fetchWorkersAndCategory();
    // }
  }, [categoryId, currentPage]);

  // Filter workers based on active sub-category
  useEffect(() => {
    if (activeFilter === 'All') {
      setWorkers(processedWorkers);
    } else {
      const filtered = processedWorkers.filter(worker => 
        worker.subCategories.includes(activeFilter)
      );
      setWorkers(filtered);
    }
  }, [activeFilter, processedWorkers]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleWorkerCardClick = (worker) => {
    setSelectedWorker(worker);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWorker(null);
  };

  const handleCreateOrder = async () => {
    if(orderNotes.length === 0){
      return Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Notes cannot be empty!",
      });
    }
    if(orderBudget === 0){
      return Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Budget cannot be empty!",
      });
    }
    if(projectDeadline === 0){
      return Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Project deadline cannot be Zero!",
      });
    }
    const formData = new FormData();
    formData.append('workerId', selectedWorker.id);
    formData.append('notes', orderNotes);
    formData.append('budget', orderBudget);
    formData.append('deadline', projectDeadline);
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
      const response = await (await fetch('/api/order/create', {
        method: 'POST',
        body: formData,
      })).json();
      console.log(response);
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Your order has been successfully created",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Failed to create your order!",
      });
    }
    setOrderNotes('');
    setOrderBudget(0);
    setShowOrderModal(false);
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <ImageSlider />
      <section className="section pt-0">
        <div className="container">
          <h2 className="h4 mb-4">Pilih pekerja di bidang {categoryName} yang sesuai dengan kebutuhan Anda</h2>
          
          {/* Filter Section */}
          <div className="category-filter mb-10 mt-3 rounded-full bg-[#EEEEEE] px-4">
            <ul className="filter-list flex gap-2 py-2">
              {subCategories.map((filter, index) => (
                <li key={index}>
                  <button
                    className={`btn btn-sm rounded-full whitespace-nowrap ${
                      activeFilter === filter 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-800 hover:bg-gray-200'
                    } transition-colors duration-200`}
                    onClick={() => handleFilterClick(filter)}
                  >
                    {filter}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Workers Grid */}
          <div className="row">
            {workers.length > 0 ? (
              workers.map((worker) => (
                <div 
                  key={worker.id} 
                  className="mb-8 md:col-6 lg:col-4 cursor-pointer"
                  onClick={() => handleWorkerCardClick(worker)}
                >
                  <div className="card mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="relative flex justify-center items-center bg-gray-100 h-32 overflow-hidden">
                      <Image
                        src={worker.banner || '/images/default-banner.jpg'}
                        alt={`${worker.name} banner`}
                        fill
                        className="object-cover rounded-t-xl"
                      />
                      
                      <div className="relative z-10">
                        {worker.image ? (
                          <Image 
                            src={worker.image} 
                            alt={worker.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-white shadow-md"></div>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-4 relative">
                      <div className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4a2 2 0 0 0-2 2v16l8-5 8 5V6a2 2 0 0 0-2-2H6z"/>
                        </svg>
                      </div>

                      <h2 className="text-lg font-semibold text-gray-800">{worker.name}</h2>
                      <div className="flex items-center space-x-1 text-yellow-400 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(worker.rating) ? '★' : '☆'}
                          </span>
                        ))}
                        <span className="text-gray-600 text-sm ml-1">{worker.rating}</span>
                        <span className="text-gray-600 text-sm ml-1">({worker.reviewCount} ulasan)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        📍 {worker.address || 'Alamat tidak tersedia'}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {worker.categories?.map((category, index) => (
                          <span 
                            key={`cat-${index}`} 
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700"
                          >
                            {category.name}
                          </span>
                        ))}
                        
                        {worker.subCategories?.map((subCat, index) => (
                          <span 
                            key={`sub-${index}`} 
                            className="inline-block bg-blue-100 rounded-full px-3 py-1 text-xs font-semibold text-blue-700"
                          >
                            {subCat}
                          </span>
                        ))}
                      </div>
                      
                      <p className="mt-3 text-sm text-gray-800 line-clamp-2">
                        {worker.description || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-10">
                <p className="text-gray-500">Tidak ada pekerja yang tersedia untuk filter ini</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Pagination */}
      {workers.length > 0 && (
        <section className="section pt-0">
          <div className="container mx-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      )}

      {/* Worker Detail Modal */}
      {showModal && selectedWorker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-[#000000ab]" 
              onClick={closeModal}
            ></div>
            
            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Profile and Name Section Above Banner */}
              <div className="relative px-6 pt-6 pb-2 flex items-start">
                <div className="relative mr-4">
                  {selectedWorker.image ? (
                    <Image 
                      src={selectedWorker.image} 
                      alt={selectedWorker.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-white shadow-lg"></div>
                  )}
                </div>
                <div className="pt-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedWorker.name}</h2>
                  <div className="flex items-center space-x-1 text-yellow-400 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(selectedWorker.rating) ? '★' : '☆'}
                      </span>
                    ))}
                    <span className="text-gray-600 text-sm ml-1">{selectedWorker.rating}</span>
                    <span className="text-gray-600 text-sm ml-1">({selectedWorker.reviewCount} ulasan)</span>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                <Image
                  src={selectedWorker.banner || '/images/default-banner.jpg'}
                  alt={`${selectedWorker.name} banner`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Worker Details */}
              <div className="px-6 py-4">
                {/* Description */}
                <div className="mt-4">
                  <h6 className="font-semibold text-gray-900">Deskripsi</h6>
                  <p className="mt-1 text-gray-600">{selectedWorker.description || 'Tidak ada deskripsi'}</p>
                </div>

                {/* Address */}
                <div className="mt-4">
                  <h6 className="font-semibold text-gray-900">Alamat</h6>
                  <p className="mt-1 text-gray-600 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {selectedWorker.address || 'Alamat tidak tersedia'}
                  </p>
                </div>

                {/* Categories */}
                <div className="mt-4">
                  <h6 className="font-semibold text-gray-900">Keahlian</h6>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedWorker.categories?.map((category, index) => (
                      <span 
                        key={`modal-cat-${index}`} 
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        {category.name}
                      </span>
                    ))}
                    {selectedWorker.subCategories?.map((subCat, index) => (
                      <span 
                        key={`modal-sub-${index}`} 
                        className="inline-block bg-blue-100 rounded-full px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {subCat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <p className="text-gray-600 mb-4">
                    <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {selectedWorker.email || '-'}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {selectedWorker.phone || '-'}
                  </p>
                </div>
                {/*reviews section*/}
                <WorkerReviews workerId={selectedWorker.id}/>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-6 py-4 flex flex-row gap-3" style={{paddingTop: '0'}}>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                  onClick={() => setShowOrderModal(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Order
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowMessageModal(true)
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showOrderModal && selectedWorker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-[#0000005e]" 
              onClick={() => setShowOrderModal(false)}
            ></div>
            
            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Buat Pesanan untuk {selectedWorker.name}
                </h3>
                
                <div className="mt-4">
                  <label htmlFor="orderNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Detail Pesanan
                  </label>
                  <textarea
                    id="orderNotes"
                    rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Jelaskan secara detail pekerjaan yang ingin Anda pesan..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    style={{borderColor:'gainsboro'}}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="orderBudget" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <input
                    id="orderBudget"
                    type="number"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Masukan nominal budget anda..."
                    value={orderBudget}
                    onChange={(e) => setOrderBudget(e.target.value)}
                    style={{borderColor:'gainsboro'}}
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="orderDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline ({projectDeadline} Day)
                  </label>
                  <input
                    id="orderDeadline"
                    type="number"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Masukan nominal budget anda..."
                    value={projectDeadline}
                    onChange={(e) => setProjectDeadline(e.target.value)}
                    style={{borderColor:'gainsboro'}}
                    min="7"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCreateOrder}
                >
                  Buat Pesanan
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowOrderModal(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMessageModal && selectedWorker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-[#0000005e]" 
              onClick={() => setShowMessageModal(false)}
            ></div>
            
            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Kirim pesan ke {selectedWorker.name}
                </h3>
                
                <div className="mt-4">
                  <label htmlFor="message_" className="block text-sm font-medium text-gray-700 mb-1">
                    Isi Pesanan
                  </label>
                  <textarea
                    id="message_"
                    rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Kirim pesan ke worker..."
                    value={messageWorker}
                    onChange={(e) => setMessageWorker(e.target.value)}
                    style={{borderColor:'gainsboro'}}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSendMessageWorker}
                >
                  Kirim Pesanan
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowMessageModal(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}