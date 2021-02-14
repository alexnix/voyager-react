import to from 'await-to-js'

type NetworkFunction = (
  method: string,
  endpoint: string,
  token?: string,
  body?: object
) => Promise<any>

const doNetwork: NetworkFunction = async function (
  method,
  endpoint,
  token,
  body
) {
  const headers: any = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (method === 'POST' || method === 'PUT') {
    headers['Content-Type'] = 'application/json'
  }

  const [err, res] = await to(
    fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(body)
    })
  )

  if (err) {
    throw new Error(err.message)
  } else {
    const data = await res?.json()
    if (res?.status === 200) {
      return data
    } else {
      throw new Error(data.message)
    }
  }
}

export default doNetwork
