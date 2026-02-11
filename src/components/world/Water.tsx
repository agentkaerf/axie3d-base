'use client'

export default function Water() {
  return (
    <mesh position={[30, 0.05, 30]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[15, 32]} />
      <meshStandardMaterial color="#1e90ff" transparent opacity={0.6} />
    </mesh>
  )
}
