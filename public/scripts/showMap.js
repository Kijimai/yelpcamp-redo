mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: coords, // starting position [lng, lat]
  zoom: 9, // starting zoom
})

// const popup = new mapboxgl.Popup({ closeOnClick: false })
//   .setLngLat(coords)
//   .setHTML("<h2>Hello World!</h2>")
//   .addTo(map)

new mapboxgl.Marker()
  .setLngLat(coords)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<h2>Hello world!</h2>"))
  .addTo(map)
