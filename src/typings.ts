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

export interface VoyagerProviderProps {
  url: string
  auth?: string
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

export interface CacheContext {
  setCache?: Dispatch<SetStateAction<CacheValue>>
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
