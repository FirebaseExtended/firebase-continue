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

import FirebaseDatabase

/**
 A Note for the user within Continote.
 The schema of each Note is outlined in sample-database.rules.json within the web sample.

 Each Note is considered immutable on the client-side to simplify syncing with the database for
 this sample.
 */
struct Note {

  // The title of this Note.
  let title: String

  // The main content of this Note.
  let content: String

  // The Firebase Realtime Database representation of this Note.
  // This could be used to add or set a Note value in the database.
  let asFirebaseData: [String : AnyObject]

  /**
   Initializes a Note with the provided values.

   - Parameter title: The title of the Note.
   - Parameter content: The main content of the Note.
   */
  init(title: String, content: String) {
    self.title = title
    self.content = content
    self.asFirebaseData = [
      "title": self.title as AnyObject,
      "content": self.content as AnyObject
    ]
  }

  /**
   Attempts to initialize a Note using values from the provided Firebase Realtime Database data
   snapshot. This could be more robust, but is sufficient for this sample app.

   - Parameter firebaseData: The Firebase data snapshot to attempt to convert into a Note.
   */
  init?(with firebaseData: DataSnapshot?) {
    guard let data = firebaseData,
          let value = data.value as? [String : AnyObject],
          let noteTitle = value["title"] as? String,
          let noteContent = value["content"] as? String else {
      return nil
    }

    self.init(title: noteTitle, content: noteContent)
  }
}
