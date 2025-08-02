import type { Insertable, Selectable, Updateable } from 'kysely'

export interface Database {
  users: {
    uuid: string
    first_name: string | null
    last_name: string | null
    email: string
    email_verified: Date | null
    password: string
    terms_of_service: Date | null
    privacy_policy: Date | null
    flags: string | null
    created_at: Date
    updated_at: Date | null
  }
  password_resets: {
    uuid: string
    token: string
    user_uuid: string
    expires_at: Date
    created_at: Date
  }
  email_verifications: {
    uuid: string
    user_uuid: string
    token: string
    expires_at: Date
    created_at: Date
  }
}

export type InsertableUser = Insertable<Database['users']>
export type SelectableUser = Selectable<Database['users']>
export type UpdateableUser = Updateable<Database['users']>

export type InsertableEmailVerification = Insertable<Database['email_verifications']>
export type SelectableEmailVerification = Selectable<Database['email_verifications']>
export type UpdateableEmailVerification = Updateable<Database['email_verifications']>
