# Firebase Continue for Android

This directory contains the Firebase Continue for Android library.

Firebase Continue enables mobile developers to easily integrate activity transitioning
from their mobile apps to the web by way of Chrome extensions.

To learn more about Firebase Continue and the problems it helps developers solve,
please see the [README at the root of this repository](../README.md).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage Instructions](#usage-instructions)
4. [How to Build](#how-to-build)
5. [Compatibility](#compatibility)
6. [Dependencies](#dependencies)
7. [Sample App](#sample-app)

## Prerequisites

In order to use Firebase Continue, you must first follow the
[Initial Setup instructions listed in the root README](../#initial-setup).

## Installation

After completing the following steps, you will have properly included this library
to use in your Android app:

1.  First, make sure you followed the [Prerequisites section](#prerequisites) above.

2.  Ensure your app can depend on all of this library's
    [Dependencies](#dependencies)
    without, for example, incompatible version numbers being an issue
    (such as your app requiring Firebase Auth and Firebase Database v10.0.0,
    which is lower than what is required by this library).

3.  Ensure this library's [Compatibility](#compatibility) items suit your app.

4.  If you have not already added Firebase to your app, please do so.

    See
    [https://firebase.google.com/docs/android/setup](https://firebase.google.com/docs/android/setup)
    for instructions on how to add Firebase, including the required
    Firebase Authentication and Firebase Realtime Database SDKs, to your app.

5.  [Build the library](#how-to-build),
    then copy the `FirebaseContinue-[VERSION-NUMBER].aar`
    compiled Android library file (where `[VERSION-NUMBER]` is replaced with the
    version of Firebase Continue you would like to use),
    and paste a copy of it somewhere for your app to depend on.

    **TODO**: When a simpler release process is in place (where developers can
    add a simple dependency to their build files without having to copy the library
    locally as well), update this and the next parts of the setup guide.

6.  Using the build system for your app,
    depend on the `FirebaseContinue-[VERSION-NUMBER].aar` Android library file.

    For example, using Android Studio:
    [https://developer.android.com/studio/build/dependencies.html](https://developer.android.com/studio/build/dependencies.html).

    A concrete example of this can be seen in the
    [Android sample app](../samples/android).

7.  Import the library wherever you would like to use it in your app:

    ```java
    import com.firebasecontinue.FirebaseContinue;
    ```

8.  Done!

## Usage Instructions

After following the [Installation section](#installation) above, typical
usage of this library is as follows. Please note that a fleshed out example of usage
can be found in the [sample Android app](../samples/android), and
more specific documentation can be found in the
[Android library itself](FirebaseContinue/library/src/main/java/com/firebasecontinue/FirebaseContinue.java).

-   When the user is signed in via Firebase Authentication and may wish to continue some activity
    within your application (such as watching a video or writing a note) elsewhere
    (i.e. within Chrome), you can use the
    `FirebaseContinue.broadcastToContinueActivity(activityUrl, applicationName)` API.

    As noted in its documentation, that API returns a
    [Task](https://developers.google.com/android/guides/tasks)
    which asynchronously broadcasts an activity (codified as a URL) within the application
    that the currently signed in user may wish to continue elsewhere (in the immediate future)
    to all potential clients (i.e. Chrome extension(s)) which could allow the user to do so by
    opening said URL.

    To learn more about Tasks, including what it means for a Task to have completed successfully
    or for it to have failed, see:
    [https://developers.google.com/android/guides/tasks](https://developers.google.com/android/guides/tasks).

    For example:

    ```java
    FirebaseContinue.broadcastActivityToContinue(
            "[TODO: YOUR-URL-TO-ALLOW-THE-USER-TO-CONTINUE-THEIR-ACTIVITY-HERE]"),
            "[TODO: YOUR-APPLICATION-NAME-HERE]")
    ).addOnSuccessListener(new OnSuccessListener<Void>() {
        @Override
        public void onSuccess(Void result) {
            // This success listener is optional but allows you to react to the user's activity
            // successfully being broadcast.

            // An example use of this listener could be to inform the user to open Chrome (with
            // your Chrome extension installed which uses the Firebase Continue for
            // Chrome Extensions library) if they wish continue their activity there.
        }
    }).addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(Exception e) {
            // This failure listener is optional but allows you to react to the user's activity
            // unsuccessfully being broadcast.
        }
    });
    ```

## How to Build

After completing the following steps, you will have properly built this library
from its source:

1.  Open Android Studio.

2.  Click to "Open an existing Android Studio project".

3.  Within the file navigator dialog that pops up, choose the
    [`FirebaseContinue/`](FirebaseContinue) directory.

4.  Click to "Make Project" within Android Studio.

5.  Done!

    The built `FirebaseContinue-[VERSION-NUMBER].aar` Android library file should
    now be in the
    [`FirebaseContinue/library/build/outputs/aar/`](FirebaseContinue/library/build/outputs/aar)
    directory.

## Compatibility

The Firebase Continue for Android library is compatible with devices and simulators
running
[Android 4.0+](https://developer.android.com/about/versions/android-4.0.html)
with
[Google Play services](https://play.google.com/store/apps/details?id=com.google.android.gms&hl=en)
installed.

Currently, this library does **not** support
[simultaneous use of multiple Firebase projects within the same app](https://firebase.google.com/docs/configure/#use_multiple_projects_in_your_application).

## Dependencies

The Firebase Continue for Android library is dependent on the following
libraries/SDKs:

### Firebase
- [com.google.firebase:firebase-auth v11.0.0+](https://firebase.google.com/docs/android/setup#available_libraries)
- [com.google.firebase:firebase-database v11.0.0+](https://firebase.google.com/docs/android/setup#available_libraries)

## Sample App

See the [Android sample folder](../samples/android) for a sample Android app and
instructions on how you can configure and install it.
