export const toSnakeCase = (str?: string) => {
  if (str) {
    return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map((x) => x.toLowerCase())
      .join('_')
  }
  return str
}

export const truncate = (str: string, length: number) => (str.length > length ? `${str.substring(0, length)}...` : str)
