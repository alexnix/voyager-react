import useGet from './useGet'
import { useState } from 'react'
import { RequestOptions } from '../types'
import { defaultRequestOptions, defaultQuery } from './defaults'

const usePagination = (
  path: string,
  reqOptions: Partial<RequestOptions> = defaultRequestOptions
) => {
  reqOptions = { ...defaultRequestOptions, ...reqOptions }
  reqOptions.query = { ...defaultQuery, ...reqOptions.query }

  const [page, setCurrentPage] = useState(reqOptions.query!.page_no!)
  const [pageSize, setPageSize] = useState(reqOptions.query!.page_size!)

  const bareGet = useGet(path, {
    ...reqOptions,
    query: {
      ...reqOptions.query,
      page_size: pageSize,
      page_no: page
    }
  })

  const nextPage = () => setCurrentPage(page + 1)
  const prevPage = () => setCurrentPage(page - 1)

  return [...bareGet, nextPage, prevPage, setCurrentPage, setPageSize]
}

export default usePagination
