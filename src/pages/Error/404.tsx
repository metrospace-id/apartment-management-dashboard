import Layout from 'components/Layout'

const Error404 = () => (
  <Layout>
    <div className="p-4 dark:bg-slate-900 w-[100vw] h-full sm:w-full">
      <div className="w-full p-4 bg-white rounded-lg h-full flex flex-col justify-center items-center">
        <h1 className="text-7xl text-slate-600 dark:text-white">404</h1>
        <p className="text-md text-slate-600 mb-16 dark:text-white">
          Halaman Tidak Ditemukan
        </p>
        <img
          src="/images/not-found.svg"
          alt="not-found"
          className="w-[350px] animate-bounce"
          style={{ animationDuration: '3s' }}
        />
      </div>
    </div>
  </Layout>
)

export default Error404
