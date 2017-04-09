export default (lat = "", lon = "") =>
  `waze://?ll=${lat},${lon}&z=10&navigate=yes`;
