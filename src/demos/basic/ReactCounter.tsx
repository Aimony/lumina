import React, { useState } from 'react'

export default function ReactCounter() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3>React Counter</h3>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '8px 16px',
          background: '#61dafb',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  )
}
