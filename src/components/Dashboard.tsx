import axios from "axios"
import { useEffect, useRef, useState } from "react"
import Filler from "./Filler"
import "./styles/Dashboard.css"
import api from "./api.json"


type weatherProps = {
    coord:{
        lon: number,
        lat:number
    }
    weather:{
        id:number,
        main:string,
        description:string,
        icon:string
    }[]
    base:string,
    main:{
        temp:number,
        feels_like:number,
        temp_min:number,
        temp_max:number,
        pressure:number,
        humidity:number
    }
    visibility:number,
    wind:{
        speed:number,
        deg:number
    }
    clouds:{
        all:number
    }
    dt:number
    sys:{
        type:number,
        id:number,
        country:string,
        sunrise:number,
        sunset:number
    }
    timezone:number,
    id:number,
    name:string,
    cod:number
}

type fivedaysProps = {
    cod: string
    message: number
    cmt: number
    list: {
        dt: number
        main: {
            temp:number,
            feels_like:number,
            temp_min:number,
            temp_max:number,
            pressure:number,
            sea_level: number,
            grnd_level: number,
            humidity:number,
            temp_kf: number
        }
        weather: {
            id: number
            main: string
            description: string
            icon: string
        }[]
        clouds: {
            all: number
        }
        wind: {
            speed: number
            deg: number
            gust: number   
        }
        visibility: number
        pop: number
        sys: {
            pod: string
        }
        dt_txt: string
    }[]
    city: {
        id: number
        name: string
        coord: {
            lat: number
            lon: number
        }
        country: string
        population: number
        timezone: number
        sunrise: number
        sunset: number
    }
}

type sunState = {
    set: string|undefined
    rise: string|undefined
}

type recomendationType = {
    country: string
    lon: number
    lat: number
    local_names: {
        en?: string
        ru?: string
    }
    name: string
    state: string
}[]

type favType = {
    name: string
    lon: number
    lat: number
}[]


type dashboardProps = {
    setClouds: React.Dispatch<number>
    setVisibility: React.Dispatch<number>
    setMain: React.Dispatch<string>
    setNight: React.Dispatch<{set: number, rise: number}>
}

