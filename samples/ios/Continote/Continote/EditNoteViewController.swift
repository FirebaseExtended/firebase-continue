//
//  Copyright (c) 2017 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

import UIKit
import Firebase
import MaterialComponents.MDCRaisedButton
import MaterialComponents.MaterialSnackbar
import MaterialComponents.MaterialTextFields

/**
 The ViewController that presents the user with a Note editor to edit a specific Note, if
 said Note is found for the user.
 */
class EditNoteViewController: BaseViewController {

  // The key from the Firebase Realtime Database of the Note the user wants to edit.
  // The Note the user wants to edit will be gathered from the Firebase Realtime Database once the
  // user is confirmed to be signed in below. This is gathered separately on this screen,
  // rather than passed from MyNotesViewController, to ensure the user is presented with the
  // latest value for the Note (at the time of opening this screen).
  var databaseKey: String!

  // Firebase Realtime Database reference for the current user's Note to edit, based on the key.
  private var databaseRef: DatabaseReference?

  // UI elements
  @IBOutlet var noteNotFoundUiContainer: UIView!
  @IBOutlet var noteNotFoundMessageLabel: UILabel!
  @IBOutlet var noteFoundUiContainer: UIView!
  @IBOutlet var noteTitleTextField: MDCTextField!
  var noteContentMultilineTextField: MDCMultilineTextField!
  @IBOutlet var saveButton: MDCRaisedButton!
  @IBOutlet var continueWritingButton: MDCRaisedButton!

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar title.
    title = Constants.Text.screenTitle

    // Style all labels.
    noteNotFoundMessageLabel.applyAppTheme(for: .normalText)

    // Set up the title text input.
    noteTitleTextField.applyAppTheme()
    noteTitleTextField.placeholder = Constants.Text.InputPlaceholder.title

    // Style all buttons.
    saveButton.applyAppTheme()
    continueWritingButton.applyAppTheme()

    // Create the main content multiline text input.
    // This could be improved by allowing the input to expand up to a maximum height, but for the
    // sake of simplicity the height is kept static based on the minimumLines property.
    noteContentMultilineTextField = MDCMultilineTextField()
    noteContentMultilineTextField.applyAppTheme()
    noteContentMultilineTextField.placeholder = Constants.Text.InputPlaceholder.content
    noteContentMultilineTextField.clearButtonMode = .never
    noteContentMultilineTextField.minimumLines = 7
    noteContentMultilineTextField.expandsOnOverflow = false

    // Add the main content text input to the screen.
    noteFoundUiContainer.addSubview(noteContentMultilineTextField)
    noteContentMultilineTextField.translatesAutoresizingMaskIntoConstraints = false

    // Top constraint for the content text input.
    view.addConstraint(
      NSLayoutConstraint(
        item: noteContentMultilineTextField,
        attribute: .top,
        relatedBy: .equal,
        toItem: noteTitleTextField,
        attribute: .bottom,
        multiplier: 1,
        constant: 8))

    // Leading constraint for the content text input.
    view.addConstraint(
      NSLayoutConstraint(
        item: noteContentMultilineTextField,
        attribute: .leading,
        relatedBy: .equal,
        toItem: view,
        attribute: .leadingMargin,
        multiplier: 1,
        constant: 0))

    // Trailing constraint for the content text input.
    view.addConstraint(
      NSLayoutConstraint(
        item: noteContentMultilineTextField,
        attribute: .trailing,
        relatedBy: .equal,
        toItem: view,
        attribute: .trailingMargin,
        multiplier: 1,
        constant: 0))

