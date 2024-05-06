import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js'
import {
  Doughnut, Pie, Bar, Line, Radar,
} from 'react-chartjs-2'
import { fakerID_ID as faker } from '@faker-js/faker'
import dayjs from 'dayjs'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Badge from 'components/Badge'
import { RELATION } from 'constants/tenant'
import { useNavigate } from 'react-router-dom'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, RadialLinearScale)

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
}

const CHART_DONUT_PENGHUNI = {
  labels: ['Tower A', 'Tower B', 'Tower C'],
  datasets: [
    {
      fill: true,
      label: 'Total Penghuni',
      data: [100, 102, 90],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    },
  ],
}

const CHART_BAR_JENIS_PENGHUNI = {
  labels: ['Penghuni', ...RELATION],
  datasets: [
    {
      fill: true,
      label: 'Jenis Penghuni',
      data: [100, 102, 90, 80, 70, 60],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderWidth: 1,
    },
  ],
}

const CHART_DATA = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      fill: true,
      label: 'Total Penghuni',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
}

const CHART_LINE_DATA = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      fill: true,
      label: '# of Votes',
      lineTension: 0.3,
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ],
}

const TENANT_DATA = Array.from(Array(10).keys()).map((key) => ({
  id: key + 1,
  unit_id: key + 1,
  unit_code: `A/01/${key + 1}`,
  name: faker.person.fullName(),
  phone: faker.helpers.fromRegExp(/081[0-9]{8}/),
  start_date: '2023-12-31 00:00:00',
  end_date: key % 2 ? '2024-12-31 00:00:00' : null,
}))

const ACCESS_CARD_DATA = Array.from(Array(10).keys()).map((key) => ({
  id: key + 1,
  unit_id: key + 1,
  unit_code: `A/01/${key + 1}`,
  card_no: `000${key + 1}`,
  rfid_no: `000000${key + 1}`,
  request_date: '2023-12-31 00:00:00',
  active_date: '2023-12-31 00:00:00',
  expired_date: '2024-12-31 00:00:00',
}))

const INCOMING_ITEM_DATA = Array.from(Array(10).keys()).map((key) => ({
  id: key + 1,
  unit_id: key + 1,
  unit_code: `A/01/${key + 1}`,
  name: faker.person.fullName(),
  requester_name: faker.person.fullName(),
  item_category_id: 1,
  item_category_name: `Kategori Barang ${key + 1}`,
  start_date: '2023-12-31 00:00:00',
  end_date: '2024-12-31 00:00:00',
}))

