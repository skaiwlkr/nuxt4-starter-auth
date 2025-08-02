import type { InsertableUser } from '~~/server/db/types'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '~~/server/db'

// Validates a Cloudflare Turnstile token
async function validateTurnstileToken(token: string) {
  const config = useRuntimeConfig()
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: process.env.NODE_ENV === 'development'
        ? '1x0000000000000000000000000000000AA' // Test Secret Key
        : config.turnstileSecretKey,
      response: token,
    }),
  })

  const data = await response.json()
  return data.success
}

// Handles user registration with email verification and Turnstile protection
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, turnstileToken } = body

    // Validate Turnstile token presence
    if (!turnstileToken) {
      throw createError({
        statusCode: 400,
        message: 'Turnstile-Token ist erforderlich',
      })
    }

    // Validate Turnstile token
    const isValidTurnstile = await validateTurnstileToken(turnstileToken)
    if (!isValidTurnstile) {
      throw createError({
        statusCode: 400,
        message: 'Ungültiges Turnstile-Token',
      })
    }

    // Check if email already exists
    const existingUser = await db
      .selectFrom('users')
      .select(['email', 'email_verified'])
      .where('email', '=', email)
      .executeTakeFirst()

    if (existingUser) {
      if (!existingUser.email_verified) {
        throw createError({
          statusCode: 400,
          message: 'Diese E-Mail-Adresse wurde bereits registriert, ist aber noch nicht verifiziert. Bitte prüfen Sie Ihre E-Mails oder fordern Sie einen neuen Verifizierungslink an.',
        })
      }
      throw createError({
        statusCode: 400,
        message: 'Error on registration',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user object
    const newUser: InsertableUser = {
      email,
      password: hashedPassword,
      first_name: null,
      last_name: null,
      flags: null,
      email_verified: null,
      uuid: randomBytes(16).toString('hex'),
      created_at: new Date(),
    }

    try {
      // Insert user into database
      const [user] = await db
        .insertInto('users')
        .values(newUser)
        .returning(['uuid', 'email'])
        .execute()

      // Send verification email
      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : process.env.FRONTEND_URL || getRequestURL(event).origin

      await $fetch(`${baseUrl}/api/auth/verify-email/send`, {
        method: 'POST',
        body: { email: user.email },
      })

      return {
        message: 'Registrierung erfolgreich. Bitte prüfe deine E-Mails und verifiziere deinen Account.',
      }
    }
    catch (dbError: any) {
      // Log database errors
      console.error('Database error on registration', {
        error: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
      })
      throw createError({
        statusCode: 500,
        message: `Error on database operation: ${dbError.message}`,
      })
    }
  }
  catch (error: any) {
    // Log and handle general errors
    console.error('Registration error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ein Fehler ist aufgetreten',
    })
  }
})
