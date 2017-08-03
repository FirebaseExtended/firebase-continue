# Firebase Continue for Chrome Extensions

This directory contains the Firebase Continue for Chrome Extensions library.

Firebase Continue enables mobile developers to easily integrate activity transitioning
from their mobile apps to the web by way of Chrome extensions.

To learn more about Firebase Continue and the problems it helps developers solve,
please see the [README at the root of this repository](../).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage Instructions](#usage-instructions)
4. [Compatibility](#compatibility)
5. [Dependencies](#dependencies)
6. [Sample Chrome Extension](#sample-chrome-extension)

## Prerequisites

In order to use Firebase Continue, you must first follow the
[Initial Setup instructions listed in the root README](../#initial-setup).

## Installation

After completing the following steps, you will have properly included this library
to use in your Chrome extension:

1.  First, make sure you followed the [Prerequisites section](#prerequisites) above.

2.  Ensure your Chrome extension can depend on all of this library's
    [Dependencies](#dependencies)
    without, for example, incompatible version numbers being an issue
    (such as your extension requiring Firebase Auth and Firebase Database v3.0.0,
    which is lower than what is required by this library).

3.  Ensure this library's [Compatibility](#compatibility) items suit your extension.

4.  If you have not already added Firebase to your Chrome extension, please do so.

    See
    [https://github.com/firebase/quickstart-js/tree/master/auth/chromextension](https://github.com/firebase/quickstart-js/tree/master/auth/chromextension)
    or the [Chrome extension sample](../samples/chrone-extension)
    for examples of how to add Firebase, including the required
    Firebase Authentication and Firebase Realtime Database SDKs, to your
    Chrome extension.

    **TODO**: Write up a more in-depth "Using Firebase in a Chrome extension" guide.
    This could be a blog post which is linked here when published.

5.  Copy the `firebase-continue.js` Chrome extensions library file
    from this directory and paste a copy of it somewhere for
    your extension to use.

    **TODO**: After v0.1.0 is released, and for all releases after that, provide
    CDN-hosted copies of each version. When a CDN-hosted copy is an option for
    developers, add a step to this installation guide to remind developers to
    update the `content_security_policy` in their extension's `manifest.json` file
    if they use said option instead of using a local copy of the library.

6.  Finally, anywhere you want to use Firebase Continue, remember to include and
    initialize all of its [Dependencies](#dependencies) ***before*** including
    and then using the library itself.

    For example:

    ```html
    <html>
    <head>

      ...

      <!-- Include the required Firebase SDKs. -->
      <script src="your-chrome-extension-scripts/firebase-app.js"></script>
      <script src="your-chrome-extension-scripts/firebase-auth.js"></script>
      <script src="your-chrome-extension-scripts/firebase-database.js"></script>

      <!--
        Your script to configure and initialize Firebase.
        See https://firebase.google.com/docs/web/setup#add_firebase_to_your_app
      -->
      <script src="your-chrome-extension-scripts/initialize-firebase.js"></script>

      <!-- Include the Firebase Continue library. -->
      <script src="your-chrome-extension-scripts/firebase-continue.js"></script>
    </head>
    <body>

      ...

    </body>
    </html>
    ```

7.  Done!

## Usage Instructions

After following the [Installation section](#installation) above, typical
usage of this library is as follows. Please note that a fleshed out example of usage
can be found in the [sample Chrome extension](../samples/chrome-extension), and
more specific documentation can be found in the
[Chrome extensions library itself](firebase-continue.js).

1.  Define at least one callback function to react to Firebase Continue
    "ActivityChanged" events.
    This callback is only invoked when it is first registered with Firebase
    Continue, and when the most recent Activity the user may wish to continue
    changes (i.e. is set to an actual value, or is set to nothing/`null`).

    For example:

    ```javascript
    /**
     * Handles when the most recent Activity the user may wish to continue changes
     * (i.e. is either set to an actual value, or null).
     *
     * @type {!FirebaseContinue.ActivityChangedCallback}
     * @const
     */
    var handleUserActivityToContinueChanged = function(user, activity) {
      // If the activity is non-null, the user may wish to continue an Activity.
      // Otherwise, either the user is null (meaning the user is not signed in), or
      // the user is non-null (thus signed in) and has no Activity they may wish to
      // continue.

      [TODO: YOUR-CODE-TO-HANDLE-THIS-EVENT-HERE]
    };
    ```

2.  When your extension would be ready to react to "ActivityChanged" events, you can
    register the callback function above to do so by first asynchronously getting the
    Firebase Continue instance for your application, and then registering the
    callback with said instance.

    For example:

    ```javascript
    FirebaseContinue.getInstanceFor("[TODO: YOUR-APPLICATION-NAME-HERE]")
        .then(function(firebaseContinueInstance) {
            firebaseContinueInstance.onActivityChanged(
                handleUserActivityToContinueChanged);
        })
        .catch(function(error) {
          console.error("Error registering callback with Firebase Continue: " + error);
        });
    ```

3.  When the user has an Activity they may wish to "continue", you may want to
    allow the user to "continue" that most recent Activity.

    For example:

    ```javascript
    FirebaseContinue.getInstanceFor("[TODO: YOUR-APPLICATION-NAME-HERE]")
        .then(function(firebaseContinueInstance) {
          return firebaseContinueInstance.continueLatestActivity();
        })
        .catch(function(error) {
          console.error("Error continuing latest Activity to continue: " + error);
        });
    ```

    This will open the URL for the user to "continue" the Activity.

    Then, since the user just "continued" the Activity and it would no longer be
    relevant to the user elsewhere or in the future,
    it will set the user's most recent Activity they may wish to
    continue to `null` (thus firing an "ActivityChanged" event) and delete
    the user's most recent Activity stored within the Firebase Continue node of your
    Firebase Realtime Database for this application.

4.  When the user has an Activity they may wish to "continue", you may want to
    allow the user to instead dismiss that most recent Activity if they do not wish
    to "continue" it.

    For example:

    ```javascript
    FirebaseContinue.getInstanceFor("[TODO: YOUR-APPLICATION-NAME-HERE]")
        .then(function(firebaseContinueInstance) {
          return firebaseContinueInstance.dismissLatestActivity();
        })
        .catch(function(error) {
          console.error("Error dismissing latest Activity to continue: " + error);
        });
    ```

    This will set the user's most recent Activity they may wish to
    continue to `null` (thus firing an "ActivityChanged" event) and delete
    the user's most recent Activity stored within the Firebase Continue node of your
    Firebase Realtime Database for this application.

## Compatibility

The Firebase Continue for Chrome Extensions library is compatible with all
modern versions of Chrome on Windows, macOS, and Linux.

Currently, this library does **not** support
[simultaneous use of multiple Firebase projects within the same Chrome extension](https://firebase.google.com/docs/configure/#use_multiple_projects_in_your_application).

## Dependencies

The Firebase Continue for Chrome Extensions library is dependent on the following
libraries/SDKs:

### Firebase
- [firebase-app.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)
- [firebase-auth.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)
- [firebase-database.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)

## Sample Chrome Extension

See the [Chrome extension sample folder](../samples/chrome-extension) for a
sample Chrome extension and instructions on how you can configure and install it.
