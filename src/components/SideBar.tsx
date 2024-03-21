import { useState, useEffect, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { MENUS } from 'Menu'
import type { ParentMenuProp } from 'Menu'

interface SideBarProps {
  open: boolean
}

const menus: ParentMenuProp[] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idMapping = MENUS.reduce((acc: any, el, i) => {
  acc[el.code] = i
  return acc
}, {})

MENUS.forEach((el) => {
  if (!el.parent_code) {
    menus.push(el)
    return
  }
  const parentEl: ParentMenuProp = MENUS[idMapping[el.parent_code]]
  parentEl.children = [...(parentEl.children || []), el]
})

function SideBar({ open }: SideBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState('')

  const currentParentPath = location.pathname.split('/')[1]

  const handleSelectMenu = (menu: ParentMenuProp) => {
    if (menu.children) {
      setMenuOpen(menu.code)
    } else if (menu.parent_code) {
      setMenuOpen(menu.parent_code)
      navigate(menu.url)
    } else {
      setMenuOpen('')
      navigate(menu.url)
    }
  }

  useEffect(() => {
    setMenuOpen(currentParentPath)
  }, [currentParentPath])

  return (
    <aside className={`${open ? 'ml-0' : '-ml-[250px]'} transition-all absolute z-30 w-[250px] p-4 bg-sky-900 border-r border-slate-100 shadow-sm dark:bg-black dark:border-slate-900 md:relative`}>
      <div className="m-auto py-4 text-center">
        <img src="/images/metrospace-logo-white.png" alt="logo" className="m-auto w-[150px]" />
        <h1 className="text-xs text-white">Apartment Management Dashboard</h1>
      </div>

      <div className="h-[calc(100vh-100px)] py-4 overflow-scroll no-scrollbar">
        <ul>
          <li className="">
            <span
              className={`flex gap-2 items-center ${menuOpen === '' ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
              role="presentation"
              onClick={() => navigate('/')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
              </svg>
              <span className="flex-1">Dashboard</span>
            </span>
          </li>

          <li className="text-slate-300 text-xs my-6">SETTING</li>
          {menus.filter((menu) => menu.section === 'setting').map((menu) => (
            <li className="" key={menu.code}>
              <span
                className={`flex gap-2 items-center ${menuOpen === menu.code ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                role="presentation"
                onClick={() => handleSelectMenu(menu)}
              >
                {menu.icon}
                <span className="flex-1">{menu.name}</span>
                {menu.children && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${menuOpen === menu.code ? 'rotate-90' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </span>
              {menu.children && menuOpen === menu.code && (
                <ul className="ps-2">
                  {menu.children.map((childMenu) => (
                    <li className="my-6" key={childMenu.code}>
                      <span
                        className={`flex gap-2 items-center ${location.pathname === childMenu.url ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                        role="presentation"
                        onClick={() => handleSelectMenu(childMenu)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                        <span className="flex-1">{childMenu.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          <li className="text-slate-300 text-xs my-6">MASTER</li>
          {menus.filter((menu) => menu.section === 'master').map((menu) => (
            <li className="" key={menu.code}>
              <span
                className={`flex gap-2 items-center ${menuOpen === menu.code ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                role="presentation"
                onClick={() => handleSelectMenu(menu)}
              >
                {menu.icon}
                <span className="flex-1">{menu.name}</span>
                {menu.children && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${menuOpen === menu.code ? 'rotate-90' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </span>
              {menu.children && menuOpen === menu.code && (
                <ul className="ps-2">
                  {menu.children.map((childMenu) => (
                    <li className="my-6" key={childMenu.code}>
                      <span
                        className={`flex gap-2 items-center ${location.pathname === childMenu.url ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                        role="presentation"
                        onClick={() => handleSelectMenu(childMenu)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                        <span className="flex-1">{childMenu.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          <li className="text-slate-300 text-xs my-6">MENU</li>
          {menus.filter((menu) => menu.section === 'main').map((menu) => (
            <li className="" key={menu.code}>
              <span
                className={`flex gap-2 items-center ${menuOpen === menu.code ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                role="presentation"
                onClick={() => handleSelectMenu(menu)}
              >
                {menu.icon}
                <span className="flex-1">{menu.name}</span>
                {menu.children && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${menuOpen === menu.code ? 'rotate-90' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </span>
              {menu.children && menuOpen === menu.code && (
                <ul className="ps-2">
                  {menu.children.map((childMenu) => (
                    <li className="my-6" key={childMenu.code}>
                      <span
                        className={`flex gap-2 items-center ${location.pathname === childMenu.url ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                        role="presentation"
                        onClick={() => handleSelectMenu(childMenu)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                        <span className="flex-1">{childMenu.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          <li className="text-slate-300 text-xs my-6">APLICATION</li>
          {menus.filter((menu) => menu.section === 'app').map((menu) => (
            <li className="" key={menu.code}>
              <span
                className={`flex gap-2 items-center ${menuOpen === menu.code ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                role="presentation"
                onClick={() => handleSelectMenu(menu)}
              >
                {menu.icon}
                <span className="flex-1">{menu.name}</span>
                {menu.children && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${menuOpen === menu.code ? 'rotate-90' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </span>
              {menu.children && menuOpen === menu.code && (
                <ul className="ps-2">
                  {menu.children.map((childMenu) => (
                    <li className="my-6" key={childMenu.code}>
                      <span
                        className={`flex gap-2 items-center ${location.pathname === childMenu.url ? 'text-white' : 'text-slate-400'} text-md my-6 cursor-pointer hover:text-white`}
                        role="presentation"
                        onClick={() => handleSelectMenu(childMenu)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                        <span className="flex-1">{childMenu.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default memo(SideBar)
