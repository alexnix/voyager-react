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
    return res
  }
}

export default doNetwork
