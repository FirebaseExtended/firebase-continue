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
import MaterialComponents.MaterialSnackbar
import MaterialComponents.MDCAppBarColorThemer
import MaterialComponents.MDCButtonColorThemer
import MaterialComponents.MDCTypography

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

   - Parameter labelKind: The kind of label to appear as.
   */
  func applyAppTheme(for labelKind: Constants.Theme.LabelKind) {
    font = labelKind.getFont()
    alpha = labelKind.getAlpha()
  }

  /**
   Sets this label's text to the provided value, or the provided placeholder if the value is
   nil or empty.

   If the text is set to the provided value, the desiredFont will be applied to the label.
   Otherwise, if the placeholder is used, an italicized version of the desiredFont will be applied.

   - Parameter value: The value to set the text to.
   - Parameter placeholder: The placeholder text to use if the value above is nil or empty.
   - Parameter desiredFont: The font to use if the text is set to the provided value.
   */
  func setText(to value: String?, withPlaceholder placeholder: String, using desiredFont: UIFont) {
    if !(value ?? "").isEmpty {
      text = value;
      font = desiredFont
    } else {
      text = placeholder;
      font = MDCTypography.italicFont(from: desiredFont)
    }
  }
}

extension UITextField {
  /**
   Applies a standardized visual style to this TextField.
   */
  func applyAppTheme() {
    font = Constants.Theme.LabelKind.titleText.getFont()

    // Set the border.
    layer.borderColor = Constants.Theme.TextInput.borderColor
    layer.borderWidth = Constants.Theme.TextInput.borderWidth
    layer.cornerRadius = Constants.Theme.TextInput.borderCornerRadius
  }
}

extension UITextView {
  /**
   Applies a standardized visual style to this TextView.
   */
  func applyAppTheme() {
    font = Constants.Theme.LabelKind.normalText.getFont()

    // Set the border.
    layer.borderColor = Constants.Theme.TextInput.borderColor
    layer.borderWidth = Constants.Theme.TextInput.borderWidth
    layer.cornerRadius = Constants.Theme.TextInput.borderCornerRadius
  }
}

extension MDCSnackbarManager {
  /**
   Shows the provided text in a snackbar message.

   See: https://material.io/components/ios/catalog/snackbars/

   - Parameter text: The text to show.
   */
  static func show(_ text: String) {
    MDCSnackbarManager.show(MDCSnackbarMessage(text: text))
  }
}
