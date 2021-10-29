mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [-122.6742, 45.5202], // starting position [lng, lat]
  zoom: 9, // starting zoom
})
