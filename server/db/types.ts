import type { Insertable, Selectable, Updateable } from 'kysely'

export interface Database {
  users: {
    uuid: string
    first_name: string | null
    last_name: string | null
  }
}

export type InsertableUser = Insertable<Database['users']>
export type SelectableUser = Selectable<Database['users']>
export type UpdateableUser = Updateable<Database['users']>
