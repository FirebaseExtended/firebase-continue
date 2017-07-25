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

/**
 The MyNotesTableView within MyNotesViewController is filled with these cells (one per Note).
 */
class MyNotesTableViewCell: UITableViewCell {

  // The key from the Firebase Realtime Database for the Note this cell represents.
  // This is passed to the EditNoteViewController.
  var noteKey: String?

  // The Note this cell represents.
  var note: Note? {
    didSet {
      // Populate this cell with the values from the Note.
      titleLabel.applyAppTheme(for: .titleText)
      titleLabel.setText(to: note?.title, or: "No Title", using: titleLabel.font)
      contentLabel.applyAppTheme(for: .subheadingText)
      contentLabel.setText(to: note?.content, or: "No Content", using: contentLabel.font)
    }
  }

  // UI outlets
  @IBOutlet var titleLabel: UILabel!
  @IBOutlet var contentLabel: UILabel!
}
