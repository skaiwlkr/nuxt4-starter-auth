import jwt from 'jsonwebtoken'
import { db } from '~~/server/db'

export default defineEventHandler(async (event) => {
  try {
    // Extract the JWT token from the Authorization header
    const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Nicht authentifiziert',
      })
    }

    // Verify the JWT token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }

    // Fetch the user from the database using the decoded user ID
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('uuid', '=', decoded.userId)
      .executeTakeFirst()

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Benutzer nicht gefunden',
      })
    }

    return { user }
  }
  catch (error: any) {
    // Handle JWT verification errors specifically
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        message: 'Ungültiger Token',
      })
    }

    // Handle all other errors
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Ein Fehler ist aufgetreten',
    })
  }
})
