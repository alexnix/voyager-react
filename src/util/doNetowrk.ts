import to from 'await-to-js'
import type { AuthInjector } from '../typings'

type NetworkFunction = (
  method: string,
  endpoint: string,
  body?: object,
  auth?: AuthInjector
) => Promise<any>

const doNetwork: NetworkFunction = async function (
  method,
  endpoint,
  body_bare,
  auth
) {
  const headers_beare: any = {}

  if (method === 'POST' || method === 'PUT') {
    headers_beare['Content-Type'] = 'application/json'
  }

  let headers = headers_beare,
    body = body_bare
  if (auth) [headers, body] = await auth!(headers_beare, body_bare)

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
    const [jsonErr, data] = await to(res!.json())
    if (jsonErr) {
      throw new Error(res?.statusText)
    }
    if (res?.status === 200) {
      return data
    } else {
      throw new Error(data.message)
    }
  }
}

export default doNetwork
