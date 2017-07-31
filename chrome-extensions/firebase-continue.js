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
 * The Firebase Continue for Chrome Extensions library.
 *
 * Firebase Continue enables mobile developers to easily integrate activity
 * transitioning from their mobile apps to the web by way of Chrome extensions.
 * For more details, see: https://github.com/firebase/firebase-continue.
 *
 * This wrapper object, and the inner FirebaseContinueInstance class,
 * encapsulate all Firebase Continue functionality available to Chrome
 * extensions.
 *
 * Since one Firebase project could logically be used for multiple applications,
 * this wrapper allows simultaneous use of Firebase Continue for one or more of
 * those applications within a single Chrome extension.
 *
 * This wrapper also ensures at most one Firebase Continue instance is used
 * per application (within a single Chrome extension), and stores variables
 * and functions relevant to all such instances.
 *
 * In most cases, such as the case for the Continote samples, a Firebase project
 * is used for a single application (i.e. Continote), so only one instance is
 * ever used (i.e. the instance for Continote).
 *
 * As an example of the multiple application use case, consider if a developer
 * were to use a single Firebase project for multiple applications
 * (ex. SomeEmailApp and SomeVideoApp). The developer could then release
 * a single Chrome extension which would allow users to continue Activities
 * across all such applications (ex. continue writing an email or watching
 * a video).
 *
 * Please see the usage instructions in the relevant README file(s).
 * There is also more specific documentation within the library itself below.
 *
 * TODO: Implement checks to ensure the Firebase, Firebase Auth, and Firebase
 * Realtime Database SDKs are included.
 *
 * TODO: Add unit tests, including tests while the app/Firebase is offline.
 *
 * @type {!Object}
 * @const
 */
