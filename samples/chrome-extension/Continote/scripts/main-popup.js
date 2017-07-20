/**
 * Copyright (c) 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a
 * copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * This script is loaded and running whenever the extension browser action
 * popup is open. It will not continue to run in the background, so this script
 * should only be used for presenting the user with UI for immediate actions
 * such as signing in (through use of a secondary popup), signing out, and
 * interacting with Firebase Continue data (i.e. either continuing or
 * dismissing an activity).
 */
(function() {
  'use strict';

  /**
   * AuthHelper instance to simplify Firebase Auth usage.
   *
   * @type {?AuthHelper}
   */
  var authHelper_ = null;

  /**
   * Various UI elements which will be manipulated through the lifecycle of
   * this popup. These are organized as part of an object for clarity and a
   * cleaner namespace.
   *
   * @type {!Object}
   * @const
   */
  var popupUi_ = {
    userSignedInContentContainer: null,
    userSignedOutContentContainer: null,
    userDisplayName: null,
    userEmail: null,
    signInButton: null,
    signOutButton: null,
    userHasNoteToContinueWritingContainer: null,
    continueWritingNoteButton: null,
    dismissWritingNoteButton: null
  };

  /**
   * Handles when the user has an Activity they wish to continue,
   * according to the Firebase Continue library.
   *
   * In the case of Continote, that means the user has a note they may wish to
   * continue writing.
   *
   * @function
   * @const
   */
  var handleUserHasNoteToContinueWriting_ = function() {
    // Show the UI for users who have a note they may wish to continue writing,
    // in case it was previously hidden.
    Utils.showElement(popupUi_.userHasNoteToContinueWritingContainer);
    Utils.enableButtonAndAddClickListener(
        popupUi_.continueWritingNoteButton,
        handleContinueWritingNoteButtonClicked_);
    Utils.enableButtonAndAddClickListener(
        popupUi_.dismissWritingNoteButton,
        handleDismissWritingNoteButtonClicked_);
  };

  /**
   * Handles when the user has no Activity they may wish to continue,
   * according to the Firebase Continue library.
   *
   * In the case of Continote, that means the user has no note they may wish to
   * continue writing.
   *
   * @function
   * @const
   */
  var handleUserHasNoNoteToContinueWriting_ = function() {
    // Hide the UI for users who have a note they may wish to continue writing.
    Utils.hideElement(popupUi_.userHasNoteToContinueWritingContainer);
    Utils.disableButtonAndRemoveClickListener(
        popupUi_.continueWritingNoteButton,
        handleContinueWritingNoteButtonClicked_);
    Utils.disableButtonAndRemoveClickListener(
        popupUi_.dismissWritingNoteButton,
        handleDismissWritingNoteButtonClicked_);
  };

  /**
   * Handles when the most recent Activity the user may wish to to continue
   * changes (i.e. is either set to an actual value, or null).
   *
   * This is also invoked right away by Firebase Continue with the most recent
   * Activity the user may wish to continue when the handler is registered.
   *
   * @type {!FirebaseContinue.ActivityChangedCallback}
   * @const
   */
  var handleUserNoteToContinueWritingChanged_ = function(user, activity) {
    // If the activity is non-null, the user may wish to continue writing a
    // note. Otherwise, the user has no note they may wish to continue writing.
    activity ? handleUserHasNoteToContinueWriting_() :
               handleUserHasNoNoteToContinueWriting_();
  };

  /**
   * Handles when the user signs in.
   *
   * See auth-helper.js for more details.
   *
   * @type {!UserSignedInCallback}
   * @const
   */
  var handleUserSignedIn_ = function(user) {
    // Hide the UI for signed out users.
    Utils.hideElement(popupUi_.userSignedOutContentContainer);
    Utils.disableButtonAndRemoveClickListener(
        popupUi_.signInButton, handleSignInButtonClicked_);

    // Show the UI for signed in users.
    Utils.showElement(popupUi_.userSignedInContentContainer);
    popupUi_.userDisplayName.textContent = user.displayName;
    popupUi_.userEmail.textContent = user.email;
    Utils.enableButtonAndAddClickListener(
        popupUi_.signOutButton, handleSignOutButtonClicked_);
  };

  /**
   * Handles when the user signs out.
   *
   * See auth-helper.js for more details.
   *
   * @type {!UserSignedOutCallback}
   * @const
   */
  var handleUserSignedOut_ = function() {
    // Hide the UI for signed in users.
    Utils.hideElement(popupUi_.userSignedInContentContainer);
    Utils.disableButtonAndRemoveClickListener(
        popupUi_.signOutButton, handleSignOutButtonClicked_);

    // Show the UI for signed out users.
    Utils.showElement(popupUi_.userSignedOutContentContainer);
    Utils.enableButtonAndAddClickListener(
        popupUi_.signInButton, handleSignInButtonClicked_);
  };

  /**
   * Handles when the sign in button is clicked.
   *
   * Displays another popup for sign in purposes if the user is signed out.
   *
   * See the documentation in signin-popup.js to understand why a secondary
   * popup is needed.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleSignInButtonClicked_ = function(event) {
    event.preventDefault();

    // Since the click event listener is only on the sign in button when the
    // user is signed out, we can reasonably assume the user is signed out.
    // However, presenting the sign in popup will fail if the user is already
    // signed in, so we need to handle that case in the catch function
    // below - just in case.
    authHelper_.presentSignInPopup().catch(function(error) {
      // TODO: Rather than outputting an error, notify the user that something
      // went wrong so that they may try again.
      console.error("Error during sign in: " + error);
    });
  };

  /**
   * Handles when the sign out button is clicked.
   *
   * Signs the user out, if they are signed in.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleSignOutButtonClicked_ = function(event) {
    event.preventDefault();

    // Since the click event listener is only on the sign out button when the
    // user is signed in, we can reasonably assume the user is signed in.
    // However, signing out will fail if the user is already signed out,
    // so we need to handle that case in the catch function
    // below - just in case.
    authHelper_.signOut().catch(function(error) {
      // TODO: Rather than outputting an error, notify the user that something
      // went wrong so that they may try again.
      console.error("Error during sign out: " + error);
    });
  };

  /**
   * Handles when the continue writing note button is clicked.
   *
   * Continues the latest Activity for the user, which in Continote's case
   * means continuing to write the note which the user last signaled they
   * wished to do.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleContinueWritingNoteButtonClicked_ = function(event) {
    event.preventDefault();

    FirebaseContinue.getInstanceFor(Constants.appName)
        .then(function(firebaseContinueInstance) {
          return firebaseContinueInstance.continueLatestActivity();
        })
        .catch(function(error) {
          console.error("Error opening note to continue writing instance: " +
              error);
        });
  };

  /**
   * Handles when the dismiss writing note button is clicked.
   *
   * Dismisses the latest Activity for the user, which in Continote's case
   * means not continuing to write the note which the user last signaled they
   * wished to do.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleDismissWritingNoteButtonClicked_ = function(event) {
    event.preventDefault();

    FirebaseContinue.getInstanceFor(Constants.appName)
        .then(function(firebaseContinueInstance) {
          return firebaseContinueInstance.dismissLatestActivity();
        })
        .catch(function(error) {
          console.error("Error dismissing note to continue writing: " + error);
        });
  };

  /**
   * Initializes this extension's browser action popup.
   *
   * This is the main entry point of this popup script.
   *
   * @function
   * @const
   */
  var init_ = function() {
    // Hold references to various UI elements for later manipulation.
    popupUi_.userSignedInContentContainer = document.getElementById(
        "user-signed-in-content-container");
    popupUi_.userSignedOutContentContainer = document.getElementById(
        "user-signed-out-content-container");
    popupUi_.userDisplayName = document.getElementById("user-display-name");
    popupUi_.userEmail = document.getElementById("user-email");
    popupUi_.signInButton = document.getElementById("sign-in-button");
    popupUi_.signOutButton = document.getElementById("sign-out-button");
    popupUi_.userHasNoteToContinueWritingContainer = document.getElementById(
        "user-has-note-to-continue-writing-container");
    popupUi_.continueWritingNoteButton = document.getElementById(
        "continue-writing-note-button");
    popupUi_.dismissWritingNoteButton = document.getElementById(
        "dismiss-writing-note-button");

    // Now that the page is ready, set up the Firebase Auth helper to listen
    // for sign in state changes.
    authHelper_ = new AuthHelper(handleUserSignedIn_, handleUserSignedOut_);

    // Begin listening for Firebase Continue events. In reacting to these
    // events, we will update the UI based on whether the user wishes to
    // continue writing a note or not.
    FirebaseContinue.getInstanceFor(Constants.appName)
        .then(function(firebaseContinueInstance) {
          firebaseContinueInstance.onActivityChanged(
              handleUserNoteToContinueWritingChanged_);
        })
        .catch(function(error) {
          console.error(
              "Error registering callback with Firebase Continue: " + error);
        });
  };

  // When the popup is ready, call the init function.
  window.addEventListener("load", init_);
})();
