import { favLocation } from "../assets/types"
import "./styles/Favorites.css"

type favoriteCardProps = {
    favItem: favLocation,
    changePos: (lon: number, lat: number, fromSearch: boolean) => void,
    removeFavorite: (favName: string) => void
}

export function FavoriteCard({ favItem, changePos, removeFavorite }: favoriteCardProps) {
    return (
        <button
        className="favoriteButton"
        title={`φ: ${favItem.lon}° \nλ: ${favItem.lat}°`}
        >
            <p onClick={() => changePos(favItem.lon, favItem.lat, false)}>
                {favItem.name}
            </p>
            <button title={`${favItem.name} aus den Favoriten entfernen`} className="favoriteRemove" onClick={() => removeFavorite(favItem.name)}>
                &times;
            </button>
        </button>
    )
}