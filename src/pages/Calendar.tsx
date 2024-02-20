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

const EVENT_TYPE_CLASS_NAME: Record<string, string> = {
  private: 'bg-green-700 border-green-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
  public: 'bg-yellow-700 border-yellow-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
}

const EVENTS = [
  {
    title: 'Meeting bersama teman teman lagi hahaha',
    start: dayjs().toDate(),
    // end: dayjs('2024-02-22 00:00:00').toDate(),
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

  const mappedEvent = useMemo(() => data.map((event) => ({
    title: event.title,
    start: event.start,
    allDay: event.allDay,
    className: eventClassNameByType(event.type),
  })), [data])

  const handleModalEventClose = () => {
    setModalEventOpen(false)
  }

  const handleClickDate = (arg: DateClickArg) => {
    setModalEventOpen(true)
    console.log(arg)
  }

  useEffect(() => {
    setData(EVENTS)
  }, [])

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
            dateClick={handleClickDate}
            eventClick={(arg) => console.log(arg)}
            locale={idLocale}
            dayCellClassNames="bg-white cursor-pointer text-slate-600 [&.fc-day-today]:!bg-sky-200 hover:bg-sky-50 dark:bg-slate-900 dark:text-white dark:[&.fc-day-today]:!bg-sky-700"
            dayHeaderClassNames="bg-sky-700 text-white"
            expandRows
          />
        </div>
      </div>

      <Modal open={modalEventOpen}>
        <form autoComplete="off" className="flex flex-col gap-4 p-6">
          <Input placeholder="Nama event" label="Nama event" />
          <DatePicker label="Tanggal mulai" placeholder="Tanggal mulai" />
          <DatePicker label="Tanggal selesai" placeholder="Tanggal selesai" />
        </form>
        <div className="p-4 flex items-center gap-2 justify-end">
          <Button onClick={handleModalEventClose} variant="default">Tutup</Button>
          <Button>Kirim</Button>
        </div>
      </Modal>
    </Layout>
  )
}

export default Calendar