function Dashboard({setClouds, setVisibility, setMain, setNight}:dashboardProps) {
    const [weather, setWeather] = useState<weatherProps>()
    const [fivedays, setFivedays] = useState<fivedaysProps>()
    const [error, setError] = useState("")
    const [pos, setPos] = useState<number[]>()
    const [time, setTime] = useState("")
    const [sun, setSun] = useState<sunState>({"set" : undefined, "rise": undefined})
    const [all, setAll] = useState(false)
    const [recom, setRecom] = useState<recomendationType>()
    const [favs, setFavs] = useState<favType>([]) //{name: "Berlin", lon: 52.518611, lat: 13.408333}
    const [isfav, setIsFav] = useState(false)
    const [searchavail, setSearchavail] = useState(false)
    const [searching, setSearching] = useState(false)

    const searchField = useRef<HTMLInputElement>(null)
    const lastSearch = useRef("")

    const owID = api.key

    const weatherLoading = weather === undefined && pos !== undefined
    const fiveLoading = fivedays === undefined && pos !== undefined

    const search_recom = document.getElementById("search_recom")

    //click outside searchfield to hide results
    useEffect(() => {
        const clickListener = document.addEventListener("click", e => {
            if(e.target !== searchField.current){
                //search_recom?.classList.remove("recomendation_active")
                setSearching(false)
                console.log("inactive")
            } else {
                //search_recom?.classList.add("recomendation_active")
                setSearching(true)
                console.log("active")
            }
        })
        const getFavs = localStorage.getItem('favorites');
        if(getFavs){
            setFavs(JSON.parse(getFavs))
        }
    }, [])

    useEffect(() => {
        if(pos !== undefined){
            axios.get("https://api.openweathermap.org/data/2.5/weather", {
                params:{
                    lat: pos[0], 
                    lon: pos[1], 
                    lang: "de",
                    appid: owID
                }})
            .then(response => setWeather(response.data))
            .catch(err => setError(err))

            axios.get("https://api.openweathermap.org/data/2.5/forecast", {
                params:{
                    lat: pos[0], 
                    lon: pos[1], 
                    appid: owID
                }})
            .then(response => setFivedays(response.data))
            .catch(err => setError(err))
            //console.log(weather)
            //console.log(fivedays)
        }
    }
    , [pos])

    useEffect(() => {
        if(weather){
            document.title = `${Math.round(weather.main.temp-273.15)}°C in ${weather.name} - Wetter App`
            const favicon = document.getElementById("favicon")
            if(favicon){
                (favicon as HTMLLinkElement).href = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`
            }
            
            if(favs){
                setIsFav(favs.filter(fav => fav.name === weather.name).length === 1)
            }
            setClouds(weather?.clouds.all)
            setVisibility(weather?.visibility)
            setMain(weather?.weather[0].main)
            //console.log(isfav)
            const sunset = new Date(weather?.sys.sunset*1000)
            const sunsetHours = sunset.getUTCHours().toString()
            const sunsetMinutes = sunset.getUTCMinutes().toString().padStart(2, "0")
            const sunrise = new Date(weather?.sys.sunrise*1000)
            const sunriseHours = sunrise.getUTCHours().toString()
            const sunriseMinutes = sunrise.getUTCMinutes().toString().padStart(2, "0")
            setSun({"set": `${sunsetHours}:${sunsetMinutes}`, "rise": `${sunriseHours}:${sunriseMinutes}`})
            setNight({"set": sunset.getUTCHours(), "rise": sunrise.getUTCHours()})
        }
    }, [weather])

    const queueRequest = () => {
        if(searchField.current){
            console.log("request")
            requestLocs()
            lastSearch.current = searchField.current.value
            search_recom?.classList.add("recomendation_active")
            setSearchavail(false)
            setTimeout(() => {
                setSearchavail(true)
                if(searchField.current && searchField.current?.value.length !== lastSearch.current.length && searchField.current.value.length > 0){
                    queueRequest()
                    //console.log(searchField.current?.value.length, lastSearch.current?.length)
                }
            }, 2000)
        }
    }

    const getLocation = () => {
        if(navigator.geolocation){
            const geo = navigator.geolocation.getCurrentPosition(location => {
                setPos([location.coords.latitude, location.coords.longitude])
                updateTime()
            })
            //console.log(geo)
        }
    }

    const updateTime = () => {
        const date = new Date()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        setTime(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
    }

    const openInfo = () => {
        setAll(prev => !prev)
    }

    const changePos = (lon:number, lat:number, fromSearch: boolean) => {
        if(fromSearch && searchField.current){
            searchField.current.value = ""
            setRecom(undefined)
        }
        //console.log([lon, lat])
        updateTime()
        setPos([lon, lat])
    }

    const requestLocs = () => {
        //console.log("request")
        axios.get("https://api.openweathermap.org/geo/1.0/direct", {
            params: {
                q: searchField.current?.value,
                limit: 5,
                appid: owID
            }
        })
        .then(response => setRecom(response.data))
        .catch(error => console.log(error))
    }

    const makeFavorite = () => {
        if(isfav){
            const newFavs = favs!.filter(fav => fav.name !== weather!.name)
            setFavs(newFavs)
            setIsFav(false)
        } else {
            let favorites = favs
            favs.push({name: weather!.name, lat: weather!.coord.lon, lon: weather!.coord.lat})
            setFavs(favorites)
            setIsFav(true)
        }
        localStorage.setItem('favorites', JSON.stringify(favs))
    }

    const updateSearch = () => {
        if(searchField.current){
            const search = searchField.current.value
            //request reconmendations whenever the first character is typed, 2 seconds since change have passed or 2 more characters have been typed
            if(search.length === 1 || (searchavail && search.length > 0) || (searchavail && Math.abs(search.length - lastSearch.current.length) >= 2 && search.length > 0)){
                queueRequest()
            }
            if(search.length === 0){
                setRecom(undefined)
                console.log("set undefined")
            }
        }
    }



    return(
        <div className="weatherContainer">
            <p>{error}</p>
            <div className="search">
                <div className="searching">
                    <input ref={searchField} placeholder="Ort suchen..." id="searchbar" onChange={updateSearch} />
                    {/*<button className="startSearch" onClick={requestLocs}>
                        <p>🔎</p>
                    </button>*/}
                    <div id="search_recom" className={`recomendation ${searching && recom ? "recomendation_active" : ""}`}>
                        {recom &&
                            recom.map(item => <button onClick={() => changePos(item.lat, item.lon, true)}>{`${item.name} (${item.country}${item.state? `, ${item.state}` : ""})`}</button>
                            )
                        }
                        {recom && recom.length === 0 &&
                        <p>Keine Ergebnisse</p>
                        }
                    </div>
                </div>
                <button className="locate" onClick={getLocation} title="Ungefähre Position mit geolocation bestimmen">
                    <p>📍</p>
                </button>
            </div>
            
            {favs.length > 0 &&
                <div className="favContainer">
                    <h1>⭐</h1>
                    <div className="favorites">
                        {favs.map(fav => <button onClick={() => changePos(fav.lon, fav.lat, false)}>{fav.name}</button>)}
                    </div>
                </div>
            }
            
            <div className="heading main">
                <div className="cityDate">
                    <h1>{weather? weather.name : <Filler loading={weatherLoading} width="200px" height="50px" />}</h1>
                    <h2>{weather? weather.sys.country : <Filler loading={weatherLoading} width="50px" height="30px" />}</h2>
                        {weather?
                            <div className="clockFavo">
                                <button className={`${isfav? "favo_active" : ""} favo`} onClick={makeFavorite}>
                                    <p className={isfav? "star_active": "star_inactive"}>⭐</p>
                                </button>
                                <div className="refreshContainer">
                                    <button className="refresh" onClick={() => changePos(weather.coord.lat, weather.coord.lon, false)}>
                                        <p>⟲</p>
                                    </button>
                                    <p className="muted">{time}</p>
                                </div>
                                
                            </div>
                            :
                            <Filler loading={weatherLoading} width="150px" height="30px" />    
                        }
                </div>
                <h1 className="temp">{weather? Math.round((weather.main.temp-273.15)*10)/10 : <Filler loading={weatherLoading} width="100px" height="100px" />}°C</h1>
            </div>

            <div className="clouds main">
                {weather?
                    <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}></img>
                    :
                    <Filler loading={weatherLoading} width="200px" height="125px" />
                }
                <div className="cloudInfo">
                    <h2>{weather? weather.weather[0].description : <Filler loading={weatherLoading} width="150px" height="40px" margin="10px" />}</h2>
                    <p className="muted">{weather? `${weather.clouds.all}% bewölkt` : <Filler loading={weatherLoading} width="250px" height="35px" />}</p>
                </div>
                
            </div>

            <div className="nextDays main">
                <h1 style={{fontWeight: "normal", fontSize: "1.25rem"}}>Die nächsten 5 Tage</h1>
                <div className="forecastList">
                    {fivedays 
                        ?
                        fivedays.list.map(i => {
                            const date = new Date(i.dt*1000)
                            const dateHours = date.getUTCHours().toString().padStart(2, "0")
                            const dateDay = date.getUTCDate()
                            const dateMonth = date.getUTCMonth()
                            return(
                                <div className="forecastItem">
                                    {dateHours === "00" ?
                                        <h1 className="followingDay">{`${dateDay}.${dateMonth}.`}</h1>
                                        : null
                                    }
                                    <h2>{`${dateHours} Uhr`}</h2>
                                    <img src={`https://openweathermap.org/img/wn/${i.weather[0].icon}@2x.png`} />
                                    <p>{Math.round((i.main.temp-273.15)*10)/10}°C</p>
                                </div>
                            )
                        })
                        :
                        <Filler loading={fiveLoading} width="125px" height="125px" />
                    }
                </div>
            </div>

            <div className="details">
                <div className="detailItem">
                    <h1>🤲 Fühlt sich an wie</h1>
                    <p>{weather
                        ? Math.round((weather.main.feels_like-273.15)*10)/10 
                        : <Filler loading={weatherLoading}  width="60px" height="60px" />}
                        °C
                    </p>
                </div>
                <div className="detailItem">
                    <h1>💨 Wind&shy;ge&shy;schwin&shy;dig&shy;keit</h1>
                    <p>{weather
                        ? Math.round(weather.wind.speed*3.6) 
                        : <Filler loading={weatherLoading}  width="60px" height="60px" />}
                        km/h
                    </p>
                </div>
                <div className="detailItem">
                    <h1>💧 Feucht&shy;ig&shy;keit</h1>
                    <p>{weather
                        ? weather.main.humidity 
                        : <Filler loading={weatherLoading}  width="60px" height="60px" />}
                        %
                    </p>
                </div>
                <div className="detailItem">
                    <h1>🌇 Sonn&shy;en&shy;un&shy;ter&shy;gang</h1>
                    <p>{weather
                        ? sun.set 
                        : <Filler loading={weatherLoading}  width="60px" height="60px" />}
                    </p>
                </div>
                <div className="detailItem">
                    <h1>🌅 Sonn&shy;en&shy;auf&shy;gang</h1>
                    <p>{weather
                        ? sun.rise 
                        : <Filler loading={weatherLoading}  width="60px" height="60px" />}
                    </p>
                </div>
                <div className="detailItem">
                    <h1>👀 Sicht&shy;wei&shy;te</h1>
                    <p>{weather
                        ? weather.visibility === 10000 ? "10+" : weather.visibility/1000 
                        : <Filler loading={weatherLoading}  width="60px" height="60px" />} 
                        km
                    </p>
                </div>
            </div>
            {weather?
            <div className={all? "allInfoContainer w-100" : "allInfoContainer"}>
                <button onClick={openInfo}>{all? "Informationen einklappen ▲" : "Alle Informationen zum aktuellen Wetter ▼"}</button>
                {all &&
                    <div>
                        <h1>Bereitgestellt von OpenWeather</h1>
                        <br/>
                        <h1>coord</h1>
                        <p>lon: {weather?.coord.lon}</p>
                        <p>lat: {weather?.coord.lat}</p>
                        <br />
                        <h1>weather</h1>
                        <p>id: {weather?.weather[0].id}</p>
                        <p>main: {weather?.weather[0].main}</p>
                        <p>description: {weather?.weather[0].description}</p>
                        <p>icon: {weather?.weather[0].icon}</p>
                        <br />
                        <p><b>base:</b> {weather?.base}</p>
                        <br />
                        <h1>main</h1>
                        <p>temp: {weather?.main.temp}</p>
                        <p>feels_like: {weather?.main.feels_like}</p>
                        <p>temp_min: {weather?.main.temp_min}</p>
                        <p>temp_max: {weather?.main.temp_max}</p>
                        <p>pressure: {weather?.main.pressure}</p>
                        <p>humidity: {weather?.main.humidity}</p>
                        <br />
                        <p><b>visibility:</b> {weather?.visibility}</p>
                        <br />
                        <h1>wind</h1>
                        <p>speed: {weather?.wind.speed}</p>
                        <p>deg: {weather?.wind.deg}</p>
                        <br/>
                        <h1>clouds</h1>
                        <p>all: {weather?.clouds.all}</p>
                        <br />
                        <p><b>dt:</b> {weather?.dt}</p>
                        <br />
                        <h1>sys</h1>
                        <p>country: {weather?.sys.country}</p>
                        <p>sunrise: {weather?.sys.sunrise}</p>
                        <p>sunset: {weather?.sys.sunset}</p>
                        <br />
                        <p><b>timezone:</b> {weather?.timezone}</p>
                        <br />
                        <p><b>name:</b> {weather?.name}</p>
                        <br />
                        <p><b>cod:</b> {weather?.cod}</p>
                        <br />
                    </div>
                }
            </div>
            :
            <Filler width="80%" height="60px" margin="50px" />
            }
            <div className="footer main">
                <small className="muted">&copy; 2022 Julian Goldbach</small>
                <div className="copies">
                    <div className="copyContainer">
                        <p>Wetter</p>
                        <span>Daten bereitgestellt von</span>
                        <a href="https://openweathermap.org/" target="_blank">
                            OpenWeather
                            <img src="images/newWindow_light.svg" />
                        </a>
                    </div>
                    <div className="copyContainer">
                        <p>Bilder</p>
                        <a href="https://unsplash.com/@aleksandarr09" target="_blank">
                            Aleksandar Ristov
                            <img src="images/newWindow_light.svg" />
                        </a>
                        <a href="https://unsplash.com/@stewi" target="_blank">
                            Stefan Widua
                            <img src="images/newWindow_light.svg" />
                        </a>
                        <a href="https://www.textures.com/" target="_blank">
                            Textures.com
                            <img src="images/newWindow_light.svg" />
                        </a>
                    </div>
                </div>
                
            </div>
        </div>
    )
}
export default Dashboard