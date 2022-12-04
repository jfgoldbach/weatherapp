import "./styles/Filler.css"

type fillerProps = {
    width: string
    height: string
    margin?: string
    loading?: boolean
}

function Filler(props:fillerProps) {
    return(
        <div 
            style={{width: props.width, height: props.height, margin: props.margin}} 
            className={`filler ${props.loading ? "filler-load" : ""}`} 
        />
    )
}
export default Filler