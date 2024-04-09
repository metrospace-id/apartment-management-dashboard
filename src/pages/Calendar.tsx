import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import idLocale from '@fullcalendar/core/locales/id'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import DatePicker from 'components/Form/DatePicker'
import Input from 'components/Form/Input'
import Radio from 'components/Form/Radio'
import TextArea from 'components/Form/TextArea'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Toast from 'components/Toast'
import { MODAL_CONFIRM_TYPE } from 'constants/form'
import api from 'utils/api'

const PAGE_NAME = 'Kalender'

const EVENT_TYPE_CLASS_NAME: Record<string, string> = {
  private: 'bg-green-700 border-green-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
  public: 'bg-yellow-700 border-yellow-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
}

let initialView = 'dayGridMonth'
if (window.innerWidth < 640) {
  initialView = 'timeGridDay'
}

const eventClassNameByType = (eventType: string) => EVENT_TYPE_CLASS_NAME[eventType]

function renderEventContent(eventInfo: any) {
  return (
    <span className="flex gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
      <i>{eventInfo.event.title}</i>
    </span>
  )
}

function Calendar() {
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null)
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [modalEventOpen, setModalEventOpen] = useState(false)
  const [fields, setFields] = useState({
    id: 0,
    title: '',
    description: '',
    start: '',
    end: '',
    timeStart: '',
    timeEnd: '',
    all_day: 1,
    type: 'private',
    created_by: 0,
  })
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [submitType, setSubmitType] = useState('create')
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false,
  })

  const mappedEvent = useMemo(() => data.data.map((event) => ({
    ...event,
    className: eventClassNameByType(event.type),
  })), [data])

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: '',
    })
  }

  const handleModalEventClose = () => {
    setModalEventOpen(false)
    setFields({
      id: 0,
      title: '',
      description: '',
      start: '',
      end: '',
      timeStart: '',
      timeEnd: '',
      all_day: 1,
      type: 'private',
      created_by: 0,
    })
  }

  const handleModalFormClose = () => {
    handleModalEventClose()
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false,
    }))
  }

  const handleChangeField = (fieldName: string, value: string | number | boolean) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }))
  }

  const handleClickEvent = (arg: EventClickArg) => {
    setModalEventOpen(true)
    setFields({
      id: +arg.event._def.publicId,
      title: arg.event._def.title,
      description: arg.event._def.extendedProps.description,
      start: dayjs(arg.event._instance?.range.start).format('YYYY-MM-DD'),
      timeStart: dayjs(arg.event._instance?.range.start).format('HH:mm'),
      end: arg.event._instance?.range.end ? dayjs(arg.event._instance?.range.end).format('YYYY-MM-DD') : '',
      timeEnd: arg.event._instance?.range.end ? dayjs(arg.event._instance?.range.end).format('HH:mm') : '',
      all_day: arg.event._def.extendedProps.all_day,
      type: arg.event._def.extendedProps.type,
      created_by: arg.event._def.extendedProps.created_by,
    })
    setSubmitType('update')
  }

  const handleSelectDate = (arg: DateSelectArg) => {
    setModalEventOpen(true)
    setFields({
      id: 0,
      title: '',
      description: '',
      start: dayjs(arg.start).format('YYYY-MM-DD'),
      end: dayjs(arg.end).format('YYYY-MM-DD'),
      timeStart: dayjs(arg.start).format('HH:mm'),
      timeEnd: dayjs(arg.end).format('HH:mm'),
      all_day: 1,
      type: 'private',
      created_by: 0,
    })
    setSubmitType('create')
  }

  const apiSubmitCreate = () => api({
    url: '/v1/calendar/create',
    withAuth: true,
    method: 'POST',
    data: fields,
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/calendar/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: fields,
  })

  const apiSubmitDelete = () => api({
    url: `/v1/calendar/${fields.id}`,
    withAuth: true,
    method: 'DELETE',
  })

  const handleGetCalendars = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/calendar',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleClickConfirm = (type: string) => {
    setModalEventOpen(false)
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE[type].title,
      description: MODAL_CONFIRM_TYPE[type].description,
      open: true,
    })
    setSubmitType(type)
  }

  const handleModalConfirmClose = () => {
    if (submitType !== 'delete') {
      setModalEventOpen(true)
    }
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false,
    }))
  }

  const handleModalDeleteOpen = () => {
    setModalEventOpen(false)
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true,
    })
    setSubmitType('delete')
  }

  const handleClickSubmit = () => {
    let apiSubmit = apiSubmitCreate
    if (submitType === 'update') {
      apiSubmit = apiSubmitUpdate
    } else if (submitType === 'delete') {
      apiSubmit = apiSubmitDelete
    }

    apiSubmit().then(() => {
      handleGetCalendars()
      handleModalFormClose()
      setToast({
        open: true,
        message: MODAL_CONFIRM_TYPE[submitType].message,
      })
    })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  useEffect(() => {
    handleGetCalendars()
  }, [])

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
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView={initialView}
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={mappedEvent}
            eventContent={renderEventContent}
            select={handleSelectDate}
            eventClick={handleClickEvent}
            locale={idLocale}
            dayCellClassNames="bg-white cursor-pointer text-slate-600 [&.fc-day-today]:!bg-sky-200 hover:bg-sky-50 dark:bg-slate-900 dark:text-white dark:[&.fc-day-today]:!bg-primary dark:border-slate-600"
            dayHeaderClassNames="bg-primary text-white"
            expandRows
            selectable
          />
        </div>
      </div>

      <Modal open={modalEventOpen} size="sm" title={fields.id ? 'Edit Acara' : 'Buat Acara Baru'}>
        <form autoComplete="off" className="grid grid-cols-2 gap-4 p-6">
          <DatePicker
            label="Tanggal mulai"
            placeholder="Tanggal mulai"
            name="start"
            value={fields.start ? dayjs(fields.start).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('start', dayjs(selectedDate).format('YYYY-MM-DD'))}
            disabled
          />

          <DatePicker
            label="Tanggal selesai"
            placeholder="Tanggal selesai"
            name="end"
            value={fields.end ? dayjs(fields.end).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('end', dayjs(selectedDate).format('YYYY-MM-DD'))}
            disabled
          />

          <Input
            placeholder="Nama acara"
            label="Nama acara"
            name="title"
            value={fields.title}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={fields.created_by !== currentUser?.id}
          />

          <TextArea
            placeholder="Deskripsi acara"
            label="Deskripsi acara"
            name="description"
            value={fields.description}
            rows={4}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={fields.created_by !== currentUser?.id}
          />

          <div>
            <p className="text-sm text-slate-600 font-medium">Jenis Acara</p>
            <div className="grid grid-cols-2 mt-2 sm:grid-cols-4 gap-4">
              <Radio
                label="Pribadi"
                name="type"
                value="private"
                checked={fields.type === 'private'}
                onChange={(e) => handleChangeField(e.target.name, e.target.value)}
                readOnly={fields.created_by !== currentUser?.id}
              />
              <Radio
                label="Publik"
                name="type"
                value="public"
                checked={fields.type === 'public'}
                onChange={(e) => handleChangeField(e.target.name, e.target.value)}
                readOnly={fields.created_by !== currentUser?.id}
              />
            </div>
          </div>
        </form>
        <div className="p-4 flex items-center gap-2 justify-end">
          <Button onClick={handleModalEventClose} variant="default">Tutup</Button>
          {fields.created_by === currentUser?.id && (
            <>
              <Button onClick={handleModalDeleteOpen} variant="danger">Hapus</Button>
              <Button onClick={() => handleClickConfirm(fields.id ? 'update' : 'create')}>Kirim</Button>
            </>
          )}

        </div>
      </Modal>

      <Modal open={modalConfirm.open} title={modalConfirm.title} size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">{modalConfirm.description}</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalConfirmClose} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmit}>Kirim</Button>
        </div>
      </Modal>

      {(isLoadingSubmit || isLoadingData) && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />
    </Layout>
  )
}

export default Calendar
