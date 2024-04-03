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
import PageTenantApartment from 'pages/Tenant/Apartment'
import PageAccessCardUnit from 'pages/AccessCard/Unit'
import PageAccessCardParking from 'pages/AccessCard/Park'
import PageAccessCardVehicleList from 'pages/AccessCard/VehicleList'
import PageError404 from 'pages/Error/404'
import PageWork from 'pages/UnitPermission/Work'
import PageRenovation from 'pages/UnitPermission/Renovation'
import PageIncomingItem from 'pages/UnitPermission/IncomingItem'
import PageOutcomingItem from 'pages/UnitPermission/OutcomingItem'
import PageItemStock from 'pages/Item/Stock'
import PageItemHistory from 'pages/Item/History'
import PageDepartment from 'pages/Department'
import PageItemRequest from 'pages/Item/Request'
import PageVendorList from 'pages/Vendor/List'
import PageVendorContract from 'pages/Vendor/Contract'
import PageItemPurchase from 'pages/Item/Purchase'
import PageMaintenanceAsset from 'pages/Maintenance/List'
import PageMaintenanceChecklist from 'pages/Maintenance/Checklist'
import PageTodoList from 'pages/TodoList'
import PageNote from 'pages/Note'
import PageProfile from 'pages/Profile'
import PageCategoryInquiry from 'pages/Category/Inquiry'
import PageInquiryTenant from 'pages/Inquiry/Tenant'
import PageInquiryWorkOrder from 'pages/Inquiry/Technician'
import PageTemplateForm from 'pages/Template/Form'
import PageTemplateDocument from 'pages/Template/Document'
import PageUnitFacility from 'pages/Unit/Facility'
import PageAreaList from 'pages/Area/List'
import PageNews from 'pages/News'
import PageUnitPermissionFacility from 'pages/UnitPermission/Facility'
import PageTenantCafe from 'pages/Tenant/Cafe'

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
    path: '/department',
    Component: PageDepartment,
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
    path: '/unit/facility',
    Component: PageUnitFacility,
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
    path: '/category/inquiry',
    Component: PageCategoryInquiry,
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
    path: '/area/list',
    Component: PageAreaList,
  },
  {
    path: '/template/form',
    Component: PageTemplateForm,
  },
  {
    path: '/template/document',
    Component: PageTemplateDocument,
  },
  {
    path: '/owner',
    Component: PageOwner,
  },
  {
    path: '/tenant-apartment',
    Component: PageTenantApartment,
  },
  {
    path: '/tenant-cafe',
    Component: PageTenantCafe,
  },
  {
    path: '/access-card/unit',
    Component: PageAccessCardUnit,
  },
  {
    path: '/access-card/parking',
    Component: PageAccessCardParking,
  },
  {
    path: '/access-card/vehicle-list',
    Component: PageAccessCardVehicleList,
  },
  {
    path: '/unit-permission/work',
    Component: PageWork,
  },
  {
    path: '/unit-permission/renovation',
    Component: PageRenovation,
  },
  {
    path: '/unit-permission/incoming-item',
    Component: PageIncomingItem,
  },
  {
    path: '/unit-permission/outcoming-item',
    Component: PageOutcomingItem,
  },
  {
    path: '/unit-permission/facility',
    Component: PageUnitPermissionFacility,
  },
  {
    path: '/vendor/list',
    Component: PageVendorList,
  },
  {
    path: '/vendor/contract',
    Component: PageVendorContract,
  },
  {
    path: '/item/stock',
    Component: PageItemStock,
  },
  {
    path: '/item/history',
    Component: PageItemHistory,
  },
  {
    path: '/item/request',
    Component: PageItemRequest,
  },
  {
    path: '/item/purchase',
    Component: PageItemPurchase,
  },
  {
    path: '/maintenance/asset',
    Component: PageMaintenanceAsset,
  },
  {
    path: '/maintenance/checklist',
    Component: PageMaintenanceChecklist,
  },
  {
    path: '/inquiry/tenant',
    Component: PageInquiryTenant,
  },
  {
    path: '/inquiry/workorder',
    Component: PageInquiryWorkOrder,
  },
  {
    path: '/calendar',
    Component: PageCalendar,
  },
  {
    path: '/todo-list',
    Component: PageTodoList,
  },
  {
    path: '/news',
    Component: PageNews,
  },
  {
    path: '/note',
    Component: PageNote,
  },
  {
    path: '/profile',
    Component: PageProfile,
  },
  {
    path: '*',
    Component: PageError404,
  },
])

export default router
