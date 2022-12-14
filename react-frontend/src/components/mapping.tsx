import { Button, Grid, MenuItem, Select } from "@material-ui/core"
import { Loader } from "google-maps"
import { useSnackbar } from "notistack"
import { FormEvent, FunctionComponent, useCallback, useEffect, useRef, useState } from "react"
import { RouteAlreadyExistsError } from "../errors/route-Already-Exists.error"
import { newColor } from "../util/colors"
import { getCurrentPosition } from "../util/geolocation"
import { Map, makeCarIcon, makeMarkerIcon } from "../util/map"
import { Route } from "../util/models"
import { NavBar } from "./navBar"
import io from "socket.io-client"

const API_URL = process.env.REACT_APP_API_URL as string
const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY)

export const Mapping: FunctionComponent = () => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [routeSelected, setRouteSelected] = useState<string>('')
    const mapRef = useRef<Map>()
    const socketIORef = useRef<SocketIOClient.Socket>()
    const {enqueueSnackbar} = useSnackbar()

    const finishedRoute = useCallback((route: Route)=> {
        enqueueSnackbar(`${route.title} finalizou`, {
            variant:'success'
        })
        mapRef.current?.removeRoute(route._id)
    },[enqueueSnackbar])

    useEffect(() => {
        if(!socketIORef.current?.connect){
            socketIORef.current = io.connect(API_URL)
            socketIORef.current.on('connect', () => console.log('conectou'))
        }
        const handler = (
            data:{
                routeId : string,
                position: [number, number],
                finished: boolean
            }
        ) => {
            const route = routes.find(route => route._id === data.routeId) as Route
            mapRef.current?.moveCurrentMarker(data.routeId,{
                lat: data.position[0],
                lng: data.position[1]
            })
            if(data.finished){
                finishedRoute(route)
            }
        }
        socketIORef.current?.on('new-position', handler)
        return () => {
            socketIORef.current?.off('new-position', handler)
        }
    } ,[finishedRoute, routes, routeSelected])

    useEffect(()=> {
        fetch(`${API_URL}/routes`)
        .then((data) => data.json())
        .then((data) => setRoutes(data))
        .catch(err => console.log(err))
    },[])

    useEffect(()=> {(async () => {
        const [,position] = await Promise.all([
            googleMapsLoader.load(),
            getCurrentPosition({enableHighAccuracy: true})
            ])
            const mapDiv = document.getElementById('map') as HTMLElement
            mapRef.current = new Map(mapDiv, { zoom: 15, center: position })
        })()}
    ,[])

    const startRoute = useCallback((event:FormEvent) => {
        event.preventDefault()
        const route = routes.find(route => route._id === routeSelected)
        try {
            const color = newColor()
            mapRef.current?.addRoute(routeSelected, {
            currentMarkerOptions: {
                position: route?.startPosition,
                icon: makeCarIcon(color)
            },
            endMarkerOptions: {
                position: route?.endPosition,
                icon: makeMarkerIcon(color)
            }})
            socketIORef.current?.emit('new-direction', {
                routeId: routeSelected
            })
        } catch (error) {
            if(error instanceof RouteAlreadyExistsError) {
                enqueueSnackbar(`${route?.title} j?? adicionado, espere finalizar`,{
                    variant:'error'
                })
                return
            }
            throw error
        }
    }, [routeSelected, routes, enqueueSnackbar])

    return (
        <Grid container style={{width: '100%', height: '100vh'}}>
            <Grid item xs={12} sm={3}>
                <NavBar/>
                <form onSubmit={startRoute} style={{padding:'1em'}}>
                    <Select fullWidth value={routeSelected} onChange={(event) => setRouteSelected(event.target.value + '')}>
                        <MenuItem value="">
                            Selecione uma corrida
                        </MenuItem>
                        {routes && routes.map((route,index) => (
                                <MenuItem value={route._id} key={index}>
                                    <em>{route.title}</em>
                                </MenuItem>
                            ))}
                    </Select>
                    <div style={{textAlign:'center',paddingTop:'1em'}}>
                        <Button type="submit" color="primary" variant="contained">Iniciar uma Corrida</Button>
                    </div>
                    
                </form>
            </Grid>
            <Grid item xs={12} sm={9}>
                <div id="map" style={{width: '100%', height: '100%'}}></div>
            </Grid>
        </Grid>
    )
}