
import React, { useEffect, useState } from 'react';
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Search, MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export type LocationValue = {
    latitude: number | null;
    longitude: number | null;
    address: string;
};

type LocationPickerProps = {
    label: string;
    value: LocationValue;
    onChange: (value: LocationValue) => void;
};

const DEFAULT_CENTER: [number, number] = [30.3165, 78.0322];

const pinIcon = L.divIcon({
    className: 'charge-go-map-pin',
    html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #ff650d;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 12px rgba(0,0,0,.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 9px;
        height: 9px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
});

const MapUpdater: React.FC<{ position: [number, number] }> = ({
    position,
}) => {
    const map = useMap();

    useEffect(() => {
        map.setView(position, Math.max(map.getZoom(), 15), {
            animate: true,
        });
    }, [map, position]);

    return null;
};

const MapClickHandler: React.FC<{
    onSelect: (latitude: number, longitude: number) => void;
}> = ({ onSelect }) => {
    useMapEvents({
        click(event) {
            onSelect(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
    label,
    value,
    onChange,
}) => {
    const [searchText, setSearchText] = useState(value.address);
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const [message, setMessage] = useState('');
    const [searchResults, setSearchResults] = useState<
        { display_name: string; lat: string; lon: string }[]
    >([]);

    const hasCoordinates =
        value.latitude !== null && value.longitude !== null;

    const position: [number, number] = hasCoordinates
        ? [value.latitude!, value.longitude!]
        : DEFAULT_CENTER;

    useEffect(() => {
        setSearchText(value.address);
    }, [value.address]);

    const reverseGeocode = async (
        latitude: number,
        longitude: number,
    ) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            );

            if (!response.ok) {
                throw new Error('Address lookup failed.');
            }

            const result = await response.json();
            const address = result.display_name || '';

            onChange({ latitude, longitude, address });
            setSearchText(address);
            setMessage('Location selected successfully.');
        } catch {
            onChange({
                latitude,
                longitude,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });
            setMessage('Pin selected. Address lookup was unavailable.');
        }
    };

    const selectCoordinates = (
        latitude: number,
        longitude: number,
    ) => {
        setMessage('Finding address...');
        setSearchResults([]);
        void reverseGeocode(latitude, longitude);
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMessage('Your browser does not support location services.');
            return;
        }

        setLocating(true);
        setMessage('');

        navigator.geolocation.getCurrentPosition(
            (location) => {
                selectCoordinates(
                    location.coords.latitude,
                    location.coords.longitude,
                );
                setLocating(false);
            },
            (error) => {
                const errorMessage =
                    error.code === error.PERMISSION_DENIED
                        ? 'Location permission was denied. Allow location access in your browser settings.'
                        : error.code === error.POSITION_UNAVAILABLE
                            ? 'Your current location is unavailable.'
                            : 'Location request timed out. Please try again.';

                setMessage(errorMessage);
                setLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
            },
        );
    };

    const searchAddress = async () => {
        const query = searchText.trim();

        if (!query) {
            setMessage('Enter an address or landmark to search.');
            return;
        }

        setSearching(true);
        setMessage('');
        setSearchResults([]);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`,
            );

            if (!response.ok) {
                throw new Error('Address search failed.');
            }

            const results = await response.json();

            if (!results.length) {
                setMessage('No matching address found. Try another search.');
            } else if (results.length === 1) {
                const result = results[0];
                selectCoordinates(Number(result.lat), Number(result.lon));
            } else {
                setSearchResults(results);
            }
        } catch {
            setMessage('Address search is temporarily unavailable.');
        } finally {
            setSearching(false);
        }
    };

    const selectSearchResult = (result: {
        display_name: string;
        lat: string;
        lon: string;
    }) => {
        const latitude = Number(result.lat);
        const longitude = Number(result.lon);

        onChange({
            latitude,
            longitude,
            address: result.display_name,
        });

        setSearchText(result.display_name);
        setSearchResults([]);
        setMessage('Location selected successfully.');
    };

    return (
        <section className="cg-location-picker">
            <div className="cg-location-heading">
                <label>{label}</label>
                <span>Required</span>
            </div>

            <div className="cg-location-search">
                <Search size={18} />

                <input
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            void searchAddress();
                        }
                    }}
                    placeholder="Search address, area or landmark"
                />

                <button
                    type="button"
                    onClick={() => void searchAddress()}
                    disabled={searching}
                    aria-label="Search address"
                >
                    {searching ? (
                        <Loader2 size={17} className="cg-spin" />
                    ) : (
                        'Search'
                    )}
                </button>
            </div>

            <button
                type="button"
                className="cg-current-location"
                onClick={useCurrentLocation}
                disabled={locating}
            >
                {locating ? (
                    <Loader2 size={17} className="cg-spin" />
                ) : (
                    <Crosshair size={17} />
                )}
                {locating ? 'Finding your location...' : 'Use my current location'}
            </button>

            {searchResults.length > 0 && (
                <div className="cg-location-results">
                    {searchResults.map((result, index) => (
                        <button
                            type="button"
                            key={`${result.lat}-${result.lon}-${index}`}
                            onClick={() => selectSearchResult(result)}
                        >
                            <MapPin size={16} />
                            <span>{result.display_name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="cg-map-wrapper">
                <MapContainer
                    center={position}
                    zoom={hasCoordinates ? 15 : 12}
                    scrollWheelZoom
                    className="cg-leaflet-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapUpdater position={position} />

                    <MapClickHandler onSelect={selectCoordinates} />

                    {hasCoordinates && (
                        <Marker
                            position={position}
                            icon={pinIcon}
                            draggable
                            eventHandlers={{
                                dragend(event) {
                                    const marker = event.target;
                                    const coordinates = marker.getLatLng();

                                    selectCoordinates(
                                        coordinates.lat,
                                        coordinates.lng,
                                    );
                                },
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            <p className="cg-map-hint">
                Tap the map or drag the pin to adjust your exact location.
            </p>

            {message && (
                <p className="cg-location-message" role="status">
                    {message}
                </p>
            )}

            {hasCoordinates && (
                <div className="cg-coordinate-display">
                    <MapPin size={15} />
                    <span>
                        {value.latitude!.toFixed(6)}, {value.longitude!.toFixed(6)}
                    </span>
                </div>
            )}

            <style>{`
        .cg-location-picker {
          display: flex;
          flex-direction: column;
          gap: 11px;
          width: 100%;
        }

        .cg-location-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .cg-location-heading label {
          color: var(--color-heading);
          font-size: .85rem;
          font-weight: 700;
        }

        .cg-location-heading span {
          color: var(--color-orange);
          font-size: .7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .cg-location-search {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 10px 0 13px;
          min-height: 48px;
          border: 1px solid var(--color-input-border);
          border-radius: 10px;
          background: var(--color-input-bg);
          color: var(--color-muted);
        }

        .cg-location-search input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--color-text);
          font: inherit;
          font-size: .88rem;
        }

        .cg-location-search button {
          border: 0;
          border-radius: 7px;
          padding: 8px 12px;
          background: var(--color-orange);
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .cg-location-search button:disabled {
          opacity: .6;
          cursor: wait;
        }

        .cg-current-location {
          display: inline-flex;
          align-items: center;
          align-self: flex-start;
          gap: 8px;
          padding: 9px 13px;
          border: 1px solid var(--color-border);
          border-radius: 9px;
          background: var(--color-surface-soft);
          color: var(--color-heading);
          font: inherit;
          font-size: .82rem;
          font-weight: 800;
          cursor: pointer;
        }

        .cg-current-location:disabled {
          opacity: .6;
          cursor: wait;
        }

        .cg-map-wrapper {
          width: 100%;
          height: 300px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          border-radius: 13px;
          background: var(--color-surface-soft);
          isolation: isolate;
        }

        .cg-leaflet-map {
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .cg-map-hint,
        .cg-location-message {
          margin: 0;
          color: var(--color-muted);
          font-size: .76rem;
          line-height: 1.5;
        }

        .cg-location-message {
          color: var(--color-orange);
        }

        .cg-coordinate-display {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--color-muted);
          font-size: .72rem;
          overflow-wrap: anywhere;
        }

        .cg-location-results {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          overflow: hidden;
        }

        .cg-location-results button {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 11px;
          border: 0;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text);
          text-align: left;
          font: inherit;
          font-size: .78rem;
          cursor: pointer;
        }

        .cg-location-results button:last-child {
          border-bottom: 0;
        }

        .cg-location-results button:hover {
          background: var(--color-surface-soft);
        }

        .cg-location-results button svg {
          flex-shrink: 0;
          color: var(--color-orange);
        }

        .charge-go-map-pin {
          background: transparent;
          border: 0;
        }

        .cg-spin {
          animation: cg-location-spin 1s linear infinite;
        }

        @keyframes cg-location-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .cg-map-wrapper {
            height: 250px;
          }
        }
      `}</style>
        </section>
    );
};
