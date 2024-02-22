import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import idLocale from '@fullcalendar/core/locales/id'
import dayjs from 'dayjs'

import Toggle from 'components/Form/Toggle'
import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Modal from 'components/Modal'
import Button from 'components/Button'
import DatePicker from 'components/Form/Datepicker'
import Input from 'components/Form/Input'
import Radio from 'components/Form/Radio'
import TextArea from 'components/Form/TextArea'
import { DateSelectArg, EventClickArg } from '@fullcalendar/core'

const EVENT_TYPE_CLASS_NAME: Record<string, string> = {
  private: 'bg-green-700 border-green-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
  public: 'bg-yellow-700 border-yellow-700 px-1 cursor-pointer text-white hover:opacity-70 hover:bg-red-500',
}

const EVENTS = [
  {
    id: 13,
    title: 'Meeting bersama teman',
    description: 'Deskripsi meeting bersama teman teman lagi hahaha',
    start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    end: dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
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
    id: 0,
    title: '',
    description: '',
    start: '',
    end: '',
    timeStart: '',
    timeEnd: '',
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
      id: 0,
      title: '',
      description: '',
      start: '',
      end: '',
      timeStart: '',
      timeEnd: '',
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
      id: +arg.event._def.publicId,
      title: arg.event._def.title,
      description: arg.event._def.extendedProps.description,
      start: dayjs(arg.event._instance?.range.start).format('YYYY-MM-DD'),
      timeStart: dayjs(arg.event._instance?.range.start).format('HH:mm'),
      end: arg.event._instance?.range.end ? dayjs(arg.event._instance?.range.end).format('YYYY-MM-DD') : '',
      timeEnd: arg.event._instance?.range.end ? dayjs(arg.event._instance?.range.end).format('HH:mm') : '',
      allDay: arg.event._def.allDay,
      type: arg.event._def.extendedProps.type,
    })
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
      allDay: arg.allDay,
      type: 'private',
    })
  }

  const handleSubmit = () => {
    const submitData = {
      ...fields,
      id: data.length,
      start: dayjs(`${fields.start} ${fields.timeStart}`).format('YYYY-MM-DD HH:mm:ss'),
      end: dayjs(`${fields.end} ${fields.timeEnd}`).format('YYYY-MM-DD HH:mm:ss'),
    }

    console.log(submitData)

    setData((prevState) => [
      ...prevState,
      submitData,
    ])

    handleModalEventClose()
  }

  useEffect(() => {
    setData(EVENTS)
  }, [])

  console.log(data)

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
            dayCellClassNames="bg-white cursor-pointer text-slate-600 [&.fc-day-today]:!bg-sky-200 hover:bg-sky-50 dark:bg-slate-900 dark:text-white dark:[&.fc-day-today]:!bg-sky-700 dark:border-slate-600"
            dayHeaderClassNames="bg-sky-700 text-white"
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

          <Toggle
            label="Acara sehari"
            checked={fields.allDay}
            name="allDay"
            onChange={(e) => handleChangeField(e.target.name, !fields.allDay)}
          />

          <div />

          {!fields.allDay && (
          <>
            <Input
              placeholder="Jam mulai"
              label="Jam mulai"
              name="timeStart"
              value={fields.timeStart}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              type="time"
            />

            <Input
              placeholder="Jam selesai"
              label="Jam selesai"
              name="timeEnd"
              value={fields.timeEnd}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              type="time"
            />
          </>
          )}

          <Input
            placeholder="Nama acara"
            label="Nama acara"
            name="title"
            value={fields.title}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
          />

          <TextArea
            placeholder="Deskripsi acara"
            label="Deskripsi acara"
            name="description"
            value={fields.description}
            rows={4}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
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
