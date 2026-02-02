'use client';

import React, { useEffect, useRef } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import * as mapboxgl from 'mapbox-gl';
import type { FeatureCollection, Feature, Point } from 'geojson';
import { getAllNodes } from "@/lib/api";

type Node = {
  node_id: string;
  name: string;
  region: string;
  mobility_coefficient: number;
  population: number;
  lat: number;
  lon: number;
  current_state: {
    S: number;
    E: number;
    I: number;
    R: number;
    D: number;
  }
};

function nodesToGeoJSON(nodes: Node[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: nodes.map((n) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [n.lon, n.lat],
      },
      properties: {
        node_id: n.node_id,
        name: n.name,
        region: n.region,
        mobility_coefficient: n.mobility_coefficient,
        population: n.population,
        S: n.current_state.S,
        E: n.current_state.E,
        I: n.current_state.I,
        R: n.current_state.R,
        D: n.current_state.D,
      },
    })),
  };
}


export default function InteractiveMap() {

  const mapContainer = useRef<HTMLDivElement | null>(null);
  useEffect(() => {

    const map = new mapboxgl.Map({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/light-v11",
      center: [46.67, 24.71],
      zoom: 6,
    });

    // Adds the nodes to the map as circles
    map.on("load", async () => {
      const nodes = await getAllNodes();
      console.log("RAW NODES:", nodes);
      const geojson = nodesToGeoJSON(nodes);
      console.log("GEOJSON:", geojson);

      map.addSource("districts", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "district-circles",
        type: "circle",
        source: "districts",
        paint: {
          "circle-radius": 12,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "I"],
            0, "#2ecc71",
            50, "#f1c40f",
            200, "#e74c3c",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
      
      map.on("click", "district-circles", (e) => {
        const props = e.features?.[0].properties;

        if (props) {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <strong>District ${props.id}</strong><br/>
              S: ${props.S}<br/>
              E: ${props.E}<br/>
              I: ${props.I}<br/>
              R: ${props.R}
            `)
            .addTo(map);
        }
      });

      map.on("mouseenter", "district-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "district-circles", () => {
        map.getCanvas().style.cursor = "";
      });


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
