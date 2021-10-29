mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: coords, // starting position [lng, lat]
  zoom: 11, // starting zoom
})

new mapboxgl.Marker().setLngLat(coords).addTo(map)
