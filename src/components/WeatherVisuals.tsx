import { useEffect, useState } from "react"
import "./styles/WeatherVisuals.css"

type visualsProps = {
    clouds: number
    visibility: number
    main: string
    night: {
        set: number
        rise: number
    }
}

function WeatherVisuals({clouds, visibility, main, night}:visualsProps) {
    const [isnight, setIsnight] = useState(false)

    const mist = 1-(visibility/10000)
    const conditions = {
        "none": [0,0],
        "Drizzle": [0.25, 0.15], //day opacity, night opacity
        "Rain": [0.75, 0.4],
        "Thunderstorm": [1, 0.65],
        "Snow": [1, 0.8]
      }
    const foundCondition = Object.keys(conditions).filter(i => i === main)
    const color = isnight? "25" : "255"

    useEffect(() => {
        if(night){
            const date = new Date()
            if(date.getHours() > night.set || date.getHours() < night.rise){
                setIsnight(true)
            }else {
                setIsnight(false)
            }
        }
        
    },[night])



    return(
        <div className={isnight? "background background_night" : "background"}>
            <div style={{opacity: clouds/100}} className={isnight? "cloudVis cloudVis_night" : "cloudVis"} />
            <div style={{opacity: conditions[foundCondition.length !== 0? main : "none"][isnight? 1 : 0]}} 
                className={isnight? (main === "Snow" ? "snowVis" : "rainVis rainVis_night")  :  (main === "Snow" ? "snowVis" : "rainVis")} />
            <div 
                style={{
                    opacity: mist*1.5,
                    backgroundImage: `linear-gradient(rgb(${color},${color},${color}) ${mist*100}%, rgba(${color},${color},${color},${mist}))`
                }} 
                className="mist" />
        </div>
        
    )
}
export default WeatherVisuals