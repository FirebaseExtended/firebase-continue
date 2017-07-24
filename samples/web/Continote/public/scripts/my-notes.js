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
 * This script is loaded and running whenever the my-notes.html page is open.
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
   * Firebase Realtime Database reference for the current user's Notes.
   *
   * @type {?firebase.database.Reference}
   */
  var notesRef_ = null;

  /**
   * Various UI elements which will be manipulated through the lifecycle of
   * this page. These are organized as part of an object for clarity and a
   * cleaner namespace.
   *
   * @type {!Object}
   * @const
   */
  var pageUi_ = {
    noteList: null,
    writeNewNoteButton: null
  };

  /**
   * Element template used to add a Note to the Note list.
   *
   * @type {!string}
   * @const
   */
  var noteListItemTemplate_ =
      '<li class="mdl-list__item mdl-list__item--two-line note-list-item">' +
        '<div class="mdl-list__item-primary-content">' +
          '<div class="note-title truncate-to-single-line"></div>' +
          '<div class="mdl-list__item-text-body note-content ' +
                       'truncate-to-single-line">' +
          '</div>' +
        '</div>' +
        '<div class="note-actions">' +
          '<button class="edit-note-button mdl-button mdl-button--raised ' +
                  'mdl-button--colored mdl-js-button mdl-js-ripple-effect" ' +
                  'disabled>' +
            '<i class="material-icons">edit</i>' +
            'Edit' +
          '</button>' +
          '<button class="delete-note-button mdl-button mdl-button--raised ' +
                  'mdl-button--colored mdl-js-button mdl-js-ripple-effect" ' +
                  'disabled>' +
            '<i class="material-icons">delete</i>' +
            'Delete' +
          '</button>' +
        '</div>' +
      '</li>';

  /**
   * Handles when a Note is added to the Firebase Realtime Database for the
   * current user.
   *
   * This is also invoked once per Note that was already in the database
   * at the time of this handler being registered with Firebase.
   *
   * @function
   * @param {!Object} snapshot - A snapshot of the Note from the database.
   * @const
   */
  var handleNoteAdded_ = function(snapshot) {
    // The key and current value for the Note, directly from the
    // Firebase Realtime Database.
    var noteKey = snapshot.key;
    var note = snapshot.val();

    // This will add the Note to the list (or update the Note in the list
    // if it already existed there).
    displayNoteInList_(noteKey, note);
  };

  /**
   * Handles when one of the current user's Notes changes in the Firebase
   * Realtime Database.
   *
   * @function
   * @param {!Object} snapshot - A snapshot of the Note from the database.
   * @const
   */
  var handleNoteChanged_ = function(snapshot) {
    // The key and current value for the Note, directly from the
    // Firebase Realtime Database.
    var noteKey = snapshot.key;
    var note = snapshot.val();

    // This will update the Note in the list.
    displayNoteInList_(noteKey, note);
  };

  /**
   * Handles when one of the current user's Notes changes in the Firebase
   * Realtime Database.
   *
   * @function
   * @param {!Object} snapshot - A snapshot of the Note from the database.
   * @const
   */
  var handleNoteRemoved_ = function(snapshot) {
    // The key of the Note that was removed, directly from the
    // Firebase Realtime Database.
    var noteKey = snapshot.key;

    // Remove the Note from the list since it was removed from the database.
    removeNoteFromList_(noteKey);
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
        pageUi_.writeNewNoteButton, handleWriteNewNoteButtonClicked_);

    // Start listening for Note-related events for the current user in the
    // Firebase Realtime Database.
    notesRef_ = firebase.database().ref("notes/" + user.uid);
    notesRef_.on("child_added", handleNoteAdded_);
    notesRef_.on("child_changed", handleNoteChanged_);
    notesRef_.on("child_removed", handleNoteRemoved_);
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
        pageUi_.writeNewNoteButton, handleWriteNewNoteButtonClicked_);
    pageUi_.noteList.innerHTML = "";

    // Stop listening for Note-related events in the Firebase Realtime
    // Database, since the user is signed out.
    if (notesRef_) {
      notesRef_.off("child_added", handleNoteAdded_);
      notesRef_.off("child_changed", handleNoteChanged_);
      notesRef_.off("child_removed", handleNoteRemoved_);
      notesRef_ = null;
    }
  };

  /**
   * Handles when the "write a new note" button is clicked.
   *
   * Adds a new Note to the Firebase Realtime Database for the current user,
   * then opens that Note to allow the user to being writing.
   *
   * @type {!ClickEventListener}
   * @const
   */
  var handleWriteNewNoteButtonClicked_ = function(event) {
    event.preventDefault();

    if (!notesRef_) {
      // If this occurs, it is likely because the user is not signed in.
      // However, this should never happen since we set up and tear down the
      // UI based on the user's Auth state. But, just in case.
      return;
    }

    // Add a new, empty Note to the Firebase Realtime Database for the
    // current user.
    var newNote = {
      title: "",
      content: ""
    };
    addNoteToDatabase_(newNote).then(function(noteKey) {
      // Now that the Note has been added to the database, open to edit it
      // immediately so that the user can begin writing.
      goToEditNotePageForNoteWithKey_(noteKey);
    }).catch(function(error) {
      console.error("Error during Note creation: " + error);
    });
  };

  /**
   * Adds the Note to the Firebase Realtime Database.
   *
   * @function
   * @param {!Note} note - The Note to add to the Firebase Realtime Database.
   * @returns {!Promise} - A Promise which either resolves with the key of the
   * Note in the Firebase Realtime Database, or rejects with an error message.
   * @const
   */
  var addNoteToDatabase_ = function(note) {
    return new Promise(function(resolve, reject) {
      var errorMessage = "Cannot add Note to database";

      if (!note || note.title === null || note.content === null) {
        // Invalid  Note, so do nothing.
        // This should never happen, but just in case.
        return reject(errorMessage);
      }

      if (!notesRef_) {
        // If this occurs, it is likely because the user is not signed in.
        // However, this should never happen since we set up and tear down the
        // UI based on the user's Auth state. But, just in case.
        return reject(errorMessage);
      }

      var newNoteRef = notesRef_.push();
      return newNoteRef.set(note).then(function() {
        return resolve(newNoteRef.key);
      }).catch(function(error) {
        return reject(error);
      });
    });
  };

  /**
   * Deletes the Note with the given key from the Firebase Realtime Database.
   *
   * @function
   * @param {!string} noteKey - The key of the Note from the Firebase Realtime
   * Database.
   * @returns {!Promise} - A Promise which either resolves with nothing,
   * or rejects with an error message.
   * @const
   */
  var deleteNoteFromDatabase_ = function(noteKey) {
    return new Promise(function(resolve, reject) {
      var errorMessage = "Cannot delete Note from database";

      if (!noteKey) {
        // Invalid key for Note, so do nothing.
        // This should never happen, but just in case.
        return reject(errorMessage);
      }

      if (!notesRef_) {
        // If this occurs, it is likely because the user is not signed in.
        // However, this should never happen since we set up and tear down the
        // UI based on the user's Auth state. But, just in case.
        return reject(errorMessage);
      }

      var noteRef = notesRef_.child(noteKey);
      if (!noteRef) {
        // There is no Note for the signed in user with the provided key.
        return reject(errorMessage);
      }

      // Delete the Note from the database.
      return noteRef.remove();
    });
  };

  /**
   * Opens the Edit Note page to edit the Note from the Firebase Realtime
   * Database with the given key.
   *
   * @function
   * @param {!string} noteKey - The key of the Note from the Firebase Realtime
   * Database.
   * @const
   */
  var goToEditNotePageForNoteWithKey_ = function(noteKey) {
    if (!noteKey) {
      // Invalid key for Note, so do nothing.
      // This should never happen, but just in case.
      return;
    }

    location.href = "/edit-note.html?noteKey=" + noteKey;
  };

  /**
   * Adds an element for the Note with the given key to the Note list, or
   * updates the element for the Note in the list if one was already there.
   *
   * @function
   * @param {!string} noteKey - The key of the Note from the Firebase Realtime
   * Database.
   * @param {!Note} note - The Note from the Firebase Realtime Database.
   * @const
   */
  var displayNoteInList_ = function(noteKey, note) {
    if (!noteKey) {
      // Invalid key for Note, so do nothing.
      // This should never happen, but just in case.
      return;
    }

    if (!note) {
      // Invalid Note, so do nothing.
      // This should never happen, but just in case.
      return;
    }

    // First, see if there already exists an element for the Note in the list.
    var elementInListForNote = pageUi_.noteList.querySelector("#" + noteKey);

    // If an element for the Note does not exist, create one and append it
    // to the list.
    if (!elementInListForNote) {
      elementInListForNote =
          Utils.appendElementBasedOnTemplateToContainer(
            noteListItemTemplate_, pageUi_.noteList);
      if (!elementInListForNote) {
        // No element was appended to the list for the Note, so do nothing.
        // This should never happen, but just in case.
        return;
      }

      elementInListForNote.setAttribute("id", noteKey);

      // Add click event listeners to interact with this Note.

      // Set up the Edit Note button.
      var editNoteButton =
          elementInListForNote.querySelector(".edit-note-button");
      if (editNoteButton) {
        Utils.enableButtonAndAddClickListener(editNoteButton,
            function(event) {
              event.preventDefault();

              // Go to the page to edit this Note.
              goToEditNotePageForNoteWithKey_(noteKey);
            });
      }

      // SEt up the Delete Note button.
      var deleteNoteButton =
          elementInListForNote.querySelector(".delete-note-button");
      if (deleteNoteButton) {
        Utils.enableButtonAndAddClickListener(deleteNoteButton,
            function(event) {
              event.preventDefault();

              // Delete the Note.
              deleteNoteFromDatabase_(noteKey);
            });
      }
    }

    // Now that there is an element for the Note in the list,
    // update the values in that element to match the Note.

    // Title of the Note.
    var noteTitleElement =
        elementInListForNote.querySelector(".note-title");
    Utils.putTextOrPlaceholderInElement(
        note.title, "No Title", noteTitleElement);

    // Main content of the Note.
    var noteContentElement =
        elementInListForNote.querySelector(".note-content");
    Utils.putTextOrPlaceholderInElement(
        note.content, "No Content", noteContentElement);
  };

  /**
   * Removes the element for the Note with the given key from the Note list.
   *
   * @function
   * @param {!string} noteKey - The key of the Note from the Firebase Realtime
   * Database.
   * @const
   */
  var removeNoteFromList_ = function(noteKey) {
    if (!noteKey) {
      // Invalid key for Note, so do nothing.
      // This should never happen, but just in case.
      return;
    }

    var elementInListForNote = pageUi_.noteList.querySelector("#" + noteKey);
    if (elementInListForNote) {
      elementInListForNote.remove();
    }
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
    pageUi_.noteList = document.getElementById("note-list");
    pageUi_.writeNewNoteButton = document.getElementById(
        "write-new-note-button");

    // Now that the page is ready, set up the Firebase Auth helper to listen
    // for sign in state changes, and to start FirebaseUI for a sign in UI
    // when the user is signed out.
    authHelper_ = new AuthHelper(handleUserSignedIn_, handleUserSignedOut_);
  };

  // When the page is ready, call the init function.
  window.addEventListener("load", init_);
})();
