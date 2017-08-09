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

import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.firebasecontinue.FirebaseContinue;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseReference;

/**
 * The Activity that presents the user with a Note editor to edit a specific Note, if
 * said Note is found for the user.
 *
 * TODO: Finish this Activity.
 */
public class EditNoteActivity extends BaseActivity {

    private static final String TAG = "EditNoteActivity";

    // The key from the Firebase Realtime Database of the Note the user wants to edit.
    // The Note the user wants to edit will be gathered from the Firebase Realtime Database
    // once the user is confirmed to be signed in below. This is gathered separately on this screen,
    // rather than passed from the MyNotesActivity, to ensure the user is presented with the
    // latest value for the Note (at the time of opening this screen).
    @Nullable
    private String mDatabaseKey = null;

    // Firebase Realtime Database reference for the current user's Note to edit, based on the key.
    @Nullable
    private DatabaseReference mDatabaseRef = null;

    // UI elements
    @Nullable
    private Button mContinueWritingElsewhereButton = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        mDatabaseKey = (intent != null) ?
                intent.getStringExtra(getString(R.string.extra_note_database_key)) : null;
        if (mDatabaseKey == null) {
            // We must have a database key to be on this screen.
            finish();
            return;
        }

        setContentView(R.layout.activity_edit_note);

        // Gather the UI elements for this Activity for future manipulation.

        mContinueWritingElsewhereButton =
                (Button) findViewById(R.id.continueWritingElsewhereButton);
        if (mContinueWritingElsewhereButton == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mContinueWritingElsewhereButton must be non-null");
        }
    }

    @Override
    protected void handleUserSignedIn(FirebaseUser user) {
        super.handleUserSignedIn(user);

        if (user == null) {
            // This should never happen, but just in case.
            throw new AssertionError("user must be non-null");
        }

        // TODO
    }

    @Override
    protected void handleUserSignedOut() {
        super.handleUserSignedOut();

        // The user must be signed in to view this screen, so navigate away from it if the user is
        // signed out.
        finish();
    }

    /**
     * Handles when the user taps the continueWritingElsewhereButton.
     *
     * @param v The View that called this triggered this handler.
     *          This should only be the continueWritingElsewhereButton itself.
     */
    public void handleContinueWritingElsewhereButtonTapped(@Nullable View v) {
        if (!currentUserIsSignedIn() || mDatabaseKey == null) {
            // This should never happen, but just in case.
            throw new AssertionError("User must be signed in and database key must be non-null");
        }

        // The current user is signed in, so allow them to easily continue writing this Note
        // within Chrome via the Continote Chrome extension and Continote web app.

        // TODO: Save the Note first so that when the user opens it elsewhere they see the latest
        // values for the Note (that they presumably wrote here in this app).

        // We use what's known as "activity-scoped listeners" here to react to the broadcast
        // Task either succeeding or failing upon its completion.
        // The reason we use activity-scoped listeners here is that they are automatically
        // removed during the onStop method of the Activity so that they are not called when
        // the Activity is no longer visible. For more details about activity-scoped listeners
        // (and Task listeners in general), see:
        // https://developers.google.com/android/guides/tasks#activity-scoped_listeners
        FirebaseContinue.broadcastActivityToContinue(
                getString(R.string.continote_url_to_edit_note_with_key, mDatabaseKey),
                getString(R.string.app_name_for_firebase_continue)
        ).addOnSuccessListener(this, new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void result) {
                showSnackbar(R.string.broadcast_to_continue_writing_note_in_chrome_successful);
            }
        }).addOnFailureListener(this, new OnFailureListener() {
            @Override
            public void onFailure(Exception e) {
                Log.e(TAG, e.getMessage(), e);
                showSnackbar(R.string.broadcast_to_continue_writing_note_in_chrome_failed);
            }
        });
    }
}
