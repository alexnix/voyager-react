import { FilterObj, QueryParameters } from '../types'

const filterFunctions = {
  eq: (lhs: any, rhs: any) => lhs === rhs,
  neq: (lhs: any, rhs: any) => lhs !== rhs,
  in: (lhs: any, rhs: Array<any>) => {
    if (Array.isArray(lhs)) {
      for (const i in lhs) {
        if (rhs.includes(i)) {
          return true
        }
      }
      return false
    } else {
      return rhs.includes(lhs)
    }
  },
  gt: (lhs: number, rhs: number) => lhs > rhs,
  gte: (lhs: number, rhs: number) => lhs >= rhs,
  lt: (lhs: number, rhs: number) => lhs < rhs,
  lte: (lhs: number, rhs: number) => lhs <= rhs
}

function itemMatchedFilters(item: any, filters: FilterObj): boolean {
  for (const [prop, filter] of Object.entries(filters)) {
    if (!filterFunctions[filter[0]](item[prop], filter[1])) {
      return false
    }
  }
  return true
}

function runRequestAgainstCache(
  resource: string,
  endpoint: string,
  cache: any,
  options: QueryParameters
): [boolean, any] {
  if (cache[resource]?.requests[endpoint]) {
    const prop = options.sort_by[0]
    const order = options.sort_by[1]
    const data = cache[resource].data
      .filter((i: any) => itemMatchedFilters(i, options.filter!))
      .sort((a: any, b: any) => {
        if (order === 'asc') {
          return a[prop] > b[prop] ? 1 : -1
        } else {
          return a[prop] < b[prop] ? 1 : -1
        }
      })
      .slice(
        options.page_no * options.page_size,
        (options.page_no + 1) * options.page_size
      )
    if (
      cache[resource].requests[endpoint].meta?.hasNext === true &&
      data.length < options.page_size
    ) {
      return [false, undefined]
    }
    return [true, data]
  } else {
    return [false, undefined]
  }
}

export default runRequestAgainstCache
export { itemMatchedFilters }
