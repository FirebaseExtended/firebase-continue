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
import MaterialComponents.MaterialSnackbar

/**
 The ViewController that presents the user with a Note editor to edit a specific Note, if
 said Note is found for the user.
 
 TODO: Finish this ViewController.
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

  // UI outlets
  @IBOutlet var temporaryTodoLabel: UILabel!

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar title.
    title = Constants.Text.screenTitle

    // Style all labels.
    temporaryTodoLabel.applyAppTheme(for: .normalText)
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

  override func handleUserSignedIn(_ user: User) {
    super.handleUserSignedIn(user)

    // Try to get the current value of the Note to edit from the Firebase Realtime
    // Database. We only get this value once here to keep things simple.
    // The Note could change elsewhere while on this screen, thus saving could
    // overwrite any of those changes.
    databaseRef = Database.database().reference(withPath: "notes/\(user.uid)/\(databaseKey)")
    databaseRef?.observeSingleEvent(of: .value, with: { (snapshot) in
      if let noteToEdit = Note(with: snapshot) {
        // TODO: Note to edit found, so pass it to a "handleNoteToEditFound(noteToEdit)" handler.
      } else {
        // TODO: Note to edit not found, call a "handleNoteToEditNotFound()" handler.
      }
    }) { (error) in
      // TODO: The user does not have permission to edit the Note. For simplicity we will treat
      // this the same as the Note not being found, so call a "handleNoteToEditNotFound()" handler.
    }
  }

  override func handleUserSignedOut() {
    super.handleUserSignedOut()

    // The user must be signed in to view this screen, so navigate away from it if the user is
    // signed out.
    navigationController?.popViewController(animated: true)
  }
}

/**
 These local constants are organized as a private extension to the global Constants struct
 for clarity and a cleaner namespace.
 */
private extension Constants {
  struct Text {
    static let screenTitle: String = "Edit Note"
  }
}
