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

import MaterialComponents.MaterialTypography
import MaterialComponents.MDCColorScheme

/**
 These constants are organized as part of a struct for clarity and a cleaner namespace.

 The constants predefined below are relevant to more than one screen within the app.
 For local constants, use a private extension within the file you need those extra constants.
 See the use of "private extension Constants" in MainViewController.swift for an example.
 */
struct Constants {
  static let appName: String = "Continote"

  // FirebaseContinue usage related.
  struct FirebaseContinue {
    static let applicationName: String = "continote"
    static let urlToEditNoteWithKey: String =
      "[TODO: YOUR-FIREBASE-HOSTING-URL-FOR-CONTINOTE-WEB-HERE]/edit-note.html?noteKey=%@"
  }

  // UI appearance related constants.
  struct Theme {

    // The color scheme we will apply to Material Components to mimic the look of Firebase.
    static let colorScheme: MDCColorScheme & NSObjectProtocol =
      MDCBasicColorScheme.init(
        primaryColor: UIColor(red: 1.0, green: 0.76, blue: 0.05, alpha: 1.0),
        secondaryColor: UIColor(red: 1.0, green: 0.6, blue: 0, alpha: 1.0))

    struct Button {
      // The elevation for buttons to give a raised look.
      static let elevation: CGFloat = 4;
    }

    // All text-based inputs (i.e. UITextField and UITextView).
    struct TextInput {
      static let borderColor: CGColor =
        UIColor(red: 0.76, green: 0.76, blue: 0.76, alpha: 0.5).cgColor
      static let borderWidth: CGFloat = 1
      static let borderCornerRadius: CGFloat = 2
    }

    enum LabelKind {

      // Labels with text we wish to appear normal/standard (such as longer text content).
      case normalText

      // Labels with text we wish to appear as a title.
      case titleText

      /**
       - Returns: The font to use for this kind of label.
       */
      func getFont() -> UIFont {
        switch self {
        case .normalText:
          return MDCTypography.subheadFont()
        case .titleText:
          return MDCTypography.titleFont()
        }
      }

      /**
       - Returns: The alpha to use for this kind of label.
       */
      func getAlpha() -> CGFloat {
        switch self {
        case .normalText:
          return MDCTypography.subheadFontOpacity()
        case .titleText:
          return MDCTypography.titleFontOpacity()
        }
      }
    }
  }
}
