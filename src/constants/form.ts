export const MODAL_CONFIRM_TYPE: Record<string, { title: string, description: string, message: string }> = {
  create: {
    title: 'Simpan data baru',
    description: 'Data baru akan disimpan, apakah anda yakin?',
    message: 'Berhasil menyimpan data',
  },
  update: {
    title: 'Simpan perubahan',
    description: 'Data perubahan akan disimpan, apakah anda yakin?',
    message: 'Berhasil merubah data',
  },
  delete: {
    title: 'Hapus data',
    description: 'Data akan dihapus, apakah anda yakin?',
    message: 'Berhasil menghapus data',
  },
  profile: {
    title: 'Simpan perubahan profile',
    description: 'Data profile baru akan disimpan, apakah anda yakin?',
    message: 'Berhasil merubah profile',
  },
  password: {
    title: 'Simpan perubahan password',
    description: 'Data password baru akan disimpan, apakah anda yakin?',
    message: 'Berhasil merubah password',
  },
}

export const PAGE_SIZE = 25

export const DOCUMENT_DEFAULT = {
  id: 0,
  name: '',
  header: '',
  subheader: '',
  content: '',
  picture: null,
}
