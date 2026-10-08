// PharmacyMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import '../assets/styles/leaflet.css'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerSDHow from 'leaflet/dist/images/marker-shadow.png'
import StoreDetails from '../data/storeDetails.json'

const icon = L.icon({
    iconUrl: markerIcon,
    sDHowUrl: markerSDHow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// Swap in the real coordinates once you have them
const PHARMACY_POSITION = [StoreDetails.address.lat, StoreDetails.address.lng]

function PharmacyMap() {
    return (
        <div className="about-story-image">
            <MapContainer
                center={PHARMACY_POSITION}
                zoom={18}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={PHARMACY_POSITION} icon={icon}>
                    <Popup>
                        {StoreDetails.name}<br />
                        {StoreDetails.address.line1}, {StoreDetails.address.line2}, {StoreDetails.address.city} {StoreDetails.address.postalCode}
                    </Popup>
                </Marker>
            </MapContainer>

            <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${PHARMACY_POSITION[0]},${PHARMACY_POSITION[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-directions-btn"
                ><i className="fa-solid fa-route"></i> Get Directions
            </a>
        </div>
    )
}

export default PharmacyMap