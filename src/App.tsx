import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import WeatherVisuals from './components/WeatherVisuals'

function App() {
  const [clouds, setClouds] = useState(100)
  const [visibility, setVisibility] = useState(8000)
  const [main, setMain] = useState("")
  const [night, setNight] = useState({"rise": 6, "set": 18})


  return (
    <div className="App">
      <WeatherVisuals clouds={clouds} visibility={visibility} main={main} night={night} />
      <Dashboard setClouds={setClouds} setVisibility={setVisibility} setMain={setMain} setNight={setNight} />
    </div>
  )
}

export default App
