import axios from "axios"
import { useEffect, useRef, useState } from "react"
import Filler from "./Filler"
import "./styles/Dashboard.css"
import api from "./api.json"
import { DetailItem } from "./DetailItem"
import { dashboardProps, weatherProps, fivedaysProps, sunState, recomendationType, favType } from "../assets/types"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { FavoriteCard } from "./FavoriteCard"



function Dashboard({setClouds, setVisibility, setMain, setNight}:dashboardProps) {
    const [weather, setWeather] = useState<weatherProps>()
    const [fivedays, setFivedays] = useState<fivedaysProps>()
    const [error, setError] = useState("")
    const [pos, setPos] = useState<number[]>()
    const [time, setTime] = useState("")
    const [pastTime, setPastTime] = useState(0)
    const [sun, setSun] = useState<sunState>({"set" : undefined, "rise": undefined})
    const [all, setAll] = useState(false)
    const [recom, setRecom] = useState<recomendationType>()
    const [favs, setFavs] = useState<favType>([]) //{name: "Berlin", lon: 52.518611, lat: 13.408333}
    const [isfav, setIsFav] = useState(false)
    const [searchavail, setSearchavail] = useState(false)
    const [searching, setSearching] = useState(false)

    const [favorites, setFavorites] = useLocalStorage("favorites", [{name: "nowhere", lon: 0, lat: 0}])

    const searchField = useRef<HTMLInputElement>(null)
    const lastSearch = useRef("")
    const timerRef = useRef<number | null>(null)

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
                //console.log("inactive")
            } else {
                //search_recom?.classList.add("recomendation_active")
                setSearching(true)
            }
        })
        //const getFavs = localStorage.getItem('favorites');
        //if(getFavs){
        //    setFavs(JSON.parse(getFavs))
        //}
        //console.log(favorites)
    }, [])

    //useEffect(() => {
    //    console.log(favorites)
    //}, [favorites])

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
        }
    }
    , [pos])

    useEffect(() => {
        if(favorites && weather){
            setIsFav(favorites.filter(fav => fav.name === weather.name).length === 1)
        }
    }, [favorites, weather])

    useEffect(() => {
        if(weather){
            document.title = `${Math.round(weather.main.temp-273.15)}°C in ${weather.name} - Wetter App`
            const favicon = document.getElementById("favicon")
            if(favicon){
                (favicon as HTMLLinkElement).href = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`
            }
            setClouds(weather?.clouds.all)
            setVisibility(weather?.visibility)
            setMain(weather?.weather[0].main)
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

    useEffect(() => {
        if (pastTime > 60 && timerRef.current){
            clearTimeout(timerRef.current)
        }
    }, [pastTime])

    const updatePastTime = () => {
        timerRef.current = window.setTimeout(() => {
            setPastTime(prev => prev + 1)
            updatePastTime()
        }, 60000);
    }

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
        } else {
            alert("Ort kann nicht durch geolocation bestimmt werden.")
        }
    }

    const updateTime = () => {
        const date = new Date()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        setTime(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
        if(timerRef.current) {
            window.clearTimeout(timerRef.current)
        }
        setPastTime(0)
        updatePastTime()
    }

    const openInfo = () => {
        setAll(prev => !prev)
    }

    const changePos = (lon:number, lat:number, fromSearch: boolean) => {
        if(fromSearch && searchField.current){
            searchField.current.value = ""
            setRecom(undefined)
        }
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
            console.log("remove")
            const newFavs = favorites!.filter(fav => fav.name !== weather!.name)
            setFavorites(newFavs)
            //setIsFav(false)
        } else {
            let favos = [...favorites, {name: weather!.name, lat: weather!.coord.lon, lon: weather!.coord.lat}]
            console.log("add", favos)
            setFavorites(favos)
            //setIsFav(true)
        }
    }

    const removeFavorite = (favName: string) => {
        const newFavs = favorites!.filter(fav => fav.name !== favName)
        setFavorites(newFavs)
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
            
            {favorites.length > 0 &&
                <div className="favContainer">
                    <div className="favorites">
                        {favorites.map(fav => <FavoriteCard favItem={fav} changePos={changePos} removeFavorite={removeFavorite} />)}
                    </div>
                </div>
            }
            
            <div className="heading main">
                <div className="cityDate">
                    <h1 title="Ort">{weather? weather.name : <Filler loading={weatherLoading} width="200px" height="50px" />}</h1>
                    <h2 title="Region">{weather? weather.sys.country : <Filler loading={weatherLoading} width="50px" height="30px" />}</h2>
                        {weather?
                            <div className="clockFavo">
                                <button className="star" title={`${weather.name} Favorisieren`} onClick={makeFavorite}>
                                    <img src={isfav? "/images/star_solid.svg" : "/images/star_outline.svg"}></img>
                                </button>
                                <div className="refreshContainer">
                                    <button className="refresh" title={`Daten für ${weather.name} aktualisieren`} onClick={() => changePos(weather.coord.lat, weather.coord.lon, false)}>
                                        <img src="images/arrow_circle_light.svg" />
                                    </button>
                                    {pastTime > 0 &&
                                        <p className={`muted time`} title={`Zuletzt aktualisiert um ${time} Uhr`}>
                                            vor {pastTime < 60 ? `${pastTime} min` : "> 1 Std"}
                                        </p>
                                    }
                                    
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
                <h1 className="nextDays_heading" style={{fontWeight: "normal", fontSize: "1.25rem"}}>Die nächsten 5 Tage</h1>
                <div className="forecastList">
                    {fivedays 
                        ?
                        fivedays.list.map((i, index) => {
                            const date = new Date(i.dt*1000)
                            const dateHours = date.getUTCHours().toString().padStart(2, "0")
                            const dateDay = date.getUTCDate()
                            const dateMonth = date.getUTCMonth()
                            return(
                                <div className="forecastItem">
                                    {dateHours === "00" ?
                                        <h1 className="followingDay">{`${dateDay}.${dateMonth + 1}.`}</h1>
                                        : null
                                    }
                                    {index === 0 && dateHours !== "00" ?
                                        <h1 className="followingDay">Heute</h1>
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
                <DetailItem 
                    symbol="🤲" title="Fühlt sich an wie" value={weather? Math.round((weather.main.feels_like-273.15)*10)/10 : ""}
                    unit="°C" condition={weather? true : false} loading={weatherLoading}
                />
                <DetailItem 
                    symbol="💨" title="Wind&shy;ge&shy;schwin&shy;dig&shy;keit" value={weather? Math.round(weather.wind.speed*3.6) : ""}
                    unit="km/h" condition={weather? true : false} loading={weatherLoading}
                />
                <DetailItem 
                    symbol="💧" title="Feucht&shy;ig&shy;keit" value={weather? weather.main.humidity : ""}
                    unit="%" condition={weather? true : false} loading={weatherLoading}
                />
                <DetailItem 
                    symbol="🌇" title="Sonn&shy;en&shy;un&shy;ter&shy;gang" value={sun.set}
                    condition={weather? true : false} loading={weatherLoading}
                />
                <DetailItem 
                    symbol="🌅" title=" Sonn&shy;en&shy;auf&shy;gang" value={sun.rise}
                    condition={weather? true : false} loading={weatherLoading}
                />
                <DetailItem 
                    symbol="👀" title="Sicht&shy;wei&shy;te" value={weather?.visibility === 10000 ? "10+" : weather ? weather.visibility/1000 : ""}
                    unit="km" condition={weather? true : false} loading={weatherLoading}
                />
            </div>
            {weather?
            <div className={all? "allInfoContainer w-100" : "allInfoContainer"}>
                <button onClick={openInfo}>{all? "Informationen einklappen ▲" : "Alle Informationen zum aktuellen Wetter ▼"}</button>
                {all &&
                    <div>
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