var FirebaseContinue = (function() {
  'use strict';

  /**
   * Stores all Firebase Continue instances in an associative array-like
   * object with application name as the key and the Firebase Continue instance
   * for said application as the value.
   *
   * ex. firebaseContinueInstances_["continote"] would hold the Firebase
   * Continue instance for the Continote application.
   *
   * @type {!Object}
   * @const
   */
  var firebaseContinueInstances_ = {};

  /**
   * The value, in milliseconds, that the Firebase Realtime Database client
   * adds to the local client time to estimate the server time.
   *
   * This is useful to determine the freshness/staleness of an Activity,
   * where freshness/staleness is determined by how recently the user wished to
   * continue the Activity.
   *
   * It is updated using a Firebase Realtime Database callback below.
   *
   * @type {!number}
   */
  var estimatedServerTimeOffsetInMs_ = 0; // Default to 0 until this is updated.

  /**
   * If an Activity was added to Firebase for the current user more than this
   * value milliseconds ago, it is considered stale (i.e. too old to be
   * relevant).
   *
   * TODO: Make this a configurable value (with instructions to ensure this
   * value is the same in all libraries and database rules) so that applications
   * can decide when exactly Activities should be considered stale.
   *
   * @type {!number}
   * @const
   */
  var maximumTimeDeltaForFreshnessInMs_ =  5 * 60 * 1000; // 5 minutes.

  /**
   * The time in milliseconds between periodic checks to see if the latest
   * cached Activity should be considered stale.
   *
   * TODO: Make this a configurable value so that applications
   * can decide how often to check for the locally cached Activity being stale.
   *
   * @type {!number}
   * @const
   */
  var timeBetweenCachedActivityStalenessChecksInMs_ =  60 * 1000; // 1 minute.

  /**
   * Determines if the given Activity is stale or not.
   * A null activity is defined to not be stale.
   *
   * @function
   * @param {?FirebaseContinue.Activity} activity
   * @returns {!boolean}
   * @const
   */
  var isActivityStale_ = function(activity) {
    // A null Activity is not stale.
    if (!activity) {
      return false;
    }

    // An Activity always has metadata with addedAt set, but just in case,
    // immediately return that the Activity is stale if either is unset.
    if (!activity.metadata || !activity.metadata.addedAt) {
      return true;
    }

    // Estimate the current Firebase Realtime Database server time,
    // then compare that with the Activity's addedAt timestamp to determine
    // how recent the user wished to continue the Activity (thus allowing
    // us to answer whether or not the Activity is stale).
    var clientTime = (new Date()).getTime();
    var estimatedServerTimeInMs = clientTime + estimatedServerTimeOffsetInMs_;
    var staleBefore =
        estimatedServerTimeInMs - maximumTimeDeltaForFreshnessInMs_;
    return activity.metadata.addedAt < staleBefore;
  };

  /**
   * Returns a deep copy of the provided Activity.
   *
   * Copying an Activity is useful when providing callbacks with the most
   * recent Activity the user wishes to continue within an application, because
   * Activities are considered immutable.
   *
   * @function
   * @param {?FirebaseContinue.Activity} activity
   * @returns {?FirebaseContinue.Activity}
   * @const
   */
  var copyOfActivity_ = function(activity) {
    // If the Activity is null, return null.
    if (!activity) {
      return null;
    }

    // Otherwise, we create a copy of the Activity object and return that.
    return {
      url: activity.url,
      metadata: {
        // An Activity always has metadata with addedAt set, but just in case,
        // use a default value of null - since a null timestamp would trigger
        // an error in Firebase if an attempt to save the Activity there was
        // made.
        addedAt: !activity.metadata || !activity.metadata.addedAt ?
                   null : activity.metadata.addedAt
      }
    };
  };

  /**
   * Returns true iff both Activities are equal (i.e. either both are null,
   * or their property values are equal), false otherwise.
   *
   * @function
   * @param {?FirebaseContinue.Activity} firstActivity
   * @param {?FirebaseContinue.Activity} secondActivity
   * @returns {!boolean}
   * @const
   */
  var areActivitiesEqual_ = function(firstActivity, secondActivity) {
    // First, we can easily check if both Activities are either null, or point
    // to the same Activity.
    if (firstActivity === secondActivity) {
      return true;
    }

    // If either Activity is null, at this point we know they must not be equal.
    if (!firstActivity || !secondActivity) {
      return false;
    }

    // If the URL properties are not equal, the Activities are not equal.
    if (firstActivity.url !== secondActivity.url) {
      return false;
    }

    // Next, we can easily check if both Activity metadata properties are
    // either null, or point to the same Activity metadata.
    if (firstActivity.metadata === secondActivity.metadata) {
      return true;
    }

    // If either Activity metadata property is null, at this point we know they
    // must not be equal, therefore the Activities must not be equal.
    if (!firstActivity.metadata || !secondActivity.metadata) {
      return false;
    }

    // If the metadata properties are not equal, the Activities are not equal.
    if (firstActivity.metadata.addedAt !== secondActivity.metadata.addedAt) {
      return false;
    }

    // Finally, we know the Activities must be equal if we are here.
    return true;
  };

  /**
   * An instance of Firebase Continue for use with a specific application.
   * Each instance handles authentication state changes, including
   * only listening for Firebase Realtime Database updates for the current
   * signed in user.
   *
   * TODO: Add unit tests.
   *
   * @constructor
   * @param {!string} applicationName - Firebase Continue can work
   * with Firebase projects that are used for multiple separate applications,
   * so the library must be provided the name of the application this instance
   * will be used for. For example, if you have a Firebase project that you
   * use for two separate applications "SomeNewsApp" and "ADifferentSportsApp",
   * and you are integrating Firebase Continue into "SomeNewsApp", you could use
   * "somenewsapp" as the application name for a Firebase Continue instance.
   * Please follow the setup READMEs to ensure the name you use here matches
   * the name defined in the Firebase Realtime Database rules.
   */
  var FirebaseContinueInstance_ = function(applicationName) {

    /**
     * The latest Activity for the current user (as cached from the Firebase
     * Realtime Database).
     *
     * A copy of this will be passed to callbacks when this value changes.
     *
     * @type {?FirebaseContinue.Activity}
     */
    var latestCachedActivity_ = null;

    /**
     * Identifies the timer created by the call to setInterval() for
     * periodically checking if the latest cached Activity is stale.
     *
     * If non-null, this can be passed to clearInterval() to cancel the periodic
     * checking.
     *
     * @type {?number}
     */
    var checkLatestCachedActivityStalenessInterval_ = null;

    /**
     * Keep a reference to the current user object, for whom this Firebase
     * Continue instance is currently configured for.
     *
     * This is kept up to date in the auth state changed handler below.
     *
     * @type {?firebase.User}
     */
    var currentUser_ = null;

    /**
     * Firebase Realtime Database reference for the current user's Firebase
     * Continue data within this application.
     *
     * @type {?firebase.database.Reference}
     */
    var mostRecentActivityRef_ = null;

    /**
     * All currently registered callbacks.
     *
     * @type {!FirebaseContinue.ActivityChangedCallback[]}
     * @const
     */
    var callbacks_ = [];

    /**
     * Updates the latest cached Activity and invokes all callbacks,
     * if it differs from the provided Activity.
     *
     * @function
     * @param {?FirebaseContinue.Activity} activity
     * @const
     */
    var updateLatestCachedActivityTo_ = function(activity) {
      if (!areActivitiesEqual_(latestCachedActivity_, activity)) {
        // Update the cache.
        latestCachedActivity_ = activity;

        // Provide all ActivityChangedCallbacks with the new cached Activity.
        invokeAllCallbacks_();

        // If it is non-null, periodically check if the latest cached Activity
        // is stale. Otherwise, stop the periodic checking.
        if (latestCachedActivity_) {
          if (!checkLatestCachedActivityStalenessInterval_) {
            checkLatestCachedActivityStalenessInterval_ =
                setInterval(
                    checkIfLatestCachedActivityIsNowStale_,
                    timeBetweenCachedActivityStalenessChecksInMs_);
          }
        } else {
          if (checkLatestCachedActivityStalenessInterval_) {
            clearInterval(checkLatestCachedActivityStalenessInterval_);
            checkLatestCachedActivityStalenessInterval_ = null;
          }
        }
      }
    };

    /**
     * Checks if the latest cached Activity for the current user is stale.
     *
     * Since stale Activities are cleared locally and ignored/deleted in the
     * Firebase Realtime Database, if this function detects that the locally
     * cached Activity is stale, it must have previously not been stale,
     * therefore we can clear it locally and delete it from Firebase.
     *
     * @function
     * @const
     */
    var checkIfLatestCachedActivityIsNowStale_ = function() {
      if (isActivityStale_(latestCachedActivity_)) {
        deleteActivityLocallyAndFromFirebaseIfEqualTo_(latestCachedActivity_);
      }
    };

    /**
     * Invokes the provided callback with the most recent Activity the user
     * wishes to continue.
     *
     * @function
     * @param {!FirebaseContinue.ActivityChangedCallback} callback
     * @const
     */
    var invokeCallback_ = function(callback) {
      callback(currentUser_, copyOfActivity_(latestCachedActivity_));
    };

    /**
     * Invokes all registered callbacks with the most recent Activity the user
     * wishes to continue.
     *
     * @function
     * @const
     */
    var invokeAllCallbacks_ = function() {
      for (var i = 0, numCallbacks = callbacks_.length; i < numCallbacks; i++) {
        invokeCallback_(callbacks_[i]);
      }
    };

    /**
     * Clears/deletes the local cache for the latest Activity the user may
     * have wished to continue.
     *
     * This will fire callbacks if the cache previously had a non-null value.
     *
     * @function
     * @const
     */
    var clearLatestActivityCache_ = function() {
      updateLatestCachedActivityTo_(null);
    };

    /**
     * Deletes the provided Activity both locally (i.e. from the local cache)
     * and from the Firebase Realtime Database.
     *
     * @function
     * @param {!FirebaseContinue.Activity} activity
     * @returns {!Promise} - A Promise which either resolves with nothing,
     * or rejects with an error message.
     * @const
     */
    var deleteActivityLocallyAndFromFirebaseIfEqualTo_ = function(activity) {
      // Copy the provided Activity right now since the caller could modify it.
      var copyOfActivity = copyOfActivity_(activity);
      return new Promise(function(resolve, reject) {
        // First, ensure the provided Activity is non-null.
        if (!copyOfActivity) {
          return reject(public_.errorMessages.activityMustBeNonNull);
        }

        // Clear the locally cached Activity if it equals the provided Activity.
        if (areActivitiesEqual_(latestCachedActivity_, copyOfActivity)) {
          clearLatestActivityCache_();
        }

        // Delete the Activity for the user from the Firebase Realtime Database
        // if the Activity in the database is equal to it.
        if (mostRecentActivityRef_) {
          mostRecentActivityRef_.once("value", function(snapshot) {
            if (areActivitiesEqual_(snapshot.val(), copyOfActivity)) {
              mostRecentActivityRef_.remove();
            }
          });
        }

        // Resolve right away, rather than waiting for the Activity to
        // be deleted from Firebase, since we do not depend on the Firebase
        // database being perfectly up to date.
        return resolve();
      });
    };

    /**
     * Handles when the Firebase Continue data for the current user changes
     * for this application.
     *
     * This is also invoked right away by Firebase with the data when the
     * handler is registered.
     *
     * @function
     * @param {!Object} snapshot - A snapshot of the data for the current user.
     * @const
     */
    var handleMostRecentActivityChanged_ = function(snapshot) {
      // The current value for the Activity to continue for the current
      // user, directly from the Firebase Realtime Database.
      var firebaseDatabaseActivityValue = snapshot.val();
      var latestActivityInFirebaseDatabaseIsStale =
          isActivityStale_(firebaseDatabaseActivityValue);

      // The value we will set for the cached version of the Activity the
      // user may wish to continue.
      // This is to compare with the previous cached value, to know if we
      // should invoke all of the callbacks which are listening for changes.
      // If the Activity in the Firebase Realtime Database is stale, we set
      // the local cache to null since the most recent Activity is no longer
      // relevant.
      var newValueForCachedActivity = !latestActivityInFirebaseDatabaseIsStale ?
            copyOfActivity_(firebaseDatabaseActivityValue) : null;

      updateLatestCachedActivityTo_(newValueForCachedActivity);

      // Finally, as a bit of cleanup, if the Activity stored in the
      // Firebase Realtime Database is stale we can try to delete it.
      if (latestActivityInFirebaseDatabaseIsStale) {
        deleteActivityLocallyAndFromFirebaseIfEqualTo_(
            firebaseDatabaseActivityValue);
      }
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
      // Keep track of the current user object for when callbacks are invoked.
      currentUser_ = user;

      if (currentUser_) {
        // The current user is signed in, so listen for Firebase Continue
        // related events within the Firebase Realtime Database.

        // Firebase Realtime Database reference for this user's Firebase
        // Continue data within this application.
        mostRecentActivityRef_ = firebase.database().ref(
            "firebaseContinue/" + applicationName + "/" + currentUser_.uid);

        // Listen for updates to this user's Firebase Continue data for this
        // application.
        mostRecentActivityRef_.on("value", handleMostRecentActivityChanged_);
      } else {
        // The current user is not signed in, so stop listening for Firebase
        // Continue related events within the Firebase Realtime Database.

        if (mostRecentActivityRef_) {
          mostRecentActivityRef_.off("value", handleMostRecentActivityChanged_);
          mostRecentActivityRef_ = null;
        }

        // The user is no longer signed in, so clear the local cache (in turn
        // invoking all callbacks if the cache previously had a value).
        clearLatestActivityCache_();
      }
    };

    /**
     * Registers a callback for ActivityChanged events, if the callback is not
     * already registered.
     *
     * Please see the documentation for FirebaseContinue.ActivityChangedCallback
     * for more information about these events.
     *
     * Note: the callback will also be invoked right after registration
     * with the most recent Activity the user may wish to continue
     * (which, again, could be null - meaning there is no relevant Activity
     * the user may wish to continue at the time of registration).
     *
     * @function
     * @param {!FirebaseContinue.ActivityChangedCallback} callback
     * @returns {?FirebaseContinue.ActivityChangedCallbackHandle} - Returns a
     * callback remover object, or null if the callback is already registered.
     * @const
     */
    this.onActivityChanged = function(callback) {
      // If the callback is already registered, do nothing.
      if (callbacks_.indexOf(callback) !== -1) {
        return null;
      }

      // Now that we know the callback isn't already registered, register it.
      callbacks_.push(callback);

      // Immediately invoke the callback.
      invokeCallback_(callback);

      return {

        /**
         * Removes the callback if it is currently registered.
         *
         * @function
         * @const
         */
        remove: function() {
          var indexOfCallback = callbacks_.indexOf(callback);

          // If the callback is found within the callbacks array, remove it.
          if (indexOfCallback !== -1) {
            callbacks_.splice(indexOfCallback, 1);
          }
        }
      }
    };

    /**
     * Continues the latest Activity for the current user, where "continuing"
     * essentially means opening the Activity's URL in a new tab, and then
     * deleting the Activity both locally and from Firebase since it would no
     * longer be relevant.
     *
     * @function
     * @returns {!Promise} - A Promise which either resolves with nothing, or
     * rejects with an error message.
     * @const
     */
    this.continueLatestActivity = function() {
      var copyOfActivity = copyOfActivity_(latestCachedActivity_);
      return new Promise(function(resolve, reject) {
        // First, ensure the latest Activity is non-null.
        if (!copyOfActivity) {
          return reject(public_.errorMessages.activityMustBeNonNull);
        }

        // Open the URL for the Activity so that the user can continue what
        // they wished to do.
        chrome.tabs.create({ url: copyOfActivity.url });

        return resolve();
      }).then(function() {
        // Delete the Activity locally and from Firebase now that is has been
        // continued.
        return deleteActivityLocallyAndFromFirebaseIfEqualTo_(copyOfActivity);
      });
    };

    /**
     * Dismisses the latest Activity for the current user, where "dismissing"
     * essentially means deleting the Activity both locally and from Firebase
     * since it is no longer relevant.
     *
     * @function
     * @returns {!Promise} - A Promise which either resolves with nothing, or
     * rejects with an error message.
     * @const
     */
    this.dismissLatestActivity = function() {
      var copyOfActivity = copyOfActivity_(latestCachedActivity_);
      return new Promise(function(resolve, reject) {
        // First, ensure the latest Activity is non-null.
        if (!copyOfActivity) {
          return reject(public_.errorMessages.activityMustBeNonNull);
        }

        return resolve();
      }).then(function() {
        // Delete the Activity locally and from Firebase to dismiss it.
        return deleteActivityLocallyAndFromFirebaseIfEqualTo_(copyOfActivity);
      });
    };

    // Finally, finish initializing this instance.
    (function() {
      // Listen for Firebase Auth state changes.
      firebase.auth().onAuthStateChanged(handleAuthStateChanged_);
    })();
  };

  // Finally, finish initializing this wrapper object before returning a public
  // facing version of it, including setting up Firebase Realtime
  // Database listeners.
  (function() {
    // Get an estimated offset to adjust client time to Firebase Realtime
    // Database server time when checking for how recent the user
    // wished to continue an Activity.
    // See:  https://firebase.google.com/docs/database/web/offline-capabilities#clock-skew
    firebase.database().ref(".info/serverTimeOffset").on("value",
        function(snapshot) {
          estimatedServerTimeOffsetInMs_ =
              snapshot.val() || estimatedServerTimeOffsetInMs_;
        });
  })();

  // This object will be returned to expose all public variables and
  // methods for this Firebase Continue wrapper.
  var public_ = {

    /**
     * Gets the Firebase Continue instance for the provided application.
     *
     * @function
     * @param {!string} applicationName - This should be an application
     * name that was included in the Firebase Realtime Database rules section
     * of the Firebase Continue setup process.
     * @returns {!Promise} - A Promise that resolves with the instance, or
     * rejects with an error.
     * @const
     */
    getInstanceFor: function(applicationName) {
      return new Promise(function(resolve, reject) {
        // First, ensure the provided application name could be valid.
        // Note: We will not know if the application name is actually permitted
        // in the Firebase Realtime Database rules for Firebase Continue
        // (as outlined in the README setup guide) until the user is signed in
        // and the Firebase Continue instance tries reading from the relevant
        // location in the Firebase Realtime Database.
        if (!applicationName || applicationName.length === 0) {
          return reject(public_.errorMessages.invalidApplicationName);
        }

        // Resolve with the existing instance for the application if one exists.
        // Otherwise, create and resolve with a new instance.
        var existingInstance = firebaseContinueInstances_[applicationName];
        if (existingInstance) {
          return resolve(existingInstance);
        } else {
          // Create and store a new instance since one did not exist
          // for this application.
          var newInstance = new FirebaseContinueInstance_(applicationName);
          firebaseContinueInstances_[applicationName] = newInstance;

          // Return the new, stored instance.
          return resolve(newInstance);
        }
      });
    },

    /**
     * These are error messages that can be thrown as a direct result
     * Firebase Continue usage (via a Promise rejection).
     *
     * They may be useful to react to specific errors when using Firebase
     * Continue.
     *
     * @type {!Object}
     * @const
     */
    errorMessages: {
      invalidApplicationName: "Invalid application name",
      activityMustBeNonNull: "Activity must be non-null"
    }
  };
  return public_;
}());

