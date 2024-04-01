import {
  useState, useEffect, useRef,
} from 'react'
import QRCode from 'react-qr-code'

import Layout from 'components/Layout'
import Breadcrumb from 'components/Breadcrumb'
import Table from 'components/Table/Table'
import Button from 'components/Button'
import Modal from 'components/Modal'
import Input from 'components/Form/Input'
import Popover from 'components/Popover'
import { Edit as IconEdit, TrashAlt as IconTrash, FileText as IconFile } from 'components/Icons'
import type { TableHeaderProps } from 'components/Table/Table'
import useDebounce from 'hooks/useDebounce'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import Autocomplete from 'components/Form/Autocomplete'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import TextArea from 'components/Form/TextArea'
import { svgToImage } from 'utils/file'
import api from 'utils/api'

const PAGE_NAME = 'List Aset'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Kode',
    key: 'code',
  },
  {
    label: 'Nama',
    key: 'name',
  },
  {
    label: 'Golongan',
    key: 'asset_group_name',
  },
  {
    label: 'Lokasi',
    key: 'asset_location_name',
  },
  {
    label: 'Jenis',
    key: 'asset_type_name',
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true,
  },
]

function PageAssetList() {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  })
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState({
    id: 0,
    code: '',
    name: '',
    asset_group_id: 0,
    asset_location_id: 0,
    asset_type_id: 0,
    year: '',
    brand: '',
    notes: '',
  })
  const [dataAssetGroup, setDataAssetGroup] = useState<{ id: number, name: string }[]>([])
  const [dataAssetLocation, setDataAssetLocation] = useState<{ id: number, name: string }[]>([])
  const [dataAssetType, setDataAssetType] = useState<{ id: number, name: string }[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [search, setSearch] = useState('')
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false,
  })
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false,
  })
  const [submitType, setSubmitType] = useState('create')
  const qrCodeRef = useRef<any>(null)

  const debounceSearch = useDebounce(search, 500, () => setPage(1))

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: '',
    })
  }

  const handleModalFormClose = () => {
    setModalForm({
      title: '',
      open: false,
      readOnly: false,
    })
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false,
    }))
    setFields({
      id: 0,
      code: '',
      name: '',
      asset_group_id: 0,
      asset_location_id: 0,
      asset_type_id: 0,
      year: '',
      brand: '',
      notes: '',
    })
  }

  const handleModalConfirmClose = () => {
    if (submitType !== 'delete') {
      setModalForm((prevState) => ({
        ...prevState,
        open: true,
      }))
    }
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false,
    }))
  }

  const handleModalCreateOpen = () => {
    setModalForm({
      title: `Tambah ${PAGE_NAME} Baru`,
      open: true,
      readOnly: false,
    })
  }

  const handleModalDetailOpen = (fieldData: any) => {
    setModalForm({
      title: `Detail ${PAGE_NAME}`,
      open: true,
      readOnly: true,
    })
    setFields({
      id: fieldData.id,
      code: fieldData.code,
      name: fieldData.name,
      asset_group_id: fieldData.asset_group_id,
      asset_location_id: fieldData.asset_location_id,
      asset_type_id: fieldData.asset_type_id,
      year: fieldData.year,
      brand: fieldData.brand,
      notes: fieldData.notes,
    })
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${PAGE_NAME}`,
      open: true,
      readOnly: false,
    })
    setFields({
      id: fieldData.id,
      code: fieldData.code,
      name: fieldData.name,
      asset_group_id: fieldData.asset_group_id,
      asset_location_id: fieldData.asset_location_id,
      asset_type_id: fieldData.asset_type_id,
      year: fieldData.year,
      brand: fieldData.brand,
      notes: fieldData.notes,
    })
  }

  const handleModalDeleteOpen = (fieldData: any) => {
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE.delete.title,
      description: MODAL_CONFIRM_TYPE.delete.description,
      open: true,
    })
    setSubmitType('delete')
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
    }))
  }

  const handleChangeField = (fieldName: string, value: string | number) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }))
  }

  const handleChangeNumericField = (fieldName: string, value: string) => {
    if (/^\d*$/.test(value) || value === '') {
      handleChangeField(fieldName, value)
    }
  }

  const handleClickConfirm = (type: string) => {
    setModalForm((prevState) => ({
      ...prevState,
      open: false,
    }))
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE[type].title,
      description: MODAL_CONFIRM_TYPE[type].description,
      open: true,
    })
    setSubmitType(type)
  }

  const handleGetAssets = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/asset',
      withAuth: true,
      method: 'GET',
      params: {
        page,
        limit: PAGE_SIZE,
        search,
      },
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllAssetLocations = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/asset-location',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataAssetLocation(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllAssetGroups = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/asset-group',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataAssetGroup(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const handleGetAllAssetTypes = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/asset-type',
      withAuth: true,
      method: 'GET',
      params: {
        limit: 9999,
      },
    })
      .then(({ data: responseData }) => {
        if (responseData.data.data.length > 0) {
          setDataAssetType(responseData.data.data)
        }
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingData(false)
      })
  }

  const apiSubmitCreate = () => api({
    url: '/v1/asset/create',
    withAuth: true,
    method: 'POST',
    data: fields,
  })

  const apiSubmitUpdate = () => api({
    url: `/v1/asset/${fields.id}`,
    withAuth: true,
    method: 'PUT',
    data: fields,
  })

  const apiSubmitDelete = () => api({
    url: `/v1/asset/${fields.id}`,
    withAuth: true,
    method: 'DELETE',
  })

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    let apiSubmit = apiSubmitCreate
    if (submitType === 'update') {
      apiSubmit = apiSubmitUpdate
    } else if (submitType === 'delete') {
      apiSubmit = apiSubmitDelete
    }

    apiSubmit().then(() => {
      handleGetAssets()
      handleModalFormClose()
      setToast({
        open: true,
        message: MODAL_CONFIRM_TYPE[submitType].message,
      })
    })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          open: true,
          message: error.response?.data?.message,
        })
      }).finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const handleSaveQR = () => {
    svgToImage(qrCodeRef.current, fields.name)
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    code: column.code,
    name: column.name,
    asset_group_name: column.asset_group_name,
    asset_location_name: column.asset_location_name,
    asset_type_name: column.asset_type_name,
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button variant="primary" size="sm" icon onClick={() => handleModalDetailOpen(column)}>
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('asset-list-edit') && (
        <Popover content="Ubah">
          <Button variant="primary" size="sm" icon onClick={() => handleModalUpdateOpen(column)}>
            <IconEdit className="w-4 h-4" />
          </Button>
        </Popover>
        )}
        {userPermissions.includes('asset-list-delete') && (
        <Popover content="Hapus">
          <Button variant="danger" size="sm" icon onClick={() => handleModalDeleteOpen(column)}>
            <IconTrash className="w-4 h-4" />
          </Button>
        </Popover>
        )}
      </div>
    ),
  }))

  useEffect(() => {
    handleGetAssets()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)

    handleGetAllAssetGroups()
    handleGetAllAssetLocations()
    handleGetAllAssetTypes()
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input placeholder="Cari nama" onChange={(e) => setSearch(e.target.value)} fullWidth />
            </div>
            <Button className="sm:ml-auto" onClick={handleModalCreateOpen}>Tambah</Button>
          </div>

          <Table
            tableHeaders={TABLE_HEADERS}
            tableData={tableDatas}
            total={data.total}
            page={data.page}
            limit={PAGE_SIZE}
            onChangePage={setPage}
            isLoading={isLoadingData}
          />
        </div>
      </div>

      <Modal open={modalForm.open} title={modalForm.title}>
        <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6" onSubmit={() => handleClickConfirm(fields.id ? 'update' : 'create')}>
          <Input
            placeholder="Nama Aset"
            label="Nama Aset"
            name="name"
            value={fields.name}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Golongan Aset"
            label="Golongan Aset"
            name="asset_group_id"
            items={dataAssetGroup.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: dataAssetGroup.find((itemData) => itemData.id === fields.asset_group_id)?.name || '',
              value: dataAssetGroup.find((itemData) => itemData.id === fields.asset_group_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('asset_group_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Lokasi Aset"
            label="Lokasi Aset"
            name="asset_location_id"
            items={dataAssetLocation.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: dataAssetLocation.find((itemData) => itemData.id === fields.asset_location_id)?.name || '',
              value: dataAssetLocation.find((itemData) => itemData.id === fields.asset_location_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('asset_location_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Autocomplete
            placeholder="Jenis Aset"
            label="Jenis Aset"
            name="asset_type_id"
            items={dataAssetType.map((itemData) => ({
              label: itemData.name,
              value: itemData.id,
            }))}
            value={{
              label: dataAssetType.find((itemData) => itemData.id === fields.asset_type_id)?.name || '',
              value: dataAssetType.find((itemData) => itemData.id === fields.asset_type_id)?.id || '',
            }}
            onChange={(value) => handleChangeField('asset_type_id', value.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Merk Aset"
            label="Merk Aset"
            name="brand"
            value={fields.brand}
            onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <Input
            placeholder="Tahun Aset"
            label="Tahun Aset"
            name="year"
            type="tel"
            value={fields.year}
            onChange={(e) => handleChangeNumericField(e.target.name, e.target.value)}
            readOnly={modalForm.readOnly}
            fullWidth
          />

          <div className="sm:col-span-2">
            <TextArea
              placeholder="Note"
              label="Note"
              name="notes"
              value={fields.notes}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />
          </div>

          {!!fields.id && (
            <Input
              placeholder="Code Aset"
              label="Code Aset"
              name="code"
              value={fields.code}
              readOnly
              fullWidth
            />
          )}

          {!!fields.id && (
            <div className="">
              <p className="text-sm text-slate-600 font-medium mb-2">QR Code</p>

              <div className="w-full sm:w-[50%]">
                <QRCode
                  ref={qrCodeRef}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  size={150}
                  value={fields.code}
                  viewBox="0 0 150 150"
                />
              </div>
            </div>
          )}

        </form>
        <div className="flex gap-2 justify-end p-4">
          {modalForm.readOnly && (
            <Button onClick={handleSaveQR}>Save QR Code</Button>
          )}
          <Button onClick={handleModalFormClose} variant="default">Tutup</Button>
          {!modalForm.readOnly && (
            <Button onClick={() => handleClickConfirm(fields.id ? 'update' : 'create')}>Kirim</Button>
          )}
        </div>
      </Modal>

      <Modal open={modalConfirm.open} title={modalConfirm.title} size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">{modalConfirm.description}</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalConfirmClose} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmit}>Kirim</Button>
        </div>
      </Modal>

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />

    </Layout>
  )
}

export default PageAssetList
