import React from 'react'
import { usePost } from 'voyager-react'
import RestaurantForm from './RestaurantForm'
import { useClose } from '../modal'

interface CreateRestaurantProps {}
const CreateRestaurant: React.FC<CreateRestaurantProps> = () => {
  const closeModal = useClose()
  const [{ err }, createRestaurant] = usePost('restaurants')

  const createRestaurantModalDone = async (name: string, image: string) => {
    const res = await createRestaurant({
      body: {
        name,
        image
      }
    })
    if (res) {
      closeModal()
    }
  }

  return (
    <div>
      {err && <div>{err}</div>}
      <RestaurantForm onDone={createRestaurantModalDone} />
    </div>
  )
}

export default CreateRestaurant
