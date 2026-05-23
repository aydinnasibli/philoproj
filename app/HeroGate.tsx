import { getHeroVisible } from '@/lib/hero'
import HeroOverlayClient from '@/components/network/HeroOverlayClient'

export default async function HeroGate() {
  const heroVisible = await getHeroVisible()
  if (!heroVisible) return null
  return <HeroOverlayClient />
}
