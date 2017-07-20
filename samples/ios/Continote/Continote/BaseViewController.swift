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
import MaterialComponents.MaterialAppBar

/**
 This is the abstract UIViewController which any other ViewController in this app must subclass.
 It sets up various common UI elements (such as the top AppBar for navigation and title purposes),
 and listens for authentication state changes to pass along to subclasses.
 */
class BaseViewController: UIViewController {

  // Firebase related
  private lazy var auth: Auth = { Auth.auth() }()
  private var authStateDidChangeListenerHandle: AuthStateDidChangeListenerHandle?

  // AppBar for navigation and title purposes. This replaces the standard UINavigationController's
  // navigation bar.
  private let appBar = MDCAppBar()

  override func viewDidLoad() {
    super.viewDidLoad()

    // Set up this screen's AppBar.
    addChildViewController(appBar.headerViewController)
    appBar.addSubviewsToParent()
    appBar.applyAppTheme()
  }

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)

    // Hide the UINavigationController's NavigationBar since we are using a Material Components
    // AppBar.
    // See: https://material.io/components/ios/catalog/flexible-headers/#interacting-with-uinavigationcontroller
    navigationController?.setNavigationBarHidden(true, animated: animated)

    // Add the authentication state handler to get current state as well as any future changes.
    authStateDidChangeListenerHandle =
      auth.addStateDidChangeListener(handleAuthStateDidChange(auth:user:))
  }

  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)

    // Remove the authentication state handler.
    if let handle = authStateDidChangeListenerHandle {
      auth.removeStateDidChangeListener(handle)
      authStateDidChangeListenerHandle = nil
    }
  }

  override func viewWillLayoutSubviews() {
    super.viewDidLayoutSubviews()

    // Ensure the main screen UI falls below the top AppBar.
    // See: https://material.io/components/ios/catalog/flexible-headers/
    appBar.headerViewController.updateTopLayoutGuide()
  }

  /**
   This method is called whenever a user signs in.
   Override in a subclass to react to this event.
   - Parameter user: The user who is now signed in.
   */
  func handleUserSignedIn(_ user: User) {}

  /**
   This method is called whenever a user signs out.
   Override in a subclass to react to this event.
   */
  func handleUserSignedOut() {}

  /**
   Convenience method for determining the current authentication state of the user.
   - Returns: true iff the current user is signed into this app, false otherwise.
   */
  func currentUserIsSignedIn() -> Bool {
    return auth.currentUser != nil
  }

  /**
   Firebase is provided this method as a callback for when the user signs in or out.
   It is also invoked right away by Firebase with the initial auth state when the handler is
   registered with Firebase.
   See: https://firebase.google.com/docs/reference/ios/firebaseauth/api/reference/Classes/FIRAuth#-addauthstatedidchangelistener
   - Parameter auth: The auth instance which called this listener.
   - Parameter user: The user who is now signed in, or nil if no user is signed in.
   */
  func handleAuthStateDidChange(auth: Auth, user: User?) {
    if let user = user {
      // The user IS signed in.
      handleUserSignedIn(user)
    } else {
      // The user is NOT signed in.
      handleUserSignedOut()
    }
  }
}
