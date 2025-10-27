import { createBrowserRouter } from 'react-router-dom'

import PageAccessCardParking from 'pages/AccessCard/Park'
import PageAccessCardUnit from 'pages/AccessCard/Unit'
import PageAccessCardVehicleList from 'pages/AccessCard/VehicleList'
import PageAreaList from 'pages/Area/List'
import PageAssetGroup from 'pages/Asset/Group'
import PageAssetList from 'pages/Asset/List'
import PageAssetLocation from 'pages/Asset/Location'
import PageAssetType from 'pages/Asset/Type'
import PageCalendar from 'pages/Calendar'
import PageCategoryInquiry from 'pages/Category/Inquiry'
import PageCategoryItem from 'pages/Category/Item'
import PageCategoryRenovation from 'pages/Category/Renovation'
import PageCategoryWork from 'pages/Category/Work'
import PageDepartment from 'pages/Department'
import PageError404 from 'pages/Error/404'
import PageFinancialReport from 'pages/FinancialReport'
import PageHome from 'pages/Home'
import PageInquiryTicket from 'pages/Inquiry/Ticket'
import PageInquiryWorkOrder from 'pages/Inquiry/WorkOrder'
import PageItemHistory from 'pages/Item/History'
import PageItemPurchase from 'pages/Item/Purchase'
import PageItemRequest from 'pages/Item/Request'
import PageItemStock from 'pages/Item/Stock'
import PageLogin from 'pages/Login'
import PageMaintenanceChecklist from 'pages/Maintenance/Checklist'
import PageMaintenanceAsset from 'pages/Maintenance/List'
import PageNews from 'pages/News'
import PageNote from 'pages/Note'
import PageOwner from 'pages/Owner'
import PagePermission from 'pages/Permission'
import PageProfile from 'pages/Profile'
import PageRole from 'pages/Role'
import PageTemplateDocument from 'pages/Template/Document'
import PageTemplateForm from 'pages/Template/Form'
import PageTenantCafe from 'pages/Tenant/Cafe'
import PageTenantUnit from 'pages/Tenant/Unit'
import PageTodoList from 'pages/TodoList'
import PageUnitApartment from 'pages/Unit/Apartment'
import PageUnitCafe from 'pages/Unit/Cafe'
import PageUnitFacility from 'pages/Unit/Facility'
import PageUnitPermissionFacility from 'pages/UnitPermission/Facility'
import PageIncomingItem from 'pages/UnitPermission/IncomingItem'
import PageOutgoingItem from 'pages/UnitPermission/OutgoingItem'
import PageRenovation from 'pages/UnitPermission/Renovation'
import PageWork from 'pages/UnitPermission/Work'
import PageUser from 'pages/User'
import PageVendorContract from 'pages/Vendor/Contract'
import PageVendorList from 'pages/Vendor/List'

const router = createBrowserRouter([
  {
    path: '/',
    Component: PageHome
  },
  {
    path: '/login',
    Component: PageLogin
  },
  {
    path: '/permission',
    Component: PagePermission
  },
  {
    path: '/role',
    Component: PageRole
  },
  {
    path: '/user',
    Component: PageUser
  },
  {
    path: '/department',
    Component: PageDepartment
  },
  {
    path: '/unit/apartment',
    Component: PageUnitApartment
  },
  {
    path: '/unit/cafe',
    Component: PageUnitCafe
  },
  {
    path: '/unit/facility',
    Component: PageUnitFacility
  },
  {
    path: '/category/work',
    Component: PageCategoryWork
  },
  {
    path: '/category/renovation',
    Component: PageCategoryRenovation
  },
  {
    path: '/category/item',
    Component: PageCategoryItem
  },
  {
    path: '/category/inquiry',
    Component: PageCategoryInquiry
  },
  {
    path: '/asset/group',
    Component: PageAssetGroup
  },
  {
    path: '/asset/location',
    Component: PageAssetLocation
  },
  {
    path: '/asset/type',
    Component: PageAssetType
  },
  {
    path: '/asset/list',
    Component: PageAssetList
  },
  {
    path: '/area/list',
    Component: PageAreaList
  },
  {
    path: '/template/form',
    Component: PageTemplateForm
  },
  {
    path: '/template/document',
    Component: PageTemplateDocument
  },
  {
    path: '/owner',
    Component: PageOwner
  },
  {
    path: '/tenant-unit',
    Component: PageTenantUnit
  },
  {
    path: '/tenant-cafe',
    Component: PageTenantCafe
  },
  {
    path: '/access-card/unit',
    Component: PageAccessCardUnit
  },
  {
    path: '/access-card/parking',
    Component: PageAccessCardParking
  },
  {
    path: '/access-card/vehicle-list',
    Component: PageAccessCardVehicleList
  },
  {
    path: '/unit-permission/work',
    Component: PageWork
  },
  {
    path: '/unit-permission/renovation',
    Component: PageRenovation
  },
  {
    path: '/unit-permission/incoming-item',
    Component: PageIncomingItem
  },
  {
    path: '/unit-permission/outgoing-item',
    Component: PageOutgoingItem
  },
  {
    path: '/unit-permission/facility',
    Component: PageUnitPermissionFacility
  },
  {
    path: '/vendor/list',
    Component: PageVendorList
  },
  {
    path: '/vendor/contract',
    Component: PageVendorContract
  },
  {
    path: '/item/stock',
    Component: PageItemStock
  },
  {
    path: '/item/history',
    Component: PageItemHistory
  },
  {
    path: '/item/request',
    Component: PageItemRequest
  },
  {
    path: '/item/purchase',
    Component: PageItemPurchase
  },
  {
    path: '/maintenance/asset',
    Component: PageMaintenanceAsset
  },
  {
    path: '/maintenance/checklist',
    Component: PageMaintenanceChecklist
  },
  {
    path: '/inquiry/ticket',
    Component: PageInquiryTicket
  },
  {
    path: '/inquiry/workorder',
    Component: PageInquiryWorkOrder
  },
  {
    path: '/news',
    Component: PageNews
  },
  {
    path: '/financial-report',
    Component: PageFinancialReport
  },
  {
    path: '/app-calendar',
    Component: PageCalendar
  },
  {
    path: '/app-todo',
    Component: PageTodoList
  },
  {
    path: '/app-note',
    Component: PageNote
  },
  {
    path: '/profile',
    Component: PageProfile
  },
  {
    path: '*',
    Component: PageError404
  }
])

export default router
