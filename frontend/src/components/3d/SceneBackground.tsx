import { Canvas, useFrame } from "@react-three/fiber"
import { Text, Float, PointMaterial } from "@react-three/drei"
import { useRef, useMemo, useState } from "react"
import * as random from "maath/random"

function FloatingFood({ position, emoji, speed }: { position: [number, number, number], emoji: string, speed: number }) {
    const ref = useRef<any>()

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.2
            ref.current.rotation.y = Math.cos(state.clock.elapsedTime * speed) * 0.2
            ref.current.position.y += Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.002
        }
    })

    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
            <Text
                ref={ref}
                position={position}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
                fillOpacity={0.8}
            >
                {emoji}
            </Text>
        </Float>
    )
}

function FoodParticles() {
    const foods = ["🍗", "🥩", "🍔", "🍕", "🥗", "🥤", "🍖", "🥦", "🥕", "🍱"]

    const particles = useMemo(() => {
        return new Array(30).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10
            ] as [number, number, number],
            emoji: foods[Math.floor(Math.random() * foods.length)],
            speed: 0.5 + Math.random() * 0.5
        }))
    }, [])

    return (
        <group>
            {particles.map((p, i) => (
                <FloatingFood key={i} position={p.position} emoji={p.emoji} speed={p.speed} />
            ))}
        </group>
    )
}

function Stars(props: any) {
    const ref = useRef<any>()
    const [sphere] = useState(() => random.inSphere(new Float32Array(3000), { radius: 1.5 }))

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 15
            ref.current.rotation.y -= delta / 20
        }
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#fbbf24" // Amber/Gold for warm food vibe
                    size={0.003}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </points>
        </group>
    )
}

export default function SceneBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-zinc-950">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <Stars />
                <FoodParticles />
            </Canvas>
        </div>
    )
}