    resetUiToInitialState()
  }

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)

    guard databaseKey != nil else {
      // The key for the Note to edit must be set for the user to be on this screen.
      // This should never happen, but just in case.
      navigationController?.popViewController(animated: true)
      return
    }
  }

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    // This allows the user to stop editing a Note value when they tap outside of the input element.
    // It would be more ideal to also have "Next" and "Done" buttons on screen when appropriate.
    view.endEditing(true)
  }

  override func handleUserSignedIn(_ user: User) {
    super.handleUserSignedIn(user)

    guard let databaseKey = databaseKey else { return }

    // Try to get the current value of the Note to edit from the Firebase Realtime
    // Database. We only get this value once here to keep things simple.
    // The Note could change elsewhere while on this screen, thus saving could
    // overwrite any of those changes.
    databaseRef = Database.database().reference(withPath: "notes/\(user.uid)/\(databaseKey)")
    databaseRef?.observeSingleEvent(of: .value, with: { [weak self] (snapshot) in
      if let noteToEdit = Note(with: snapshot) {
        DispatchQueue.main.async {
          self?.handleNoteToEditFound(noteToEdit)
        }
      } else {
        DispatchQueue.main.async {
          self?.handleNoteToEditNotFound()
        }
      }
    }) { [weak self] (error) in
      // The user does not have permission to edit the Note. For simplicity we will treat
      // this the same as the Note not being found, since the user experience in either case is
      // essentially the same.
      DispatchQueue.main.async {
        self?.handleNoteToEditNotFound()
      }
    }
  }

  override func handleUserSignedOut() {
    super.handleUserSignedOut()

    // The user must be signed in to view this screen, so navigate away from it if the user is
    // signed out.
    navigationController?.popViewController(animated: true)
  }

  /**
   Handles when the Note the user wants to edit has been found.

   - Parameter note: The Note that the user wishes to edit.
   */
  func handleNoteToEditFound(_ note: Note) {
    // The Note to edit was found, so show and enable only the appropriate UI elements.
    resetUiToInitialState()
    setNoteEditorInputsToUseValuesFrom(note: note)
    noteTitleTextField.isEnabled = true
    noteContentMultilineTextField.isEnabled = true
    saveButton.isEnabled = true
    continueWritingButton.isEnabled = true
    noteFoundUiContainer.isHidden = false
  }

  /**
   Handles when the Note the user wants to edit could not be found.
   */
  func handleNoteToEditNotFound() {
    // The Note to edit was not found, so show and enable only the appropriate UI elements.
    resetUiToInitialState()
    noteNotFoundUiContainer.isHidden = false
  }

  /**
   Resets all UI elements (such as the Note editor inputs) to their initial state.
   
   The initial state is that no attempt has yet been made to get the Note from the Firebase
   Realtime Database, so neither the noteFoundUiContainer nor the noteNotFoundUiContainer elements
   will be shown or enabled.
   */
  func resetUiToInitialState() {
    noteFoundUiContainer.isHidden = true
    noteNotFoundUiContainer.isHidden = true
    noteTitleTextField.isEnabled = false
    noteContentMultilineTextField.isEnabled = false
    saveButton.isEnabled = false
    continueWritingButton.isEnabled = false
    setNoteEditorInputsToUseValuesFrom(note: nil)
  }

  /**
   Sets the Note editor's inputs to use the values from the provided Note.

   - Parameter note: The Note to use for the Note editor's inputs.
   */
  func setNoteEditorInputsToUseValuesFrom(note: Note?) {
    noteTitleTextField.text = note?.title ?? ""
    noteContentMultilineTextField.text = note?.content ?? ""
  }

  /**
   Attempts to asynchronously set the value of the Note currently being edited in the Firebase
   Realtime Database based on the Note editor inputs.
   
   - Parameter completionCallback: The callback that is asynchronously invoked upon the save either
   being successful or failing for the reason provided to the callback as an Error.
   */
  func saveNoteToDatabase(completionCallback: @escaping (Error?) -> Void) {
    guard let databaseRef = databaseRef,
          let noteTitle = noteTitleTextField.text,
          let noteContent = noteContentMultilineTextField.text else {
        completionCallback(Constants.AppError.couldNotSaveNote)
        return
    }

    let noteFromInputs: Note = Note(title: noteTitle, content: noteContent)
    databaseRef.setValue(noteFromInputs.firebaseData) { (error, ref) in
      completionCallback(error)
    }
  }

  /**
   Handles when the user taps the saveButton.

   - Parameter sender: The object that called this action. This should only be the saveButton.
   */
  @IBAction func saveButtonAction(_ sender: Any) {
    saveNoteToDatabase() { (error) in
      guard error == nil else {
        MDCSnackbarManager.show(Constants.AppError.couldNotSaveNote.rawValue)
        return
      }

      MDCSnackbarManager.show(Constants.Text.SuccessMessage.noteSaved)
    }
  }

  /**
   Handles when the user taps the continueWritingButton.

   Uses Firebase Continue to broadcast that the user may wish to continue writing this Note
   in a supported web browser on their computer.

   - Parameter sender: The object that called this action. This should only be the
   continueWritingButton.
   */
  @IBAction func continueWritingButtonAction(_ sender: Any) {
    guard currentUserIsSignedIn(), let databaseKey = databaseKey else {
      MDCSnackbarManager.show(Constants.AppError.couldNotBroadcastToContinueWriting.rawValue)
      return
    }

    // The current user is signed in, so allow them to easily continue writing this Note
    // within Chrome (via the Continote Chrome extension) or within Safari (via Apple Handoff)
    // on their computer by using Firebase Continue to broadcast the URL to edit this Note within
    // the Continote web app.

    // First we need to save this Note to the database to ensure that the user
    // will see the same values within the web app as they see here.
    saveNoteToDatabase() { (error) in
      guard error == nil else {
        MDCSnackbarManager.show(Constants.AppError.couldNotBroadcastToContinueWriting.rawValue)
        return
      }

      FCNContinue.broadcastToContinueActivity(
        withUrl: String(format: Constants.FirebaseContinue.urlToEditNoteWithKey, databaseKey),
        withinApplication: Constants.FirebaseContinue.applicationName) { (firebaseContinueError) in
          guard firebaseContinueError == nil else {
            MDCSnackbarManager.show(Constants.AppError.couldNotBroadcastToContinueWriting.rawValue)
            return
          }

          // The broadcast was successful, so inform the user how they can continue writing.
          MDCSnackbarManager.show(Constants.Text.SuccessMessage.broadcastToContinueWriting)
      }
    }
  }
}

/**
 These local constants are organized as a private extension to the global Constants struct
 for clarity and a cleaner namespace.
 */
private extension Constants {
  struct Text {
    static let screenTitle: String = "Edit Note"

    struct SuccessMessage {
      static let noteSaved: String = "Note saved successfully!"
      static let broadcastToContinueWriting: String =
        "You can now open Chrome and use the Continote extension to continue writing."
    }

    struct InputPlaceholder {
      static let title: String = "Title"
      static let content: String = "Content"
    }
  }

  enum AppError: String, Error {
    case couldNotSaveNote = "Could not save note. Please try again."
    case couldNotBroadcastToContinueWriting = "Something went wrong. Please try again."
  }
}
