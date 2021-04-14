import type { QueryParameters, RequestOptions } from '../typings'

const defaultQuery: QueryParameters = {
  select: [],
  page_no: 0,
  page_size: 100,
  sort_by: ['createdAt', 'desc'],
  filter: {}
}

const defaultRequestOptions: RequestOptions = {
  query: defaultQuery,
  lazy: false,
  policy: 'cache-first',
  strictSoring: false,
  spawnFromCache: false,
  skipUntil: true
}

const initRequestState = (lazy: boolean) => ({
  loading: lazy ? false : true,
  called: false,
  data: null,
  meta: null,
  err: null
})

export { defaultQuery, defaultRequestOptions, initRequestState }
