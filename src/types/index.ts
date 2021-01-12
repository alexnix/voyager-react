interface Meta {
  total: number
  hasNext: boolean
  // hasPrev: boolean
}

export interface RequestState<T = any> {
  loading: boolean
  data: null | T
  meta?: null | Meta
  err: null | any
}

export interface VoyagerGetResult<T> {
  data: T
  meta?: Meta
}

export interface QueryParameters {
  select?: string[]
  where?: string
  op?: 'eq' | 'neq' | 'regex'
  rhs?: string
  sort?: string
  order?: 'asc' | 'desc'
  page_size?: number
  page_no?: number
}

export interface RequestOptions {
  query?: QueryParameters
  onCompleted?: (data: any) => void
}

export interface LoginHook {
  loading: boolean
  login: (username: string, password: string) => Promise<AuthData>
}

export interface RegisterHook {
  loading: boolean
  register: (username: string, password: string) => Promise<AuthData>
}

export interface AuthData {
  user: any
  token: string
}

export interface VoyagerProviderProps {
  url: string
  auth?: string
  useCache: boolean
  children: React.ReactNode
}

export interface Cache {
  setCache?: any
  value: {
    [key: string]: VoyagerGetResult<any>
  }
}

