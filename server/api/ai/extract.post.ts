export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.text) {
    throw createError({ statusCode: 400, message: 'No text provided for extraction' })
  }

  try {
    return await extractTicketsFromText(body.text)
  } catch (e) {
    if ((e as { statusCode?: number }).statusCode) throw e
    const message = e instanceof Error ? e.message : 'Failed to extract tickets'
    throw createError({ statusCode: 500, message })
  }
})
