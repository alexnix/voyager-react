import React from 'react'
import { Formik, Field, ErrorMessage, Form } from 'formik'
import * as Yup from 'yup'

interface Props {
  onLogin: (params: { username: string; password: string }) => void
  error: string | null
}

const LoginForm: React.FC<Props> = ({ onLogin, error }) => {
  return (
    <div>
      {error && <div>{error}</div>}
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(values) => onLogin(values)}
        validationSchema={Yup.object({
          username: Yup.string().required('Username is required.'),
          password: Yup.string().required('Password is required.')
        })}
      >
        <Form>
          <div>
            <label htmlFor='username'>Username</label>
            <Field name='username' type='text' />
            <ErrorMessage name='username' />
          </div>
          <div>
            <label htmlFor='password'>password</label>
            <Field name='password' type='password' />
            <ErrorMessage name='password' />
          </div>
          <button type='submit'>Login</button>
        </Form>
      </Formik>
    </div>
  )
}

export default LoginForm
