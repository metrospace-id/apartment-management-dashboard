import { useState, useRef, useEffect } from 'react'

import Breadcrumb from 'components/Breadcrumb'
import Button from 'components/Button'
import Input from 'components/Form/Input'
import InputPassword from 'components/Form/InputPassword'
import { TrashAlt as IconTrash } from 'components/Icons'
import Layout from 'components/Layout'
import LoadingOverlay from 'components/Loading/LoadingOverlay'
import Modal from 'components/Modal'
import Toast from 'components/Toast'
import { MODAL_CONFIRM_TYPE } from 'constants/form'
import api from 'utils/api'
import { toBase64 } from 'utils/file'

const PageProfile = () => {
  const [field, setField] = useState({
    id: 0,
    name: '',
    email: '',
    email_verified_at: '',
    picture: ''
  })
  const [passwordField, setPasswordField] = useState({
    password: '',
    new_password: '',
    new_password_confirmation: ''
  })

  const [isModalDeletePictureOpen, setIsModalDeletePictureOpen] =
    useState(false)
  const [modalConfirm, setModalConfirm] = useState({
    title: '',
    description: '',
    open: false
  })
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [toast, setToast] = useState({
    open: false,
    message: ''
  })
  const [modalForm, setModalForm] = useState({
    title: '',
    open: false,
    readOnly: false
  })
  const [submitType, setSubmitType] = useState('profile')
  const [error, setError] = useState<any>({})

  const pictureRef = useRef<any>(null)

  const handleChangeField = (fieldName: string, value: string | number) => {
    setField((prevState) => ({
      ...prevState,
      [fieldName]: value
    }))
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
    setPasswordField({
      password: '',
      new_password: '',
      new_password_confirmation: ''
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
      setField((prevState) => ({
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
          setField((prevState) => ({
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

  const handleCloseToast = () => {
    setToast({
      open: false,
      message: ''
    })
  }

  const handleModalConfirmClose = () => {
    if (passwordField.password) {
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

  const handleModalPasswordOpen = () => {
    setModalForm({
      title: 'Ubah Password',
      open: true,
      readOnly: true
    })
  }

  const handleChangePasswordField = (pwField: string, value: string) => {
    setPasswordField((prevState) => ({
      ...prevState,
      [pwField]: value
    }))
    setError((prevState: any) => ({
      ...prevState,
      [pwField]: ''
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

  const handleConfirmPassword = () => {
    if (!passwordField.new_password_confirmation) {
      setError((prevState: any) => ({
        ...prevState,
        new_password_confirmation: 'Konfirmasi password tidak boleh kosong.'
      }))
    } else if (
      passwordField.new_password !== passwordField.new_password_confirmation
    ) {
      setError((prevState: any) => ({
        ...prevState,
        new_password_confirmation: 'Konfirmasi password tidak sesuai.'
      }))
    } else {
      handleClickConfirm('password')
    }
  }

  const handleSubmitProfile = () => {
    api({
      withAuth: true,
      method: 'PUT',
      url: `/v1/user/${field.id}`,
      data: {
        name: field.name,
        password: passwordField.password,
        picture: field.picture
      }
    })
      .then(() => {
        setToast({
          open: true,
          message: 'Berhasil menyimpan data.'
        })
        handleModalFormClose()
      })
      .catch((e) => {
        setToast({
          open: true,
          message: e?.response?.data?.message || 'Terjadi kesalahan'
        })
      })
      .finally(() => {
        setIsLoadingSubmit(false)
      })
  }

  const handleSubmitPassword = () => {
    api({
      withAuth: true,
      method: 'PUT',
      url: `/v1/user/${field.id}/password`,
      data: {
        password: passwordField.password,
        new_password: passwordField.new_password
      }
    })
      .then(() => {
        setToast({
          open: true,
          message: 'Berhasil menyimpan data.'
        })
        handleModalFormClose()
        setTimeout(() => {
          window.location.reload()
          setIsLoadingSubmit(false)
        }, 1000)
      })
      .catch((e) => {
        setToast({
          open: true,
          message: e?.response?.data?.message || 'Terjadi kesalahan'
        })
        setError((prevState: any) => ({
          ...prevState,
          password: e?.response?.data?.message || 'Terjadi kesalahan'
        }))
        handleModalConfirmClose()
      })
  }

  const handleClickSubmit = () => {
    setIsLoadingSubmit(true)

    if (submitType === 'profile') {
      handleSubmitProfile()
    } else {
      handleSubmitPassword()
    }
  }

  useEffect(() => {
    setIsLoadingSubmit(true)
    setTimeout(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}')
      setField((prevState) => ({
        ...prevState,
        id: localStorageUser.id,
        name: localStorageUser.name,
        email: localStorageUser.email,
        email_verified_at: localStorageUser.email_verified_at,
        picture: localStorageUser.picture || 'https://placehold.co/300x300'
      }))
      setIsLoadingSubmit(false)
    }, 500)
  }, [])

  return (
    <Layout>
      <Breadcrumb title="Profil" />
      <div className="p-4 dark:bg-slate-900 w-[100vw] sm:w-full">
        {!field.email_verified_at && (
          <div className="p-4 rounded-lg bg-tertiary-50 mb-4">
            <p className="text-slate-600 text-sm font-semibold">
              Silakan ubah password terlebih dahulu
            </p>
          </div>
        )}

        <div className="w-full p-4 bg-white rounded-lg flex flex-col justify-center items-center">
          <form className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-600 ">
                Foto Profil
              </p>

              {!field.picture && (
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
                {field.picture ? (
                  <div className="border border-slate-200 rounded hover:border-primary relative overflow-hidden">
                    <span
                      className="rounded-full bg-red-500 absolute right-1 top-1 cursor-pointer p-2"
                      onClick={handleModalDeletePictureOpen}
                      role="presentation"
                    >
                      <IconTrash
                        className="text-white"
                        width={16}
                        height={16}
                      />
                    </span>
                    <img
                      src={field.picture}
                      alt="doc"
                      className="w-[200px] h-[200px] object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">Belum ada foto</p>
                )}
              </div>
            </div>
            <Input
              label="Email"
              placeholder="Email"
              value={field.email}
              disabled
            />
            <Input
              label="Nama Lengkap"
              placeholder="Nama Lengkap"
              value={field.name}
              name="name"
              onChange={(e) => handleChangeField(e.target.name, e.target.value)}
            />

            <div className="flex justify-between">
              <Button
                onClick={handleModalPasswordOpen}
                size="sm"
                variant="secondary"
              >
                Ubah Password
              </Button>

              <Button onClick={() => handleClickConfirm('profile')} size="sm">
                Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Modal open={modalForm.open} title={modalForm.title}>
        <form
          autoComplete="off"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6"
          onSubmit={handleConfirmPassword}
        >
          <InputPassword
            placeholder="Password Lama"
            label="Password Lama"
            value={passwordField.password}
            name="password"
            onChange={(e) =>
              handleChangePasswordField(e.target.name, e.target.value)
            }
            className="col-span-2"
            error={!!error.password}
            helperText={error.password}
          />

          <InputPassword
            placeholder="Password Baru"
            label="Password Baru"
            value={passwordField.new_password}
            name="new_password"
            onChange={(e) =>
              handleChangePasswordField(e.target.name, e.target.value)
            }
            className="col-span-2"
          />

          <InputPassword
            placeholder="Konfirmasi Password Baru"
            label="Konfirmasi Password Baru"
            value={passwordField.new_password_confirmation}
            name="new_password_confirmation"
            onChange={(e) =>
              handleChangePasswordField(e.target.name, e.target.value)
            }
            className="col-span-2"
            error={!!error.new_password_confirmation}
            helperText={error.new_password_confirmation}
          />
        </form>
        <div className="flex gap-2 justify-end p-4">
          <Button onClick={handleModalFormClose} variant="default">
            Tutup
          </Button>
          <Button onClick={handleConfirmPassword}>Kirim</Button>
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

export default PageProfile
