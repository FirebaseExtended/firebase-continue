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
 * This class encapsulates Firebase Auth use within Continote.
 *
 * Remember to include this script in the <head> of a page if you plan on
 * using authentication within that page.
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
   * Returns true iff the current user is signed into this extension, false
   * otherwise.
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

    // Call the appropriate callback for the current auth state.
    currentUserIsSignedIn_() ? handleUserSignedIn(currentUser_) :
                               handleUserSignedOut();
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
    userAlreadySignedIn: "User already signed in",
    userAlreadySignedOut: "User already signed out"
  };

  /**
   * Displays a popup for sign in purposes.
   *
   * See the documentation in signin-popup.js to understand why a secondary
   * popup is needed.
   *
   * @function
   * @returns {!Promise} - A Promise which either resolves with nothing,
   * or rejects with an error message.
   * @const
   */
  this.presentSignInPopup = function() {
    var authHelper = this;
    return new Promise(function(resolve, reject) {
      // If the user is already signed in, reject immediately.
      if (currentUserIsSignedIn_()) {
        return reject(authHelper.errorMessages.userAlreadySignedIn);
      }

      // The user is not already signed in, so present the secondary signin
      // popup.
      window.open(chrome.extension.getURL("signin-popup.html"),
                  "Continote - Sign In",
                  "width=500,height=350");

      return resolve();
    });
  }.bind(this);

  /**
   * Signs the user in via Google.
   *
   * @function
   * @returns {!Promise} - A Promise which either resolves with nothing,
   * or rejects with an error message.
   * @const
   */
  this.signInWithGoogle = function() {
    var authHelper = this;
    return new Promise(function(resolve, reject) {
      // If the user is already signed in, reject immediately.
      if (currentUserIsSignedIn_()) {
        return reject(authHelper.errorMessages.userAlreadySignedIn);
      }

      // Set up and resolve with the authentication provider.
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({
        // Ask the user to choose which Google account they wish to use with
        // Continote.
        prompt: "select_account"
      });
      return resolve(provider);
    }).then(function(provider) {
      // The user is signed out, so we can sign them in with the supplied
      // authentication provider.
      return firebase.auth().signInWithPopup(provider);
    });
  }.bind(this);

  /**
   * Signs the user in via Facebook.
   *
   * @function
   * @returns {!Promise} - A Promise which either resolves with nothing,
   * or rejects with an error message.
   * @const
   */
  this.signInWithFacebook = function() {
    var authHelper = this;
    return new Promise(function(resolve, reject) {
      // If the user is already signed in, reject immediately.
      if (currentUserIsSignedIn_()) {
        return reject(authHelper.errorMessages.userAlreadySignedIn);
      }

      // Set up and resolve with the authentication provider.
      var provider = new firebase.auth.FacebookAuthProvider();
      return resolve(provider);
    }).then(function(provider) {
      // The user is signed out, so we can sign them in with the supplied
      // authentication provider.
      return firebase.auth().signInWithPopup(provider);
    });
  }.bind(this);

  /**
   * Signs the user out.
   *
   * @function
   * @returns {!Promise} - A Promise which either resolves with nothing,
   * or rejects with an error message.
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
