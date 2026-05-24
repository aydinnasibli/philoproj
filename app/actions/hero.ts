'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { HERO_COOKIE } from '@/lib/hero'

const SEVEN_DAYS_S = 7 * 24 * 60 * 60

export async function markHeroSeen() {
  const cookieStore = await cookies()
  cookieStore.set(HERO_COOKIE, '1', {
    maxAge: SEVEN_DAYS_S,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  revalidatePath('/')
}
