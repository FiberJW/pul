<p align="center">
  <img alt="flavor" src="http://i.imgur.com/Ha8Eaey.png" width="256">
</p>

<h2 align="center" style="font-weight:600">
  PÜL
</h2>

<p align="center">
  A carpooling app designed for students to help each other get more involved in their community.
</p>

---

## Directory Structure

```
.
├── LICENSE
├── README.md
├── android.sh // script for running project on Android emulator
├── getdeps.sh // script for running `npm i` in all dirs (., ./mobile, ./server)
├── ios.sh // script for running project on iOS emulator
├── mobile // contains exponent project
│   ├── assets
│   │   ├── fonts
│   │   │   ├── NeutraTextBold.ttf
│   │   │   ├── OpenSans-Bold.ttf
│   │   │   ├── OpenSans-BoldItalic.ttf
│   │   │   ├── OpenSans-ExtraBold.ttf
│   │   │   ├── OpenSans-ExtraBoldItalic.ttf
│   │   │   ├── OpenSans-Italic.ttf
│   │   │   ├── OpenSans-Light.ttf
│   │   │   ├── OpenSans-LightItalic.ttf
│   │   │   ├── OpenSans-Regular.ttf
│   │   │   ├── OpenSans-Semibold.ttf
│   │   │   └── OpenSans-SemiboldItalic.ttf
│   │   ├── html
│   │   │   └── t-rex.html
│   │   └── images
│   │       ├── PokerFace.png
│   │       ├── error.png
│   │       ├── error@2x.png
│   │       ├── error@3x.png
│   │       ├── forever_alone.png
│   │       ├── lyft_logo_white.png
│   │       ├── lyft_logo_white@2x.png
│   │       ├── lyft_logo_white@3x.png
│   │       ├── pul_logo_black.png
│   │       ├── pul_logo_black@2x.png
│   │       ├── pul_logo_black@3x.png
│   │       ├── pul_logo_white.png
│   │       ├── pul_logo_white@2x.png
│   │       └── pul_logo_white@3x.png
│   ├── components
│   │   ├── Carpooler.js
│   │   ├── CrossPlatformIcon.js
│   │   ├── DropdownAlertProvider.js
│   │   ├── Event.js
│   │   ├── GetEventDate.js
│   │   ├── GetEventDescription.js
│   │   ├── GetEventLocation.js
│   │   ├── GetEventName.js
│   │   ├── GetEventTime.js
│   │   ├── GetEventType.js
│   │   ├── GetEventUrl.js
│   │   ├── NavBarCancelButton.js
│   │   ├── NavbarTitle.js
│   │   ├── Ride.js
│   │   ├── SchoolOption.js
│   │   ├── ShareButton.js
│   │   └── TrexPlayer.js
│   ├── config
│   │   ├── colors.js
│   │   ├── keys.js
│   │   ├── newEventFormStylesheet.js
│   │   ├── pickupTimeStylesheet.js
│   │   └── settingsFormStylesheet.js
│   ├── exp.json
│   ├── main.js
│   ├── navigation
│   │   └── Router.js
│   ├── package.json
│   ├── screens
│   │   ├── ChooseSchoolScreen.js
│   │   ├── DriveOptionsScreen.js
│   │   ├── GetEmailScreen.js
│   │   ├── GetNameScreen.js
│   │   ├── GetPasswordScreen.js
│   │   ├── GetPhoneNumberScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LocationScreen.js
│   │   ├── MeetDriverScreen.js
│   │   ├── MeetRiderScreen.js
│   │   ├── NewEventScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── SetPickupLocationScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── TabScreen.js
│   │   ├── TrexScreen.js
│   │   └── UpcomingRideScreen.js
│   ├── stores // MobX stuff
│   │   ├── EventStore.js
│   │   └── TrexStore.js
│   └── utils
│       ├── KeyboardEventListener.js
│       ├── connectDropdownAlert.js
│       ├── createLyftDeepLink.js
│       ├── filter.js
│       ├── isConnected.js
│       └── shuffle.js
├── package.json
├── server // contains worker scripts on Heroku
│   ├── Procfile
│   ├── config.json
│   ├── index.js
│   ├── npm-debug.log
│   ├── package.json
│   ├── serviceAccountCredentials.json
│   └── utils
│       └── addNewSchool.js
└── template-files
    ├── config.json
    ├── keys.js
    └── serviceAccountCredentials.json
```

## Major technologies used

- Exponent
- React Native
- ex-navigation
- MobX
- Moment.js
 

Check it out [here](https://exp.host/@pulapp/pul)! (although you most likely can't sign in unless you go to a supported school)
