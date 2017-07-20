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
 * This script is loaded and running whenever signin-popup.html is open.
 * It will not continue to run in the background, so this script should only
 * be used for presenting the user with UI for signing in.
 *
 * Note: We cannot use the main browser action popup (i.e. main-popup.html)
 * for sign in purposes because that popup is automatically closed by Chrome
 * when it loses focus. This means that if the user were to click a Sign In
 * button in that popup, the sign in process would be instantly aborted because
 * both Google and Facebook authorization open their own popups as well.
 * Instead, this secondary popup can remain open while we wait for the user to
 * complete the sign in process.
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
   * this auth popup.
   *
   * These are organized as part of an object for clarity and a cleaner
   * namespace.
   *
   * @type {!Object}
   * @const
   */
  var popupUi_ = {
    userSignedInContentContainer: null,
    userSignedOutContentContainer: null,
    googleSignInButton: null,
    facebookSignInButton: null
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
        popupUi_.googleSignInButton, handleGoogleSignInButtonClicked_);
    Utils.disableButtonAndRemoveClickListener(
        popupUi_.facebookSignInButton, handleFacebookSignInButtonClicked_);

    // Show the UI for signed in users.
    Utils.showElement(popupUi_.userSignedInContentContainer);
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

    // Show the UI for signed out users.
    Utils.showElement(popupUi_.userSignedOutContentContainer);
    Utils.enableButtonAndAddClickListener(
        popupUi_.googleSignInButton, handleGoogleSignInButtonClicked_);
    Utils.enableButtonAndAddClickListener(
        popupUi_.facebookSignInButton, handleFacebookSignInButtonClicked_);
  };

  /**
   * Handles when the Google sign in button is clicked.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleGoogleSignInButtonClicked_ = function(event) {
    event.preventDefault();

    // Since the click event listener is only on the Google sign in button when
    // the user is signed out, we can reasonably assume the user is signed out.
    // However, signing in will fail if the user is already signed in, so we
    // need to handle that case in the catch function below - just in case.
    authHelper_.signInWithGoogle().catch(function(error) {
      // TODO: Deal with specific errors that can be thrown by Firebase Auth
      // here (for example, the error resulting from trying to sign in with
      // multiple providers for the same email). This might be best to do
      // within AuthHelper.
      // See https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithPopup

      // TODO: Rather than outputting an error, notify the user that something
      // went wrong so that they may try again.
      console.error("Error during Google sign in: " + error);
    });
  };

  /**
   * Handles when the Facebook sign in button is clicked.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleFacebookSignInButtonClicked_ = function(event) {
    event.preventDefault();

    // Since the click event listener is only on the Facebook sign in button
    // when the user is signed out, we can reasonably assume the user is signed
    // out. However, signing in will fail if the user is already signed in, so
    // we need to handle that case in the catch function below - just in case.
    authHelper_.signInWithFacebook().catch(function(error) {
      // TODO: Deal with specific errors that can be thrown by Firebase Auth
      // here (for example, the error resulting from trying to sign in with
      // multiple providers for the same email). This might be best to do
      // within AuthHelper.
      // See https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithPopup

      // TODO: Rather than outputting an error, notify the user that something
      // went wrong so that they may try again.
      console.error("Error during Facebook sign in: " + error);
    });
  };

  /**
   * Initializes this extension's signin popup.
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
    popupUi_.googleSignInButton = document.getElementById(
        "google-sign-in-button");
    popupUi_.facebookSignInButton = document.getElementById(
        "facebook-sign-in-button");

    // Now that the page is ready, set up the Firebase Auth helper to listen
    // for sign in state changes.
    authHelper_ = new AuthHelper(handleUserSignedIn_, handleUserSignedOut_);
  };

  // When the popup is ready, call the init function.
  window.addEventListener("load", init_);
})();
