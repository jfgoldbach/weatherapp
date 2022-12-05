import Filler from "./Filler";

type detailProps = {
    title: string
    value: string | number | undefined
    condition: boolean
    loading: boolean
    unit?: string
    symbol?: string
}

export function DetailItem ({title, condition, loading, value, unit, symbol}: detailProps) {
    return(
        <div className="detailItem">
            <div className="detailItem_title">
                <h1>{symbol}</h1>
                <h1>{title}</h1>
            </div>
            <div className="detailItem_value">{condition && value
                ? <h1>{value}</h1>
                : <Filler loading={loading}  width="60px" height="60px" />}
                <p>{unit? unit: ""}</p>
            </div>
        </div>
    )
}