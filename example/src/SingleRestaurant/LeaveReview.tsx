import React from 'react'
import { usePost } from 'voyager-react'

interface LeaveReviewProps {
  restaurantId: string
}

const LeaveReview: React.FC<LeaveReviewProps> = ({ restaurantId }) => {
  const [, postReview] = usePost('reviews')

  const sendReview = () => {
    postReview({
      body: {
        comment: 'hi',
        date_of_visit: new Date().toISOString(),
        rating: 4,
        restaurant: restaurantId
      }
    })
  }
  return (
    <div>
      <button onClick={sendReview}>Send Review</button>
    </div>
  )
}

export default LeaveReview
