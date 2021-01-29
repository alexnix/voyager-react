import { FilterObj, QueryParameters } from './../../types'

const filterFunctions = {
  eq: (lhs: any, rhs: any) => lhs === rhs,
  neq: (lhs: any, rhs: any) => lhs !== rhs,
  in: (lhs: any, rhs: Array<any>) => rhs.includes(lhs),
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
  endpoint
  resource
  try {
    console.log(cache)

    const data = cache.data
      .filter((i: any) => itemMatchedFilters(i, options.filter!))
      .sort((a: any, b: any) => {
        const prop = options.sort_by[0]
        const order = options.sort_by[1]
        if (order === 'asc') {
          return a[prop] > b[prop]
        } else {
          return a[prop] < b[prop]
        }
      })
    return [true, data]
  } catch (e) {
    console.log(e)

    return [false, undefined]
  }
}

export default runRequestAgainstCache
