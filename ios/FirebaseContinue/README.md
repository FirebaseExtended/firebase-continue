# Firebase Continue for iOS

This directory contains the Firebase Continue for iOS library.

To learn about Firebase Continue and the problems it helps developers solve,
please see the [README at the root of this repository](../).

There is one notable difference between this and the Android library.
When possible, the Firebase Continue for iOS library will not only
leverage Firebase to allow users to continue their activity within Chrome on any
supported platform, but will also make use of
[Apple Handoff](https://developer.apple.com/handoff/)
for a more native experience for users with both an iOS device and a macOS computer.

**Important Notice**: This is currently a work-in-progress.
Expect frequent updates as an initial, complete v0.1.0 is fleshed out.
See [Development Progress](#development-progress) for details.
This notice will be removed when v0.1.0 is officially ready and released
in the Releases page of this repo.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage Instructions](#usage-instructions)
4. [How to Build](#how-to-build)
5. [Compatibility](#compatibility)
6. [Dependencies](#dependencies)
7. [Sample App](#sample-app)
8. [Development Progress](#development-progress)

## Prerequisites

In order to use Firebase Continue, you must first follow the
[Initial Setup instructions listed in the root README](../#initial-setup).

## Installation

After completing the following steps, you will have properly included this library
to use in your iOS app:

1.  First, make sure you followed the [Prerequisites section](#prerequisites) above.

2.  Ensure your app can depend on all of this library's
[Dependencies](#dependencies)
without, for example, incompatible version numbers being an issue
(such as your app requiring Firebase Auth and Firebase Database v3.0.0,
which is lower than what is required by this library).

3.  Ensure this library's [Compatibility](#compatibility) items suit your app.

4.  If you have not already added Firebase to your app, please do so.

See
[https://firebase.google.com/docs/ios/setup](https://firebase.google.com/docs/ios/setup)
for instructions on how to add Firebase, including the required
Firebase Authentication and Firebase Realtime Database SDKs, to your app.

5.  **TODO**

6.  Import the library wherever you would like to use it in your app.

For example, in Swift:

```swift
// Other imports here
...

// Import the Firebase Continue library.
import FirebaseContinue

class MyViewControllerThatUsesFirebaseContinue: UIViewController {

...

// Some code that uses FirebaseContinue here.

}
```

Or, in Objective-C:

```objective-c
// Other imports here
...

// Import the Firebase Continue library.
@import FirebaseContinue;

@interface MyViewControllerThatUsesFirebaseContinue ()

...

@end

@implementation MyViewControllerThatUsesFirebaseContinue

...

// Some code that uses FirebaseContinue here.

@end
```

7.  Done!

**TODO**: Finish listing installation instructions here to include this library in an
iOS app. In particular, provide instructions on how to use CocoaPods to
include it when released on CocoaPods, as well as how to include it manually.

## Usage Instructions

**TODO**: List how to use each of the provided APIs here in a realistic way.

## How to Build

After completing the following steps, you will have properly built this library
from its source:

1.  **TODO**

## Compatibility

The Firebase Continue for iOS library is compatible with iOS 8.0+ in both Swift 3.0
and Objective-C.

In order to include and use this library, you must be using a macOS computer
with Xcode 8+.

Currently, this library does **not** support
[simultaneous use of multiple Firebase projects within the same app](https://firebase.google.com/docs/configure/#use_multiple_projects_in_your_application).

## Dependencies

The Firebase Continue for iOS library is dependent on the following libraries/SDKs:

### Firebase
- [Firebase/Core v4.0.0+](https://firebase.google.com/docs/ios/setup#add_the_sdk)
- [Firebase/Auth v4.0.0+](https://firebase.google.com/docs/auth/ios/start#add_firebase_auth_to_your_xcode_project)
- [Firebase/Database v4.0.0+](https://firebase.google.com/docs/database/ios/start#add_firebase_database_to_your_app)

## Sample App

See the [iOS sample folder](../samples/ios) for a sample iOS app and
instructions on how you can configure and install it.

## Development Progress

This section will be removed when each of the items below are complete for an
initial, released v0.1.0 of this library.

### Major Features Completed
- [ ] User authentication state management (via Firebase Authentication) to ensure
only signed in users can "continue" their activity elsewhere (i.e. within Chrome, or
within a native macOS application)
- [ ] API to allow "continuing" user activities elsewhere

