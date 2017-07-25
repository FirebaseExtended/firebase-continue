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
import FirebaseDatabaseUI
import MaterialComponents.MaterialButtons

/**
 The view controller that presents the user with a list of their Notes in Continote.

 From here the user can add, delete, or open to edit Notes.
 */
class MyNotesViewController: BaseViewController {

  // Firebase Realtime Database reference for the current user's Notes within Continote.
  private var notesFirebaseDatabaseRef: DatabaseReference?

  // The data source to populate the TableView of Notes for the current user.
  private var myNotesTableViewDataSource: MyNotesTableViewDataSource?

  // UI outlets
  @IBOutlet var myNotesTableView: UITableView!
  @IBOutlet var writeNewNoteButton: MDCRaisedButton!

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar title.
    title = Constants.Text.screenTitle

    // Style all buttons.
    writeNewNoteButton.applyAppTheme()
  }

  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)

    // Remove all bindings and database observers.
    myNotesTableViewDataSource?.unbind()
    myNotesTableViewDataSource = nil
    notesFirebaseDatabaseRef?.removeAllObservers()
    notesFirebaseDatabaseRef = nil
  }

  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard let segueIdentifier = Constants.Segue(rawValue: segue.identifier!) else { return }

    switch segueIdentifier {
    case .editNote:
      // We need to let the EditNoteViewController know which Note the user wishes to edit
      // before the segue can be performed.
      let cell = sender as! MyNotesTableViewCell
      let editNoteViewController = segue.destination as! EditNoteViewController
      editNoteViewController.keyOfNoteToEdit = cell.noteKey
    }
  }

  override func handleUserSignedIn(_ user: User) {
    super.handleUserSignedIn(user)

    // Set up our TableView up to sync with the Notes for the current user from the Firebase
    // Realtime Database.
    notesFirebaseDatabaseRef = Database.database().reference().child("notes").child(user.uid)
    myNotesTableViewDataSource = MyNotesTableViewDataSource(
      query: notesFirebaseDatabaseRef!,
      populateCell: { tableView, indexPath, snapshot in
        // Get the data for this Note, as gathered from the Firebase Realtime Database, and parse
        // it to create a Note struct for this cell.
        let noteKey:String = snapshot.key
        let note: Note? = Note(with: snapshot)

        // Get and then populate a cell in the TableView to use for this Note.
        let cell = tableView.dequeueReusableCell(withIdentifier: "MyNotesTableViewCell")
                    as! MyNotesTableViewCell
        cell.noteKey = noteKey
        cell.note = note

        return cell
      })

    myNotesTableViewDataSource?.bind(to: myNotesTableView)

    // Finally, show this screen's UI since everything is ready.
    myNotesTableView.isHidden = false
    writeNewNoteButton.isHidden = false
  }

  override func handleUserSignedOut() {
    super.handleUserSignedOut()

    // Hide this screen's UI since the user must be signed in to see any Notes.
    myNotesTableView.isHidden = true
    writeNewNoteButton.isHidden = true

    // The user must be signed in to view this screen, so navigate away from it if the user is
    // signed out.
    navigationController?.popViewController(animated: true)
  }

  /**
   Handles when the user taps the "write a new note" button.

   Adds a new Note to the Firebase Realtime Database for the current user,
   then opens that Note to allow the user to begin writing.

   - Parameter sender: The object that called this action. This should only be the
   writeNewNoteButton.
   */
  @IBAction func writeNewNoteButtonAction(_ sender: Any) {
    guard let notesFirebaseDatabaseRef = notesFirebaseDatabaseRef else {
      // This should never happen because the user must be signed in, but just in case.
      return
    }

    // Add a new, empty Note to the Firebase Realtime Database for the current user.
    let newNote: Note = Note(title: "", content: "")
    let newNoteRef: DatabaseReference = notesFirebaseDatabaseRef.childByAutoId()
    newNoteRef.setValue(newNote.asFirebaseData) { (error, ref) -> Void in
      if error != nil {
        MDCSnackbarManager.show(Constants.Text.ErrorMessage.couldNotCreateNewNote)
        return
      }

      // Open the Edit Note screen with this Note by creating a temporary MyNotesTableViewCell
      // and providing it the key for this new Note (so that the segue to the Edit Note screen
      // can be performed). We do this so that the user may immediately Edit the Note, rather than
      // having to wait for the TableView to update from Firebase Realtime Database events and then
      // manually tap the cell for the Note.
      // This is not very clean, but is sufficient for this sample app.
      let temporaryCellForSegue: MyNotesTableViewCell = MyNotesTableViewCell()
      temporaryCellForSegue.noteKey = ref.key
      self.performSegue(withIdentifier: Constants.Segue.editNote.rawValue,
                        sender: temporaryCellForSegue)
    }
  }
}

/**
 These local constants are organized as a private extension to the global Constants struct
 for clarity and a cleaner namespace.
 */
private extension Constants {
  struct Text {
    static let screenTitle: String = "My Notes"

    struct ErrorMessage {
      static let couldNotCreateNewNote: String = "Could not create a new Note. Please try again."
    }
  }

  // These segue identifiers must match the identifiers defined in the Main storyboard.
  enum Segue: String {
    case editNote = "editNote"
  }
}
