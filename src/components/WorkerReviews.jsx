'use client'

import { useState, useEffect } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

export default function WorkerReviews({ workerId }) {
  const [ratings, setRatings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState({})
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false)

  const fetchRatings = async (pageNum) => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/ratings/${workerId}?page=${pageNum}&limit=3`
      )
      const data = await res.json()

      if (data.success) {
        if (pageNum === 1) {
          setRatings(data.data)
          setStats(data.stats)
        } else {
          setRatings(prev => [...prev, ...data.data])
        }
        setHasMore(data.pagination.hasMore)
      } else {
        setError(data.error || 'Failed to fetch ratings')
      }
    } catch (err) {
      setError('Failed to fetch ratings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRatings(1)
  }, [workerId])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchRatings(nextPage)
  }

  const toggleReview = (id) => {
    setExpandedReviews(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const toggleReviewsSection = () => {
    setIsReviewsExpanded(prev => !prev)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'hari ini'
    if (diffInDays === 1) return 'kemarin'
    if (diffInDays < 7) return `${diffInDays} hari lalu`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu lalu`
    return `${Math.floor(diffInDays / 30)} bulan lalu`
  }

  if (loading && page === 1) return <div className="mt-6 py-4 text-center">Memuat ulasan...</div>
  if (error) return <div className="mt-6 py-4 text-red-500">{error}</div>
  if (!stats || ratings.length === 0) return <div className="mt-6 py-4">Belum ada ulasan</div>

  return (
    <div className="mt-3 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h6 className="font-semibold text-gray-900">Ulasan Klien</h6>
        <button 
          onClick={toggleReviewsSection}
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          {isReviewsExpanded ? (
            <>
              <span className="mr-1">Sembunyikan</span>
              <FiChevronUp />
            </>
          ) : (
            <>
              <span className="mr-1">Lihat Ulasan</span>
              <FiChevronDown />
            </>
          )}
        </button>
      </div>
      
      {isReviewsExpanded && (
        <>
          {/* Review Stats */}
          <div className="flex items-center mb-6">
            <div className="text-4xl font-bold mr-4">{stats.average}</div>
            <div className="flex-1">
              {stats.distribution.map(item => (
                <div key={item.stars} className="flex items-center mb-1">
                  <span className="w-12 text-sm text-gray-600 text-center">{item.stars}</span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-yellow-400 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-gray-600 text-center">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {ratings.map(rating => (
              <div key={rating.id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center overflow-hidden">
                    {rating.order.user.profile_pic ? (
                      <img 
                        src={rating.order.user.profile_pic} 
                        alt={rating.order.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {rating.order.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h6 className="font-semibold">{rating.order.user.name}</h6>
                    <div className="flex items-center">
                      {renderStars(rating.rating)}
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDate(rating.createdAt.toString())}
                      </span>
                    </div>
                  </div>
                  {rating.comment.length > 100 && (
                    <button 
                      onClick={() => toggleReview(rating.id)}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      {expandedReviews[rating.id] ? 'Sembunyikan' : 'Lihat Ulasan'}
                    </button>
                  )}
                </div>
                
                {(expandedReviews[rating.id] || !rating.comment || rating.comment.length < 100) && (
                  <p className="text-gray-600 mt-1">
                    {rating.comment || 'Tidak ada komentar'}
                  </p>
                )}
                
                {rating.comment && rating.comment.length >= 100 && !expandedReviews[rating.id] && (
                  <p className="text-gray-600 mt-1">
                    {rating.comment.substring(0, 100)}...
                  </p>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 py-2 rounded"
              >
                {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}