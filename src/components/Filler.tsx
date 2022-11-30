import "./styles/Filler.css"

type fillerProps = {
    width: string
    height: string
    margin?: string
}

function Filler(props:fillerProps) {
    return(
        <div style={{width: props.width, height: props.height, margin: props.margin}} className="filler">
        </div>
    )
}
export default Filler