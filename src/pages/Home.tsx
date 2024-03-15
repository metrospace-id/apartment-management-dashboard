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

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, RadialLinearScale)

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
}

const CHART_DATA = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      fill: true,
      label: '# of Votes',
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

function Home() {
  const PAGE_NAME = 'Dashboard'
  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full flex flex-col gap-6">

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-lg bg-white dark:bg-slate-950 p-4">
            <p className="text-md text-slate-600 font-semibold dark:text-white">Jumlah Unit</p>
            <div className="flex gap-2 items-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <p className="text-4xl">99</p>
            </div>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-950 p-4">
            <p className="text-md text-slate-600 font-semibold dark:text-white">Jumlah Pemilik</p>
            <div className="flex gap-2 items-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
              <p className="text-4xl">99</p>
            </div>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-950 p-4">
            <p className="text-md text-slate-600 font-semibold dark:text-white">Jumlah Penghuni</p>
            <div className="flex gap-2 items-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <p className="text-4xl">99</p>
            </div>
          </div>
          <div className="rounded-lg bg-white dark:bg-slate-950 p-4">
            <p className="text-md text-slate-600 font-semibold dark:text-white">Jumlah Kendaraan</p>
            <div className="flex gap-2 items-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <p className="text-4xl">99</p>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-md text-slate-600 dark:text-white font-semibold">Chart Donat</p>
            <Doughnut data={CHART_DATA} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-md text-slate-600 dark:text-white font-semibold">Chart Pie</p>
            <Pie data={CHART_DATA} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-md text-slate-600 dark:text-white font-semibold">Chart Radar</p>
            <Radar data={CHART_DATA} options={chartOptions} />
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-md text-slate-600 dark:text-white font-semibold">Chart Bar</p>
            <Bar data={CHART_DATA} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg dark:bg-slate-950">
            <p className="text-md text-slate-600 dark:text-white font-semibold">Chart Line</p>
            <Line data={CHART_LINE_DATA} options={chartOptions} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Home
