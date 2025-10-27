import { useState, useEffect, useRef } from 'react'
import QRCode from 'react-qr-code'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Input from 'components/Form/Input'
import TextArea from 'components/Form/TextArea'
import {
  Edit as IconEdit,
  FileText as IconFile,
  TrashAlt as IconTrash
} from 'components/Icons'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Popover from 'components/Popover'
import Table from 'components/Table/Table'
import type { TableHeaderProps } from 'components/Table/Table'
import Toast from 'components/Toast'
import { PAGE_SIZE, MODAL_CONFIRM_TYPE } from 'constants/form'
import useDebounce from 'hooks/useDebounce'
import api from 'utils/api'
import { toBase64 } from 'utils/file'

const PAGE_NAME = 'Template Dokumen'

const TABLE_HEADERS: TableHeaderProps[] = [
  {
    label: 'Nama',
    key: 'name'
  },
  {
    label: 'Aksi',
    key: 'action',
    className: 'w-[100px]',
    hasAction: true
  }
]

const PageTemplateDocument = () => {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [data, setData] = useState<DataTableProps>({
    data: [],
    page: 1,
    limit: 10,
    total: 0
  })
  const [page, setPage] = useState(1)
  const [fields, setFields] = useState({
    id: 0,
    name: '',
    header: '',
    subheader: '',
    content: '',
    picture: ''
  })
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: ''
  })
  const [search, setSearch] = useState('')
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false
  })
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false
  })
  const [submitType, setSubmitType] = useState('create')
  const [isModalDeletePictureOpen, setIsModalDeletePictureOpen] =
    useState(false)

  const debounceSearch = useDebounce(search, 500, () => setPage(1))
  const pictureRef = useRef<any>(null)

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: ''
    })
  }

  const handleModalFormClose = () => {
    setModalForm({
      title: '',
      open: false,
      readOnly: false
    })
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
    setFields({
      id: 0,
      name: '',
      header: '',
      subheader: '',
      content: '',
      picture: ''
    })
  }

  const handleModalConfirmClose = () => {
    if (submitType !== 'delete') {
      setModalForm((prevState) => ({
        ...prevState,
        open: true
      }))
    }
    setModalConfirm((prevState) => ({
      ...prevState,
      open: false
    }))
  }

  const handleModalDetailOpen = (fieldData: any) => {
    setModalForm({
      title: `Detail ${fieldData.name}`,
      open: true,
      readOnly: true
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      name: fieldData.name,
      header: fieldData.header,
      subheader: fieldData.subheader,
      content: fieldData.content,
      picture: fieldData.picture
    }))
  }

  const handleModalUpdateOpen = (fieldData: any) => {
    setModalForm({
      title: `Ubah ${fieldData.name}`,
      open: true,
      readOnly: false
    })
    setFields((prevState) => ({
      ...prevState,
      id: fieldData.id,
      name: fieldData.name,
      header: fieldData.header,
      subheader: fieldData.subheader,
      content: fieldData.content,
      picture: fieldData.picture
    }))
  }

  const handleChangeField = (fieldName: string, value: string | number) => {
    setFields((prevState) => ({
      ...prevState,
      [fieldName]: value
    }))
  }

  const handleClickConfirm = (type: string) => {
    setModalForm((prevState) => ({
      ...prevState,
      open: false
    }))
    setModalConfirm({
      title: MODAL_CONFIRM_TYPE[type].title,
      description: MODAL_CONFIRM_TYPE[type].description,
      open: true
    })
    setSubmitType(type)
  }

  const handleGetDocuments = () => {
    setIsLoadingData(true)
    api({
      url: '/v1/document',
      withAuth: true,
      method: 'GET',
      params: {
        page,
        limit: PAGE_SIZE,
        search
      }
    })
      .then(({ data: responseData }) => {
        setData(responseData.data)
      })
      .catch((error) => {
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }

  const apiSubmitUpdate = () =>
    api({
      url: `/v1/document/${fields.id}`,
      withAuth: true,
      method: 'PUT',
      data: fields
    })

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    const apiSubmit = apiSubmitUpdate

    apiSubmit()
      .then(() => {
        handleGetDocuments()
        handleModalFormClose()
        setToast({
          open: true,
          message: MODAL_CONFIRM_TYPE[submitType].message
        })
      })
      .catch((error) => {
        handleModalConfirmClose()
        setToast({
          open: true,
          message: error.response?.data?.message
        })
      })
      .finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const handleModalDeletePictureOpen = () => {
    setIsModalDeletePictureOpen(true)
  }

  const handleClickCancelDeletePicture = () => {
    setIsModalDeletePictureOpen(false)
  }

  const handleClickSubmitDeletePicture = () => {
    handleClickCancelDeletePicture()
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      setToast({
        open: true,
        message: 'Berhasil menghapus foto.'
      })
      setFields((prevState) => ({
        ...prevState,
        picture: ''
      }))
    }, 500)
  }

  const handleClickPictureUpload = () => {
    pictureRef.current.click()
  }

  const handlePictureUpload = (files: FileList | null) => {
    if (files) {
      const file = files[0]
      // console.log(file)
      if (
        (file.type.includes('image') || file.type.includes('pdf')) &&
        file.size < 500000
      ) {
        toBase64(file).then((result) => {
          pictureRef.current.value = null
          setFields((prevState) => ({
            ...prevState,
            picture: result as string
          }))
        })
      } else {
        const message =
          file.size > 500000
            ? 'Ukuran file terlalu besar, silakan pilih file dibawah 500kb.'
            : 'Dokumen format tidak sesuai, silakan pilih format image atau pdf.'
        setToast({
          open: true,
          message
        })
      }
    }
  }

  const tableDatas = data.data.map((column) => ({
    id: column.id,
    name: column.name,
    action: (
      <div className="flex items-center gap-1">
        <Popover content="Detail">
          <Button
            variant="primary"
            size="sm"
            icon
            onClick={() => handleModalDetailOpen(column)}
          >
            <IconFile className="w-4 h-4" />
          </Button>
        </Popover>
        {userPermissions.includes('template-document-edit') && (
          <Popover content="Ubah">
            <Button
              variant="primary"
              size="sm"
              icon
              onClick={() => handleModalUpdateOpen(column)}
            >
              <IconEdit className="w-4 h-4" />
            </Button>
          </Popover>
        )}
      </div>
    )
  }))

  useEffect(() => {
    handleGetDocuments()
  }, [debounceSearch, page])

  useEffect(() => {
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (localStorageUser.permissions) {
        setUserPermissions(localStorageUser.permissions)
      }
    }, 500)
  }, [])

  return (
    <Layout>
      <Breadcrumb title={PAGE_NAME} />

      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg dark:bg-black">
          <div className="mb-4 flex gap-4 flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-[30%]">
              <Input
                placeholder="Cari nama"
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </div>
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

      <Modal open={modalForm.open} title={modalForm.title} size="lg">
        <form
          autoComplete="off"
          className="flex flex-col lg:flex-row gap-6 p-6"
        >
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-600">
                Logo Apartmen
              </p>

              {!modalForm.readOnly && !fields.picture && (
                <div>
                  <Button
                    onClick={handleClickPictureUpload}
                    size="sm"
                    variant="secondary"
                  >
                    Upload Foto
                  </Button>

                  <input
                    ref={pictureRef}
                    type="file"
                    hidden
                    onChange={(e) => handlePictureUpload(e.target.files)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                {fields.picture && (
                  <div className="border border-slate-200 rounded hover:border-primary relative">
                    {!modalForm.readOnly && (
                      <span
                        className="rounded-full bg-red-500 absolute right-0 top-0 cursor-pointer p-2"
                        onClick={handleModalDeletePictureOpen}
                        role="presentation"
                      >
                        <IconTrash
                          className="text-white"
                          width={16}
                          height={16}
                        />
                      </span>
                    )}
                    <img
                      src={fields.picture}
                      alt="doc"
                      className="w-[100px] h-[100px] object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <TextArea
              placeholder="Header"
              label="Header"
              name="header"
              value={fields.header}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />
            <TextArea
              placeholder="Subheader"
              label="Subheader"
              name="subheader"
              value={fields.subheader}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              fullWidth
            />
            <TextArea
              placeholder="Content"
              label="Content"
              name="content"
              value={fields.content}
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
              readOnly={modalForm.readOnly}
              rows={5}
              fullWidth
            />
          </div>

          <div className="flex-3 flex flex-col gap-4">
            <p className="font-medium text-sm text-slate-600">Preview</p>

            <div className="bg-slate-100 rounded-md p-4 overflow-scroll h-full">
              <div className="bg-white p-4 text-slate-600 min-w-[800px] text-pr">
                <div className="whitespace-pre-line border-b-2 border-black flex items-center gap-4">
                  <div className="w-[80px]">
                    {fields.picture ? (
                      <div className="relative">
                        <img
                          src={fields.picture}
                          alt="doc"
                          className="w-[100px] h-[100px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-[100px] h-[100px] rounded border border-slate-100 flex flex-col items-center justify-center">
                        <p className="text-xxs">Logo Apartment</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-semibold text-lg">{fields.header}</p>
                    <p className="font-semibold text-xs">{fields.subheader}</p>
                  </div>
                  <div className="w-[100px]" />
                </div>
                <div className="py-4 flex flex-col gap-4">
                  <div className="text-center whitespace-pre-line">
                    <div className="flex justify-between">
                      <div className="flex flex-col text-left">
                        <p className="text-xs font-semibold">{fields.name}</p>
                        {(fields.id === 1 || fields.id === 2) && (
                          <>
                            <p className="text-xxs font-normal">Unit: 0000</p>
                            <p className="text-xxs font-normal">
                              Tanggal Mulai: 01 Jan 2024
                            </p>
                            <p className="text-xxs font-normal">
                              Tanggal Selesai: 01 Jan 2024
                            </p>
                          </>
                        )}
                        {fields.id === 3 && (
                          <>
                            <p className="text-xxs font-normal">Unit: 0000</p>
                            <p className="text-xxs font-normal">
                              Tanggal Masuk: 01 Jan 2024
                            </p>
                          </>
                        )}
                        {fields.id === 4 && (
                          <>
                            <p className="text-xxs font-normal">Unit: 0000</p>
                            <p className="text-xxs font-normal">
                              Tanggal Keluar: 01 Jan 2024
                            </p>
                          </>
                        )}
                        {(fields.id === 5 || fields.id === 6) && (
                          <p className="text-xxs font-normal">
                            Divisi: Nama Divisi
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col text-right text-xs">
                        <p className="text-xs font-semibold">Pemohon</p>
                        <p className="text-xxs font-normal">Lorem Ipsum</p>
                        <p className="text-xxs font-normal">081xxxxxxxxx</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center whitespace-pre-line">
                    <div className="flex flex-col text-left gap-2">
                      {(fields.id === 1 || fields.id === 2) && (
                        <p className="text-xxs font-normal">
                          Jenis Pekerjaan: Lorem Ipsum
                        </p>
                      )}
                      {(fields.id === 3 || fields.id === 4) && (
                        <p className="text-xxs font-normal">
                          Jenis Barang: Lorem Ipsum
                        </p>
                      )}

                      {fields.id === 5 && (
                        <table className="w-full mb-4">
                          <thead>
                            <tr className="border-t-1 border-slate-300">
                              <td className="text-xxs font-semibold">No.</td>
                              <td className="text-xxs font-semibold">
                                Nama Barang
                              </td>
                              <td className="text-xxs font-semibold">Jumlah</td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t-1 border-slate-300 last:border-b-0">
                              <td className="text-xxs">1</td>
                              <td className="text-xxs">Barang 1</td>
                              <td className="text-xxs">1</td>
                            </tr>
                            <tr className="border-t-1 border-slate-300 last:border-b-1">
                              <td className="text-xxs">2</td>
                              <td className="text-xxs">Barang 2</td>
                              <td className="text-xxs">2</td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {fields.id === 6 && (
                        <table className="w-full mb-4">
                          <thead>
                            <tr className="border-t-1 border-slate-300">
                              <td className="text-xxs font-semibold">No.</td>
                              <td className="text-xxs font-semibold">
                                Nama Barang
                              </td>
                              <td className="text-xxs font-semibold">Jumlah</td>
                              <td className="text-xxs font-semibold">Harga</td>
                              <td className="text-xxs font-semibold">
                                Sub Total
                              </td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t-1 border-slate-300 last:border-b-0">
                              <td className="text-xxs">1</td>
                              <td className="text-xxs">Barang 1</td>
                              <td className="text-xxs">1</td>
                              <td className="text-xxs">Rp 1</td>
                              <td className="text-xxs">Rp 1</td>
                            </tr>
                            <tr className="border-t-1 border-slate-300 last:border-b-1">
                              <td className="text-xxs">2</td>
                              <td className="text-xxs">Barang 2</td>
                              <td className="text-xxs">2</td>
                              <td className="text-xxs">Rp 2</td>
                              <td className="text-xxs">Rp 2</td>
                            </tr>
                            <tr className="border-t-1 border-slate-300 last:border-b-1">
                              <td
                                className="text-xxs"
                                colSpan={3}
                                aria-label="total"
                              />
                              <td className="text-xxs font-semibold">Total</td>
                              <td className="text-xxs font-semibold">Rp 3</td>
                            </tr>
                            <tr className="border-t-1 border-slate-300 last:border-b-1">
                              <td
                                className="text-xxs"
                                colSpan={3}
                                aria-label="total"
                              />
                              <td className="text-xxs font-semibold">Diskon</td>
                              <td className="text-xxs font-semibold">Rp 0</td>
                            </tr>
                            <tr className="border-t-1 border-slate-300 last:border-b-1">
                              <td
                                className="text-xxs"
                                colSpan={3}
                                aria-label="total"
                              />
                              <td className="text-xxs font-semibold">
                                PPN 11%
                              </td>
                              <td className="text-xxs font-semibold">Rp 0</td>
                            </tr>
                            <tr className="border-t-1 border-slate-300 last:border-b-1">
                              <td
                                className="text-xxs"
                                colSpan={3}
                                aria-label="total"
                              />
                              <td className="text-xxs font-semibold">
                                Grand Total
                              </td>
                              <td className="text-xxs font-semibold">Rp 3</td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      <p className="text-xxs font-normal">{fields.content}</p>
                    </div>
                  </div>
                  <div className="text-center whitespace-pre-line">
                    <div className="flex flex-col text-left gap-2">
                      <p className="text-xxs font-normal">
                        Jakarta, 01 Jan 2024
                      </p>
                      <QRCode
                        style={{
                          height: 'auto',
                          maxWidth: '50px',
                          width: '50px'
                        }}
                        size={150}
                        value="contoh"
                        viewBox="0 0 150 150"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">
            Tutup
          </Button>
          {!modalForm.readOnly && (
            <Button
              onClick={() =>
                handleClickConfirm(fields.id ? 'update' : 'create')
              }
            >
              Kirim
            </Button>
          )}
        </div>
      </Modal>

      <Modal open={modalConfirm.open} title={modalConfirm.title} size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            {modalConfirm.description}
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalConfirmClose} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmit}>Kirim</Button>
        </div>
      </Modal>

      <Modal open={isModalDeletePictureOpen} title="Hapus Foto" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">
            Apa anda yakin ingin menghapus foto?
          </p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeletePicture} variant="default">
            Kembali
          </Button>
          <Button onClick={handleClickSubmitDeletePicture}>Ya</Button>
        </div>
      </Modal>

      {isLoadingSubmit && <LoadingOverlay />}

      <Toast
        open={toast.open}
        message={toast.message}
        onClose={handleCloseToast}
      />
    </Layout>
  )
}

export default PageTemplateDocument
