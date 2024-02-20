import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface BreadcrumbProps {
  title?: string
}
function Breadcrumb({ title }: BreadcrumbProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const pathnames = location.pathname.split('/')

  const handleClickItem = (index: number) => {
    if (index === 0) {
      navigate('/')
    }
  }

  const renderBreadcrumbItem = (name: string) => {
    if (name) {
      return name
    }

    return 'dashboard'
  }

  return (
    <div className="p-4 bg-white flex justify-between dark:bg-black sticky top-0 left-0 right-0 z-10 shadow">
      <p className="text-md font-semibold text-slate-600 dark:text-white">{title}</p>
      <div className="flex gap-1 items-center">
        {pathnames.map((path, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            {!!index && (
              <span className="text-sm font-normal text-slate-400 dark:text-white">/</span>
            )}
            <p
              className={`text-sm text-slate-600 dark:text-white capitalize ${index + 1 < pathnames.length ? 'cursor-pointer' : 'font-semibold'}`}
              onClick={() => handleClickItem(index)}
              role="presentation"
            >
              {index === 0 ? 'home' : renderBreadcrumbItem(path)}
            </p>
          </React.Fragment>
        ))}
      </div>
    </div>

  )
}

export default Breadcrumb