function Home() {
  const PAGE_NAME = 'Dashboard'
  const navigate = useNavigate()

  const periodMonth = dayjs().startOf('month').format('MMM YYYY')
  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full flex flex-col gap-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-lg bg-blue-600 dark:bg-slate-950 text-white dark:text-white p-4">
            <div className="flex justify-between">
              <p className="text-sm sm:text-md font-semibold">Jumlah Unit</p>
              <div className="p-4 rounded-full bg-blue-200 hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-4xl">99</p>
            </div>
          </div>
          <div className="rounded-lg bg-green-600 dark:bg-slate-950 text-white dark:text-white p-4">
            <div className="flex justify-between">
              <p className="text-sm sm:text-md font-semibold">Jumlah Pemilik</p>
              <div className="p-4 rounded-full bg-green-200 hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-600">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-4xl">99</p>
            </div>
          </div>
          <div className="rounded-lg bg-yellow-600 dark:bg-slate-950 text-white dark:text-white p-4">
            <div className="flex justify-between">
              <p className="text-sm sm:text-md font-semibold">Jumlah Penghuni</p>
              <div className="p-4 rounded-full bg-yellow-200 hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-4xl">99</p>
            </div>
          </div>
          <div className="rounded-lg bg-purple-600 dark:bg-slate-950 text-white dark:text-white p-4">
            <div className="flex justify-between">
              <p className="text-sm sm:text-md font-semibold">Jumlah Kendaraan</p>
              <div className="p-4 rounded-full bg-purple-200 hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-4xl">99</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg bg-white dark:bg-slate-950 text-slate-600 dark:text-white p-4">
            <div className="flex flex-col">
              <p className="text-sm sm:text-md font-semibold">Perizinan Unit</p>
              <p className="text-xxs sm:text-xs text-slate-500">
                Periode&nbsp;
                <span>{periodMonth}</span>
              </p>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-slate-500">Izin Kerja</p>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">99</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-slate-500">Izin Renovasi</p>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">99</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-950 text-slate-600 dark:text-white p-4">
            <div className="flex flex-col">
              <p className="text-sm sm:text-md font-semibold">Barang</p>
              <p className="text-xxs sm:text-xs text-slate-500">
                Periode&nbsp;
                <span>{periodMonth}</span>
              </p>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-slate-500">Permintaan Barang</p>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">99</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-slate-500">Pembelian Barang</p>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">99</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-950 text-slate-600 dark:text-white p-4">
            <div className="flex flex-col">
              <p className="text-sm sm:text-md font-semibold">Perawatan</p>
              <p className="text-xxs sm:text-xs text-slate-500">
                Periode&nbsp;
                <span>{periodMonth}</span>
              </p>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-slate-500">Perawatan Aset</p>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">99</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-slate-500">Checklist</p>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">99</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Penghuni Gedung</p>
            <Doughnut data={CHART_DONUT_PENGHUNI} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950 md:col-span-2">
            <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Jenis Penghuni</p>
            <Bar data={CHART_BAR_JENIS_PENGHUNI} options={{ ...chartOptions, indexAxis: 'y' as const }} />
          </div>

          {/* <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Chart Pie</p>
            <Pie data={CHART_DATA} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Chart Radar</p>
            <Radar data={CHART_DATA} options={chartOptions} />
          </div> */}
        </div>

        {/* <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Chart Bar</p>
            <Bar data={CHART_DATA} options={{ ...chartOptions, indexAxis: 'y' as const }} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Chart Line</p>
            <Line data={CHART_LINE_DATA} options={chartOptions} />
          </div>
        </div> */}

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div className="flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <div className="px-4 pt-4 flex items-center justify-between">
              <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Penyewa Terbaru</p>
              <Button size="sm" onClick={() => navigate('/tenant')}>Selengkapnya</Button>
            </div>

            <div className="w-full overflow-scroll">
              <table className="border-collapse min-w-full w-max">
                <thead className="font-semibold bg-sky-50">
                  <tr>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      No. Unit
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Nama
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      No. Telepon
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Tanggal Masuk
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Tanggal Keluar
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {TENANT_DATA.map((data) => (
                    <tr key={data.id} className="border-slate-200 border-b-1 last:border-b-0">
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.unit_code}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.name}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.phone}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{dayjs(data.start_date).format('YYYY-MM-DD')}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.end_date ? dayjs(data.end_date).format('YYYY-MM-DD') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <div className="px-4 pt-4 flex items-center justify-between">
              <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Kartu Akses Parkir</p>
              <Button size="sm" onClick={() => navigate('/access-card/park')}>Selengkapnya</Button>
            </div>

            <div className="w-full overflow-scroll">
              <table className="border-collapse min-w-full w-max">
                <thead className="font-semibold bg-sky-50">
                  <tr>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      No. Unit
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      No. Kartu
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      No. RFID
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Tanggal Permintaan
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Status
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {ACCESS_CARD_DATA.map((data) => (
                    <tr key={data.id} className="border-slate-200 border-b-1 last:border-b-0">
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.unit_code}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.card_no}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.rfid_no}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{dayjs(data.request_date).format('YYYY-MM-DD')}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">
                        <Badge>Permintaan Baru</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <div className="px-4 pt-4 flex items-center justify-between">
              <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Izin Barang Masuk</p>
              <Button size="sm" onClick={() => navigate('/unit-permission/incoming-item')}>Selengkapnya</Button>
            </div>

            <div className="w-full overflow-scroll">
              <table className="border-collapse min-w-full w-max">
                <thead className="font-semibold bg-sky-50">
                  <tr>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      No. Unit
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Nama Pemohon
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Jenis Barang
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Tanggal Masuk
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {INCOMING_ITEM_DATA.map((data) => (
                    <tr key={data.id} className="border-slate-200 border-b-1 last:border-b-0">
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.unit_code}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.requester_name}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.item_category_name}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{dayjs(data.start_date).format('YYYY-MM-DD')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <div className="px-4 pt-4 flex items-center justify-between">
              <p className="text-sm sm:text-md text-slate-600 dark:text-white font-semibold">Izin Barang Keluar</p>
              <Button size="sm" onClick={() => navigate('/unit-permission/outcoming-item')}>Selengkapnya</Button>
            </div>

            <div className="w-full overflow-scroll">
              <table className="border-collapse min-w-full w-max">
                <thead className="font-semibold bg-sky-50">
                  <tr>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      No. Unit
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Nama Pemohon
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Jenis Barang
                    </td>
                    <td className="text-sm text-slate-600 dark:text-white p-4">
                      Tanggal Keluar
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {INCOMING_ITEM_DATA.map((data) => (
                    <tr key={data.id} className="border-slate-200 border-b-1 last:border-b-0">
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.unit_code}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.requester_name}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{data.item_category_name}</td>
                      <td className="text-sm text-slate-500 dark:text-white px-4 py-2">{dayjs(data.start_date).format('YYYY-MM-DD')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Home
