# Firebase Continue for iOS

This directory contains the Firebase Continue for iOS library.

Firebase Continue enables mobile developers to easily integrate activity transitioning
from their mobile apps to the web by way of Chrome extensions
(or [Apple Handoff](https://developer.apple.com/handoff/),
for users with both an iOS device and macOS computer that are Apple Handoff enabled).

To learn more about Firebase Continue and the problems it helps developers solve,
please see the [README at the root of this repository](../README.md).

There is one notable difference between this and the [Android library](../android).
When possible, the Firebase Continue for iOS library will not only
leverage Firebase to allow users to continue their activity within Chrome on any
supported platform, but will also make use of
[Apple Handoff](https://developer.apple.com/handoff/)
for a more native experience for users with both an iOS device and a macOS computer.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage Instructions](#usage-instructions)
4. [Compatibility](#compatibility)
5. [Dependencies](#dependencies)
6. [Sample App](#sample-app)

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

5. Drag the `FCNContinue.h` and `FCNContinue.m` Firebase Continue for iOS library files from the
    [`FirebaseContinue/FirebaseContinue/Classes/`](FirebaseContinue/FirebaseContinue/Classes)
    directory into your Xcode project, where all of your app's code is.

    Allow Xcode to copy the files for you.

    1.  If you are using Swift in your app, remember to import
        `FCNContinue.h` in your app's
        [bridging header](https://developer.apple.com/library/content/documentation/Swift/Conceptual/BuildingCocoaApps/MixandMatch.html)
        like so:

        ```objective-c
        #import "FCNContinue.h"
        ```

6.  Done!

    You can now use the library in your app.
    See the [usage instructions](#usage-instructions) below to learn how.

## Usage Instructions

After following the [Installation section](#installation) above, typical
usage of this library is as follows. Please note that a fleshed out example of usage
can be found in the [sample iOS app](../samples/ios), and
more specific documentation can be found in the
[iOS library itself](FirebaseContinue/FirebaseContinue/Classes/FCNContinue.h).

-   When the user is signed in via Firebase Authentication and may wish to continue some activity
    within your application (such as watching a video or writing a note) elsewhere
    (ex. within Chrome), you can use the broadcast API.

    For example, in Swift:

    ```swift
    FCNContinue.broadcastToContinueActivity(
        withUrl: [TODO: YOUR-URL-TO-ALLOW-THE-USER-TO-CONTINUE-THEIR-ACTIVITY-HERE],
        withinApplication: [TODO: YOUR-APPLICATION-NAME-HERE] { (firebaseContinueError) in
            // This completion callback block is optional but allows you to react to the user's
            // activity either successfully being broadcast or failing to broadcast.

            if (firebaseContinueError != nil) {
                // The activity failed to broadcast.
            } else {
                // The activity was successfully broadcast.

                // An example use of this could be to inform the user to open Chrome (with
                // your Chrome extension installed which uses the Firebase Continue for
                // Chrome Extensions library), or their macOS computer with Apple Handoff,
                // if they wish continue their activity there.
            }
        }
    ```

    Or, in Objective-C:

    ```objective-c
    [FCNContinue broadcastToContinueActivityWithUrl:[TODO: YOUR-URL-TO-ALLOW-THE-USER-TO-CONTINUE-THEIR-ACTIVITY-HERE]
                          withinApplicationWithName:[TODO: YOUR-APPLICATION-NAME-HERE]
                                withCompletionBlock:
        ^(NSError *_Nullable firebaseCompleteError) {
            // This completion callback block is optional but allows you to react to the user's
            // activity either successfully being broadcast or failing to broadcast.

            if (firebaseContinueError) {
                // The activity failed to broadcast.
            } else {
                // The activity was successfully broadcast.

                // An example use of this could be to inform the user to open Chrome (with
                // your Chrome extension installed which uses the Firebase Continue for
                // Chrome Extensions library), or their macOS computer with Apple Handoff,
                // if they wish continue their activity there.
            }
        }];
    ```

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
- [Firebase/Auth v4.0+](https://firebase.google.com/docs/auth/ios/start#add_firebase_auth_to_your_xcode_project)
- [Firebase/Database v4.0+](https://firebase.google.com/docs/database/ios/start#add_firebase_database_to_your_app)

## Sample App

See the [iOS sample folder](../samples/ios) for a sample iOS app and
instructions on how you can configure and install it.
