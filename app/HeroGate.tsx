import { connection } from 'next/server'
import { getHeroVisible } from '@/lib/hero'
import HeroOverlayClient from '@/components/network/HeroOverlayClient'

export default async function HeroGate() {
  await connection()
  const heroVisible = await getHeroVisible()
  if (!heroVisible) return null
  return <HeroOverlayClient />
}
