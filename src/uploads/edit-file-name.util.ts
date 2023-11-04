export function editFileName(req, file, cb) {
  // Generate a unique filename for the uploaded file.
  const fileName = `${Date.now()}-${file.originalname}`
  cb(null, fileName)
}
