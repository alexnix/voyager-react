import { to } from 'await-to-js'
import buildEndpoint from './buildEndpoint'

import type { APIConnector } from '../../../typings'

const foreWardAsT = <T>() => async (res: Response) => {
  const [jsonErr, data] = await to(res.json())
  if (jsonErr) {
    throw new Error(`Not a JOSN. ${res.status} ${res.statusText}`)
  }
  if (res.status === 200) {
    return data as T
  } else {
    throw new Error(data.message)
  }
}

const unpackQueryResult: APIConnector.UnpackQueryResult = foreWardAsT<APIConnector.UnpackQueryResultReturn>()

const unpackMutationResult: APIConnector.UnpackMutationResult = foreWardAsT<APIConnector.UnpackMutationResultReturn>()

export { buildEndpoint, unpackQueryResult, unpackMutationResult }
