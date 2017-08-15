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
import android.support.constraint.ConstraintLayout;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.firebasecontinue.FirebaseContinue;
import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

/**
 * The Activity that presents the user with a Note editor to edit a specific Note, if
 * said Note is found for the user.
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
    private ConstraintLayout mNoteNotFoundUiContainer = null;
    @Nullable
    private ConstraintLayout mNoteFoundUiContainer = null;
    @Nullable
    private EditText mNoteTitleTextInput = null;
    @Nullable
    private EditText mNoteContentTextInput = null;
    @Nullable
    private Button mSaveButton = null;
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

        mNoteNotFoundUiContainer = (ConstraintLayout) findViewById(R.id.noteNotFoundUiContainer);
        if (mNoteNotFoundUiContainer == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mNoteNotFoundUiContainer must be non-null");
        }

        mNoteFoundUiContainer = (ConstraintLayout) findViewById(R.id.noteFoundUiContainer);
        if (mNoteFoundUiContainer == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mNoteFoundUiContainer must be non-null");
        }

        mNoteTitleTextInput = (EditText) findViewById(R.id.noteTitleTextInput);
        if (mNoteTitleTextInput == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mNoteTitleTextInput must be non-null");
        }

        mNoteContentTextInput = (EditText) findViewById(R.id.noteContentTextInput);
        if (mNoteContentTextInput == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mNoteContentTextInput must be non-null");
        }

        mSaveButton = (Button) findViewById(R.id.saveButton);
        if (mSaveButton == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mSaveButton must be non-null");
        }

        mContinueWritingElsewhereButton =
                (Button) findViewById(R.id.continueWritingElsewhereButton);
        if (mContinueWritingElsewhereButton == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mContinueWritingElsewhereButton must be non-null");
        }

        resetUiToInitialState();
    }

    @Override
    protected void handleUserSignedIn(FirebaseUser user) {
        super.handleUserSignedIn(user);

        if (user == null) {
            // This should never happen, but just in case.
            throw new AssertionError("user must be non-null");
        }

        // Try to get the current value of the Note to edit from the Firebase Realtime
        // Database. We only get this value once here to keep things simple.
        // The Note could change elsewhere while on this screen, thus saving could
        // overwrite any of those changes.
        mDatabaseRef = FirebaseDatabase.getInstance().getReference(
                "notes/" + user.getUid() + "/" + mDatabaseKey);
        mDatabaseRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                final Note note = snapshot.getValue(Note.class);
                runOnUiThread(new Runnable() {
                    public void run() {
                        handleNoteToEditFound(note);
                    }
                });
            }

            @Override
            public void onCancelled(DatabaseError error) {
                runOnUiThread(new Runnable() {
                    public void run() {
                        handleNoteToEditNotFound();
                    }
                });
            }
        });
    }

    @Override
    protected void handleUserSignedOut() {
        super.handleUserSignedOut();

        // The user must be signed in to view this screen, so navigate away from it if the user is
        // signed out.
        finish();
    }

    /**
     * Handles when the Note the user wants to edit has been found.
     *
     * Sets up the UI to allow the user to edit said Note by enabling and making visible the
     * Note editor UI elements, and populating the editor text inputs with the values from the Note.
     *
     * @param note The Note that the user wishes to edit.
     */
    private void handleNoteToEditFound(Note note) {
        // The Note to edit was found, so show and enable only the appropriate UI elements.
        resetUiToInitialState();
        setNoteEditorInputsToUseValuesFrom(note);
        mNoteTitleTextInput.setEnabled(true);
        mNoteContentTextInput.setEnabled(true);
        mSaveButton.setEnabled(true);
        mContinueWritingElsewhereButton.setEnabled(true);
        mNoteFoundUiContainer.setVisibility(View.VISIBLE);
    }

    /**
     * Handles when the Note the user wants to edit could not be found.
     */
    private void handleNoteToEditNotFound() {
        // The Note to edit was not found, so show and enable only the appropriate UI elements.
        resetUiToInitialState();
        mNoteNotFoundUiContainer.setVisibility(View.VISIBLE);
    }

    /**
     * Resets all UI elements (such as the Note editor inputs) to their initial state.
     *
     * The initial state is that no attempt has yet been made to get the Note from the Firebase
     * Realtime Database, so neither the noteFoundUiContainer nor the noteNotFoundUiContainer
     * elements will be shown or enabled.
     */
    private void resetUiToInitialState() {
        mNoteFoundUiContainer.setVisibility(View.GONE);
        mNoteNotFoundUiContainer.setVisibility(View.GONE);
        mNoteTitleTextInput.setEnabled(false);
        mNoteContentTextInput.setEnabled(false);
        mSaveButton.setEnabled(false);
        mContinueWritingElsewhereButton.setEnabled(false);
        setNoteEditorInputsToUseValuesFrom(null);
    }

    /**
     * Sets the Note editor's inputs to use the values from the provided Note.
     *
     * @param note The Note to use for the Note editor's inputs.
     */
    private void setNoteEditorInputsToUseValuesFrom(@Nullable Note note) {
        mNoteTitleTextInput.setText((note != null) ? note.getTitle() : "");
        mNoteContentTextInput.setText((note != null) ? note.getContent() : "");
    }

    /**
     * Attempts to asynchronously set the value of the Note currently being edited in the Firebase
     * Realtime Database based on the Note editor inputs.
     *
     * This can fail if, for example, the user is not signed in, or for any number of other
     * Firebase Realtime Database errors that could possibly occur.
     * See: https://firebase.google.com/docs/reference/android/com/google/firebase/database/DatabaseError
     *
     * This could be modified to go into the Note class, but this is the only place it is used,
     * so this is sufficient for this sample app.
     *
     * @return A Task which, upon completion, signals whether or not the Note was successfully
     * saved to the database.
     */
    private Task<Void> saveNoteToDatabase() {
        final TaskCompletionSource<Void> taskCompletion = new TaskCompletionSource<>();
        Task<Void> task = taskCompletion.getTask();

        // First, ensure the current user is signed in.
        if (!currentUserIsSignedIn()) {
            taskCompletion.setException(new IllegalStateException("The user must be signed in"));

            return task;
        }

        // Next, ensure the we have a reference to this Note for the current user.
        if (mDatabaseRef == null) {
            taskCompletion.setException(new IllegalStateException("Database ref must be non-null"));

            return task;
        }

        // Finally, attempt to save the Note asynchronously.
        Note noteFromInputs = new Note(
                mNoteTitleTextInput.getText().toString(),
                mNoteContentTextInput.getText().toString());
        mDatabaseRef.setValue(noteFromInputs, new DatabaseReference.CompletionListener() {
            @Override
            public void onComplete(DatabaseError error, DatabaseReference ref) {
                if (error == null) {
                    // Set that this Task was successful.
                    taskCompletion.setResult(null);
                } else {
                    // Set that this Task was unsuccessful.
                    taskCompletion.setException(error.toException());
                }
            }
        });

        return task;
    }

    /**
     * Handles when the user taps the saveButton.
     *
     * @param v The View that called this triggered this handler.
     *          This should only be the saveButton itself.
     */
    public void handleSaveButtonTapped(@Nullable View v) {
        if (v == null) {
            // This should never happen, but just in case.
            throw new AssertionError("view must be non-null");
        }

        // Attempt to save the Note.
        EditNoteActivity activity = (EditNoteActivity) v.getContext();
        saveNoteToDatabase()
                .addOnSuccessListener(
                        activity,
                        new OnSuccessListener<Void>() {
                            @Override
                            public void onSuccess(Void result) {
                                showSnackbar(R.string.save_note_successful);
                            }
                        })
                .addOnFailureListener(
                        activity,
                        new OnFailureListener() {
                            @Override
                            public void onFailure(Exception e) {
                                Log.e(TAG, e.getMessage(), e);
                                showSnackbar(R.string.save_note_failed);
                            }
                        });
    }

    /**
     * Handles when the user taps the continueWritingElsewhereButton.
     *
     * @param v The View that called this triggered this handler.
     *          This should only be the continueWritingElsewhereButton itself.
     */
    public void handleContinueWritingElsewhereButtonTapped(@Nullable View v) {
        if (v == null) {
            // This should never happen, but just in case.
            throw new AssertionError("view must be non-null");
        }

        // Save the Note first so that when the user opens it elsewhere they see the latest
        // values for the Note (that they presumably wrote here in this app).
        final EditNoteActivity activity = (EditNoteActivity) v.getContext();
        saveNoteToDatabase().continueWithTask(new Continuation<Void, Task<Void>>() {
            @Override
            public Task<Void> then(Task<Void> task) throws Exception {
                // Now that the Note has been saved, broadcast that the user may wish to continue
                // writing it.
                return FirebaseContinue.broadcastActivityToContinue(
                        getString(R.string.continote_url_to_edit_note_with_key, mDatabaseKey),
                        getString(R.string.app_name_for_firebase_continue));
            }
        }).addOnSuccessListener(
                activity,
                new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void result) {
                        showSnackbar(R.string.broadcast_to_continue_successful);
                    }
                }
        ).addOnFailureListener(
                activity,
                new OnFailureListener() {
                    @Override
                    public void onFailure(Exception e) {
                        Log.e(TAG, e.getMessage(), e);
                        showSnackbar(R.string.broadcast_to_continue_failed);
                    }
                }
        );
    }
}
