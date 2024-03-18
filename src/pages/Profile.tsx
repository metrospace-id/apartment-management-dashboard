import { useState, useRef } from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Input from 'components/Form/Input'
import Layout from 'components/Layout'
import Button from 'components/Button'
import Modal from 'components/Modal'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Toast from 'components/Toast'
import { TrashAlt as IconTrash } from 'components/Icons'
import { toBase64 } from 'utils/file'
import { MODAL_CONFIRM_TYPE } from 'constants/form'
import InputPassword from 'components/Form/InputPassword'

function PageProfile() {
  const [field, setField] = useState({
    name: 'Uje',
    email: 'uje@email.com',
    picture: 'https://via.placeholder.com/300x300',
  })
  const [passwordField, setPasswordField] = useState({
    password: '',
    password_confirmation: '',
  })

  const [isModalDeletePictureOpen, setIsModalDeletePictureOpen] = useState(false)
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false,
  })
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: '',
  })
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false,
  })
  const [submitType, setSubmitType] = useState('create')
  const [error, setError] = useState<any>({})

  const pictureRef = useRef<any>(null)

  const handleChangeField = (fieldName: string, value: string | number) => {
    setField((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }))
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
        message: 'Berhasil menghapus foto.',
      })
      setField((prevState) => ({
        ...prevState,
        picture: '',
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
      if ((file.type.includes('image') || file.type.includes('pdf')) && file.size < 500000) {
        toBase64(file).then((result) => {
          pictureRef.current.value = null
          setField((prevState) => ({
            ...prevState,
            picture: result as string,
          }))
        })
      } else {
        const message = file.size > 500000 ? 'Ukuran file terlalu besar, silakan pilih file dibawah 500kb.' : 'Dokumen format tidak sesuai, silakan pilih format image atau pdf.'
        setToast({
          open: true,
          message,
        })
      }
    }
  }

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: '',
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

  const handleModalPasswordOpen = () => {
    setModalForm({
      title: 'Ubah Password',
      open: true,
      readOnly: true,
    })
  }

  const handleChangePasswordField = (pwField: string, value: string) => {
    setPasswordField((prevState) => ({
      ...prevState,
      [pwField]: value,
    }))
    setError((prevState: any) => ({
      ...prevState,
      [pwField]: '',
    }))
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

  const handleConfirmPassword = () => {
    if (!passwordField.password_confirmation) {
      setError((prevState: any) => ({
        ...prevState,
        password_confirmation: 'Konfirmasi password tidak boleh kosong.',
      }))
    } else if (passwordField.password !== passwordField.password_confirmation) {
      setError((prevState: any) => ({
        ...prevState,
        password_confirmation: 'Konfirmasi password tidak sesuai.',
      }))
    } else {
      handleClickConfirm('update')
    }
  }

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      setIsLoadingSubmit(false)
      handleModalFormClose()
      setToast({
        open: true,
        message: MODAL_CONFIRM_TYPE[submitType].message,
      })
    }, 500)
  }

  console.log(error)

  return (
    <Layout>
      <Breadcrumb title="Profil" />
      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        <div className="w-full p-4 bg-white rounded-lg flex flex-col justify-center items-center">
          <form className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-600">
                Foto Profil
              </p>

              { !field.picture && (
              <div>
                <Button onClick={handleClickPictureUpload} size="sm" variant="secondary">
                  Upload Foto
                </Button>

                <input ref={pictureRef} type="file" hidden onChange={(e) => handlePictureUpload(e.target.files)} />
              </div>
              )}
              <div className="flex gap-2">
                {field.picture ? (
                  <div className="border border-slate-200 rounded hover:border-sky-700 relative [&_span]:hover:block overflow-hidden">

                    <span
                      className="rounded-full bg-red-500 absolute right-0 top-0 cursor-pointer hidden p-2"
                      onClick={handleModalDeletePictureOpen}
                      role="presentation"
                    >
                      <IconTrash className="text-white" width={16} height={16} />
                    </span>
                    <img src={field.picture} alt="doc" className="w-[200px] h-[200px] object-contain" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">Belum ada foto</p>
                )}
              </div>
            </div>
            <Input label="Email" placeholder="Email" value={field.email} disabled />
            <Input label="Nama Lengkap" placeholder="Nama Lengkap" value={field.name} name="name" onChange={(e) => handleChangeField(e.target.name, e.target.value)} />

            <div className="flex justify-between">
              <Button onClick={handleModalPasswordOpen} size="sm" variant="secondary">
                Ubah Password
              </Button>

              <Button onClick={() => handleClickConfirm('update')} size="sm">
                Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Modal open={modalForm.open} title={modalForm.title}>
        <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          <InputPassword
            placeholder="Password Lama"
            label="Password Lama"
            name="old_Password"
            className="col-span-2"
          />

          <InputPassword
            placeholder="Password Baru"
            label="Password Baru"
            value={passwordField.password}
            name="password"
            onChange={(e) => handleChangePasswordField(e.target.name, e.target.value)}
            className="col-span-2"
          />

          <InputPassword
            placeholder="Konfirmasi Password Baru"
            label="Konfirmasi Password Baru"
            value={passwordField.password_confirmation}
            name="password_confirmation"
            onChange={(e) => handleChangePasswordField(e.target.name, e.target.value)}
            className="col-span-2"
            error={!!error.password_confirmation}
            helperText={error.password_confirmation}
          />

        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">Tutup</Button>
          <Button onClick={handleConfirmPassword}>Kirim</Button>
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

      <Modal open={isModalDeletePictureOpen} title="Hapus Foto" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-white">Apa anda yakin ingin menghapus foto?</p>
        </div>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleClickCancelDeletePicture} variant="default">Kembali</Button>
          <Button onClick={handleClickSubmitDeletePicture}>Ya</Button>
        </div>
      </Modal>

      {isLoadingSubmit && (
        <LoadingOverlay />
      )}

      <Toast open={toast.open} message={toast.message} onClose={handleCloseToast} />
    </Layout>
  )
}

export default PageProfile
