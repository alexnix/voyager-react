import React from 'react'
import { useDetlete } from 'voyager-react'
import Review from './Review'

interface Props {
  data: any
}

const ReviewWrapper: React.FC<Props> = ({ data }) => {
  const [, deleteReview] = useDetlete('reviews')

  return (
    <Review
      review={data}
      onDelete={() => {
        deleteReview({ id: data._id })
      }}
    />
  )
}

export default ReviewWrapper
