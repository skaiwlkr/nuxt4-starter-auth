import { db } from '~~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const { token } = await readBody(event)

    if (!token) {
      throw createError({
        statusCode: 400,
        message: 'Token fehlt',
      })
    }

    // Search for verification in database
    const verification = await db
      .selectFrom('email_verifications')
      .selectAll()
      .where('token', '=', token)
      .where('expires_at', '>', new Date())
      .executeTakeFirst()

    if (!verification) {
      throw createError({
        statusCode: 400,
        message: 'Ungültiger oder abgelaufener Token',
      })
    }

    // Find user
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('uuid', '=', verification.user_uuid)
      .executeTakeFirst()

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Benutzer nicht gefunden',
      })
    }

    if (user.email_verified) {
      throw createError({
        statusCode: 400,
        message: 'E-Mail-Adresse wurde bereits verifiziert',
      })
    }

    // Start transaction
    await db.transaction().execute(async (trx) => {
      // Mark email as verified
      await trx
        .updateTable('users')
        .set({
          email_verified: new Date(),
        })
        .where('uuid', '=', user.uuid)
        .execute()

      // Delete verification entry
      await trx
        .deleteFrom('email_verifications')
        .where('uuid', '=', verification.uuid)
        .execute()
    })

    return { message: 'E-Mail-Adresse wurde erfolgreich verifiziert' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ein Fehler ist aufgetreten',
    })
  }
})
