import Expo from "expo";
import { lyftClientId } from "../config/keys";

export default async event => {
  const {
    coords: { latitude, longitude }
  } = await Expo.Location.getCurrentPositionAsync({
    enableHighAccuracy: false
  });
  const dropoffLat = event.location.geometry.location.lat;
  const dropoffLng = event.location.geometry.location.lng;
  return `lyft://ridetype?id=lyft&pickup[latitude]=${latitude}&pickup[longitude]=${longitude}&destination[latitude]=${dropoffLat}&destination[longitude]=${dropoffLng}&partner=${lyftClientId}`;
};
