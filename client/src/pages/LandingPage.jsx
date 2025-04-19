"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, Float, PerspectiveCamera, Environment, Stars, useProgress, Html } from "@react-three/drei"
import { useSpring, animated } from "@react-spring/three"

// Loading component
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 border-4 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-white">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  )
}

// Particles background
function ParticleField() {
  const particles = useRef([])
  const count = 1000
  
  useFrame((state) => {
    for (let i = 0; i < count; i++) {
      const particle = particles.current[i]
      particle.rotation.x += 0.001
      particle.rotation.y += 0.001
    }
  })

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (particles.current[i] = el)}
          position={[
            Math.random() * 20 - 10,
            Math.random() * 20 - 10,
            Math.random() * 20 - 10
          ]}
        >
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Scene() {
  const sphereRef = useRef()
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const { camera } = useThree()
  
  // Scroll-based camera movement
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
    }
    
    // Smooth camera movement based on scroll
    const scrollY = window.scrollY
    camera.position.y = -(scrollY * 0.005)
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      <Environment preset={isDarkTheme ? "night" : "sunset"} />
      
      <ParticleField />
      <Stars fade speed={0.5} depth={50} count={5000} />
      
      <ambientLight intensity={isDarkTheme ? 0.5 : 0.8} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDarkTheme ? 1 : 1.5} 
        castShadow 
      />
      
      {/* Theme Toggle Sphere */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[4, 4, 0]}>
        <mesh 
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          cursor="pointer"
        >
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            color={isDarkTheme ? "#ffffff" : "#000000"} 
            emissive={isDarkTheme ? "#ffffff" : "#000000"}
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
      
      {/* Floating sphere with improved material */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            color={isDarkTheme ? "#333333" : "#666666"} 
            metalness={0.8} 
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>
      </Float>
      
      {/* Enhanced Title */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[0, 3, 0]}>
        <Text
          fontSize={1.5}
          color={isDarkTheme ? "#ffffff" : "#000000"}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          material-toneMapped={false}
        >
          LearnHub
        </Text>
      </Float>
      
      {/* Enhanced Subtitle */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[0, 2, 0]}>
        <Text
          fontSize={0.5}
          color={isDarkTheme ? "#cccccc" : "#333333"}
          anchorX="center"
          anchorY="middle"
          material-toneMapped={false}
        >
          Expand your skills with our expert-led courses
        </Text>
      </Float>
      
      {/* Enhanced Buttons */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[-1.5, 0, 0]}>
        <Button3D
          text="Login"
          color="#4CAF50"
          hoverColor="#45a049"
          onClick={() => {window.location.href='/login'}}
        />
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[1.5, 0, 0]}>
        <Button3D
          text="Sign Up"
          color="#2196F3"
          hoverColor="#1976D2"
          onClick={() => {window.location.href='/signup'}}
        />
      </Float>
    </>
  )
}

function Button3D({ text, color, hoverColor, onClick }) {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  
  const [springs, api] = useSpring(() => ({
    scale: 1,
    color: color,
    config: { mass: 1, tension: 170, friction: 26 }
  }))
  
  const handlePointerOver = () => {
    setIsHovered(true)
    api.start({ 
      scale: 1.1,
      color: hoverColor
    })
  }
  
  const handlePointerOut = () => {
    setIsHovered(false)
    api.start({ 
      scale: 1,
      color: color
    })
  }
  
  return (
    <animated.mesh
      ref={meshRef}
      scale={springs.scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={onClick}
    >
      <boxGeometry args={[2, 0.5, 0.1]} />
      <animated.meshStandardMaterial color={springs.color} />
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
      {isHovered && (
        <mesh position={[0, -0.4, 0]}>
          <planeGeometry args={[2, 0.1]} />
          <meshBasicMaterial color={hoverColor} transparent opacity={0.3} />
        </mesh>
      )}
    </animated.mesh>
  )
}

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section with 3D Scene */}
      <section className="h-screen relative">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={<Loader />}>
            <Scene />
          </Suspense>
        </Canvas>
      </section>

      {/* Features Section */}
      <section className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
              <h3 className="text-2xl font-semibold mb-4">Expert Instructors</h3>
              <p>Learn from industry professionals with years of experience.</p>
            </div>
            <div className="p-6 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
              <h3 className="text-2xl font-semibold mb-4">Interactive Learning</h3>
              <p>Engage with hands-on projects and real-world applications.</p>
            </div>
            <div className="p-6 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
              <h3 className="text-2xl font-semibold mb-4">Flexible Schedule</h3>
              <p>Learn at your own pace with 24/7 access to course materials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-20">
        <div className="max-w-6xl mx-auto px-8 flex flex-col items-center justify-center h-full">
          <h2 className="text-4xl font-bold mb-8 text-center">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 text-center">Join thousands of students already learning with us</p>
          <button className="px-8 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  )
}