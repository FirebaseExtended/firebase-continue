# Firebase Continue Samples - "Continote" Android App

This directory contains a sample Android app titled "Continote" which uses the
Firebase Continue for Android library.

Users can begin writing a note in this app and then continue writing in Chrome
from exactly where they are using the
[sample Chrome extension](../chrome-extension) and [sample web app](../web).

**Important Notice**: This is currently a work-in-progress.
Expect frequent updates as an initial, complete v0.1.0 is fleshed out.
See [Development Progress](#development-progress) for details.
This notice will be removed when v0.1.0 is officially ready and released
in the Releases page of this repo.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Usage](#usage)
4. [Compatibility](#compatibility)
5. [Dependencies](#dependencies)
6. [Disclaimer](#disclaimer)
7. [Development Progress](#development-progress)

## Prerequisites

Before proceeding to the [Setup section](#setup) below, you must
first follow the [main `samples` README](../) so that you have a properly
configured Firebase project for this and any other "Continote" samples
you run.

## Setup

After completing the following steps, you will have a properly configured instance of
this sample to build and install to try out:

1.  First, make sure you followed the [Prerequisites section](#prerequisites) above.

2.  If you have not already done so, install
    [Android Studio](https://developer.android.com/studio/index.html),
    then use it to
    [install Android SDKs v16 and v25](https://developer.android.com/studio/intro/update.html#sdk-manager),
    as well as
    [Android Build-Tools v25.0.0](https://developer.android.com/studio/releases/build-tools.html)
    and the
    [Google Play Services SDK](https://developers.google.com/android/guides/setup).

3.  Go to the
    [Firebase console for your Firebase project](https://console.firebase.google.com/).

4.  Click to "Add Firebase to your Android app":

    1.  In the dialog that opens, when asked for an `Android package name`,
        enter `com.google.firebasecontinue.sample.continote`.

    2.  For `App nickname (optional)`, enter `Continote`.

    3.  For `Debug signing certificate SHA-1 (optional)`, follow the guide here:
        [https://developers.google.com/android/guides/client-auth](https://developers.google.com/android/guides/client-auth)
        and enter the `debug certificate fingerprint` SHA-1 that was generated.

    4.  Click the **Register App** button.

    5.  Follow the instructions that should now be within the dialog to download the
        `google-services.json` file and move that file to the correct directory
        of [`Continote/app/`](Continote/app).

    6.  Close the dialog as we do not need to perform the dialog's remaining step(s)
        to set up this sample.

5.  Copy the `sample-strings.xml` file from the
    [`Continote/setup-file-templates/`](Continote/setup-file-templates)
    directory and paste a copy of it in the
    [`Continote/app/src/main/res/values/`](Continote/app/src/main/res/values)
    directory.

6.  Rename the `sample-strings.xml` copy to `strings.xml`.

7.  Open `strings.xml` in a text editor and fill out the clearly marked
    *[TODO: YOUR-VALUE-HERE]* details:

    1.  Replace the two instances of *[TODO: YOUR-FACEBOOK-APP-ID-HERE]* with your
        Facebook app's ID from the [Prerequisites section](#prerequisites) above.

8.  Done!

    You should now be able to build and then install the sample on any compatible
    Android device or simulator.

## Usage

After this sample is properly set up and installed on your Android device or
simulator, open it.

From there, you will be asked to sign in to be able to add notes, delete notes, or
open to edit a note.

When editing a note, you will also have the option of "continuing" to write/edit the
note elsewhere (i.e. within Chrome). To make use of this, be sure to also install the
[sample Chrome extension](../chrome-extension).

## Compatibility

This sample app is compatible with devices and simulators running
[Android 4.1+](https://developer.android.com/about/versions/android-4.1.html)
with
[Google Play services](https://play.google.com/store/apps/details?id=com.google.android.gms&hl=en)
installed.

In order to build and install this sample on an Android device or simulator,
you must be using a computer with
[Android Studio](https://developer.android.com/studio/index.html), Android SDK v16 and v25, and the
[Android Build-Tools v25.0.0](https://developer.android.com/studio/releases/build-tools.html)
installed.

## Dependencies

This sample is dependent on the following libraries/SDKs:

### Firebase
- [com.google.firebase:firebase-auth v11.0.0+](https://firebase.google.com/docs/android/setup#available_libraries)
- [com.google.firebase:firebase-database v11.0.0+](https://firebase.google.com/docs/android/setup#available_libraries)

### Firebase Continue
- [Firebase Continue for Android v0.1.0+](../../android)

### FirebaseUI
- [FirebaseUI Android v2.0.0+](https://github.com/firebase/FirebaseUI-Android)

### Android Support Libraries
- [com.android.support:appcompat-v7 v25.0.0+](https://developer.android.com/topic/libraries/support-library/packages.html#v7-appcompat)
- [com.android.support:design v25.0.0+](https://material.io/components/android/docs/)
- [com.android.support:support-annotations v25.0.0+](https://developer.android.com/studio/write/annotations.html)
- [com.android.support.constraint:constraint-layout v1.0.0+](https://developer.android.com/training/constraint-layout/index.html)

## Disclaimer

The focus of this sample is to demonstrate Firebase Continue usage in a
somewhat realistic scenario. This sample can also act as a simple model of how
to use Firebase and FirebaseUI in an Android app.

The focus is *not*, however, to have a perfect user interface or user
experience. Please keep that in mind when trying out this sample.

## Development Progress

This section will be removed when each of the items below are complete for an
initial, released v0.1.0 of this sample.

### Major Features Completed
- [x] User authentication (via Firebase Authentication and FirebaseUI)
- [ ] "My Notes" screen, allowing signed in users to view a list of their notes with
the option to add a note, delete a note, or open to edit a note
- [ ] "Edit Note" screen, allowing signed in users to edit a particular note with the
option to "Continue Writing Elsewhere" (made possible by Firebase Continue)
