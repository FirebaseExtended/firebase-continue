# Firebase Continue Samples - "Continote" Application

This directory contains a set of Firebase Continue samples, collectively titled
"Continote".

"Continote" allows users to begin writing plaintext notes in either the
[Android sample app](android) or the [iOS sample app](ios), and then continue
writing in Chrome from exactly where they are thanks to the
[sample Chrome extension](chrome-extension)
(or [Apple Handoff](https://developer.apple.com/handoff/),
for users with both an iOS device running "Continote" and
macOS computer) opening a link to the correct location in the [sample web app](web).

All of the samples provided here are designed to be used with the same
Firebase project.

It is strongly recommended that you create a new Firebase project specifically
for the "Continote" samples.
See the [Initial Setup guide](#initial-setup) below for more details.

**Important Notice**: "Continote" is currently a work-in-progress.
Expect frequent updates as an initial, complete v0.1.0 is fleshed out.
See [Development Progress](#development-progress) for details.
This notice will be removed when v0.1.0 is officially ready
and released in the Releases page of this repo.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Usage](#usage)
3. [Compatibility](#compatibility)
4. [Dependencies](#dependencies)
5. [Development Progress](#development-progress)

## Initial Setup

After completing the following steps, you will have properly set up a Firebase
project to be able to try the Firebase Continue samples, collectively titled
"Continote":

1.  First, if you have not already done so, either download a copy of this
    repository from the Releases page to get a stable version of
    Firebase Continue (including its samples),
    or clone the repository locally for an unstable, development version.

2.  [Create a Firebase project](https://firebase.google.com/)
    to use for the Continote samples.

    Note that [Firebase offers a free plan](https://firebase.google.com/pricing/)
    which you may be able to take advantage of.

    **Reminder**: Firebase Continue, and thus these samples, requires use of
    [Firebase Authentication](https://firebase.google.com/products/auth/)
    and the
    [Firebase Realtime Database](https://firebase.google.com/products/database/)
    for your project. Furthermore, the Firebase Realtime Database rules for Continote
    will be applied to your project, and the
    [sample web app](web) will be deployed to
    [Firebase Hosting](https://firebase.google.com/products/hosting/),
    using the
    [Firebase CLI](https://firebase.google.com/docs/cli/).

3.  Enable signing in with Google for your Firebase project:

    1.  In the [Firebase console](https://console.firebase.google.com/)
        for your project, open the Authentication section.

    2.  On the Sign in method tab, enable the Google sign-in method, and click
        **Save**.

4.  Enable signing in with Facebook for your Firebase project:

    1.  On the [Facebook for Developers website](https://developers.facebook.com/),
        create an app for use with the Continote samples.

    2.  Make note of the **name** you gave your new Facebook app, as well as its
        **App ID** and **App Secret** as you will need those values for this and
        other Continote samples.

    3.  In the [Firebase console](https://console.firebase.google.com/)
        for your project, open the Authentication section.

    4.  On the Sign in method tab, enable the Facebook sign-in method and
        specify the App ID and App Secret from above, and click **Save**.

    5.  Within that same Facebook sign-in method dialog, copy your OAuth redirect URI
        (ex. `my-app-12345.firebaseapp.com/__/auth/handler`)
        and add it to your "Valid OAuth redirect URIs" in your Facebook app's settings
        on the [Facebook for Developers website](https://developers.facebook.com/)
        in the Product Settings > Facebook Login configuration page.

5.  [Follow the setup guide for the Continote sample web app](web#setup),
    since doing so will also apply the necessary Firebase Realtime Database rules
    for both Firebase Continue and Continote itself to your Firebase project.

6.  Done!

    You can now follow the other setup guides for each Continote
    sample you plan on trying (for example, the
    [sample Chrome extension](chrome-extension#setup) and the
    [sample iOS app](ios#setup)).

## Usage

Please see each sample subdirectory for relevant usage guides.

## Compatibility

Please see each sample subdirectory for relevant compatibility information.

## Dependencies

Please see each sample subdirectory for relevant dependency information.

## Development Progress

This section will be removed when each of the items below are complete for an
initial, released v0.1.0 of "Continote".

See subdirectory README files for more specific v0.1.0 development progress lists.

### Samples Completed
- [x] [Chrome extension sample](chrome-extension)
- [x] [iOS sample](ios)
- [ ] Android sample
- [x] [Web sample](web)
