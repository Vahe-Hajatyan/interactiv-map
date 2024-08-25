'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapProps {
  mapboxToken: string;
}

const Map: React.FC<MapProps> = ({ mapboxToken }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectBuilding, setSelectBuilding] = useState<{
    id: string;
    details: any;
  } | null>(null);
  const [buildingHeights, setBuildingHeights] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    mapboxgl.accessToken = mapboxToken;
    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
    });

    newMap.on('load', () => {
      newMap.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            22,
            ['get', 'height'],
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.6,
        },
      });

      newMap.on('click', '3d-buildings', (e: any) => {
        const features = e.features;
        if (features && features.length > 0) {
          const feature = features[0];
          const buildingId = feature.id;
          const currentHeight =
            buildingHeights[buildingId] || feature.properties.height || 0;

          setBuildingHeights((prev) => ({
            ...prev,
            [buildingId]: currentHeight,
          }));

          setSelectBuilding({
            id: buildingId,
            details: {
              type: feature.properties.type || 'N/A',
              name: feature.properties.name || 'N/A',
              address: feature.properties.address || 'N/A',
              height: currentHeight || 'N/A',
            },
          });

          newMap.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
            'case',
            ['==', ['id'], buildingId],
            '#f00',
            '#aaa',
          ]);
        }
      });

      newMap.on('click', (e) => {
        const features = newMap.queryRenderedFeatures(e.point, {
          layers: ['3d-buildings'],
        });
        if (!features.length) {
          newMap.setPaintProperty(
            '3d-buildings',
            'fill-extrusion-color',
            '#aaa'
          );
          setSelectBuilding(null);
        }
      });
    });

    mapRef.current = newMap;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken]);

  const increaseBuildingHeight = () => {
    if (mapRef.current && selectBuilding) {
      const currentHeight = buildingHeights[selectBuilding.id] || 0;
      const newHeight = currentHeight + 50;

      mapRef.current.setPaintProperty('3d-buildings', 'fill-extrusion-height', [
        'case',
        ['==', ['id'], selectBuilding.id],
        newHeight,
        ['get', 'fill-extrusion-height'],
      ]);

      setBuildingHeights((prev) => ({
        ...prev,
        [selectBuilding.id]: newHeight,
      }));

      setSelectBuilding((prev) => ({
        ...prev!,
        details: {
          ...prev!.details,
          height: newHeight,
        },
      }));
    }
  };

  return (
    <div className="relative h-[350px]">
      <div ref={mapContainerRef} className="w-full h-full" />
      {selectBuilding && (
        <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10 font-sans">
          <h3 className="text-lg font-bold">Building Information</h3>
          <p>
            <strong>Type:</strong> {selectBuilding.details.type}
          </p>
          <p>
            <strong>Name:</strong> {selectBuilding.details.name}
          </p>
          <p>
            <strong>Address:</strong> {selectBuilding.details.address}
          </p>
          <p>
            <strong>Height:</strong> {selectBuilding.details.height} meters
          </p>
          <button
            onClick={increaseBuildingHeight}
            className="mt-4 bg-blue-500 text-white p-2 rounded"
          >
            Increase Height
          </button>
        </div>
      )}
    </div>
  );
};

export default Map;
