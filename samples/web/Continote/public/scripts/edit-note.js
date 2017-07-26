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
 * This script is loaded and running whenever the edit-note.html page is open.
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
   * Firebase Realtime Database reference for the Note the user wishes to edit.
   *
   * @type {?firebase.database.Reference}
   */
  var noteRef_ = null;

  /**
   * The Firebase Realtime Database key of the Note the user wishes to edit.
   *
   * @type {?string}
   */
  var noteKey_ = null;

  /**
   * This is the class which, if applied to an element, means
   * it should only be visible when the Note to edit was found for the
   * current user.
   *
   * @type {!string}
   * @const
   */
  var showOnlyWhenNoteFoundClass_ = "show-only-when-note-found";

  /**
   * This is the class which, if applied to an element, means
   * it should only be visible when the Note to edit has not been found for the
   * current user.
   *
   * @type {!string}
   * @const
   */
  var showOnlyWhenNoteNotFoundClass_ = "show-only-when-note-not-found";

  /**
   * Various UI elements which will be manipulated through the lifecycle of
   * this page. These are organized as part of an object for clarity and a
   * cleaner namespace.
   *
   * @type {!Object}
   * @const
   */
  var pageUi_ = {
    noteTitleMaterialTextField: null,
    noteTitleInput: null,
    noteContentMaterialTextField: null,
    noteContentInput: null,
    saveNoteButton: null,
    backToMyNotesButton: null,
    snackbarContainer: null
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
    Utils.enableButtonAndAddClickListener(
        pageUi_.backToMyNotesButton, handleBackToMyNotesButtonClicked_);

    // Get the current value of the Note to edit from the Firebase Realtime
    // Database. We only get this value once here to keep things simple.
    // The Note could change elsewhere while on this page, thus saving could
    // overwrite any of those changes.
    if (noteKey_) {
      noteRef_ = firebase.database().ref("notes/" + user.uid + "/" + noteKey_);
      noteRef_.once("value").then(function(snapshot) {
        var note = snapshot.val();
        note ? handleNoteToEditFound_(note) : handleNoteToEditNotFound_();
      }).catch(function() {
        handleNoteToEditNotFound_();
      });
    }
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
        pageUi_.backToMyNotesButton, handleBackToMyNotesButtonClicked_);
    noteRef_ = null;

    // Since the user is not signed in, there is trivially no Note they could
    // be editing right now.
    handleNoteToEditNotFound_();
  };

  /**
   * Handles when the "save note" button is clicked.
   *
   * Updates the Note that is currently being edited in the Firebase Realtime
   * Database to use the values from the user's input.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleSaveNoteButtonClicked_ = function(event) {
    event.preventDefault();

    // Create a Note from the user's input.
    var noteFromUserInput = {
      title: pageUi_.noteTitleInput.value,
      content: pageUi_.noteContentInput.value
    };

    // Set the value for the Note in the Firebase Realtime Database to use
    // the Note created from the user's input.
    setNoteInDatabase_(noteFromUserInput).then(function() {
      // Notify the user that the Note was successfully saved.
      pageUi_.snackbarContainer.MaterialSnackbar.showSnackbar({
        message: "Note successfully saved!"
      });
    }).catch(function() {
      // Notify the user that the Note was not saved.
      pageUi_.snackbarContainer.MaterialSnackbar.showSnackbar({
        message: "Note could not be saved. Please try again."
      });
    });
  };

  /**
   * Handles when the "back to my notes" button is clicked.
   *
   * Sends the user to the My Notes page.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleBackToMyNotesButtonClicked_ = function(event) {
    event.preventDefault();

    // Set the browser's location to go to the My Notes page.
    window.location.href = "/my-notes.html";
  };

  /**
   * Handles when the Note the user wants to edit has been found.
   *
   * @function
   * @param {!Note} note - The Note to edit that was found.
   * @const
   */
  var handleNoteToEditFound_ = function(note) {
    // Use the Note values to prepopulate the Note editor's inputs.
    setNoteEditorInputsToUseValuesFromNote_(note);

    // The Note was found, so show and enable only the appropriate UI
    // elements.
    Utils.hideAllElementsWithClassName(showOnlyWhenNoteNotFoundClass_);
    pageUi_.noteTitleMaterialTextField.MaterialTextfield.enable();
    pageUi_.noteContentMaterialTextField.MaterialTextfield.enable();
    Utils.enableButtonAndAddClickListener(
        pageUi_.saveNoteButton, handleSaveNoteButtonClicked_);
    Utils.showAllElementsWithClassName(showOnlyWhenNoteFoundClass_);
  };

  /**
   * Handles when the Note the user wants to edit has not been found.
   *
   * @function
   * @const
   */
  var handleNoteToEditNotFound_ = function() {
    // Reset the Note editor's inputs.
    setNoteEditorInputsToUseValuesFromNote_(null);

    // The Note has not been found, so show and enable only the appropriate UI
    // elements.
    Utils.hideAllElementsWithClassName(showOnlyWhenNoteFoundClass_);
    pageUi_.noteTitleMaterialTextField.MaterialTextfield.disable();
    pageUi_.noteContentMaterialTextField.MaterialTextfield.disable();
    Utils.disableButtonAndRemoveClickListener(
        pageUi_.saveNoteButton, handleSaveNoteButtonClicked_);
    Utils.showAllElementsWithClassName(showOnlyWhenNoteNotFoundClass_);
  };

  /**
   * Sets the Note editor's input elements to use the values from the provided
   * Note.
   *
   * @function
   * @param {?Note} note - The Note to use for the Note editor's inputs.
   * @const
   */
  var setNoteEditorInputsToUseValuesFromNote_ = function(note) {
    pageUi_.noteTitleMaterialTextField.MaterialTextfield.change(
        (note && note.title) ? note.title : ""
    );
    pageUi_.noteContentMaterialTextField.MaterialTextfield.change(
        (note && note.content) ? note.content : ""
    );
  };

  /**
   * Sets the currently being edited Note in the Firebase Realtime Database to
   * the provided value.
   *
   * @function
   * @param {!Note} newNoteValue - The value of the Note to set.
   * @returns {!Promise} - A Promise which either resolves with nothing,
   * or rejects with an error message.
   * @const
   */
  var setNoteInDatabase_ = function(newNoteValue) {
    return new Promise(function(resolve, reject) {
      var defaultErrorMessage = "Could not set Note value in database";

      if (!noteRef_ || !newNoteValue ||
          newNoteValue.title === null || newNoteValue.content === null) {
        // This should never happen, but just in case.
        return reject(defaultErrorMessage);
      }

      return noteRef_.set(newNoteValue).then(function() {
        return resolve();
      }).catch(function(error) {
        return reject(error ? error : defaultErrorMessage);
      });
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
    pageUi_.noteTitleMaterialTextField =
        document.getElementById("note-title-material-textfield");
    pageUi_.noteTitleInput = document.getElementById("note-title-input");
    pageUi_.noteContentMaterialTextField =
        document.getElementById("note-content-material-textfield");
    pageUi_.noteContentInput = document.getElementById("note-content-input");
    pageUi_.saveNoteButton = document.getElementById("save-note-button");
    pageUi_.backToMyNotesButton = document.getElementById(
        "back-to-my-notes-button");
    pageUi_.snackbarContainer = document.getElementById("snackbar-container");

    // Get the key of the Note that the user wishes to edit.
    // This is not robust at all, but it is sufficient for this sample web app.
    var urlSplitToGetNoteKey =
        window.location.href.split("/edit-note.html?noteKey=");
    noteKey_ =
        (urlSplitToGetNoteKey.length === 2) ? urlSplitToGetNoteKey[1] : null;

    // Now that the page is ready, set up the Firebase Auth helper to listen
    // for sign in state changes, and to start FirebaseUI for a sign in UI
    // when the user is signed out.
    authHelper_ = new AuthHelper(handleUserSignedIn_, handleUserSignedOut_);
  };

  // When the page is ready, call the init function.
  window.addEventListener("load", init_);
})();
