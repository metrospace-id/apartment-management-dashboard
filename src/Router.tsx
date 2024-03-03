import {
  createBrowserRouter,
} from 'react-router-dom'

import PageLogin from 'pages/Login'
import PageHome from 'pages/Home'
import PagePermission from 'pages/Permission'
import PageRole from 'pages/Role'
import PageUser from 'pages/User'
import PageUnitApartment from 'pages/Unit/Apartment'
import PageUnitCafe from 'pages/Unit/Cafe'
import PageCalendar from 'pages/Calendar'
import PageCategoryWork from 'pages/Category/Work'
import PageCategoryRenovation from 'pages/Category/Renovation'
import PageCategoryItem from 'pages/Category/Item'
import PageAssetGroup from 'pages/Asset/Group'
import PageAssetLocation from 'pages/Asset/Location'
import PageAssetType from 'pages/Asset/Type'
import PageAssetList from 'pages/Asset/List'
import PageOwner from 'pages/Owner'
import PageTenant from 'pages/Tenant'
import PageAccessCardUnit from 'pages/AccessCard/Unit'
import PageAccessCardPark from 'pages/AccessCard/Park'
import PageAccessCardVehicleList from 'pages/AccessCard/VehicleList'
import PageError404 from 'pages/Error/404'
import PageWork from 'pages/Work'
import PageRenovation from 'pages/Renovation'
import PageIncomingItem from 'pages/IncomingItem'
import PageOutcomingItem from 'pages/OutcomingItem'

const router = createBrowserRouter([
  {
    path: '/',
    Component: PageHome,
  },
  {
    path: '/login',
    Component: PageLogin,
  },
  {
    path: '/permission',
    Component: PagePermission,
  },
  {
    path: '/role',
    Component: PageRole,
  },
  {
    path: '/user',
    Component: PageUser,
  },
  {
    path: '/unit/apartment',
    Component: PageUnitApartment,
  },
  {
    path: '/unit/cafe',
    Component: PageUnitCafe,
  },
  {
    path: '/category/work',
    Component: PageCategoryWork,
  },
  {
    path: '/category/renovation',
    Component: PageCategoryRenovation,
  },
  {
    path: '/category/item',
    Component: PageCategoryItem,
  },
  {
    path: '/asset/group',
    Component: PageAssetGroup,
  },
  {
    path: '/asset/location',
    Component: PageAssetLocation,
  },
  {
    path: '/asset/type',
    Component: PageAssetType,
  },
  {
    path: '/asset/list',
    Component: PageAssetList,
  },
  {
    path: '/owner',
    Component: PageOwner,
  },
  {
    path: '/tenant',
    Component: PageTenant,
  },
  {
    path: '/access-card/unit',
    Component: PageAccessCardUnit,
  },
  {
    path: '/access-card/park',
    Component: PageAccessCardPark,
  },
  {
    path: '/access-card/vehicle-list',
    Component: PageAccessCardVehicleList,
  },
  {
    path: '/work',
    Component: PageWork,
  },
  {
    path: '/renovation',
    Component: PageRenovation,
  },
  {
    path: '/incoming-item',
    Component: PageIncomingItem,
  },
  {
    path: '/outcoming-item',
    Component: PageOutcomingItem,
  },
  {
    path: '/calendar',
    Component: PageCalendar,
  },
  {
    path: '*',
    Component: PageError404,
  },
])

export default router
