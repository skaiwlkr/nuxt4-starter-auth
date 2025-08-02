import { compare, hash } from 'bcryptjs'
import { db } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const { token, password } = await readBody(event)

  // Search for token in database
  const passwordReset = await db
    .selectFrom('password_resets')
    .innerJoin('users', 'users.uuid', 'password_resets.user_uuid')
    .select([
      'password_resets.uuid',
      'password_resets.user_uuid',
      'users.password',
    ])
    .where('password_resets.token', '=', token)
    .where('password_resets.expires_at', '>', new Date())
    .executeTakeFirst()

  // Delete token if it has expired
  if (!passwordReset) {
    await db
      .deleteFrom('password_resets')
      .where('token', '=', token)
      .execute()

    throw createError({
      statusCode: 400,
      message: 'Ungültiger oder abgelaufener Token',
    })
  }

  // Check if new password matches the old one
  const isSamePassword = await compare(password, passwordReset.password)
  if (isSamePassword) {
    throw createError({
      statusCode: 400,
      message: 'Das neue Passwort darf nicht dem alten Passwort entsprechen',
    })
  }

  // Hash password and update
  const hashedPassword = await hash(password, 10)
  await db
    .updateTable('users')
    .set({ password: hashedPassword })
    .where('uuid', '=', passwordReset.user_uuid)
    .execute()

  // Delete token only after successful password change
  await db
    .deleteFrom('password_resets')
    .where('token', '=', token)
    .execute()

  return { success: true }
})
