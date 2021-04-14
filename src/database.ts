import faunadb from 'faunadb'

import { faunaFetch } from './utils'

const q = faunadb.query

export interface UserProfile {
  user_id: string
  languages: string[]
  bio: string
}

export interface UserProfileResult {
  ref: any
  ts: number
  data: UserProfile
}

export async function getProfile(
  userID: string,
): Promise<UserProfileResult | null> {
  const client = new faunadb.Client({ secret: FAUNA_KEY, fetch: faunaFetch })

  let foundUser = null

  await client
    .paginate(q.Match(q.Index('user'), userID))
    .map((ref) => {
      return q.Get(ref)
    })
    .each((user: any) => {
      foundUser = user[0]
    })

  return Array.isArray(foundUser) ? null : foundUser
}

export async function setProfile(profile: UserProfile) {
  const client = new faunadb.Client({ secret: FAUNA_KEY, fetch: faunaFetch })

  await client.query(
    q.Create(q.Collection('profiles'), {
      data: profile,
    }),
  )
}

export async function updateProfile(ref: any, profile: UserProfile) {
  const client = new faunadb.Client({ secret: FAUNA_KEY, fetch: faunaFetch })

  await client.query(q.Replace(ref, { data: profile }))
}
