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
    <aside className={`${open ? 'ml-0' : '-ml-[250px]'} transition-all absolute z-20 w-[250px] p-4 bg-sky-900 border-r border-slate-100 shadow-sm dark:bg-black dark:border-slate-900 md:relative`}>
      <div className="m-auto py-4 text-center">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALsAAAAgCAYAAABKMQnqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDM1MiwgMjAyMC8wMS8zMC0xNTo1MDozOCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjcyNTU4MUZFMTlDMjExRUM5MTU3ODNDMzcyQzcwRUI1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjcyNTU4MUZGMTlDMjExRUM5MTU3ODNDMzcyQzcwRUI1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzI1NTgxRkMxOUMyMTFFQzkxNTc4M0MzNzJDNzBFQjUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzI1NTgxRkQxOUMyMTFFQzkxNTc4M0MzNzJDNzBFQjUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5Bb6J6AAAK/UlEQVR42txcC3QW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" alt="logo" className="m-auto w-[100px]" />
        <h1 className="text-xs text-white">by AMD</h1>
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
