/**
 * @providesModule Router
 */

import { createRouter } from '@exponent/ex-navigation';
import HomeScreen from '../screens/HomeScreen';
import TabScreen from '../screens/TabScreen';
import NewEventScreen from '../screens/NewEventScreen';
import UpcomingRideScreen from '../screens/UpcomingRideScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SetPickupLocationScreen from '../screens/SetPickupLocationScreen';
import DriveOptionsScreen from '../screens/DriveOptionsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ChooseSchoolScreen from '../screens/ChooseSchoolScreen';
import GetEmailScreen from '../screens/GetEmailScreen';
import GetNameScreen from '../screens/GetNameScreen';
import GetPhoneNumberScreen from '../screens/GetPhoneNumberScreen';
import GetPasswordScreen from '../screens/GetPasswordScreen';
import LocationScreen from '../screens/LocationScreen';
import MeetDriverScreen from '../screens/MeetDriverScreen';
import MeetRiderScreen from '../screens/MeetRiderScreen';
import TrexScreen from '../screens/TrexScreen';

export default createRouter(
  () =>
    ({
      home: () => HomeScreen,
      tabs: () => TabScreen,
      newEvent: () => NewEventScreen,
      settings: () => SettingsScreen,
      upcoming: () => UpcomingRideScreen,
      setPickupLocation: () => SetPickupLocationScreen,
      setDriveOptions: () => DriveOptionsScreen,
      onboarding: () => OnboardingScreen,
      chooseSchool: () => ChooseSchoolScreen,
      getEmail: () => GetEmailScreen,
      getName: () => GetNameScreen,
      location: () => LocationScreen,
      getPhoneNumber: () => GetPhoneNumberScreen,
      getPassword: () => GetPasswordScreen,
      meetDriver: () => MeetDriverScreen,
      meetRider: () => MeetRiderScreen,
      trex: () => TrexScreen,
    }),
  { ignoreSerializableWarnings: true },
);
