import pdfParse from 'pdf-parse'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  const pdfFile = formData?.find(f => f.name === 'file')

  if (!pdfFile || !pdfFile.data) {
    throw createError({ statusCode: 400, message: 'No PDF file provided' })
  }

  try {
    // Extract text from PDF
    const pdfData = await pdfParse(Buffer.from(pdfFile.data))
    const text = pdfData.text

    if (!text || text.trim().length === 0) {
      throw createError({ statusCode: 400, message: 'PDF contains no extractable text' })
    }

    // Extract tickets directly (no loopback HTTP call)
    return await extractTicketsFromText(text)
  } catch (e) {
    if ((e as { statusCode?: number }).statusCode) throw e
    const message = e instanceof Error ? e.message : 'Failed to parse PDF'
    throw createError({ statusCode: 500, message })
  }
})
