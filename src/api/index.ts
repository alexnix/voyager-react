import useGet from './useGet'
import { useContext, useReducer } from 'react'
import VoyagerContext from '../VoyagerContext'
import VoyagerCache from '../VoyagerCache'
import to from 'await-to-js'
import produce from 'immer'
import doNetwork from './../util/doNetowrk'

import type { RequestState, VoyagerContext_t } from './../typings'

type HookRunFunction<T> = (params: { id?: string; body?: object }) => Promise<T>

const initializer: RequestState = {
  loading: false,
  called: false,
  data: null,
  err: null
}

type Action =
  | { type: 'START' }
  | { type: 'SUCCESS'; payload: any }
  | { type: 'ERROR'; payload: string }

const reducer = (state: RequestState, action: Action): RequestState =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'START': {
        draft.loading = true
        return draft
      }
      case 'SUCCESS': {
        draft.loading = false
        draft.called = true
        draft.err = null
        draft.data = action.payload
        return draft
      }
      case 'ERROR': {
        draft.loading = false
        draft.called = true
        draft.data = null
        draft.err = action.payload
        return draft
      }
      default:
        throw Error('Unhandled action type.')
    }
  })

const apiHook = (verb: 'POST' | 'PUT' | 'DELETE') => <T>(
  path: string
): [RequestState, HookRunFunction<T>] => {
  const [gResource] = path.split('/')

  const {
    client: { url, auth, connector }
  } = useContext(VoyagerContext) as VoyagerContext_t
  const { dispatchCacheEvent } = useContext(VoyagerCache)

  const [requestState, dispatch] = useReducer(reducer, initializer)

  const updateCache = (data: any, verb: string) => {
    const dispatchFactory = (verb: 'POST' | 'PUT' | 'DELETE') => (
      resource: string,
      data: any
    ) => dispatchCacheEvent!({ type: verb, payload: { resource, data } })

    const update = {
      post: dispatchFactory('POST'),
      put: dispatchFactory('PUT'),
      delete: dispatchFactory('DELETE')
    }

    if (data._voyager_api) {
      ;['post', 'put', 'delete'].forEach((verb) => {
        if (data[verb]) {
          for (const [resource, value] of Object.entries(data[verb])) {
            if (value instanceof Array) {
              update[verb](resource, value)
            } else {
              update[verb](resource, [value])
            }
          }
        }
      })
    } else {
      update[verb.toLowerCase()](gResource, [data])
    }
  }

  const run: HookRunFunction<T> = async ({ id, body }) => {
    dispatch({ type: 'START' })
    let endpoint: string

    endpoint = `${url}/${gResource}`
    if (id) endpoint += `/${id}`

    const [err, res] = await to(doNetwork(verb, endpoint, body, auth))

    if (err) {
      dispatch({ type: 'ERROR', payload: err.message })
      return null
    }

    const [errUnpack, data] = await to(connector.unpackMutationResult(res))
    if (errUnpack) {
      dispatch({ type: 'ERROR', payload: errUnpack.message })
      return null
    }

    updateCache(data, verb)
    dispatch({ type: 'SUCCESS', payload: data })
    return res
  }

  return [requestState, run]
}

const usePost = apiHook('POST')
const usePut = apiHook('PUT')
const useDelete = apiHook('DELETE')

export { usePost, usePut, useDelete, useGet }
