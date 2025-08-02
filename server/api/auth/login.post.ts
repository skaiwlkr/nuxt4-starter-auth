import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '~~/server/db'

// Validates the Cloudflare Turnstile token to prevent automated attacks
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

// Main login handler that processes user authentication
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, turnstileToken } = body

    // Validate that Turnstile token is provided
    if (!turnstileToken) {
      throw createError({
        statusCode: 400,
        message: 'Turnstile-Token ist erforderlich',
      })
    }

    // Verify the Turnstile token with Cloudflare
    const isValidTurnstile = await validateTurnstileToken(turnstileToken)
    if (!isValidTurnstile) {
      throw createError({
        statusCode: 400,
        message: 'Ungültiges Turnstile-Token',
      })
    }

    // Query the database for the user
    const user = await db
      .selectFrom('users')
      .select(['uuid', 'email', 'password', 'first_name', 'last_name', 'email_verified'])
      .where('email', '=', email)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Ungültige Anmeldedaten',
      })
    }

    // Verify the provided password against the stored hash
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Ungültige Anmeldedaten',
      })
    }

    // Ensure the user's email has been verified
    if (!user.email_verified) {
      throw createError({
        statusCode: 403,
        message: 'Bitte verifiziere zuerst deine E-Mail-Adresse.',
      })
    }

    // Generate JWT token for authenticated session
    const token = jwt.sign(
      { userId: user.uuid },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    )

    // Remove password from user object before sending response
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ein Fehler ist aufgetreten',
    })
  }
})
