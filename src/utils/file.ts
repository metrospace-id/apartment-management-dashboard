// eslint-disable-next-line import/prefer-default-export
export const toBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
})

export const svgToImage = (svgElement: any, name = 'qr-code') => {
  // const svg = document.getElementById('svg')
  // get svg source.
  const serializer = new XMLSerializer()
  let source = serializer.serializeToString(svgElement)

  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  }

  source = `<?xml version="1.0" standalone="no"?>\r\n${source}`

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`

  const downloadLink = document.createElement('a')
  document.body.appendChild(downloadLink)

  downloadLink.href = url
  downloadLink.target = '_self'
  downloadLink.download = name
  downloadLink.click()
}
