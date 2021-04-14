const findById = (arr: any[], id: string, id_field: string = '_id') =>
  arr.find((i) => i[id_field] === id)

export default findById
