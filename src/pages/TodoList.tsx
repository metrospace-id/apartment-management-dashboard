import { useEffect, useState } from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Checkbox from 'components/Form/Checkbox'
import Input from 'components/Form/Input'
import TextArea from 'components/Form/TextArea'
import Layout from 'components/Layout'
import LoadingContent from 'components/Loading/LoadingContent'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Toast from 'components/Toast'
import { MODAL_CONFIRM_TYPE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'

const PAGE_NAME = 'To Do List'

const PageTodoList = () => {
  const [currentUser, setCurrentUser] = useState<{
    id: number
    name: string
  } | null>(null)
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [filter, setFilter] = useState({
    is_deleted: 0,
    is_done: 0
  })
  const [fields, setFields] = useState({
    id: 0,
    title: '',
    description: '',
    is_done: 0,
    status: 0
  })
  const [search, setSearch] = useState('')
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false
  })
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false
  })
  const [toast, setToast] = useState({
    open: false,
    message: ''
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(0)
  const [submitType, setSubmitType] = useState('create')

  const debounceSearch = useDebounce(search, 500)

  const handleModalCreateOpen = () => {
    setModalForm({
      title: `Tambah ${PAGE_NAME} Baru`,
      open: true,
      readOnly: false
    })
    setFields({
      id: 0,
      title: '',
      description: '',
      is_done: 0,
      status: 1
    })
  }

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: ''
    })
  }

  const handleModalFormClose = () => {
    setModalForm({
      title: '',
      open: false,
      readOnly: false
    })
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
    setFields({
      id: 0,
      title: '',
      description: '',
      is_done: 0,
      status: 0
    })
  }

  const handleModalConfirmClose = () => {
    if (submitType !== 'delete') {
      setModalForm((prevState) => ({
        ...prevState,
        open: true
      }))
    }
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      title: fieldData.title,
      description: fieldData.description
    }))
  }

  const handleModalDeleteOpen = (fieldData: any) => {
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true
    })
    setSubmitType('delete')
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      title: fieldData.title,
      description: fieldData.description
    }))
  }

  const handleChangeField = (
    fieldName: string,
    value: string | number | boolean
  ) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value
    }))
  }

  const handleFilterDataByMenu = (menuIndex: number) => {
    if (menuIndex === 1) {
      setFilter(() => ({
        is_deleted: 0,
        is_done: 1
      }))
    } else if (menuIndex === 2) {
      setFilter(() => ({
        is_deleted: 1,
        is_done: 0
      }))
    } else {
      setFilter(() => ({
        is_deleted: 0,
        is_done: 0
      }))
    }
  }

  const handleChangeMenu = (number: number) => {
    setSelectedMenu(number)
    handleFilterDataByMenu(number)
  }

  const handleClickConfirm = (type: string) => {
    setModalForm((prevState) => ({
      ...prevState,
      open: false
    }))
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE[type].title,
      description: MODAL_CONFIRM_TYPE[type].description,
      open: true
    })
    setSubmitType(type)
  }

  const apiSubmitCreate = () =>
    api({
      url: '/v1/todo/create',
      withAuth: true,
      method: 'POST',
      data: fields
    })

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/todo/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: fields
    })

  const apiSubmitDelete = () =>
    api({
      url: `/v1/todo/${fields.id}`,
      withAuth: true,
      method: 'DELETE'
    })

  const handleGetTodos = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/todo',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
        search,
        ...filter
      }
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleCheckTodo = (id: number) => {
    api({
      url: `/v1/todo/done/${id}`,
      withAuth: true,
      method: 'POST'
    })
      .then(() => {
        handleGetTodos()
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    let apiSubmit = apiSubmitCreate
    if (submitType === 'update') {
      apiSubmit = apiSubmitUpdate
    } else if (submitType === 'delete') {
      apiSubmit = apiSubmitDelete
    }

    apiSubmit()
      .then(() => {
        handleGetTodos()
        handleModalFormClose()
        setToast({
          open: true,
          message: MODAL_CONFIRM_TYPE[submitType].message
        })
      })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  useEffect(() => {
    handleGetTodos()
  }, [debounceSearch, filter])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser) {
        setCurrentUser(localStorageUser)
      }
    }, 500)
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full flex p-4 bg-white rounded-lg dark:bg-black flex-col sm:flex-row gap-6 sm:gap-0">
          <div className="sm:w-[250px] sm:pr-4 sm:border-r-1 border-slate-200">
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Cari judul"
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
              <div
                className={`flex gap-2 items-center ${selectedMenu === 0 ? 'bg-sky-500 text-white' : ''} hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer p-2 text-slate-600 dark:text-white`}
                role="presentation"
                onClick={() => handleChangeMenu(0)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>

                <p className="font-medium text-sm flex-1">List</p>
              </div>

              <div
                className={`flex gap-2 items-center ${selectedMenu === 1 ? 'bg-sky-500 text-white' : ''} hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer p-2 text-slate-600 dark:text-white`}
                role="presentation"
                onClick={() => handleChangeMenu(1)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>

                <p className="font-medium text-sm flex-1">Done</p>
              </div>

              <div
                className={`flex gap-2 items-center ${selectedMenu === 2 ? 'bg-sky-500 text-white' : ''} hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer p-2 text-slate-600 dark:text-white`}
                role="presentation"
                onClick={() => handleChangeMenu(2)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>

                <p className="font-medium text-sm flex-1">Trash</p>
              </div>

              <Button onClick={handleModalCreateOpen}>Tambah</Button>
            </div>
          </div>
          <div className="flex-1 sm:px-4 flex gap-2 flex-col">
            {isLoadingData && <LoadingContent />}
            {!isLoadingData &&
              data.data.map((todo) => (
                <div
                  className="p-2 border-1 rounded-lg flex gap-2 items-center text-slate-600 dark:text-white"
                  key={todo.id}
                >
                  {!todo.deleted_at && todo.created_by !== currentUser?.id && (
                    <Checkbox
                      checked={!!todo.is_done}
                      onClick={() => handleCheckTodo(todo.id)}
                    />
                  )}
                  <p
                    className={`text-sm  font-semibold ${todo.is_done ? 'line-through' : ''} flex-1`}
                  >
                    {todo.title}
                  </p>
                  {!todo.deleted_at && todo.created_by !== currentUser?.id && (
                    <div
                      role="presentation"
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => handleModalDeleteOpen(todo)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      <Modal open={modalForm.open} title={modalForm.title} size="sm">
        <form autoComplete="off" className="grid grid-cols-1 gap-4 p-6">
          <Input
            placeholder="Judul"
            label="Judul"
            name="title"
            value={fields.title}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            fullWidth
          />

          <TextArea
            placeholder="Deskripsi"
            label="Deskripsi"
            name="description"
            value={fields.description}
            rows={4}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            fullWidth
          />
        </form>
        <div className="p-4 flex items-center gap-2 justify-end">
          <Button onClick={handleModalFormClose} variant="default">
            Tutup
          </Button>
          <Button
            onClick={() => handleClickConfirm(fields.id ? 'update' : 'create')}
          >
            Kirim
          </Button>
        </div>
      </Modal>

      <Modal open={modalConfirm.open} title={modalConfirm.title} size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            {modalConfirm.description}
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalConfirmClose} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmit}>Kirim</Button>
        </div>
      </Modal>

      {isLoadingSubmit && <LoadingOverlay />}

      <Toast
        open={toast.open}
        message={toast.message}
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageTodoList
