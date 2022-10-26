import { Position } from "./models"

export function getCurrentPosition(options?:PositionOptions):Promise<Position>{
    return new Promise((resolve,rejects)=> {
        navigator.geolocation.getCurrentPosition(
            position => resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }),
            error => rejects(error),
            options
        )
    })
}