import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import useOutsideClick from 'hooks/useOutsideClick'
import SideBar from './SideBar'

const NOTIFICATIONS = Array.from(Array(10).keys()).map((key) => ({
  title: `Notifikasi ke ${key + 1}`,
  description: `Deskipsi notifikasi ke ${key + 1}. Isinya deskripsi notifikasi singkat padat.`,
}))

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigation = useNavigate()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSidebarOpen, setIsSideBarOpen] = useState(true)
  const [theme, setTheme] = useState(localStorage.theme)

  const notificationElRef = useRef<HTMLDivElement | null>(null)
  const profileElRef = useRef<HTMLDivElement | null>(null)

  useOutsideClick(notificationElRef, () => setIsNotificationOpen(false))
  useOutsideClick(profileElRef, () => setIsProfileOpen(false))

  const handleClickNotification = () => {
    setIsNotificationOpen((prevState) => !prevState)
  }

  const handleClickProfile = () => {
    setIsProfileOpen((prevState) => !prevState)
  }

  const handleClickSideBar = () => {
    setIsSideBarOpen((prevState) => !prevState)
  }

  const handleClickFullScreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    }
  }

  const handleClickTheme = () => {
    if (localStorage.theme === 'dark') {
      setTheme('light')
      localStorage.setItem('theme', 'light')
    } else {
      setTheme('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  const handleClickLogout = () => {
    localStorage.removeItem('token')
    navigation('/login')
  }

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    if (!localStorage.token && location.pathname !== '/login') {
      navigation('/login')
    }

    if (window.innerWidth < 640) {
      setIsSideBarOpen(false)
    }
  }, [])

  return (

    <main className="h-[100vh] flex relative">
      <SideBar open={isSidebarOpen} />
      {isSidebarOpen && (
        <div className="absolute w-screen h-screen block z-20 bg-black opacity-70 sm:hidden dark:opacity-30" onClick={handleClickSideBar} role="presentation" />
      )}

      <div className={`relative flex-1 w-full ${isSidebarOpen ? 'max-w-[calc(100vw-250px)]' : ''}`}>
        <header className="p-4 flex bg-white border-b border-slate-100 shadow-sm gap-4 dark:bg-black dark:border-slate-700">

          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center relative"
              role="presentation"
              onClick={handleClickSideBar}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 dark:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mr-0 ml-auto">
            <div
              className="hidden sm:flex items-center justify-center relative"
              role="presentation"
              onClick={handleClickFullScreen}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 dark:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-center relative" ref={notificationElRef}>
              <div
                className={`${isNotificationOpen ? 'bg-slate-200 dark:bg-slate-700' : ''} w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700`}
                role="presentation"
                onClick={handleClickNotification}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 dark:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </div>

              <div className="absolute shadow-lg z-20 top-12 right-[-104px] w-screen overflow-hidden sm:right-0 sm:w-[320px] sm:rounded-md">
                <div className={`transition-all bg-white ${isNotificationOpen ? 'mt-0' : 'mt-[-200%]'}`}>
                  <div className="bg-primary p-4 dark:bg-black">
                    <p className="text-md text-white font-medium">Notifikasi</p>
                  </div>
                  <div className="bg-white max-h-[250px] overflow-scroll dark:bg-slate-900">
                    <ul>
                      {NOTIFICATIONS.map((notification) => (
                        <li className="p-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" key={notification.title}>
                          <p className="text-sm text-slate-600 font-medium dark:text-white">{notification.title}</p>
                          <p className="text-xs text-slate-500 font-normal dark:text-white">{notification.description}</p>
                          <span className="flex gap-1 items-center mt-2 text-slate-400 dark:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <p className="text-xs">30 detik yang lalu</p>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                role="presentation"
                onClick={handleClickTheme}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600 dark:text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 dark:text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative" ref={profileElRef}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200"
                role="presentation"
                onClick={handleClickProfile}
              >
                <img src="https://via.placeholder.com/200x200" className="rounded-full w-8 h-8" alt="avatar" />
              </div>

              <div className="absolute shadow-lg z-20 top-12 right-[-16px] w-screen overflow-hidden sm:right-0 sm:w-[200px] sm:rounded-md">
                <div className={`transition-all bg-white ${isProfileOpen ? 'mt-0' : 'mt-[-200%]'} dark:bg-slate-900`}>
                  <div className="p-4">
                    <p className="text-xs text-slate-600 font-medium dark:text-white">Halo, Uje</p>
                  </div>
                  <div className="border-b border-slate-200 py-2">
                    <ul>
                      <li className="py-2 px-4 cursor-pointer flex gap-1 items-center text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white" onClick={() => navigation('/profile')} role="presentation">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        <p className="text-sm font-medium">Profile</p>
                      </li>
                      <li className="py-2 px-4 cursor-pointer flex gap-1 items-center text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white" onClick={() => navigation('/todo-list')} role="presentation">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>
                        <p className="text-sm font-medium">Todo List</p>
                      </li>
                      <li className="py-2 px-4 cursor-pointer flex gap-1 items-center text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white" onClick={() => navigation('/note')} role="presentation">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        <p className="text-sm font-medium">Notes</p>
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <ul>
                      <li className="py-2 px-4 cursor-pointer flex gap-1 items-center text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white" onClick={handleClickLogout} role="presentation">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                        </svg>
                        <p className="text-sm font-medium">Logout</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </header>
        <div className={`${isSidebarOpen ? 'max-w-[calc(100vw-250px)]' : ''} h-[calc(100vh-65px)] overflow-scroll bg-slate-100 dark:bg-slate-800 relative`}>
          {children}
        </div>
      </div>
    </main>
  )
}

export default Layout
