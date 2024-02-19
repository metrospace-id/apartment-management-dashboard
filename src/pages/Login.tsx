import Button from 'components/Button'
import Input from 'components/Form/Input'
import InputPassword from 'components/Form/InputPassword'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
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
      navigate('/')
    } else {
      setError({
        email: fields.email ? '' : 'Email tidak boleh kosong',
        password: fields.password ? '' : 'Password tidak boleh kosong',
      })
    }
  }

  return (
    <div className="w-100 h-screen bg-slate-50 relative">
      <div className="h-1/3 bg-[50%] bg-cover relative" style={{ backgroundImage: 'url(/images/bg-login.jpg)' }}>
        <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 absolute left-0 right-0 top-0 opacity-90" />
        <div className="absolute left-0 right-0 bottom-0 z-10 h-auto fill-white">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1440 120"><path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z" /></svg>
        </div>
      </div>
      <div className="absolute inset-0 z-10 flex justify-center">
        <div className="w-[500px] flex flex-col py-32 items-center">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALsAAAAgCAYAAABKMQnqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDM1MiwgMjAyMC8wMS8zMC0xNTo1MDozOCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjcyNTU4MUZFMTlDMjExRUM5MTU3ODNDMzcyQzcwRUI1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjcyNTU4MUZGMTlDMjExRUM5MTU3ODNDMzcyQzcwRUI1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzI1NTgxRkMxOUMyMTFFQzkxNTc4M0MzNzJDNzBFQjUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzI1NTgxRkQxOUMyMTFFQzkxNTc4M0MzNzJDNzBFQjUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5Bb6J6AAAK/UlEQVR42txcC3QW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" alt="logo" className="w-[150px]" />
          <p className="text-sm text-slate-50">by ADM</p>

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
