'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, MoreVertical, Clock, Flag } from 'lucide-react'

const GRID_SIZE = 6

type BlockType = 'vertical' | 'horizontal' | 'key'

interface Block {
  id: number
  type: BlockType
  width: number
  height: number
  x: number
  y: number
}

export function SimplePuzzle() {
  const [time, setTime] = useState(59)
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 1, type: 'vertical', width: 1, height: 2, x: 0, y: 1 },
    { id: 2, type: 'vertical', width: 1, height: 2, x: 1, y: 0 },
    { id: 3, type: 'vertical', width: 1, height: 2, x: 2, y: 4 },
    { id: 4, type: 'vertical', width: 1, height: 2, x: 3, y: 2 },
    { id: 5, type: 'vertical', width: 1, height: 3, x: 4, y: 2 },
    { id: 6, type: 'vertical', width: 1, height: 2, x: 5, y: 1 },
    { id: 7, type: 'vertical', width: 1, height: 2, x: 5, y: 4 },
    { id: 8, type: 'horizontal', width: 2, height: 1, x: 2, y: 0 },
    { id: 9, type: 'horizontal', width: 2, height: 1, x: 3, y: 1 },
    { id: 10, type: 'horizontal', width: 3, height: 1, x: 0, y: 3 },
    { id: 11, type: 'horizontal', width: 2, height: 1, x: 3, y: 5 },
    { id: 12, type: 'key', width: 2, height: 1, x: 1, y: 2 },
  ])
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null)
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    setDraggedBlock(id)
    e.dataTransfer.setData('text/plain', id.toString())
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (draggedBlock === null) return

    const block = blocks.find(b => b.id === draggedBlock)
    if (!block) return

    const gridRect = e.currentTarget.getBoundingClientRect()
    const cellSize = gridRect.width / GRID_SIZE
    let newX = Math.floor((e.clientX - gridRect.left) / cellSize)
    let newY = Math.floor((e.clientY - gridRect.top) / cellSize)

    // Constrain movement based on block type
    if (block.type === 'horizontal' || block.type === 'key') {
      newY = block.y
    } else if (block.type === 'vertical') {
      newX = block.x
    }

    // Check if the move is valid
    if (isValidMove(block, newX, newY)) {
      setBlocks(prevBlocks => 
        prevBlocks.map(b => 
          b.id === block.id ? { ...b, x: newX, y: newY } : b
        )
      )
      checkWinCondition({ ...block, x: newX, y: newY })
    }

    setDraggedBlock(null)
  }

  const isValidMove = (block: Block, newX: number, newY: number): boolean => {
    // Check boundaries
    if (newX < 0 || newY < 0 || newX + block.width > GRID_SIZE || newY + block.height > GRID_SIZE) {
      return false
    }

    // Check collisions with other blocks
    return !blocks.some(otherBlock => 
      otherBlock.id !== block.id &&
      newX < otherBlock.x + otherBlock.width &&
      newX + block.width > otherBlock.x &&
      newY < otherBlock.y + otherBlock.height &&
      newY + block.height > otherBlock.y
    )
  }

  const checkWinCondition = (block: Block) => {
    if (block.type === 'key' && block.x === GRID_SIZE - block.width) {
      setGameWon(true)
    }
  }

  const renderGrid = () => {
    return (
      <div 
        className="grid grid-cols-6 gap-0.5 mb-4 relative bg-gray-700"
        style={{ width: '300px', height: '300px' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Grid cells */}
        {[...Array(GRID_SIZE * GRID_SIZE)].map((_, index) => (
          <div key={index} className="bg-gray-800" />
        ))}
        
        {/* Blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`absolute rounded-sm cursor-move ${
              block.type === 'vertical' ? 'bg-red-500' :
              block.type === 'horizontal' ? 'bg-green-500' :
              'bg-yellow-500'
            }`}
            style={{
              width: `${(block.width / GRID_SIZE) * 100}%`,
              height: `${(block.height / GRID_SIZE) * 100}%`,
              left: `${(block.x / GRID_SIZE) * 100}%`,
              top: `${(block.y / GRID_SIZE) * 100}%`,
              border: '2px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)',
              padding: '2px',
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, block.id)}
          >
            <div className={`w-full h-full ${
              block.type === 'vertical' ? 'bg-red-500' :
              block.type === 'horizontal' ? 'bg-green-500' :
              'bg-yellow-500'
            }`}>
              {block.type === 'key' && (
                <div className="flex items-center justify-center h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Flag at the right of the middle of the third cell */}
        <div className="absolute" style={{ right: '-30px', top: 'calc(50% - 40px)' }}>
          <Flag className="h-8 w-8 text-green-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-2 flex justify-between items-center border-b border-gray-700">
          <ChevronLeft className="h-6 w-6" />
          <h1 className="text-xl font-bold">Simple Puzzle</h1>
          <MoreVertical className="h-6 w-6" />
        </div>
        <div className="p-4 flex flex-col items-center">
          <div className="mb-4 flex justify-between items-center w-full">
            <div className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-1">
              <Clock className="h-4 w-4" />
              <span>{String(time).padStart(2, '0')}:{String(0).padStart(2, '0')}</span>
            </div>
          </div>
          {gameWon ? (
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold mb-2">You Won!</h2>
              <p>Congratulations! You solved the puzzle.</p>
            </div>
          ) : (
            <>
              
              {renderGrid()}
              <p className="text-sm text-center mt-4">
                Move the yellow key block to the flag to win!
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}