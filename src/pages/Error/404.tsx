import Layout from 'components/Layout'

function Error404() {
  return (
    <Layout>
      <div className="flex-1 justify-center items-center flex flex-col">
        <h1 className="text-7xl text-slate-600 dark:text-white">404</h1>
        <p className="text-md text-slate-600 mb-16 dark:text-white">Halaman Tidak Ditemukan</p>
        <img src="/images/not-found.svg" alt="not-found" className="w-[350px] animate-bounce" style={{ animationDuration: '3s' }} />
      </div>
    </Layout>
  )
}

export default Error404
