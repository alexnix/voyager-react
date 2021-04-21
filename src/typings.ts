import { Dispatch, SetStateAction } from 'react'

export interface Meta {
  total: number
  hasNext: boolean
  hasPrev: boolean
}

export interface RequestState<T = any> {
  loading: boolean
  called?: boolean
  data: null | T
  meta?: null | Meta
  err: null | any
}

export interface VoyagerGetResult<T> {
  data: T
  meta?: Meta
}

export type Filter = [
  'eq' | 'neq' | 'regex' | 'in' | 'gt' | 'gte' | 'lt' | 'lte',
  string | number | null | Array<string | number | null>
]

export type Sort = [string, 'asc' | 'desc']

export interface FilterObj {
  [key: string]: Filter
}

export interface QueryParameters {
  select: string[]
  page_size: number
  page_no: number
  sort_by: Sort
  filter: FilterObj
}

export interface RequestOptions {
  query: Partial<QueryParameters>
  lazy: boolean
  policy: 'cache-first' | 'cache-and-network' | 'network-first' | 'no-cache'
  strictSoring: boolean
  spawnFromCache: boolean
  skipUntil: boolean
  alias?: string
}

export type Full<T> = {
  [P in keyof T]: T[P]
}

export interface LoginHook {
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<AuthData>
}

export interface RegisterHook {
  loading: boolean
  error: string | null
  register: (username: string, password: string) => Promise<AuthData>
}

export interface AuthData {
  user: any
  token: string
}

export type AuthInjector = (
  headers: Record<string, string>,
  body?: any
) => Promise<[Record<string, string>, any]> | [Record<string, string>, any]

export namespace APIConnector {
  export type BuildEndpoint = (
    url: string,
    resource: string,
    query: QueryParameters
  ) => string

  export interface UnpackQueryResultReturn {
    data: any[]
    meta: Meta
  }
  export type UnpackQueryResult = (
    res: Response
  ) => Promise<UnpackQueryResultReturn>

  export type UnpackMutationResultRetun =
    | {
        _voyager_api?: boolean
        foo: Record<string, any | any[]>
      }
    | Record<string, any>
  export type UnpackMutationResult = (
    res: Response
  ) => Promise<UnpackMutationResultRetun>

  export interface Config {
    buildEndpoint: BuildEndpoint
    unpackQueryResult: UnpackQueryResult
    unpackMutationResult: UnpackMutationResult
  }
}

export interface VoyagerProviderProps {
  client: {
    url: string
    auth?: AuthInjector
    connector?: Partial<APIConnector.Config>
  }
  children: React.ReactNode
}

export interface RequestCache {
  queryParams: QueryParameters
  meta: Meta
  alias?: string
}

export interface ResourceCache<T = any> {
  data: Array<T>
  requests: Record<string, RequestCache>
}

export type CacheValue = Record<string, ResourceCache>

export type CacheReducerAction =
  | {
      type: 'GET'
      payload: {
        resource: string
        id: string
        endpoint: string
        data: any
        queryParams: QueryParameters
      }
    }
  | {
      type: 'POST'
      payload: { resource: string; data: any }
    }
  | {
      type: 'PUT'
      payload: { resource: string; data: any }
    }
  | {
      type: 'DELETE'
      payload: { resource: string; data: any }
    }
  | { type: 'MANUAL_EDIT'; payload: CacheValue }

export interface CacheContext {
  dispatchCacheEvent?: Dispatch<CacheReducerAction>
  cache: CacheValue
}

export interface AuthFunctionParams {
  username: string
  password: string
  extra?: { [key: string]: any }
}

export type AuthFunction = (params: AuthFunctionParams) => Promise<void>

export interface GetFunctionParams {
  silent?: boolean
  policy?: 'cache-first' | 'cache-and-network' | 'network-first' | 'no-cache'
}

export type GetFunction<T> = (params?: GetFunctionParams) => Promise<T>

interface PaginationData {
  getNextPage: () => void
  getPreviousPage: () => void
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
}

export type PaginatedGet<T = any> = [
  RequestState<T>,
  GetFunction<T>,
  PaginationData
]

export type CacheObserver = (
  verb: 'get' | 'post' | 'put' | 'delete',
  data: any,
  resource: string
) => void

export interface VoyagerContext_t {
  client: {
    url: string
    connector: APIConnector.Config
    auth?: AuthInjector
  }
  cacheObservers: CacheObserver[]
  setCacheObservers: Dispatch<SetStateAction<CacheObserver[]>>
}
