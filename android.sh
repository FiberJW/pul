#!/usr/bin/env bash

# genymotion emulator ID is the first and only argument to this script
if [ -z "$1" ]
  then
    echo "No emulator specified. Attempting to launch on device."
    cd mobile;
    exp start --android;
  else
    echo "Opening emulator: $1"
    open /Applications/Genymotion.app/Contents/MacOS/player.app --args --vm-name "$1";
    cd mobile;
    exp start --android;
fi
