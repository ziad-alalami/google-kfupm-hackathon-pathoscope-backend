'use client';

import React, { useEffect, useRef } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import * as mapboxgl from 'mapbox-gl';



export default function InteractiveMap() {

  const mapContainer = useRef<HTMLDivElement | null>(null);
  console.log('MAPBOX TOKEN:', process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  useEffect(() => {

    const map = new mapboxgl.Map({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-122.4, 37.8],
      zoom: 9,
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
