"use client"

import { ChordDiagram } from "@/components/guitar/ChordDiagram"
import { useGuitarEngine } from "@/hooks/useGuitarEngine"


export default function DemoPage() {
  const { playChord } = useGuitarEngine()
  
  return (
    <div>
      <ChordDiagram chordName="C" />
      <button onClick={() => playChord("C")}>Play C</button>
    </div>
  )
}
