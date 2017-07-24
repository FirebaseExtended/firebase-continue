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

/**
 This view controller presents the user with a list of their notes in Continote.
 From here the user can open or delete notes.
 */
class MyNotesViewController: BaseViewController {

  // Firebase Realtime Database reference for the current user's note data within this application.
  private var notesFirebaseDatabaseRef: DatabaseReference?

  // The FirebaseUI data source to populate the TableView of notes for the current user.
  private var notesTableViewDataSource: FUITableViewDataSource!

  // UI outlets
  @IBOutlet var temporaryTodoLabel: UILabel!

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar title.
    title = Constants.screenTitle

    // Style all labels.
    temporaryTodoLabel.applyAppTheme(for: .normalText)
  }

  override func handleUserSignedIn(_ user: User) {
    super.handleUserSignedIn(user)

    // Set up our TableView up to sync with GoogleBroadcasts for the current user.
    let currentUserId: String! = Auth.auth().user.uid
    notesFirebaseDatabaseRef = Database.database().reference().child("notes").child(currentUserId)
    notesTableViewDataSource =
      notesTableView.bind(to: notesFirebaseDatabaseRef!) { tableView, indexPath, snap in
        let cell = tableView.dequeueReusableCell(withIdentifier: "NoteCell") as! NoteTableViewCell
        let value:[String : AnyObject] = snap.value as? [String : AnyObject] ?? [:]
        let url:String = value["url"] as! String
        let addedAt:Int = value["originPushedAt"] as! Int

        cell.label?.text = "App: \(app)\n" +
          "Action: \(action)\n" +
          "URL: \(url)\n" +
          "Origin Pushed At: \(originPushedAtString)\n" +
          "Destination Continued At: \(destinationContinuedAtString)"

        // Style the delete button.
        cell.deleteButton?.setTitleColor(UIColor.red, for: .normal)
        cell.deleteButton?.backgroundColor = .clear
        cell.deleteButton?.layer.cornerRadius = 5
        cell.deleteButton?.layer.borderWidth = 1
        cell.deleteButton?.layer.borderColor = UIColor.red.cgColor

        // Terrible hack to pass along the key of what should be deleted.
        cell.deleteButton?.accessibilityHint = snap.key
        cell.deleteButton?.addTarget(
          self, action: #selector(deleteButtonPressed), for: .touchUpInside)

        return cell
      }

    // Now that the TableView is ready, display it.
    notesTableView.isHidden = false
  }

  override func handleUserSignedOut() {
    super.handleUserSignedOut()

    // Remove all database bindings and observers.
    notesTableViewDataSource?.unbind()
    notesTableViewDataSource = nil
    notesFirebaseDatabaseRef?.removeAllObservers()
    notesFirebaseDatabaseRef = nil

    // Now that the data source is empty, reload the table to clear out its contents.
    notesTableView.reloadData()

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
  static let screenTitle: String = "My Notes"
}
