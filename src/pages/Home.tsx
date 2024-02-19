import Layout from 'components/Layout'

function Home() {
  return (
    <Layout>
      <div className="p-4 bg-white flex justify-between dark:bg-black">
        <p className="text-md font-semibold text-slate-600 dark:text-white">Dashboard</p>
        <div className="flex gap-1 items-center">
          <p className="text-sm font-normal text-slate-400 dark:text-white">Home</p>
          <p className="text-sm font-normal text-slate-400 dark:text-white">/</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-white">Dashboard</p>
        </div>
      </div>

      <div className="flex-1 m-4 p-4 bg-white rounded-lg dark:bg-slate-900">
        <h1 className="text-xl text-slate-600 dark:text-white sm:text-7xl">Content Dashboard</h1>
      </div>
    </Layout>
  )
}

export default Home
