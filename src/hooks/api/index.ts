import useGet from './useGet'
import { RequestState, AuthData, Cache } from '../../types'
import { useContext, useState } from 'react'
import VoyagerContext from '../../VoyagerContext'
import VoyagerCache from '../../VoyagerCache'
import useAuthData from '../localStorage/useAuthData'
import to from 'await-to-js'
import produce from 'immer'
import pathToResource from './pathToResource'

type HookRunFunction<T> = (params: { id?: string; body?: object }) => Promise<T>

const apiHook = (verb: 'POST' | 'PUT' | 'DELETE' | 'GET') => <T>(
  path: string
): [RequestState, HookRunFunction<T>] => {
  const resource = pathToResource(path)

  const { url } = useContext(VoyagerContext)
  const { setCache } = useContext(VoyagerCache)
  const [authData] = useAuthData<AuthData>()

  const [requestState, setRequestState] = useState<RequestState<T>>({
    loading: false,
    called: false,
    data: null,
    err: null
  })

  function updateCacheAfterDelete(data: any) {
    console.log(data)

    setCache((prev: Cache) =>
      produce(prev, (draft) => {
        draft.value[resource].data = draft.value[resource].data.filter(
          (i: any) => i._id !== data._id
        )
      })
    )
  }

  function updateCacheAfterPost(data: any) {
    setCache((prev: Cache) =>
      produce(prev, (draft) => {
        draft.value[resource].data.push({ ...data, _sortings: [] })
      })
    )
  }

  function updateCacheAfterPut(data: any) {
    setCache((prev: Cache) =>
      produce(prev, (draft) => {
        draft.value[resource].data = [
          ...draft.value[resource].data.filter((i: any) => i._id !== data._id),
          data
        ]
      })
    )
  }

  const updateCache = {
    POST: updateCacheAfterPost,
    PUT: updateCacheAfterPut,
    DELETE: updateCacheAfterDelete
  }

  const run: HookRunFunction<T> = async ({ id, body }) => {
    setRequestState({ loading: true, data: null, err: null })
    let endpoint: string

    endpoint = `${url}/${resource}`
    if (id) endpoint += `/${id}`

    const [err, res] = await to(
      fetch(endpoint, {
        method: verb,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData?.token}`
        }
      })
    )

    if (err) {
      setRequestState({ loading: false, data: null, err: err.message })
    } else {
      const data = await res?.json()
      if (res?.status === 200) {
        updateCache[verb](data)
        setRequestState({ loading: false, data, err: null })
        return data
      } else {
        setRequestState({ loading: false, data: null, err: data.message })
      }
    }
  }

  return [requestState, run]
}

const usePost = apiHook('POST')
const usePut = apiHook('PUT')
const useDetlete = apiHook('DELETE')
const useLazyGet = apiHook('GET')

export { usePost, usePut, useDetlete, useLazyGet, useGet }
