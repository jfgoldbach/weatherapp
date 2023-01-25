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
    const [loaded, setLoaded] = useState(false)

    const mist = 1-(visibility/10000)
    const conditions: {[key: string]: number[]} = {
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

    useEffect(() => {
        document.body.style.backgroundColor = isnight? "#020b10" : "#c7e0ff"
    }, [isnight])

    const isLoaded = () => {
        setLoaded(true)
    }



    return(
        <div className={`${isnight? "background background_night" : "background"}`}>
            <img 
                className={loaded? "visible" : ""} 
                src={isnight? "images/stefan-widua-iPOZf3tQfHA-unsplash_cropped.jpg" : "images/aleksandar-ristov-LAy1DOJbPlw-unsplash_cropped.jpg"}
                onLoad={isLoaded}>
            </img>
            <div 
                style={{
                    opacity: mist*2,
                    backgroundImage: `linear-gradient(rgb(${color},${color},${color}) ${(mist)*90}%, rgba(${color},${color},${color},${(mist-0.5)}))`
                }} 
                className="mist" 
            />
            <div style={{opacity: (clouds/100 - (mist*0.65))}} className={isnight? "cloudVis cloudVis_night" : "cloudVis"} />
            <div style={{opacity: conditions[foundCondition.length !== 0? main : "none"][isnight? 1 : 0]}} 
                className={isnight? (main === "Snow" ? "snowVis" : "rainVis rainVis_night")  :  (main === "Snow" ? "snowVis" : "rainVis")} />
            
        </div>
        
    )
}
export default WeatherVisuals