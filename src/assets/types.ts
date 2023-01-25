export type weatherProps = {
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


export type fivedaysProps = {
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


export type sunState = {
    set: string|undefined
    rise: string|undefined
}


export type recomendationType = {
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


export type favLocation = {
    name: string
    lon: number
    lat: number
}

export type favType = favLocation[]


export type dashboardProps = {
    setClouds: React.Dispatch<number>
    setVisibility: React.Dispatch<number>
    setMain: React.Dispatch<string>
    setNight: React.Dispatch<{set: number, rise: number}>
}