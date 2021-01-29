import { QueryParameters } from './../../types'

function filterToString(filter: any): string {
  let arr
  if (Array.isArray(filter)) {
    arr = filter
  } else {
    arr = [filter]
  }
  return arr
    .map((i) => {
      if (typeof i === 'string') {
        return `"${i}"`
      } else {
        return String(i)
      }
    })
    .join(',')
}

function buildEndpoint(
  url: string,
  resource: string,
  query: QueryParameters
): string {
  let endpoint
  if (resource.startsWith('http')) {
    return resource
  } else {
    endpoint = `${url}/${resource}`
    if (query) {
      endpoint += '?'
      if (query.select.length > 0) {
        endpoint += `select=${query.select.join(',')}&`
      }
      for (const [prop, filter] of Object.entries(query.filter)) {
        endpoint += `${prop}=${filter[0]}:${filterToString(filter[1])}&`
      }
      endpoint += `sort_by=${query.sort_by[0]}:${query.sort_by[1]}&`
      endpoint += `page_size=${query.page_size}&`
      endpoint += `page_no=${query.page_no}`
    }
    return endpoint
  }
}
export default buildEndpoint
