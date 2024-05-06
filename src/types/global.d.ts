declare module 'react-qr-scanner'

export { }
declare global {
  interface DataTableProps {
    data: Record<string, any>[]
    page: number
    limit: number
    total: number
  }

  interface DocumentProps {
    id: number,
    name: string
    header: string
    subheader: string
    content: string
    picture: null | string,
  }
}
