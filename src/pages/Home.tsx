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
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg">
            <p className="text-md text-slate-600 font-semibold">Chart Donat</p>
            <Doughnut data={CHART_DATA} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg">
            <p className="text-md text-slate-600 font-semibold">Chart Pie</p>
            <Pie data={CHART_DATA} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg">
            <p className="text-md text-slate-600 font-semibold">Chart Radar</p>
            <Radar data={CHART_DATA} options={chartOptions} />
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg">
            <p className="text-md text-slate-600 font-semibold">Chart Bar</p>
            <Bar data={CHART_DATA} options={chartOptions} />
          </div>

          <div className="p-4 flex flex-col gap-4 bg-white rounded-lg">
            <p className="text-md text-slate-600 font-semibold">Chart Line</p>
            <Line data={CHART_LINE_DATA} options={chartOptions} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Home
