/**
 * @providesModule Router
 */

import { createRouter } from "@expo/ex-navigation";
import HomeScreen from "../screens/HomeScreen";
import TabScreen from "../screens/TabScreen";
import EventAdminScreen from "../screens/EventAdminScreen";
import UpcomingRideScreen from "../screens/UpcomingRideScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SetPickupLocationScreen from "../screens/SetPickupLocationScreen";
import DriveOptionsScreen from "../screens/DriveOptionsScreen";
import EntryScreen from "../screens/EntryScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ChooseSchoolScreen from "../screens/ChooseSchoolScreen";
import GetEmailScreen from "../screens/GetEmailScreen";
import GetNameScreen from "../screens/GetNameScreen";
import GetPhoneNumberScreen from "../screens/GetPhoneNumberScreen";
import GetPasswordScreen from "../screens/GetPasswordScreen";
import LocationScreen from "../screens/LocationScreen";
import PickupScreen from "../screens/PickupScreen";
import TrexScreen from "../screens/TrexScreen";

export default createRouter(
  () => ({
    home: () => HomeScreen,
    tabs: () => TabScreen,
    eventAdmin: () => EventAdminScreen,
    settings: () => SettingsScreen,
    upcoming: () => UpcomingRideScreen,
    setPickupLocation: () => SetPickupLocationScreen,
    setDriveOptions: () => DriveOptionsScreen,
    entry: () => EntryScreen,
    onboarding: () => OnboardingScreen,
    chooseSchool: () => ChooseSchoolScreen,
    getEmail: () => GetEmailScreen,
    getName: () => GetNameScreen,
    location: () => LocationScreen,
    getPhoneNumber: () => GetPhoneNumberScreen,
    getPassword: () => GetPasswordScreen,
    pickup: () => PickupScreen,
    trex: () => TrexScreen
  }),
  { ignoreSerializableWarnings: true }
);
