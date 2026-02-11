'use client'

import Terrain from './Terrain'
import Trees from './Trees'
import Rocks from './Rocks'
import Water from './Water'
import Skybox from './Skybox'
import PointOfInterest from './PointOfInterest'

const POINTS_OF_INTEREST = [
  { position: [15, 0, 15] as [number, number, number], label: 'Ancient Shrine', color: '#ffd700' },
  { position: [-20, 0, 10] as [number, number, number], label: 'Crystal Cave', color: '#00ffff' },
  { position: [5, 0, -25] as [number, number, number], label: 'Mushroom Grove', color: '#ff69b4' },
  { position: [-15, 0, -20] as [number, number, number], label: 'Stone Circle', color: '#9370db' },
  { position: [25, 0, -10] as [number, number, number], label: 'Old Bridge', color: '#ff8c00' },
]

export default function World() {
  return (
    <>
      <Skybox />
      <Terrain />
      <Trees />
      <Rocks />
      <Water />
      {POINTS_OF_INTEREST.map((poi) => (
        <PointOfInterest key={poi.label} {...poi} />
      ))}
    </>
  )
}
