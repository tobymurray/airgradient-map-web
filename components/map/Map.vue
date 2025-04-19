<template>
  <UiProgressBar :show="loading"></UiProgressBar>
  <div id="map">
    <LMap
      class="map"
      ref="map"
      :maxBoundsViscosity="INITIAL_MAP_VIEW_CONFIG.maxBoundsViscosity"
      :maxBounds="INITIAL_MAP_VIEW_CONFIG.maxBounds"
      :zoom="INITIAL_MAP_VIEW_CONFIG.zoom"
      :max-zoom="INITIAL_MAP_VIEW_CONFIG.maxZoom"
      :min-zoom="INITIAL_MAP_VIEW_CONFIG.minZoom"
      :center="INITIAL_MAP_VIEW_CONFIG.center"
      @ready="onMapReady"
    >
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import L, { DivIcon, GeoJSON, LatLngBounds, LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@maplibre/maplibre-gl-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'
import { GeoJsonObject } from 'geojson'
import { LMap } from '@vue-leaflet/vue-leaflet'
import { useRuntimeConfig } from 'nuxt/app'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'

import { convertToGeoJSON } from '~/utils/'
import { AGMapData } from '~/types'
import { getPM25Color } from '~/utils/'
import { INITIAL_MAP_VIEW_CONFIG } from '~/constants'

const loading = ref<boolean>(false)
const map = ref<typeof LMap>()
const apiUrl = useRuntimeConfig().public.apiUrl

let mapInstance: L.Map
let markers: GeoJSON

const onMapReady = () => {
  setUpMapInstance()
  addGeocodeControl()
}

function setUpMapInstance(): void {
  if (!map.value) {
    return
  }

  mapInstance = map.value.leafletObject

  L.maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/liberty'
  }).addTo(mapInstance)

  markers = L.geoJson(null, {
    pointToLayer: createMarker
  }).addTo(mapInstance)

  mapInstance.on('moveend', updateMap)
  mapInstance.whenReady(updateMap)
}

function createMarker(feature: GeoJSON.Feature, latlng: LatLngExpression): L.Marker {
  const measurement: number = feature.properties?.value || 0
  const backgroundColor: string = getPM25Color(measurement)
  const isSensor: boolean = feature.properties?.type === 'sensor'
  const isReference: boolean = feature.properties?.sensorType === 'Reference'

  const markerSize = isSensor ? 24 : 36

  const icon: DivIcon = L.divIcon({
    html: `<div class="ag-marker-cluster ${!isSensor ? 'is-cluster' : ''} ${isReference ? 'is-reference' : ''}"
             style=background-color: ${backgroundColor}">
             <span>${measurement}</span>
           </div>`,
    className: `marker-cluster-outer ${!isSensor ? 'is-cluster-outer' : ''}`,
    iconSize: L.point(markerSize, markerSize)
  })

  const marker = L.marker(latlng, { icon })

  if (isSensor && feature.properties) {
    const locationName: string = feature.properties.locationName || 'Unknown Location'
    const tooltipContent = `
      <div class="marker-tooltip">
        <div class="tooltip-header">${locationName}</div>
        <div class="tooltip-content">
          <div class="measurement">
            <span class="value">${measurement}</span>
            <span class="unit">PM2.5 μg/m³</span>
          </div>
        </div>
      </div>
    `

    marker.bindTooltip(tooltipContent, {
      direction: 'top',
      offset: L.point(0, -12),
      opacity: 1,
      permanent: false,
      className: 'ag-marker-tooltip'
    })
  } else if (!isSensor) {
    // Add click handler for cluster markers
    marker.on('click', () => {
      const currentZoom = mapInstance.getZoom()
      const newZoom = Math.min(currentZoom + 2, INITIAL_MAP_VIEW_CONFIG.maxZoom)

      mapInstance.flyTo(latlng, newZoom, {
        animate: true,
        duration: 0.8
      })
    })
  }

  return marker
}

async function updateMap(): Promise<void> {
  if (loading.value) {
    return
  }
  loading.value = true

  try {
    const bounds: LatLngBounds = mapInstance.getBounds()
    const response = await $fetch<AGMapData>(
      `${apiUrl}/v1/measurements/current/cluster`,
      {
        params: {
          xmin: bounds.getSouth(),
          ymin: bounds.getWest(),
          xmax: bounds.getNorth(),
          ymax: bounds.getEast(),
          zoom: mapInstance.getZoom(),
          measure: 'pm25'
        },
        retry: 1,
      }
    )

    const geoJsonData: GeoJsonObject = convertToGeoJSON(response.data)
    markers.clearLayers()
    markers.addData(geoJsonData)
  } catch (error) {
    console.error('Failed to fetch map data:', error)
  } finally {
    loading.value = false
  }
}

function addGeocodeControl(): void {
  const provider = new OpenStreetMapProvider()

  const searchControl = GeoSearchControl({
    provider,
    style: 'bar',
    autoClose: true,
    keepResult: true
  })

  mapInstance.addControl(searchControl)
}
</script>

<style lang="scss">
#map {
  height: calc(100vh - 5px);
}

.marker-cluster-outer {
  background: none !important;
  border: none !important;
}

.marker-cluster-outer.is-cluster-outer {
  background: none !important;
  border: none !important;
}

.ag-marker-cluster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-family: $secondary-font;

  // Default style for sensor markers
  border-radius: 4px;
  font-size: 12px;

  // Specific styles for cluster markers
  &.is-cluster {
    border-radius: 50% !important;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transform: translate3d(0,0,0);
    cursor: pointer;

    &:hover {
      opacity: 0.9;
      transform: scale(1.05);
      transition: all 0.2s ease;
    }
  }

  &.is-reference {
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
  }
}

.ag-marker-tooltip {
  font-family: $secondary-font;
  padding: 0;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  background: white;
  backdrop-filter: blur(8px);
  min-width: 180px;

  &::before {
    display: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: white;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
  }

  .marker-tooltip {
    .tooltip-header {
      background: $primary-color;
      color: white;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 14px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .tooltip-content {
      padding: 12px;
      text-align: center;

      .measurement {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 8px;

        .value {
          font-size: 24px;
          font-weight: 700;
          color: $text-color;
          line-height: 1;
        }

        .unit {
          font-size: 12px;
          color: $dark-grey;
          font-weight: 500;
          white-space: nowrap;
        }
      }
    }
  }
}

.leaflet-tooltip {
  z-index: 1000 !important;
}

.leaflet-geosearch-bar {
  width: 300px !important;
  max-width: 300px !important;
  margin: 10px 10px 0 auto !important;

  form {
    padding-left: 30px;
    background-image: url('/assets/images/icons/search.svg');
    background-position: 5px 5px;
    background-size: 20px;
  }

  .reset {
    color: $dark-grey !important;
    line-height: 27px !important;
    font-size: 16px;
  }
}

.leaflet-control-geosearch .results.active {
  width: calc(100% + 25px);
  margin-left: -25px;
}

.results > .active,
.leaflet-control-geosearch .results > :hover {
  color: $primary-color;
  border-radius: 4px;
  border-color: transparent;
}
</style>
