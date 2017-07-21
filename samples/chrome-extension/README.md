# Firebase Continue Samples - "Continote" Chrome Extension

This directory contains a sample Chrome extension titled "Continote" which uses
the Firebase Continue for Chrome Extensions library.

In both the [Android sample app](../android) and the [iOS sample app](../ios),
after a user taps to continue writing their note in Chrome, this extension
allows them to complete that process by opening a link to the
["Continote" sample web app](../web) to exactly where they left off.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Usage](#usage)
4. [Compatibility](#compatibility)
5. [Dependencies](#dependencies)
6. [Disclaimer](#disclaimer)

## Prerequisites

Before proceeding to the [Setup section](#setup) below, you
must first follow the [main `samples` README](../) so that you have a properly
configured Firebase project for this and any other "Continote" samples
you run.

## Setup

After completing the following steps, you will have a properly configured instance of
this sample packaged and installed to try out:

1.  First, make sure you followed the [Prerequisites section](#prerequisites) above.

2.  Copy the `firebase-continue.js` Chrome extensions library from the
    [`../../chrome-extensions`](../../chrome-extensions) directory and paste it in the
    [`Continote/scripts/`](Continote/scripts/) directory.

3.  Copy the `sample-config.js` file from the
    [`Continote/scripts/`](Continote/scripts)
    directory and paste a copy of it also in
    [`Continote/scripts/`](Continote/scripts).

4.  Rename the `sample-config.js` copy to `config.js`.

5.  Open `config.js` and fill out the clearly marked *[TODO: YOUR-VALUE-HERE]* details
    with the
    [values for your Firebase project](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app).

6.  Package and install the extension to Chrome:

    1.  Open Google Chrome if you are not already using it.

    2.  Go to [chrome://extensions](chrome://extensions) to view and modify the
        extensions currently installed to your browser.

    3.  If it is not already checked, enable "Developer mode" by clicking the
        "Developer mode" checkbox at the top of your
        [chrome://extensions](chrome://extensions) page.

    4.  Click the "Pack extension..." button at the top of the page.

    5.  In the "Pack Extension" dialog that appears:

        1.  For the "Extension root directory", choose [`Continote/`](Continote).

        2.  For the "Private key file", choose nothing since this initial packaging
            and installing will generate a private key file for you to use in
            the future.

    6.  Click the "Pack Extension" to package the extension (i.e. generate
        installation and private key files).

    7.  Make note of where your extenion's `Continote.crx` and `Continote.pem` files
        were generated (most likely, they could be generated in this directory).

        **Keep your `Continote.pem` key file in a safe place.
        You will need it to package and install new versions of your extension.**

    8.  Navigate to where your `Continote.crx` file is, and drag it onto the
        [chrome://extensions](chrome://extensions) page in Chrome to install
        your extension.

    9.  Make note of your extension's **ID** on that page. You will need it later.

7.  [Whitelist your Chrome extension ID in Firebase](https://firebase.google.com/docs/auth/web/google-signin#authenticate_with_firebase_in_a_chrome_extension)
    to allow Firebase Authentication within the extension.

8.  Done!

    **Important Reminder**:
    If you make any changes to the code of your Chrome extension, remember
    to repeat the "package and install" step of this setup guide with one difference:
    provide the "Pack Extension" dialog with your private key file that was generated
    the first time you packaged and installed the extension. This is so that
    the packaging updates your existing Chrome extension, instead of creating
    a new Chrome extension with a new ID.

## Usage

After this sample is properly set up and installed to your Chrome browser,
open it by clicking its
[browser action icon button](https://developer.chrome.com/extensions/browserAction).

From there, you will be asked to sign in to be able to receive notifications to
continue writing notes.

## Compatibility

This sample Chrome extension is compatible with the
[same versions of Chrome as the Firebase Continue library itself](../../chrome-extensions/#compatibility).

Please ensure popups are not blocked, and JavaScript is enabled.

## Dependencies

This sample is dependent on the following libraries/SDKs:

### Firebase
- [firebase-app.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)
- [firebase-auth.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)
- [firebase-database.js v4.0.0+](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app)

### Firebase Continue
- [Firebase Continue for Chrome Extensions v0.1.0+](../../chrome-extensions)

### Material Design Lite
- [Material Design Lite v1.3.0+](https://getmdl.io/)

## Disclaimer

The focus of this sample is to demonstrate Firebase Continue usage in a
somewhat realistic scenario. This sample can also act as a simple model of how
to use Firebase in a Chrome extension.

The focus is *not*, however, to have a perfect user interface or user
experience. Please keep that in mind when trying out this sample.
