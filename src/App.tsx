import dayjs from 'dayjs'
import id from 'dayjs/locale/id'
import { RouterProvider } from 'react-router-dom'

import router from 'Router'

dayjs.locale(id)

const App = () => <RouterProvider router={router} />

export default App
