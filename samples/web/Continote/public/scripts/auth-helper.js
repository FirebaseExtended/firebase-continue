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
 * Furthermore, make sure that page has an element with an id that matches
 * the signInUiContainerId_ constant below, to allow the user to sign in.
 * See index.html for an example.
 *
 * This class requires use of utils.js.
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
      "signInSuccess": function(user, credential, redirectUrl) {
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
   * FirebaseUI will be initialized within the element on the page with this id.
   *
   * That element is added with the signInUITemplate_ below.
   *
   * @type {!string}
   * @const
   */
  var firebaseUiSignInContainerId_ = "firebaseui-container";

  /**
   * A sign in UI will be initialized within the element on the page with this
   * id.
   *
   * @type {!string}
   * @const
   */
  var signInUiContainerId_ = "sign-in-container";

  /**
   * Element template used to add a sign in UI to the page.
   *
   * @type {!string}
   * @const
   */
  var signInUITemplate_ =
      '<section class="mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">' +
        '<div class="mdl-card mdl-cell mdl-cell--12-col">' +
          '<div class="mdl-card__title">' +
            '<h2 class="mdl-card__title-text">' +
            'Sign in required' +
            '</h2>' +
          '</div>' +
          '<div class="mdl-card__supporting-text">' +
            '<p>Please sign in below to view this page.</p>' +
            '<div id="'+ firebaseUiSignInContainerId_ +'"></div>' +
          '</div>' +
        '</div>' +
      '</section>';

  /**
   * This is the class which, if applied to an element, means
   * it should only be visible to users who are signed in.
   *
   * @type {!string}
   * @const
   */
  var showOnlyToSignedInUsersClass_ = "show-only-to-signed-in-users";

  /**
   * This is the class which, if applied to an element, means
   * it should only be visible to users who are signed out.
   *
   * @type {!string}
   * @const
   */
  var showOnlyToSignedOutUsersClass_ = "show-only-to-signed-out-users";

  /**
   * Shows all DOM elements which are for signed in users only.
   *
   * @function
   * @const
   */
  var showAllSignedInOnlyElements_ = function() {
    Utils.showAllElementsWithClassName(showOnlyToSignedInUsersClass_);
  };

  /**
   * Shows all DOM elements which are for signed out users only.
   *
   * @function
   * @const
   */
  var showAllSignedOutOnlyElements_ = function() {
    Utils.showAllElementsWithClassName(showOnlyToSignedOutUsersClass_);
  };

  /**
   * Hides all DOM elements which are for signed in users only.
   *
   * @function
   * @const
   */
  var hideAllSignedInOnlyElements_ = function() {
    Utils.hideAllElementsWithClassName(showOnlyToSignedInUsersClass_);
  };

  /**
   * Hides all DOM elements which are for signed out users only.
   *
   * @function
   * @const
   */
  var hideAllSignedOutOnlyElements_ = function() {
    Utils.hideAllElementsWithClassName(showOnlyToSignedOutUsersClass_);
  };

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
   * Hides elements on the page that are marked with the
   * "showOnlyToSignedInUsersClass_" or "showOnlyToSignedOutUsersClass_"
   * classes (depending on the Auth state).
   *
   * Next, it sets up a sign in ui if necessary,
   * then shows the elements on the page for the Auth state
   * (based on the same classes as before).
   *
   * Finally, it invokes the relevant callback.
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
      hideAllSignedOutOnlyElements_();

      showAllSignedInOnlyElements_();

      handleUserSignedIn(currentUser_);
    } else {
      hideAllSignedInOnlyElements_();

      // The current user is not signed in, so display a sign in UI using
      // FirebaseUI.
      var signInUiContainer = document.getElementById(signInUiContainerId_);
      if (signInUiContainer) {
        // If the sign in container has no children it has not been populated
        // with the sign in UI, so we add the sign in UI to it.
        if (!signInUiContainer.firstElementChild) {
          Utils.appendElementBasedOnTemplateToContainer(
              signInUITemplate_, signInUiContainer);
        }

        // Now that the sign in UI is certainly on the page, set up FirebaseUI.
        firebaseUi_.reset();
        firebaseUi_.start(
            "#" + firebaseUiSignInContainerId_, firebaseUiConfig_);
      }

      showAllSignedOutOnlyElements_();

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
