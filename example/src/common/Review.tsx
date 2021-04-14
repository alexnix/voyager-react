import React from 'react'

interface Props {
  review: any
  onDelete: () => void
}

const Review: React.FC<Props> = ({ review, onDelete }) => {
  return (
    <div>
      {review.comment}
      <div>
        <button onClick={onDelete}>Delete</button>
        <button>Edit</button>
      </div>
    </div>
  )
}

export default Review
