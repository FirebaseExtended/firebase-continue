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
 This view controller presents the user with a list of their notes in Continote.
 From here the user can open or delete notes.
 */
class MyNotesViewController: BaseViewController {

  // UI outlets
  @IBOutlet var temporaryTodoLabel: UILabel!

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar title.
    title = Constants.screenTitle

    // Style all labels.
    temporaryTodoLabel.applyAppTheme(for: .normalText)
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
  static let screenTitle: String = "My Notes"
}
