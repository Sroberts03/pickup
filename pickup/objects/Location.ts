import { Float } from "react-native/Libraries/Types/CodegenTypes"

export default class Location {
    id: number
    placeId: string
    address: string
    lat: Float
    lng: Float

    constructor(id: number, placeId: string, address: string, lat: Float, lng: Float) {
        this.id = id
        this.placeId = placeId
        this.address = address
        this.lat = lat
        this.lng = lng
    }
}