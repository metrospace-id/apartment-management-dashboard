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
}

export const PAGE_SIZE = 25
