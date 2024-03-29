import axios from 'axios'
import { Cookies } from 'react-cookie'

interface ApiProps {
  withAuth?: boolean
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  data?: Record<string, any>
  headers?: Record<string, any>
}

const api = ({
  withAuth, method, url, data, headers,
}: ApiProps) => {
  const token = new Cookies().get('token')
  const newHeaders: Record<string, any> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'x-api-key': process.env.REACT_APP_API_KEY,
    ...headers,
  }

  if (withAuth) {
    newHeaders['x-token'] = `${token}`
  }

  return axios({
    baseURL: `${process.env.REACT_APP_API_URL}${url}`,
    method: method || 'GET',
    withCredentials: false,
    headers: newHeaders,
    data,
  })
}

export default api
