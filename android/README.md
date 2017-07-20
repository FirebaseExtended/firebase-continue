# Firebase Continue for Android

This directory contains the Firebase Continue for Android library.

To learn about Firebase Continue and the problems it helps developers solve,
please see the [README at the root of this repository](../).

**Important Notice**: This is currently a work-in-progress.
Expect frequent updates as an initial, complete v0.1.0 is fleshed out.
See [Development Progress](#development-progress) for details.
This notice will be removed when v0.1.0 is officially ready and released
in the Releases page of this repo.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage Instructions](#usage-instructions)
4. [Compatibility](#compatibility)
5. [Dependencies](#dependencies)
6. [Sample App](#sample-app)
7. [Development Progress](#development-progress)

## Prerequisites

In order to use Firebase Continue, you must first follow the
[Initial Setup instructions listed in the root README](../#initial-setup).

## Installation

After completing the following steps, you will have properly included this library
to use in your Android app:

1.  First, make sure you followed the [Prerequisites section](#prerequisites) above.

2.  If you have not already added Firebase to your app, please do so.

    See
    [https://firebase.google.com/docs/android/setup](https://firebase.google.com/docs/android/setup)
    for instructions on how to add Firebase, including the required
    Firebase Authentication and Firebase Realtime Database SDKs, to your app.

3.  **TODO**

4.  Finally, import all of this library's [Dependencies](#dependencies) and the
    library itself ***before*** trying to use the library.

    For example:

    ```java
    TODO
    ```

5.  Done!

**TODO**: Finish listing installation instructions here to include this library in an
Android app.

## Usage Instructions

**TODO**: List how to use each of the provided APIs here in a realistic way.

## Compatibility

The Firebase Continue for Android library is compatible with **TODO**.

Currently, this library does **not** support
[simultaneous use of multiple Firebase projects within the same app](https://firebase.google.com/docs/configure/#use_multiple_projects_in_your_application).

## Dependencies

The Firebase Continue for Android library is dependent on the following
libraries/SDKs:

### Firebase
- **TODO**

## Sample App

See the [Android sample folder](../samples/android) for a sample Android app and
instructions on how you can configure and install it.

## Development Progress

This section will be removed when each of the items below are complete for an
initial, released v0.1.0 of this library.

### Major Features Completed
- [ ] User authentication state management (via Firebase Authentication) to ensure
only signed in users can "continue" their activity elsewhere (i.e. within Chrome)
- [ ] API to allow "continuing" user activities elsewhere
