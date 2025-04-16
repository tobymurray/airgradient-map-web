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

  /**
   * Sets up the Leaflet map instance.
   */
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

  /**
 * Updates the map with new data based on current bounds.
 * Fetches air quality data from the API and updates markers.
 */
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

  /**
 * Creates a marker for the GeoJSON feature.
 * @param {Object} feature - The GeoJSON feature.
 * @param {LatLngExpression} latlng - The latitude and longitude for the marker.
 */
  function createMarker(feature: GeoJSON.Feature, latlng: LatLngExpression): L.Marker {
    const measurement: number = feature.properties.value
    const backgroundColor: string = getPM25Color(measurement)

    const icon: DivIcon = L.divIcon({
      html: `<div class="ag-marker-cluster" style="background-color: ${backgroundColor}"><span>${measurement}</span></div>`,
      className: `marker-cluster-outer`,
      iconSize: L.point(24, 24)
    })

    return L.marker(latlng, { icon })
  }
</script>

<style lang="scss">
  #map {
    height: calc(100vh - 5px);
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
  }

  .leaflet-bar-part.leaflet-bar-part-single:before,
  .leaflet-bar-part.leaflet-bar-part-single:after {
    display: none !important;
  }

  .leaflet-control-zoom-in span,
  .leaflet-control-zoom-out span {
    color: $primary-color !important;
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
