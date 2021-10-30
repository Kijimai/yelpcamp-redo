mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/dark-v10", // style URL
  center: coords, // starting position [lng, lat]
  zoom: 9, // starting zoom
})

new mapboxgl.Marker()
  .setLngLat(coords)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${title}</h3>`))
  .addTo(map)
