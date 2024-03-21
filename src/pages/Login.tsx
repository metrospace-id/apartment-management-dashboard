import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import Button from 'components/Button'
import Input from 'components/Form/Input'
import InputPassword from 'components/Form/InputPassword'

function Login() {
  const navigation = useNavigate()
  const location = useLocation()
  const [fields, setFields] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState({
    email: '',
    password: '',
  })

  const handleChangeField = (field: string, value: string) => {
    setFields((prevState) => ({
      ...prevState,
      [field]: value,
    }))
    setError((prevState) => ({
      ...prevState,
      [field]: '',
    }))
  }

  const handleSubmit = () => {
    if (fields.email && fields.password) {
      const token = window.btoa(JSON.stringify(fields))
      localStorage.setItem('token', token)
      navigation('/')
    } else {
      setError({
        email: fields.email ? '' : 'Email tidak boleh kosong',
        password: fields.password ? '' : 'Password tidak boleh kosong',
      })
    }
  }

  useEffect(() => {
    if (!!localStorage.token && location.pathname === '/login') {
      navigation('/')
    }
  }, [])

  return (
    <div className="w-100 h-screen bg-slate-50 relative">
      <div className="h-1/3 bg-[50%] bg-cover relative" style={{ backgroundImage: 'url(/images/bg-login.jpg)' }}>
        <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 absolute left-0 right-0 top-0 opacity-90" />
        <div className="absolute left-0 right-0 bottom-0 z-10 h-auto fill-white">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1440 120"><path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z" /></svg>
        </div>
      </div>
      <div className="absolute inset-0 z-10 flex justify-center">
        <div className="w-full flex flex-col py-32 items-center px-4 md:w-[500px] md:px-0">
          <img src="/images/metrospace-logo.png" alt="logo" className="w-[200px]" />
          <p className="text-md text-slate-50">Apartment Management Dashboard</p>

          <div className="w-full rounded-lg p-8 bg-white shadow-md flex flex-col my-8">
            <div className="w-full text-center">
              <p className="text-sm text-slate-600 font-semibold mb-1">Selamat Datang</p>
              <p className="text-sm text-slate-500">Silakan Masuk Untuk Melanjutkan</p>

              <form className="my-6 flex flex-col gap-4">
                <Input
                  label="Email"
                  placeholder="email@domain.com"
                  fullWidth
                  name="email"
                  onChange={(e) => handleChangeField(e.target.name, e.target.value)}
                  error={!!error.email}
                  helperText={error.email}
                />
                <InputPassword
                  label="Password"
                  placeholder="password"
                  name="password"
                  onChange={(e) => handleChangeField(e.target.name, e.target.value)}
                  fullWidth
                  error={!!error.password}
                  helperText={error.password}
                />
                <Button onClick={handleSubmit}>Masuk</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
