'use client';

import React, { useEffect, useRef } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import * as mapboxgl from 'mapbox-gl';
import type { FeatureCollection, Point } from 'geojson';
import { getAllNodes } from "@/lib/api";
import type { UINode } from "./NodeDetailsPanel";

type Node = UINode & {
  lat: number;
  lon: number;
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

import type { SimulationFrame } from "../app/page";

type Props = {
  onNodeHover?: (node: UINode | null) => void;
  onNodeClick?: (node: UINode | null) => void;
  onBackgroundClick?: (coords: { lat: number; lon: number }) => void;
  frames?: SimulationFrame[];
  currentDayIndex?: number;
};

export default function InteractiveMap({ onNodeHover, onNodeClick, onBackgroundClick, frames, currentDayIndex = 0 }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Create map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [46.67, 24.71],
      zoom: 6,
    });

    // Adds the nodes to the map as circles
    map.on("load", async () => {
      const nodes = await getAllNodes();
      const geojson = nodesToGeoJSON(nodes as any);

      map.addSource("districts", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "district-circles",
        type: "circle",
        source: "districts",
        paint: {
          "circle-radius": 10,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "I"],
            0, "#22c55e",
            50, "#eab308",
            200, "#ef4444",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0f172a",
        },
      });

      const toNode = (props: any): UINode => ({
        node_id: props.node_id,
        name: props.name,
        region: props.region,
        mobility_coefficient: props.mobility_coefficient,
        population: props.population,
        current_state: {
          S: props.S,
          E: props.E,
          I: props.I,
          R: props.R,
          D: props.D,
        },
      });

      mapRef.current = map;

      map.on("click", "district-circles", (e) => {
        const props = e.features?.[0].properties;
        if (props && onNodeClick) {
          onNodeClick(toNode(props));
        }
      });

      // Metadata/details now only change on click, not hover
      map.on("mousemove", "district-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "district-circles", () => {
        map.getCanvas().style.cursor = "";
      });

      // Background click (no feature) -> used for create-node flow
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["district-circles"],
        });
        if (features && features.length > 0) {
          return; // handled by layer-specific click
        }
        if (onBackgroundClick) {
          onBackgroundClick({ lat: e.lngLat.lat, lon: e.lngLat.lng });
        }
      });

    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update circles when frames/currentDayIndex change
  useEffect(() => {
    if (!mapRef.current) return;
    if (!frames || frames.length === 0) return;

    const map = mapRef.current;
    const frame = frames[Math.min(Math.max(currentDayIndex, 0), frames.length - 1)];
    const src: any = map.getSource("districts");
    if (!src) return;
    const current: any = src._data;
    if (!current || !current.features) return;

    const updated = {
      ...current,
      features: current.features.map((f: any) => {
        const name = f.properties.name;
        const state = frame.nodes_state[name];
        if (!state) return f;
        return {
          ...f,
          properties: {
            ...f.properties,
            S: state.S,
            E: state.E,
            I: state.I,
            R: state.R,
            D: state.D,
          },
        };
      }),
    };
    src.setData(updated);
  }, [frames, currentDayIndex]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%" }}
      className="relative z-0"
    />
  );
}
