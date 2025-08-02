import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { db } from '~~/server/db'
import { sendEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  // Find user by email
  const user = await db
    .selectFrom('users')
    .select(['uuid'])
    .where('email', '=', email)
    .executeTakeFirst()

  // For security reasons, we don't reveal whether the email exists
  if (!user) {
    return { success: true }
  }

  // Generate reset token using SHA-256 hash
  const token = createHash('sha256')
    .update(Math.random().toString())
    .digest('hex')

  // Store token in database with expiration time
  await db
    .insertInto('password_resets')
    .values({
      uuid: uuidv4(),
      token,
      user_uuid: user.uuid,
      /* expires_at: new Date(Date.now() + 60 * 1000), // Valid for 1 minute (Debugging) */
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
      created_at: new Date(),
    })
    .execute()

  // Prepare reset URL for email
  const frontendUrl = process.env.FRONTEND_URL || getRequestURL(event).origin
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`

  if (!frontendUrl) {
    throw createError({
      statusCode: 500,
      message: 'Frontend URL konnte nicht ermittelt werden',
    })
  }

  try {
    // Send password reset email
    await sendEmail({
      to: email,
      subject: 'Passwort zurücksetzen',
      text: `Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen: ${resetUrl}`,
      html: `
        <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Der Link ist 24 Stunden gültig.</p>
      `,
    })
    return { success: true }
  }
  catch (error) {
    console.error('Fehler beim E-Mail-Versand:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Versenden der E-Mail',
    })
  }
})