// Below are extra JSDoc definitions to describe the objects and
// callback functions this Firebase Continue library expects.

/**
 * An Activity the user may wish to continue doing,
 * as defined in the Firebase Realtime Database.
 *
 * An Activity is considered immutable, both on the client-side and
 * within the Firebase Realtime Database.
 *
 * It has a URL linking to something that the user may wish to
 * continue doing. "Continuing" the Activity, then, essentially means
 * opening that link.
 *
 * Important Reminder: To allow the user to continue an Activity, please use
 * the provided "continueLatestActivity" method, rather than opening the URL
 * directly, so that Firebase Continue can guarantee correct functionality.
 *
 * The schema defined for each Activity
 * in sample-firebase-continue-database.rules.json
 * should always match this type definition.
 *
 * @typedef {Object} FirebaseContinue.Activity
 * @property {!string} url - If opened, this URL should allow the user
 * to continue what they were doing (i.e. their most recent "Activity" in the
 * application that they may wish to continue doing).
 * @property {!FirebaseContinue.ActivityMetadata} metadata
 */

/**
 * The metadata associated with an Activity,
 * as defined in the Firebase Realtime Database.
 *
 * The schema defined for each Activity Metadata
 * in sample-firebase-continue-database.rules.json
 * should always match this type definition.
 *
 * @typedef {Object} FirebaseContinue.ActivityMetadata
 * @property {!number} addedAt - When the Activity was added to Firebase.
 */

/**
 * This callback is only invoked when it is first registered with Firebase
 * Continue, and when the most recent Activity the user may wish to continue
 * changes (i.e. is set to an actual value, or is set to nothing/null).
 *
 * @callback FirebaseContinue.ActivityChangedCallback
 * @param {?firebase.User} user - The user for which this ActivityChanged event
 * is relevant to, or null if the user is signed out.
 * @param {?FirebaseContinue.Activity} activity - The Activity the user wishes
 * to continue, or null if there is no such Activity. If this is non-null, then
 * the user parameter is guaranteed to be non-null as well.
 */

/**
 * When an Activity changed callback is registered with Firebase Continue
 * this is returned so that the callee can remove the callback if desired.
 *
 * @typedef {Object} FirebaseContinue.ActivityChangedCallbackHandle
 * @property {!Function} remove - Removes the callback.
 */
