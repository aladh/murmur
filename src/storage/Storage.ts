interface Storage {
  upload(accessToken: string, blob: Blob, filename: string): Promise<any>
  download(shareLink: string): Promise<Blob>
  getDownloadLink(accessToken: string, filename: string): Promise<string>
}

export default Storage