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

import MaterialComponents.MaterialAppBar
import MaterialComponents.MaterialButtons
import MaterialComponents.MDCAppBarColorThemer
import MaterialComponents.MDCButtonColorThemer

/**
 This file provides some simple utility functions for use throughout the app.
 */

extension MDCAppBar {
  /**
   Applies a standardized visual style to this AppBar.
   */
  func applyAppTheme() {
    MDCAppBarColorThemer.apply(Constants.Theme.colorScheme, to: self)
  }
}

extension MDCRaisedButton {
  /**
   Applies a standardized visual style to this button.
   */
  func applyAppTheme() {
    setElevation(Constants.Theme.Button.elevation, for: .normal)
    MDCButtonColorThemer.apply(Constants.Theme.colorScheme, to: self)
  }
}

extension UILabel {
  /**
   Applies a standardized visual style to this label of a certain kind.
   */
  func applyAppTheme(for labelKind: Constants.Theme.LabelKind) {
    font = labelKind.getFont()
    alpha = labelKind.getAlpha()
  }
}
