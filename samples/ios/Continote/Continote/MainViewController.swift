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
import FirebaseAuthUI
import FirebaseFacebookAuthUI
import FirebaseGoogleAuthUI
import MaterialComponents.MaterialButtons
import MaterialComponents.MaterialSnackbar

/**
 The ViewController that is initially pushed onto this app's UINavigationController.

 It presents the user with an initial screen to either sign in and then navigate to other screens,
 or sign out.
 */
class MainViewController: BaseViewController {

  // FirebaseUI related
  private lazy var authUI: FUIAuth = {
    // Set up FirebaseUI authentication.
    let customizedAuthUI: FUIAuth = FUIAuth.defaultAuthUI()!
    customizedAuthUI.providers = Constants.Auth.providers
    customizedAuthUI.isSignInWithEmailHidden = true
    return customizedAuthUI
  }()

  // UI outlets
  @IBOutlet var authLabel: UILabel!
  @IBOutlet var authButton: MDCRaisedButton!
  @IBOutlet var myNotesButton: MDCRaisedButton!

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar title.
    title = Constants.appName

    // Style all labels.
    authLabel.applyAppTheme(for: .normalText)

    // Style all buttons.
    authButton.applyAppTheme()
    myNotesButton.applyAppTheme()
  }

  override func shouldPerformSegue(withIdentifier identifier: String, sender: Any?) -> Bool {
    guard let destination = Constants.Segue(rawValue: identifier) else { return false }

    if destination == .myNotes {
      // The user should only be able to go to the notes screen if they are signed in.
      return currentUserIsSignedIn()
    }

    return false
  }

  override func handleUserSignedIn(_ user: User) {
    super.handleUserSignedIn(user)

    // Update the UI to reflect the user now being signed in.
    let name:String = user.displayName!
    let email:String = user.email!
    authLabel.text = String(format: Constants.Text.welcomeMessage, name, email)
    authButton.setTitle(Constants.Text.signOutButtonTitle, for: .normal)
    myNotesButton.isHidden = false
  }

  override func handleUserSignedOut() {
    super.handleUserSignedOut()

    // Update the UI to reflect the user now being signed out.
    authLabel.text = Constants.Text.signInMessage
    authButton.setTitle(Constants.Text.signInButtonTitle, for: .normal)
    myNotesButton.isHidden = true
  }

  /**
   Presents the sign in screen to the user, if they are currently signed out.
   */
  func presentSignInScreen() {
    guard !currentUserIsSignedIn() else { return }

    // Present the sign in screen.
    present(authUI.authViewController(), animated: true)
  }

  /**
   Signs the user out, if they are currently signed in.
   */
  func signUserOut() {
    guard currentUserIsSignedIn() else { return }

    do {
      // Try to sign the user out.
      try authUI.signOut()
    } catch {
      MDCSnackbarManager.show(Constants.Text.ErrorMessage.couldNotSignOut)
    }
  }

  /**
   Handles when the user taps the auth (i.e. "Sign In"/"Sign Out") button.

   - Parameter sender: The object that called this action. This should only be the authButton.
   */
  @IBAction func authButtonAction(_ sender: Any) {
    if !currentUserIsSignedIn() {
      // The user is NOT signed in, so they want to sign in.
      presentSignInScreen()
    } else {
      // The user IS signed in, so they want to sign out.
      signUserOut()
    }
  }
}

/**
 These local constants are organized as a private extension to the global Constants struct
 for clarity and a cleaner namespace.
 */
private extension Constants {
  struct Auth {
    // These are the authentication methods this app allows.
    static let providers: [FUIAuthProvider] = [FUIGoogleAuth(), FUIFacebookAuth()]
  }

  struct Text {
    static let signInMessage: String = "Please sign in below to use \(appName)."
    static let welcomeMessage: String = "Hello %@!\nYou are currently signed in as %@"

    static let signInButtonTitle: String = "Sign In"
    static let signOutButtonTitle: String = "Sign Out"

    struct ErrorMessage {
      static let couldNotSignOut: String = "Could not sign out. Please try again."
    }
  }

  // These segue identifiers must match the identifiers defined in the Main storyboard.
  enum Segue: String {
    case myNotes = "myNotes"
  }
}
