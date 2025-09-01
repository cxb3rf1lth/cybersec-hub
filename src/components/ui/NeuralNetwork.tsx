import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  connections: number[]
}

interface NeuralNetworkProps {
  className?: string
  nodeCount?: number
  connectionDistance?: number
  opacity?: number
}

export function NeuralNetwork({ 
  className = '', 
  nodeCount = 100, 
  connectionDistance = 150,
  opacity = 0.3 
}: NeuralNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const initNodes = () => {
      nodesRef.current = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: []
      }))
    }

    const updateNodes = () => {
      nodesRef.current.forEach(node => {
        node.x += node.vx
        node.y += node.vy

        // Boundary collision
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1

        // Keep nodes within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))
      })
    }

    const findConnections = () => {
      nodesRef.current.forEach((node, i) => {
        node.connections = []
        nodesRef.current.forEach((otherNode, j) => {
          if (i !== j) {
            const distance = Math.sqrt(
              Math.pow(node.x - otherNode.x, 2) + 
              Math.pow(node.y - otherNode.y, 2)
            )
            if (distance < connectionDistance) {
              node.connections.push(j)
            }
          }
        })
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      ctx.strokeStyle = `rgba(239, 68, 68, ${opacity * 0.3})` // red with opacity
      ctx.lineWidth = 0.8
      ctx.beginPath()

      nodesRef.current.forEach((node, i) => {
        node.connections.forEach(connectionIndex => {
          const connectedNode = nodesRef.current[connectionIndex]
          const distance = Math.sqrt(
            Math.pow(node.x - connectedNode.x, 2) + 
            Math.pow(node.y - connectedNode.y, 2)
          )
          
          // Fade connection based on distance
          const connectionOpacity = (1 - distance / connectionDistance) * opacity * 0.5
          ctx.strokeStyle = `rgba(239, 68, 68, ${connectionOpacity})`
          
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connectedNode.x, connectedNode.y)
        })
      })
      ctx.stroke()

      // Draw nodes
      nodesRef.current.forEach(node => {
        const nodeSize = 2 + (node.connections.length * 0.3)
        const glowIntensity = Math.min(node.connections.length / 5, 1)
        
        // Node glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize + 3, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, nodeSize + 3
        )
        gradient.addColorStop(0, `rgba(239, 68, 68, ${opacity * glowIntensity * 0.8})`)
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
        ctx.fillStyle = gradient
        ctx.fill()

        // Node core
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${opacity * (0.6 + glowIntensity * 0.4)})`
        ctx.fill()

        // Node highlight
        ctx.beginPath()
        ctx.arc(node.x - nodeSize/3, node.y - nodeSize/3, nodeSize/3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`
        ctx.fill()
      })
    }

    const animate = () => {
      updateNodes()
      findConnections()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initNodes()
    animate()

    window.addEventListener('resize', () => {
      resizeCanvas()
      initNodes()
    })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [nodeCount, connectionDistance, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  )
}