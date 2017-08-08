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
import FirebaseDatabase
import FirebaseDatabaseUI
import MaterialComponents.MaterialSnackbar

/**
 The data source used for the TableView in MyNotesViewController.

 We need to override FUITableViewDataSource in order to allow the user to edit
 (and then subsequently delete) rows (i.e. Notes) within the table.
 */
class MyNotesTableViewDataSource: FUITableViewDataSource {

  override func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool {
    // Allow the user to edit any row in the table.
    return true
  }

  override func tableView(_ tableView: UITableView,
                          commit editingStyle: UITableViewCellEditingStyle,
                          forRowAt indexPath: IndexPath) {
    guard editingStyle == .delete else { return }

    // Attempt to delete the corresponding Note from the Firebase Realtime Database.
    if (UInt(indexPath.row) < count) {
      snapshot(at: indexPath.row).ref.removeValue { (error, ref) in
        guard error == nil else {
          MDCSnackbarManager.show(Constants.AppError.couldNotDeleteNote.rawValue)
          return
        }
      }
    }
  }
}

/**
 These local constants are organized as a private extension to the global Constants struct
 for clarity and a cleaner namespace.
 */
private extension Constants {
  enum AppError: String, Error {
    case couldNotDeleteNote = "Could not delete note. Please try again."
  }
}
