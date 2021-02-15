import useGet from './useGet'
import { useState, useEffect } from 'react'
import { RequestOptions, GetFunction, RequestState } from '../types'
import { defaultRequestOptions, defaultQuery } from './defaults'

const usePagination = <T = any>(
  path: string,
  reqOptions: Partial<RequestOptions> = defaultRequestOptions
): [RequestState<T>, GetFunction<T>, any, any, any, any, any] => {
  reqOptions = { ...defaultRequestOptions, ...reqOptions }
  reqOptions.query = { ...defaultQuery, ...reqOptions.query }

  const [page, setCurrentPage] = useState(reqOptions.query!.page_no!)
  const [pageSize, setPageSize] = useState(reqOptions.query!.page_size!)

  const getOptions = (page_d: number = 0) => ({
    ...reqOptions,
    query: {
      ...reqOptions.query,
      page_size: pageSize,
      page_no: page + page_d
    }
  })

  const bareGet = useGet<T>(path, getOptions())

  useGet<T>(path, {
    ...getOptions(-1),
    skipUntil: page > 0
  })

  useGet<T>(path, {
    ...getOptions(1),
    // TODO make this skip actually work, current issue is that immediately after the page changes the useGet hook is still returing data for the previus page, causing this hook (usePagination) to pre-fetch next page
    skipUntil: bareGet[0].loading == false && bareGet[0].meta?.hasNext === true
  })

  console.log('page, bareGet[0]: ', page, bareGet[0])

  useEffect(() => {
    setCurrentPage(reqOptions.query!.page_no!)
  }, [reqOptions.query!.page_no])

  useEffect(() => {
    setPageSize(reqOptions.query!.page_size!)
  }, [reqOptions.query!.page_size])

  const nextPage = () => setCurrentPage(page + 1)
  const prevPage = () => setCurrentPage(page - 1)
  const getCurrentPage = () => page

  return [
    ...bareGet,
    nextPage,
    prevPage,
    setCurrentPage,
    getCurrentPage,
    setPageSize
  ]
}

export default usePagination
