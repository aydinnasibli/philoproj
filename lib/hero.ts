import 'server-only'
import { cookies } from 'next/headers'

export const HERO_COOKIE = 'manuscript_hero_seen'

export async function getHeroVisible(): Promise<boolean> {
  const cookieStore = await cookies()
  return !cookieStore.get(HERO_COOKIE)
}
