export interface AuthData<T = any> {
  user: T
  token: string
}

export interface AuthFunctionParams {
  username: string
  password: string
  extra?: { [key: string]: any }
}

export type AuthFunction = (params: AuthFunctionParams) => Promise<any>

export interface RequestState {
  loading: boolean
  data: AuthData | null
  err: string | null
  called?: boolean
}
