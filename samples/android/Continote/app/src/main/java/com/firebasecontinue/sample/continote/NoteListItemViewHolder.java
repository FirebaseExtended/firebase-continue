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

import android.graphics.Typeface;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.view.View;
import android.widget.TextView;

/**
 * The ListView within MyNotesActivity is filled with items managed by these ViewHolders
 * (one per Note).
 *
 * For more details about the ViewHolder design pattern, see:
 * https://developer.android.com/training/improving-layouts/smooth-scrolling.html
 */
public class NoteListItemViewHolder {

    // The key from the Firebase Realtime Database for the Note this ViewHolder represents.
    // This is passed to the EditNoteActivity.
    @Nullable
    private String mNoteDatabaseKey = null;

    /**
     * Constructs a new NoteListItemViewHolder instance for the provided View and Note combination.
     *
     * @param itemView The View managed by this ViewHolder.
     * @param note The Note this ViewHolder is for.
     * @param databaseKey The database key of the Note this ViewHolder is for.
     */
    public NoteListItemViewHolder(@NonNull View itemView,
                                  @NonNull Note note,
                                  @NonNull String databaseKey) {
        if (itemView == null || note == null || databaseKey == null || databaseKey.length() == 0) {
            // This should not happen, but just in case.
            return;
        }

        update(itemView, note, databaseKey);
    }

    /**
     * Updates this ViewHolder and the UI of the View managed by it based on the provided Note and
     * database key.
     *
     * @param itemView The View managed by this ViewHolder which may need its UI updated.
     * @param note The Note this ViewHolder is for (to update the UI based on).
     * @param databaseKey The database key of the Note this ViewHolder is for.
     */
    public void update(@NonNull View itemView, @NonNull Note note, @NonNull String databaseKey) {
        if (itemView == null || note == null || databaseKey == null || databaseKey.length() == 0) {
            // This should not happen, but just in case.
            return;
        }

        mNoteDatabaseKey = databaseKey;

        TextView titleTextView = (TextView) itemView.findViewById(R.id.noteItemTitleTextView);
        setTextWithPlaceholder(titleTextView, note.getTitle(), "No Title");
        TextView contentTextView = (TextView) itemView.findViewById(R.id.noteItemContentTextView);
        setTextWithPlaceholder(contentTextView, note.getContent(), "No Content");
    }

    /**
     * Gets and returns Note database key.
     *
     * @return The Firebase Realtime Database key for the Note this ViewHolder is for.
     */
    @Nullable
    public String getNoteDatabaseKey() {
        return mNoteDatabaseKey;
    }

    /**
     * Sets the text of the provided textView to the provided value, or the placeholder if the
     * value is null or empty. Also italicizes the textView if the placeholder is used.
     *
     * This could go into a "Utils" class, but this is the only place it is used, so this
     * is sufficient for this sample app.
     *
     * @param textView The TextView to set the text for.
     * @param value The value to set the text to.
     * @param placeholder The placeholder text to use if the value above is null or empty.
     */
    private static void setTextWithPlaceholder(@NonNull TextView textView,
                                               @Nullable String value,
                                               @Nullable String placeholder) {
        if (textView == null) {
            // This should not happen, but just in case.
            return;
        }

        if (value != null && value.length() > 0) {
            // The provided value is nonempty, so use it.
            textView.setText(value);
            textView.setTypeface(textView.getTypeface(), Typeface.NORMAL);
        } else {
            // The provided value is empty, so use the placeholder.
            textView.setText(placeholder);
            textView.setTypeface(textView.getTypeface(), Typeface.ITALIC);
        }
    }
}
