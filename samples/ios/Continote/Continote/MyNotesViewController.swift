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
 The ViewController that presents the user with a table of their Notes in Continote.

 From here the user can add, delete, or open to edit Notes.
 */
class MyNotesViewController: BaseViewController {

  // Firebase Realtime Database reference for the current user's Notes within Continote.
  private var notesRef: DatabaseReference?

  // The data source to populate the TableView of Notes for the current user.
  private var dataSource: MyNotesTableViewDataSource?

  // UI outlets
  @IBOutlet var tableView: UITableView!
  @IBOutlet var newNoteButton: MDCRaisedButton!

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar title.
    title = Constants.Text.screenTitle

    // Style all buttons.
    newNoteButton.applyAppTheme()
  }

  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)

    // Remove all bindings and database observers.
    dataSource?.unbind()
    dataSource = nil
    notesRef?.removeAllObservers()
    notesRef = nil
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)

    tableView.flashScrollIndicators()
  }

  override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
    guard let identifierString = segue.identifier,
          let segueIdentifier = Constants.Segue(rawValue: identifierString),
          segueIdentifier == .editNote else { return }

    // We need to let the EditNoteViewController know which Note the user wishes to edit
    // before the segue can be performed.
    let editNoteViewController = segue.destination as! EditNoteViewController

    // Set the databaseKey based on the object passed in.
    if let cell = sender as? MyNotesTableViewCell {
      editNoteViewController.databaseKey = cell.noteKey
    } else if let key = sender as? String {
      editNoteViewController.databaseKey = key
    }
  }

  override func handleUserSignedIn(_ user: User) {
    super.handleUserSignedIn(user)

    // Set up our TableView up to sync with the Notes for the current user from the Firebase
    // Realtime Database.
    notesRef = Database.database().reference(withPath: "notes/\(user.uid)")
    dataSource = MyNotesTableViewDataSource(
      query: notesRef!,
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

    dataSource?.bind(to: tableView)

    // Finally, show this screen's UI since everything is ready.
    tableView.isHidden = false
    newNoteButton.isHidden = false
  }

  override func handleUserSignedOut() {
    super.handleUserSignedOut()

    // Hide this screen's UI since the user must be signed in to see any Notes.
    tableView.isHidden = true
    newNoteButton.isHidden = true

    // The user must be signed in to view this screen, so navigate away from it if the user is
    // signed out.
    navigationController?.popViewController(animated: true)
  }

  /**
   Handles when the user taps the newNoteButton.

   Adds a new Note to the Firebase Realtime Database for the current user,
   then opens that Note to allow the user to begin writing.

   - Parameter sender: The object that called this action. This should only be the newNoteButton.
   */
  @IBAction func newNoteButtonAction(_ sender: Any) {
    guard let notesRef = notesRef else { return }

    // Add a new, empty Note to the Firebase Realtime Database for the current user.
    let newNote: Note = Note(title: "", content: "")
    let newNoteRef: DatabaseReference = notesRef.childByAutoId()
    newNoteRef.setValue(newNote.firebaseData) { [weak self] (error, ref) -> Void in
      guard error == nil else {
        MDCSnackbarManager.show(Constants.AppError.couldNotCreateNewNote.rawValue)
        return
      }

      // Open the Edit Note screen with this Note.
      // We do this so that the user may immediately edit the Note, rather than
      // having to wait for the TableView to update from Firebase Realtime Database
      // events and then manually tap the cell for the Note.
      DispatchQueue.main.async {
        self?.performSegue(withIdentifier: Constants.Segue.editNote.rawValue, sender: ref.key)
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
    static let screenTitle: String = "My Notes"
  }

  enum AppError: String, Error {
    case couldNotCreateNewNote = "Could not create a new note. Please try again."
  }

  // These segue identifiers must match the identifiers defined in the Main storyboard.
  enum Segue: String {
    case editNote = "editNote"
  }
}
