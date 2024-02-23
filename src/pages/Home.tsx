import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'

function Home() {
  const PAGE_NAME = 'Dashboard'
  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg">
          <h1 className="text-xl text-slate-600 dark:text-white ">Content Dashboard</h1>
        </div>
      </div>
    </Layout>
  )
}

export default Home
