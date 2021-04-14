import useGet from './useGet'
import { useState, useEffect } from 'react'
import { defaultRequestOptions, defaultQuery } from './../util/defaults'

import type { RequestOptions, PaginatedGet } from './../typings'

const usePagination = <T = any>(
  path: string,
  reqOptions: Partial<RequestOptions> = defaultRequestOptions
): PaginatedGet<T> => {
  reqOptions = { ...defaultRequestOptions, ...reqOptions }
  reqOptions.query = { ...defaultQuery, ...reqOptions.query }

  const [currentPage, setCurrentPage] = useState(reqOptions.query!.page_no!)
  const [pageSize, setPageSize] = useState(reqOptions.query!.page_size!)

  const getOptions = (delta: number = 0) => ({
    ...reqOptions,
    query: {
      ...reqOptions.query,
      page_size: pageSize,
      page_no: currentPage + delta
    }
  })

  const bareGet = useGet<T>(path, getOptions())

  useGet<T>(path, {
    ...getOptions(-1),
    skipUntil: currentPage > 0
  })

  useGet<T>(path, {
    ...getOptions(1),
    skipUntil: (currentPage + 1) * pageSize < (bareGet[0].meta?.total || 0)
  })

  useEffect(() => {
    setCurrentPage(reqOptions.query!.page_no!)
  }, [reqOptions.query!.page_no])

  useEffect(() => {
    setPageSize(reqOptions.query!.page_size!)
  }, [reqOptions.query!.page_size])

  const getNextPage = () => setCurrentPage(currentPage + 1)
  const getPreviousPage = () => setCurrentPage(currentPage - 1)

  return [
    ...bareGet,
    {
      getNextPage,
      getPreviousPage,
      currentPage,
      pageSize,
      setCurrentPage,
      setPageSize
    }
  ]
}

export default usePagination
