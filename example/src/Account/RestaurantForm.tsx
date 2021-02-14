import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

interface RestaurantFormProps {
  onDone: (name: string, image: string) => void
  doneBtnText?: string
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  onDone,
  doneBtnText = 'Create'
}) => {
  const Input = (name: string, type: string = 'text') => (
    <div>
      <Field name={name} type={type} />
      <ErrorMessage name={name} />
    </div>
  )

  return (
    <div>
      <Formik
        onSubmit={(v) => onDone(v.name, v.image)}
        initialValues={{ name: '', image: '' }}
        validationSchema={Yup.object({
          name: Yup.string().required('name is required'),
          image: Yup.string().required('image is required')
        })}
      >
        <Form>
          {Input('name')}
          {Input('image')}
          <button type='submit'>{doneBtnText}</button>
        </Form>
      </Formik>
    </div>
  )
}

export default RestaurantForm
