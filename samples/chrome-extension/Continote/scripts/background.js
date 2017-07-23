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
 * This script is loaded and running whenever the extension is installed and
 * enabled. It will continue to run in the background, so this is where we can
 * listen for and notify the user about any relevant Firebase Continue related
 * activity for the Continote application.
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
   * These states represent all possible configurations this extension's
   * browser action icon button can have.
   *
   * The browser action title appears when the user hovers their mouse over the
   * extension's button icon within Chrome.
   *
   * The browser action badge can provide additional information that is more
   * visible to the user. Note that a 4 character limit is recommended for the
   * badge text.
   *
   * For more information about browser actions, see
   * https://developer.chrome.com/extensions/browserAction.
   *
   * @type {!Object}
   * @const
   */
  var browserActionStates_ = {

    /**
     * The default state when the user is signed out.
     *
     * It indicates to the user that they should sign in.
     *
     * @type {!BrowserActionButtonState}
     * @const
     */
    userSignedOutDefault: {
      // Provide an indication that clicking the icon will ask the user to
      // sign in.
      title: "Click here to sign into the Continote extension.",

      // Use the icon badge to signal to the user that they should sign in.
      badgeText: "User",
      badgeBackgroundColor: "red"
    },

    /**
     * The default state when the user is signed in.
     *
     * It is plain, to not be distracting when nothing requires immediate
     * attention.
     *
     * @type {!BrowserActionButtonState}
     * @const
     */
    userSignedInDefault: {
      // Provide an indication that clicking the icon will allow the user to
      // interact with the extension.
      title: "Click here to open the Continote extension.",

      // Clear the badge since nothing requires immediate attention.
      badgeText: "",
      badgeBackgroundColor: "green"
    },

    /**
     * The state for when the user has note they may wish to continue writing.
     *
     * @type {!BrowserActionButtonState}
     * @const
     */
    userHasNoteToContinueWriting: {
      // Provide an indication that clicking the icon will allow the user to
      // continue writing a note they recently wished to continue writing.
      title: "Click here to continue writing your note.",

      // Use the icon badge to signal to the user that they have a note they
      // may wish to continue writing here.
      badgeText: "Note",
      badgeBackgroundColor: "green"
    }
  };

  /**
   * These notification parameter sets represent all possible Chrome
   * notifications that this extension can display to the user.
   *
   * @type {!Object}
   * @const
   */
  var chromeNotifications_ = {

    /**
     * The notification to inform the user that they should sign in.
     *
     * @type {!ChromeNotificationParameterSet}
     * @const
     */
    userShouldSignIn: {
      id: "userShouldSignIn",
      title: "Sign In Required",
      message: "Please sign in to use the Continote extension.",
      buttons: [
        { title: "Sign In" }
      ],
      handleButtonClicked: function(buttonIndex) {
        switch (buttonIndex) {

          // Sign in button clicked.
          case 0:
            authHelper_.presentSignInPopup().catch(function(error) {
              switch (error) {
                case authHelper_.errorMessages.userAlreadySignedIn:
                  // Do nothing, as the user is already signed in.
                  break;

                default:
                  console.error("Error during sign in: " + error);
              }
            });
            break;

          // Unknown button clicked.
          default:
            console.error("Unknown button " + buttonIndex + " clicked");
        }
      }
    },

    /**
     * The notification to inform the user that they have a note they may wish
     * to continue writing.
     *
     * @type {!ChromeNotificationParameterSet}
     * @const
     */
    userHasNoteToContinueWriting: {
      id: "userHasNoteToContinueWriting",
      title: "Continue Writing Your Note",
      message: "Would you like to continue writing your note?",
      buttons: [
        { title: "Open Note" },
        { title: "Dismiss" }
      ],
      handleButtonClicked: function(buttonIndex) {
        switch (buttonIndex) {

          // Open note button clicked.
          case 0:
            FirebaseContinue.getInstanceFor(Constants.appName)
                .then(function(firebaseContinueInstance) {
                  return firebaseContinueInstance.continueLatestActivity();
                })
                .catch(function(error) {
                  console.error(
                      "Error opening note to continue writing instance: " +
                      error);
                });
            break;

          // Dismiss note button clicked.
          case 1:
            FirebaseContinue.getInstanceFor(Constants.appName)
                .then(function(firebaseContinueInstance) {
                  return firebaseContinueInstance.dismissLatestActivity();
                })
                .catch(function(error) {
                  console.error(
                      "Error dismissing note to continue writing: " + error);
                });
            break;

          // Unknown button clicked.
          default:
            console.error("Unknown button " + buttonIndex + " clicked");
        }
      }
    }
  };

  /**
   * Applies the provided state to the browser action icon button for this
   * extension in Chrome's UI.
   *
   * @function
   * @param {!BrowserActionButtonState} state
   * @const
   */
  var applyBrowserActionButtonState_ = function(state) {
    chrome.browserAction.setTitle({ title: state.title });
    chrome.browserAction.setBadgeText({ text: state.badgeText });
    chrome.browserAction.setBadgeBackgroundColor({
      color: state.badgeBackgroundColor });
  };

  /**
   * Creates and displays a Chrome notification from the supplied parameters.
   *
   * To learn about the Chrome Notifications API, see:
   * https://developer.chrome.com/extensions/richNotifications
   *
   * @function
   * @param {!ChromeNotificationParameterSet} withParameters
   * @const
   */
  var displayChromeNotification_ = function(withParameters) {
    // See: https://developer.chrome.com/apps/notifications#type-NotificationOptions
    var notificationOptions = {
      // Default values which are the same for all notifications.
      type: "basic",
      iconUrl: "images/icons/icon-128.png",

      // Specific to this notification.
      title: withParameters.title,
      message: withParameters.message
    };

    if (withParameters.buttons) {
      notificationOptions.buttons = withParameters.buttons;
    }

    chrome.notifications.create(
      // If a notification with this same id is already displayed, it will
      // be overridden by this new notification. This reduces UI clutter.
      withParameters.id,
      notificationOptions,
      function(notificationId) {
        // This callback is required before Chrome 42.
        // Do nothing here, since we set the notificationId ourselves above.
        // See: https://developer.chrome.com/extensions/notifications#method-create
      }
    );
  };

  /**
   * Clears the provided Chrome notification if it is currently displayed.
   *
   * @function
   * @param {!ChromeNotificationParameterSet} withParameters
   * @const
   */
  var clearChromeNotification_ = function(withParameters) {
    chrome.notifications.clear(
        withParameters.id,
        function(wasCleared) {
          // This callback is required before Chrome 42. Do nothing here.
          // See: https://developer.chrome.com/extensions/notifications#method-clear
        });
  };

  /**
   * Clears all Chrome notifications displayed by this extension.
   *
   * @function
   * @const
   */
  var clearAllChromeNotifications_ = function() {
    // Iterate through all possible notifications which could be displayed
    // by this extension, and clear them. If the notification is not currently
    // displayed, clear will do nothing.
    for (var notification in chromeNotifications_) {
      if (chromeNotifications_.hasOwnProperty(notification)) {
        clearChromeNotification_(chromeNotifications_[notification]);
      }
    }
  };

  /**
   * Handles when the user has an Activity they may wish to continue,
   * according to the Firebase Continue library.
   *
   * In the case of Continote, that means the user may wish to continue writing
   * a note.
   *
   * @function
   * @const
   */
  var handleUserHasNoteToContinueWriting_ = function() {
    // Update the action button.
    applyBrowserActionButtonState_(
        browserActionStates_.userHasNoteToContinueWriting);

    // Notify the user that they have a note to continue writing.
    // TODO: Provide options directly on this notification to continue or
    // dismiss the Activity directly from the notification.
    displayChromeNotification_(
        chromeNotifications_.userHasNoteToContinueWriting);
  };

  /**
   * Handles when the user has no Activity they may wish to continue,
   * according to the Firebase Continue library.
   *
   * In the case of Continote, that means the user has no note they may wish to
   * continue writing.
   *
   * @function
   * @param {?firebase.User} user - If the user is null,
   * then the current user is not signed in (and thus will trivially have no
   * note to continue writing).
   * @const
   */
  var handleUserHasNoNoteToContinueWriting_ = function(user) {
    // Clear any possible notifications that could no longer be relevant.
    clearChromeNotification_(chromeNotifications_.userHasNoteToContinueWriting);

    // Clear the action button (in case it previously indicated that the user
    // had a note to continue writing).
    applyBrowserActionButtonState_(user ?
        browserActionStates_.userSignedInDefault :
        browserActionStates_.userSignedOutDefault);
  };

  /**
   * Handles when the most recent Activity the user may wish to continue changes
   * (i.e. is either set to an actual value, or null).
   *
   * This is also invoked right away by Firebase Continue with the
   * most recent Activity when the handler is registered.
   *
   * @type {!FirebaseContinue.ActivityChangedCallback}
   * @const
   */
  var handleUserNoteToContinueWritingChanged_ = function(user, activity) {
    // If the activity is non-null, the user may wish to continue writing a
    // note. Otherwise, the user has no note they may wish to continue writing.
    activity ? handleUserHasNoteToContinueWriting_() :
               handleUserHasNoNoteToContinueWriting_(user);
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
    // Clear any possible notifications that could no longer be relevant.
    clearChromeNotification_(chromeNotifications_.userShouldSignIn);

    // Update the action button to show that the user is signed in.
    applyBrowserActionButtonState_(browserActionStates_.userSignedInDefault);
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
    // Clear all possible Chrome notifications.
    clearAllChromeNotifications_();

    // Update the action button to show that the user is signed out.
    applyBrowserActionButtonState_(browserActionStates_.userSignedOutDefault);

    // Notify the user that they should sign in.
    // TODO: Provide a button directly on this notification to sign in.
    displayChromeNotification_(chromeNotifications_.userShouldSignIn);
  };

  /**
   * Handles when the user clicks a button in any Chrome notification displayed
   * by this extension.
   *
   * See: https://developer.chrome.com/apps/notifications#event-onButtonClicked
   *
   * @function
   * @param {!string} notificationId
   * @param {!number} buttonIndex
   * @const
   */
  var handleChromeNotificationButtonClicked_ = function(notificationId,
                                                        buttonIndex) {
    if (chromeNotifications_.hasOwnProperty(notificationId)) {
      var notification = chromeNotifications_[notificationId];
      if (notification.handleButtonClicked) {
        // Invoke the button clicked callback for the specific notification.
        notification.handleButtonClicked(buttonIndex);
      }
    }
  };

  /**
   * Initializes this extension's background processor.
   *
   * This is the main entry point of this background script.
   *
   * @function
   * @const
   */
  var init_ = function() {
    // Register to handle all Chrome notification button clicks.
    chrome.notifications.onButtonClicked.addListener(
        handleChromeNotificationButtonClicked_);

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

  // When the extension is ready, call the init function.
  window.addEventListener("load", init_);
})();

// Below are extra JSDoc definitions to describe the objects and
// callback functions this script uses.

/**
 * A state describing how the browser action icon button should look.
 *
 * @typedef {Object} BrowserActionButtonState
 * @property {!string} title
 * @property {!string} badgeText
 * @property {!string} badgeBackgroundColor
 */

/**
 * A set of parameters used to create (thus display) a Chrome notification.
 *
 * @typedef {Object} ChromeNotificationParameterSet
 * @property {!string} id
 * @property {!string} title
 * @property {!string} message
 * @property {?Array.<Object>} buttons - See the "buttons" property of Chrome
 * notification options at:
 * https://developer.chrome.com/apps/notifications#type-NotificationOptions
 * @property {?ChromeNotificationButtonClicked} handleButtonClicked
 */

/**
 * This callback is only invoked when the user clicks a button within a
 * Chrome notification.
 *
 * @callback ChromeNotificationButtonClicked
 * @param {!number} buttonIndex - The index of the button that was clicked, in
 * the context of the notification's "buttons" array.
 */
