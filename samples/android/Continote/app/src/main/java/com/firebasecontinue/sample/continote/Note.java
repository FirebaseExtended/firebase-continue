/**
 * Copyright (c) 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.firebasecontinue.sample.continote;

import android.support.annotation.Nullable;

/**
 * A Note for the user within Continote.
 * The schema of each Note is outlined in sample-database.rules.json within the web sample.
 */
public class Note {

    // The title of this Note.
    @Nullable
    private String mTitle = null;

    // The main content of this Note.
    @Nullable
    private String mContent = null;

    /**
     * Constructs a default Note without any values.
     *
     * This is necessary for Firebase to be able to create a new instance of this class.
     */
    public Note() {}

    /**
     * Constructs a new Note instance with the provided values.
     *
     * Important reminder:
     * Changes to Notes (such as creating a new Note) on the client-side do not automatically
     * propagate to the Firebase Realtime Database.
     *
     * @param title The title of the Note.
     * @param content The main content of the Note.
     */
    public Note(@Nullable String title, @Nullable String content) {
        mTitle = title;
        mContent = content;
    }

    /**
     * Gets and returns the title of this Note.
     *
     * @return The title of this Note.
     */
    @Nullable
    public String getTitle() {
        return mTitle;
    }

    /**
     * Gets and returns the main content of this Note.
     *
     * @return The main content of this Note.
     */
    @Nullable
    public String getContent() {
        return mContent;
    }

    /**
     * Sets the title of this Note on the client-side.
     *
     * This is necessary for Firebase to create and update Note instances.
     *
     * @param title The new title of this Note.
     */
    public void setTitle(@Nullable String title) {
        mTitle = title;
    }

    /**
     * Sets the main content of this Note on the client-side.
     *
     * This is necessary for Firebase to create and update Note instances.
     *
     * @param content The new main content of this Note.
     */
    public void setContent(@Nullable String content) {
        mContent = content;
    }
}
