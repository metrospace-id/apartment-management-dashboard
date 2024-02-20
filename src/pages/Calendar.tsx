import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import dayjs from 'dayjs'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Modal from 'components/Modal'
import Button from 'components/Button'
import DatePicker from 'components/Form/Datepicker'
import Input from 'components/Form/Input'
import Radio from 'components/Form/Radio'
import Toggle from 'components/Form/Toggle'
import { DateSelectArg, EventClickArg } from '@fullcalendar/core'

const EVENT_TYPE_CLASS_NAME: Record<string, string> = {
  private: 'bg-green-700 border-green-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
  public: 'bg-yellow-700 border-yellow-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
}

const EVENTS = [
  {
    title: 'Meeting bersama teman',
    description: 'Deskripsi meeting bersama teman teman lagi hahaha',
    start: dayjs().toDate(),
    end: dayjs().add(1, 'hour').toDate(),
    allDay: false,
    type: 'public',
  },
]

let initialView = 'dayGridMonth'
if (window.innerWidth < 640) {
  initialView = 'timeGridDay'
}

const eventClassNameByType = (eventType: string) => EVENT_TYPE_CLASS_NAME[eventType]

function renderEventContent(eventInfo: any) {
  // console.log(eventInfo)
  return (
    <span className="flex gap-1 overflow-hidden text-ellipsis">
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </span>
  )
}

function Calendar() {
  const [data, setData] = useState<any[]>([])
  const [modalEventOpen, setModalEventOpen] = useState(false)
  const [fields, setFields] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    allDay: true,
    type: 'private',
  })

  const mappedEvent = useMemo(() => data.map((event) => ({
    ...event,
    className: eventClassNameByType(event.type),
  })), [data])

  const handleModalEventClose = () => {
    setModalEventOpen(false)
    setFields({
      title: '',
      description: '',
      start: '',
      end: '',
      allDay: true,
      type: 'private',
    })
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
      title: arg.event._def.title,
      description: arg.event._def.extendedProps.description,
      start: dayjs(arg.event._instance?.range.start).format('YYYY-MM-DD HH:mm:ss'),
      end: arg.event._instance?.range.end ? dayjs(arg.event._instance?.range.end).format('YYYY-MM-DD HH:mm:ss') : '',
      allDay: arg.event._def.allDay,
      type: arg.event._def.extendedProps.type,
    })
  }

  const handleSelectDate = (arg: DateSelectArg) => {
    setModalEventOpen(true)
    setFields({
      title: '',
      description: '',
      start: dayjs(arg.start).format('YYYY-MM-DD HH:mm:ss'),
      end: dayjs(arg.end).format('YYYY-MM-DD HH:mm:ss'),
      allDay: arg.allDay,
      type: 'private',
    })
  }

  const handleSubmit = () => {
    setData((prevState) => [
      ...prevState,
      fields,
    ])
    handleModalEventClose()
  }

  useEffect(() => {
    setData(EVENTS)
  }, [])

  // console.log(fields)
  // console.log(dayjs('2024-02-28 00:00:00').toDate(), new Date())

  return (
    <Layout>
      <Breadcrumb title="Calendar" />

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
            // dateClick={handleClickDate}
            select={handleSelectDate}
            eventClick={handleClickEvent}
            locale={idLocale}
            dayCellClassNames="bg-white cursor-pointer text-slate-600 [&.fc-day-today]:!bg-sky-200 hover:bg-sky-50 dark:bg-slate-900 dark:text-white dark:[&.fc-day-today]:!bg-sky-700"
            dayHeaderClassNames="bg-sky-700 text-white"
            expandRows
            selectable
          />
        </div>
      </div>

      <Modal open={modalEventOpen}>
        <form autoComplete="off" className="flex flex-col gap-4 p-6">
          <Input
            placeholder="Nama event"
            label="Nama event"
            name="title"
            value={fields.title}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
          />

          <DatePicker
            label="Tanggal mulai"
            placeholder="Tanggal mulai"
            name="start"
            value={fields.start ? dayjs(fields.start).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('start', dayjs(selectedDate).format('YYYY-MM-DD HH:mm:ss'))}
          />

          {/* <Toggle
            label="Acara sehari"
            checked={fields.allDay}
            name="allDay"
            onChange={(e) => handleChangeField(e.target.name, !fields.allDay)}
          /> */}

          {/* {!fields.allDay && ( */}
          <DatePicker
            label="Tanggal selesai"
            placeholder="Tanggal selesai"
            name="end"
            value={fields.end ? dayjs(fields.end).toDate() : undefined}
            onChange={(selectedDate) => handleChangeField('end', dayjs(selectedDate).format('YYYY-MM-DD HH:mm:ss'))}
          />

          {/* )} */}

          <div>
            <p className="text-sm text-slate-600 font-medium">Jenis Acara</p>
            <div className="grid grid-cols-2 mt-2 sm:grid-cols-4 gap-4">
              <Radio
                label="Pribadi"
                name="type"
                value="private"
                checked={fields.type === 'private'}
                onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              />
              <Radio
                label="Publik"
                name="type"
                value="public"
                checked={fields.type === 'public'}
                onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              />
            </div>
          </div>
        </form>
        <div className="p-4 flex items-center gap-2 justify-end">
          <Button onClick={handleModalEventClose} variant="default">Tutup</Button>
          <Button onClick={handleSubmit}>Kirim</Button>
        </div>
      </Modal>
    </Layout>
  )
}

export default Calendar
