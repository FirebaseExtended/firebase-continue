# Firebase Continue

## Status

![Status: Archived](https://img.shields.io/badge/Status-Archived-red)

This library is no longer actively maintained. We **do not recommend** using this library in production.

If you maintain a fork of this library that you believe is healthier than the official version, we may consider recommending your fork.  Please open a Pull Request if you believe that is the case.

## What is Firebase Continue?

In the general sense, when leveraged by a developer in
their [Firebase](https://firebase.google.com/)-enabled Android and/or iOS
app(s) and Chrome extension, the Firebase Continue libraries allow users to easily
transition from the developer's mobile app(s) to the developer's web app. This
transition allows the user to conveniently and nearly instantaneously continue their
activity within the mobile app in the web app instead, by means of a Chrome
extension.

As an added bonus, the [Firebase Continue for iOS library](ios) will not only
leverage Firebase to allow users to continue their activity within Chrome on any
supported platform, but will also make use of
[Apple Handoff](https://developer.apple.com/handoff/)
for a more native experience for users with both an iOS device and a macOS computer
that are Apple Handoff enabled.

Note: this is not an official Google product.

### Example Use Case

For a specific example (which refers to the
[Firebase Continue samples](samples)),
if you were to use Firebase Continue for a note writing application called
"Continote", a user could begin writing a note on their iOS or Android device using
the Continote app while on the bus. Then, they could finish writing it in Chrome on
their Windows, macOS, or Linux computer when they return home, without having to
manually open the Continote website to find the note there.

Instead, once the mobile app decides the user may wish to continue their current
note writing activity elsewhere (either by direct action on the user's part or
periodically while writing), the user would receive a prompt within Chrome on
their computer (via a Chrome extension using the Firebase Continue library)
to continue writing the note there, with one click.

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Overall Design](#overall-design)
3. [Initial Setup](#initial-setup)
4. [Samples](#samples)
5. [Making Contributions](#making-contributions)
6. [License](#license)

## Directory Structure

The root of this repository is split into several subdirectories, one per
platform that Firebase Continue supports
([Android](android), [iOS](ios), and [Chrome extensions](chrome-extensions)).

Please see the README in these subdirectories for specific installation and
usage instructions, after following the [Initial Setup guide](#initial-setup)
below.

There is one more subdirectory at [`samples/`](samples/) which holds a set of
samples. See the [Samples section](#samples) below for more information.

Finally, there is a
[`sample-firebase-continue-database.rules.json`](sample-firebase-continue-database.rules.json)
file at the root of this repository.
This is the suggested set of Firebase Realtime Database security and validation rules
for use with Firebase Continue. More details on this are provided below in the
[Initial Setup guide](#initial-setup).

## Overall Design

It is important to understand how Firebase Continue works at a high-level before
trying to use the libraries.

### What is an Activity?

In the context of Firebase Continue, an Activity is something the user may wish to
"continue" doing within an application.

For example, an Activity could be writing a note in Continote or watching a video in
a video sharing application.

Specifically, an Activity has a URL linking to that "something" that the user may
wish to continue doing, and has associated metadata for the libraries to use.

"Continuing" an Activity, then, essentially means opening that URL.

Therefore, to use Firebase Continue, you **must be able to
codify the state of what you want your users to be able to "continue" doing in
URLs**.

### How do the Firebase Continue libraries work together?

[Firebase](https://firebase.google.com/), of course!

The libraries use
[Firebase Authentication](https://firebase.google.com/docs/auth/)
to ensure Activities are user-specific,
and the
[Firebase Realtime Database](https://firebase.google.com/docs/database/)
to store and transfer Activities between the mobile
app(s) and Chrome extension.

For simplicity, an Activity is always considered immutable,
both on the client-side and within the Firebase Realtime Database.

Furthermore, within an application, at most one Activity per user is stored in the
database, since only the most recent Activity for a user to "continue" within an
application could be relevant.

By design, only Activities performed relatively recently could be relevant to a user.
Therefore the metadata of the most recent Activity for a user is used to determine how
long ago in the past the Activity was added to the database.
From there, the Activity could be deleted if deemed too old to be relevant.

All of these additions to and deletions from the database trigger Firebase events
which the Firebase Continue libraries use to provide their functionalities.

## Initial Setup

After completing the following steps, you will have properly set up your Firebase
project to make use of the Firebase Continue libraries:

1.  First, if you have not already done so, either download a copy of this
    repository from the Releases page to get a stable version of
    Firebase Continue (including its samples),
    or clone the repository locally for an unstable, development version.

2.  If you don't already have a Firebase project,
    [create one](https://firebase.google.com/).

    Note that [Firebase offers a free plan](https://firebase.google.com/pricing/)
    which you may be able to take advantage of.

    **Reminder**: Firebase Continue requires use of
    [Firebase Authentication](https://firebase.google.com/products/auth/)
    and the
    [Firebase Realtime Database](https://firebase.google.com/products/database/)
    for your project.

3.  Copy the
    [`sample-firebase-continue-database.rules.json`](sample-firebase-continue-database.rules.json)
    file from the root of this repository and paste a copy of it also
    at the root.

4.  Rename the `sample-firebase-continue-database.rules.json` copy to
    `database.rules.json`.

5.  Open `database.rules.json` and fill out the clearly marked
    *[TODO: YOUR-VALUE-HERE]* details.

6.  Update your
    [Firebase Realtime Database rules](https://firebase.google.com/docs/database/security/quickstart)
    to include the rules from the `database.rules.json` file you just filled out.

    This can either be done manually within the
    [Firebase Console](https://console.firebase.google.com/), or automatically with
    the `firebase deploy` command using the
    [Firebase CLI](https://firebase.google.com/docs/cli/).

7.  Done!

    You can now follow the more specific setup guides for each Firebase Continue
    library you plan on using. These are found in each library's README.

## Samples

A set of Firebase Continue samples, along with detailed setup instructions,
can be found in the [`samples/`](samples/) subdirectory.

There is a sample provided for each platform Firebase Continue supports
([Android](samples/android), [iOS](samples/ios), and
[Chrome extensions](samples/chrome-extension)), as well
as a [sample web app](samples/web)
that includes the
[suggested Firebase Realtime Database rules](sample-firebase-continue-database.rules.json)
after setting up and deploying it to your
Firebase project.

## Making Contributions

Before making any contributions to this repository, please read and follow the
steps in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE).
