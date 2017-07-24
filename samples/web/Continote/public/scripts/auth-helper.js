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
 * This class encapsulates Firebase Auth use within a page in the
 * Continote web app.
 *
 * Remember to include this script in the <head> of a page if you plan on
 * using authentication within that page.
 *
 * Furthermore, make sure that page has a <div> element with an ID that matches
 * the firebaseUiSignInContainerId_ constant below, to allow the user to
 * sign in via FirebaseUI.
 *
 * @constructor
 * @param {!UserSignedInCallback} handleUserSignedIn
 * @param {!UserSignedOutCallback} handleUserSignedOut
 */
function AuthHelper(handleUserSignedIn, handleUserSignedOut) {
  'use strict';

  /**
   * A reference to the current user object.
   *
   * This is kept up to date in the auth state changed handler below.
   *
   * @type {?firebase.User}
   */
  var currentUser_ = null;

  /**
   * The FirebaseUI object to use for sign in purposes.
   *
   * See: https://github.com/firebase/firebaseui-web
   *
   * @type {!Object}
   * @const
   */
  var firebaseUi_ = new firebaseui.auth.AuthUI(firebase.auth());

  /**
   * The FirebaseUI config object.
   *
   * See: https://github.com/firebase/firebaseui-web#configuration
   *
   * @type {!Object}
   * @const
   */
  var firebaseUiConfig_ = {
    "callbacks": {
      "signInSuccess": function (user, credential, redirectUrl) {
        // Do not redirect.
        return false;
      }
    },
    "signInFlow": "popup",
    "signInOptions": [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        scopes: ["https://www.googleapis.com/auth/plus.login"]
      },
      {
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        scopes: [
          "public_profile",
          "email"
        ]
      }
    ]
  };

  /**
   * FirebaseUI will be initialized within the element on the page with this ID.
   *
   * @type {!string}
   * @const
   */
  var firebaseUiSignInContainerId_ = "firebaseui-container";

  /**
   * Returns true iff the current user is signed into this web app,
   * false otherwise.
   *
   * @function
   * @returns {!boolean}
   * @const
   */
  var currentUserIsSignedIn_ = function() {
    return !!currentUser_;
  };

  /**
   * Handles when the user signs in or out.
   *
   * This is also invoked right away by Firebase with the auth state when the
   * handler is registered with Firebase.
   * See: https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onAuthStateChanged
   *
   * @function
   * @param {?firebase.User} user
   * @const
   */
  var handleAuthStateChanged_ = function(user) {
    // Keep track of the current user object.
    currentUser_ = user;

    // Configure FirebaseUI (if necessary) and then call the appropriate
    // callback for the current auth state.
    if (currentUserIsSignedIn_()) {
      handleUserSignedIn(currentUser_);
    } else {
      // The current user is not signed in, so display a sign in UI using
      // FirebaseUI.
      firebaseUi_.reset();
      firebaseUi_.start("#" + firebaseUiSignInContainerId_, firebaseUiConfig_);

      handleUserSignedOut();
    }
  };

  /**
   * These are error messages that can be thrown as a direct result of an
   * AuthHelper instance (via a Promise rejection).
   *
   * Note that other error messages are possible if, for example, a Firebase
   * Auth Promise rejects itself.
   *
   * @type {!Object}
   * @const
   */
  this.errorMessages = {
    userAlreadySignedOut: "User already signed out"
  };

  /**
   * Signs the user out.
   *
   * @function
   * @returns {!Promise}
   * @const
   */
  this.signOut = function() {
    var authHelper = this;
    return new Promise(function(resolve, reject) {
      // If the user is already signed out, reject immediately.
      if (!currentUserIsSignedIn_()) {
        return reject(authHelper.errorMessages.userAlreadySignedOut);
      }

      return resolve();
    }).then(function() {
      // The user is signed in, so we can sign them out.
      return firebase.auth().signOut();
    });
  }.bind(this);

  // Finally, finish initializing this instance.
  (function() {
    // Listen for Firebase Auth state changes.
    firebase.auth().onAuthStateChanged(handleAuthStateChanged_);
  })();
}

// Below are extra JSDoc definitions to describe the callback functions
// this class expects.

/**
 * This callback is used by AuthHelper when the user's auth state is set to
 * signed in.
 *
 * @callback UserSignedInCallback
 * @param {!firebase.User} user
 */

/**
 * This callback is used by AuthHelper when the user's auth state is set to
 * signed out.
 *
 * @callback UserSignedOutCallback
 */
