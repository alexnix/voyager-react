import useGet from './useGet'
import { RequestState, AuthData, Cache } from '../../types'
import { useContext, useState } from 'react'
import VoyagerContext from '../../VoyagerContext'
import VoyagerCache from '../../VoyagerCache'
import useAuthData from '../localStorage/useAuthData'

type HookRunFunction = ({
  id,
  body
}: {
  id?: string
  body?: object
}) => Promise<any>

const apiHook = (verb: 'POST' | 'PUT' | 'DELETE' | 'GET') => <T>(
  resource: string
): [HookRunFunction, RequestState] => {
  const { url } = useContext(VoyagerContext)
  const { setCache } = useContext(VoyagerCache)
  const [authData] = useAuthData<AuthData>()

  const [requestState, setRequestState] = useState<RequestState<T>>({
    loading: false,
    data: null,
    err: null
  })

  const run: HookRunFunction = ({ id, body }) => {
    setRequestState({ loading: true, data: null, err: null })
    let endpoint: string
    if (resource.startsWith('http')) endpoint = resource
    else {
      endpoint = `${url}/${resource}`
      if (id) endpoint += `/${id}`
    }
    return new Promise<T>((resolve, resject) => {
      fetch(endpoint, {
        method: verb,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData?.token}`
        }
      })
        .then((r) => {
          if (r.status === 200) {
            return r.json()
          } else {
            throw Error(r.statusText)
          }
        })
        .then((data) => {
          setRequestState({ loading: false, data, err: null })
          if (verb === 'POST') {
            setCache!((prev: Cache) => ({
              ...prev,
              value: {
                ...prev.value,
                [resource]: {
                  ...prev.value[resource],
                  data: [...prev.value[resource].data, data],
                  meta: {
                    ...prev.value[resource].meta,
                    total: prev.value[resource].meta!.total + 1
                  }
                }
              }
            }))
          }
          if (verb === 'DELETE') {
            setCache!((prev: Cache) => ({
              ...prev,
              value: {
                ...prev.value,
                [resource]: {
                  ...prev.value[resource],
                  data: prev.value[resource].data.filter(
                    (i: any) => i._id !== id
                  ),
                  meta: {
                    ...prev.value[resource].meta,
                    total: prev.value[resource].meta!.total - 1
                  }
                }
              }
            }))
          }
          resolve(data)
        })
        .catch((err) => {
          setRequestState({ loading: false, data: null, err })
          resject(err)
        })
    })
  }

  return [run, requestState]
}

const usePost = apiHook('POST')
const usePut = apiHook('PUT')
const useDetlete = apiHook('DELETE')
const useLazyGet = apiHook('GET')

export { usePost, usePut, useDetlete, useLazyGet, useGet }
