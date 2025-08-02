import type { InsertableEmailVerification } from '~~/server/db/types'
import { randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'
import { db } from '~~/server/db'
import { sendEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = body || {}

    // If no email in body, try to use authenticated user
    let userEmail = email
    if (!userEmail) {
      const authHeader = getHeader(event, 'Authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { uuid: string }
        const user = await db
          .selectFrom('users')
          .select('email')
          .where('uuid', '=', decoded.uuid)
          .executeTakeFirst()

        if (user) {
          userEmail = user.email
        }
      }
    }

    if (!userEmail) {
      throw createError({
        statusCode: 400,
        message: 'E-Mail-Adresse ist erforderlich',
      })
    }

    // Retrieve user from database
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', userEmail)
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

    // Delete old tokens
    await db
      .deleteFrom('email_verifications')
      .where('user_uuid', '=', user.uuid)
      .execute()

    // Generate new verification token
    const emailVerificationToken = randomBytes(32).toString('hex')

    // Token validity period
    /* const expires = new Date(Date.now() + 1 * 60 * 1000) // 1 minute validity (Debugging) */
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours validity

    // Store new verification token
    const newVerification: InsertableEmailVerification = {
      user_uuid: user.uuid,
      token: emailVerificationToken,
      expires_at: expires,
      uuid: randomBytes(16).toString('hex'),
      created_at: new Date(),
    }

    await db
      .insertInto('email_verifications')
      .values(newVerification)
      .execute()

    // Prepare verification URL
    const frontendUrl = process.env.FRONTEND_URL || getRequestURL(event).origin
    const verifyUrl = process.env.NODE_ENV === 'development'
      ? `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${userEmail}`
      : `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${userEmail}`

    // Send verification email
    await sendEmail({
      to: userEmail,
      subject: 'Bitte bestätige deine E-Mail-Adresse',
      text: `Klicke auf den folgenden Link, um deinen Account zu verifizieren: ${verifyUrl}\n\nDer Link ist 24 Stunden gültig.`,
      html: `
        <p>Klicke auf den folgenden Link, um deinen Account zu verifizieren:</p>
        <a href="${verifyUrl}">Account verifizieren</a>
        <p>Der Link ist 24 Stunden gültig.</p>
      `,
    })

    return { message: 'Verifizierungs-E-Mail wurde gesendet' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ein Fehler ist aufgetreten',
    })
  }
})
