import React from 'react'

interface Props {
  elements: object[]
  ElementItem: any
}

const List: React.FC<Props> = ({ elements, ElementItem }) => {
  return (
    <ul>
      {elements.map((e, idx) => (
        <ElementItem key={idx} data={e} />
      ))}
    </ul>
  )
}

export default List
