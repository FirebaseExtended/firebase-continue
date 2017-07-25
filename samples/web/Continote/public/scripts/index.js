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
 * This script is loaded and running whenever the index.html page is open.
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
   * this page. These are organized as part of an object for clarity and a
   * cleaner namespace.
   *
   * @type {!Object}
   * @const
   */
  var pageUi_ = {
    userDisplayName: null,
    userEmail: null,
    signOutButton: null
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
    // Set up the UI for signed in users.
    pageUi_.userDisplayName.textContent = user.displayName;
    pageUi_.userEmail.textContent = user.email;
    Utils.enableButtonAndAddClickListener(
        pageUi_.signOutButton, handleSignOutButtonClicked_);
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
    // Tear down the UI for signed in users.
    Utils.disableButtonAndRemoveClickListener(
        pageUi_.signOutButton, handleSignOutButtonClicked_);
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
      switch (error) {
        case authHelper_.errorMessages.userAlreadySignedOut:
          // Do nothing, as the user is already signed out.
          break;

        default:
          console.error("Error during sign out: " + error);
      }
    });
  };

  /**
   * Initializes this page.
   *
   * This is the main entry point of this page's script.
   *
   * @function
   * @const
   */
  var init_ = function() {
    // Hold references to various UI elements for later manipulation.
    pageUi_.userDisplayName = document.getElementById("user-display-name");
    pageUi_.userEmail = document.getElementById("user-email");
    pageUi_.signOutButton = document.getElementById("sign-out-button");

    // Now that the page is ready, set up the Firebase Auth helper to listen
    // for sign in state changes, and to start FirebaseUI for a sign in UI
    // when the user is signed out.
    authHelper_ = new AuthHelper(handleUserSignedIn_, handleUserSignedOut_);
  };

  // When the page is ready, call the init function.
  window.addEventListener("load", init_);
})();
