# Firebase Continue Samples - "Continote" Web App

This directory contains a sample web app titled "Continote".

This web app is designed to be deployed to
[Firebase Hosting](https://firebase.google.com/docs/hosting/), which is
[available for free](https://firebase.google.com/pricing/).

Users can begin writing a note in either the [Android sample app](../android)
or the [iOS sample app](../ios), and then continue writing in Chrome from
exactly where they are thanks to the
[sample Chrome extension](../chrome-extension) opening a link to the correct
location in this web app.

A Firebase Continue library itself is not used within this web app.

This web app is simply the destination for users to continue writing notes within
Chrome, and deploying it includes applying the recommended Firebase Realtime
Database security and validation rules to your Firebase project.

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
first follow the [main `samples` README](../) so that you have a properly configured
Firebase project for this and any other "Continote" samples you run.

## Setup

After completing the following steps, you will have a properly configured
and deployed instance of this sample to try out:

1.  First, make sure you followed the [Prerequisites section](#prerequisites) above.

2.  Copy the
    [`sample-firebase-continue-database.rules.json`](../../sample-firebase-continue-database.rules.json)
    file from the root of this repository and paste a copy of it in
    the [`Continote/`](Continote) directory.

3.  Rename the `sample-firebase-continue-database.rules.json` copy to
    `database.rules.json`.

4.  Open `database.rules.json` and fill out the clearly marked
    *[TODO: YOUR-VALUE-HERE]* details:

    1.  Replace
        *[TODO: YOUR-APPLICATION'S-OTHER-FIREBASE-REALTIME-DATABASE-RULES-HERE]*
        with the Continote-specific database rules in
        [`Continote/sample-database.rules.json`](Continote/sample-database.rules.json).

    2.  Replace all instances of *[TODO: YOUR-APPLICATION-NAME-HERE]* with
        `continote`.

5.  Copy the `sample-config.js` file from the
    [`Continote/public/scripts/`](Continote/public/scripts)
    directory and paste a copy of it also in
    [`Continote/public/scripts/`](Continote/public/scripts).

6.  Rename the `sample-config.js` copy to `config.js`.

7.  Open `config.js` and fill out the clearly marked *[TODO: YOUR-VALUE-HERE]* details
    with the
    [values for your Firebase project](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app).

8.  If you have not already,
    [install the Firebase CLI](https://firebase.google.com/docs/cli/#setup).

9.  [Initialize the `Continote/` directory with the Firebase CLI](https://firebase.google.com/docs/cli/#initializing_a_project_directory)
    by using the `firebase init` command within the
    [`Continote/`](Continote) directory:

    1.  When asked by the Firebase CLI what features you want to use, select
        `Database` and `Hosting`.

    2.  When asked to select a default Firebase project, choose the Firebase
        project you created in the [Prerequisites section](#prerequisites) above.

    3.  When asked in the Database Setup section what file should be used for
        Database Rules, use `database.rules.json`.

    4.  When asked in the Database Setup section if you want to overwrite your
        local `database.rules.json` file with the rules that are already applied
        to your Firebase project, enter `N`.

    5.  When asked in the Hosting Setup section what you want to use as your public
        directory, use `public`.

    6.  When asked in the Hosting Setup section if you want to configure to be a
        single-page app, enter `N`.

    7.  When asked in the Hosting Setup section if you want to overwrite your
        local `public/404.html` file, enter `N`.

    8.  When asked in the Hosting Setup section if you want to overwrite your
        local `public/index.html` file, enter `N`.

10. Use the Firebase CLI to
    [deploy the Continote web app (and database rules)](https://firebase.google.com/docs/hosting/deploying#deploying-your-site),
    by using the `firebase deploy` command
    within the [`Continote/`](Continote) directory.

11. Done!

    The web app, along with the suggested Firebase Realtime Database rules for
    Firebase Continue, should now be deployed to your Firebase project.

    You should now be able to open Chrome and navigate to the URL in the final output
    of the `firebase deploy` command to view the sample web app hosted on
    [Firebase Hosting](https://firebase.google.com/products/hosting/).

## Usage

After this sample is properly set up and deployed, open your Chrome browser
and go to the link outputted by the `firebase deploy` command
(ex. "Hosting URL: https://[YOUR-FIREBASE-PROJECT-ID].firebaseapp.com").

From there, you will be asked to sign in to be able to add notes, delete notes, or
open to edit a note.

## Compatibility

This sample web app is best viewed in modern versions of Chrome on a desktop or
laptop running Windows, macOS, or Linux.

## Dependencies

This sample is dependent on the following libraries/SDKs:

### Firebase
- [firebase-app.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)
- [firebase-auth.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)
- [firebase-database.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)

### FirebaseUI
- [FirebaseUI Web v2.0.0+](https://github.com/firebase/firebaseui-web)

### Material Design Lite
- [Material Design Lite v1.3.0+](https://getmdl.io/)

## Disclaimer

The focus of this sample is to demonstrate Firebase Continue usage in a
somewhat realistic scenario. This sample can also act as a simple model of how
to use Firebase and FirebaseUI in a web app.

The focus is *not*, however, to have a perfect user interface or user
experience. Please keep that in mind when trying out this sample.

## Development Progress

This section will be removed when each of the items below are complete for an
initial, released v0.1.0 of this sample.

### Major Features Completed
- [ ] User authentication (via Firebase Authentication and FirebaseUI)
- [ ] "My Notes" page, allowing signed in users to view a list of their notes with
the option to add a note, delete a note, or open to edit a note
- [ ] "Edit Note" page, allowing signed in users to edit a particular note
