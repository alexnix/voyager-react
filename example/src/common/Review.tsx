import React from 'react'

interface Props {
  review: any
  onDelete: () => void
}

const Review: React.FC<Props> = ({ review }) => {
  return (
    <div>
      {review.comment}
      <div>
        <button>Delete</button>
      </div>
    </div>
  )
}

export default Review
