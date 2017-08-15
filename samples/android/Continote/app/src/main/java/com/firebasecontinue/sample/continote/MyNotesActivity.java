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

import android.content.DialogInterface;
import android.content.Intent;
import android.support.annotation.Nullable;
import android.os.Bundle;
import android.support.v7.app.AlertDialog;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;

import com.firebase.ui.database.FirebaseListAdapter;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

/**
 * The Activity that presents the user with a list of their Notes in Continote.
 *
 * From here the user can add, delete, or open to edit Notes.
 */
public class MyNotesActivity extends BaseActivity {

    private static final String TAG = "MyNotesActivity";

    // Firebase Realtime Database reference for the current user's Notes within Continote.
    @Nullable
    private DatabaseReference mNotesRef = null;

    // Adapter that populates the ListView of Notes.
    @Nullable
    private FirebaseListAdapter<Note> mAdapter = null;

    // UI elements
    @Nullable
    private ListView mListView = null;
    @Nullable
    private Button mNewNoteButton = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_my_notes);

        // Gather the UI elements for this Activity for future manipulation.

        mListView = (ListView) findViewById(R.id.listView);
        if (mListView == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mListView must be non-null");
        }

        mNewNoteButton = (Button) findViewById(R.id.newNoteButton);
        if (mNewNoteButton == null) {
            // This should never happen, but just in case.
            throw new AssertionError("mNewNoteButton must be non-null");
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        if (mAdapter != null) {
            mAdapter.cleanup();
        }
    }

    @Override
    protected void handleUserSignedIn(FirebaseUser user) {
        super.handleUserSignedIn(user);

        if (user == null) {
            // This should never happen, but just in case.
            throw new AssertionError("user must be non-null");
        }

        // Set up our ListView up to sync with the Notes for the current user from the Firebase
        // Realtime Database.
        mNotesRef = FirebaseDatabase.getInstance().getReference("notes/" + user.getUid());
        mAdapter = new FirebaseListAdapter<Note>(
                this,
                Note.class,
                R.layout.note_list_item,
                mNotesRef) {
            @Override
            protected void populateView(View view, Note note, int position) {
                String noteDatabaseKey = getRef(position).getKey();
                NoteListItemViewHolder viewHolder =
                        (NoteListItemViewHolder) view.getTag();
                if (viewHolder == null) {
                    // Set up the ViewHolder to manage this View (i.e. set the content
                    // of the View based on the Note).
                    viewHolder =
                            new NoteListItemViewHolder(view, note, noteDatabaseKey);
                    view.setTag(viewHolder);
                } else {
                    // Since a ViewHolder already existed for this View, update it
                    // based on the Note (since values for the Note may have changed).
                    viewHolder.update(view, note, noteDatabaseKey);
                }
            }
        };
        mListView.setAdapter(mAdapter);

        // Allow the user to tap on a Note list item to open and edit that Note.
        mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                NoteListItemViewHolder viewHolder = (NoteListItemViewHolder) view.getTag();
                if (viewHolder == null) {
                    // This should never happen, but just in case.
                    throw new AssertionError("viewHolder must be non-null");
                }

                // Since the item was tapped, open to edit the Note.
                openEditScreenForNoteWithKey(viewHolder.getNoteDatabaseKey());
            }
        });

        // Allow the user to press and hold on a Note list item to choose to delete that Note.
        mListView.setOnItemLongClickListener(new AdapterView.OnItemLongClickListener() {
            @Override
            public boolean onItemLongClick(AdapterView<?> parent,
                                           View view,
                                           int position,
                                           long id) {
                final NoteListItemViewHolder viewHolder = (NoteListItemViewHolder) view.getTag();
                if (viewHolder == null) {
                    // This should never happen, but just in case.
                    throw new AssertionError("viewHolder must be non-null");
                }

                // Show a dialog with an option for the user to delete this Note.
                final MyNotesActivity myNotesActivity = (MyNotesActivity) view.getContext();
                new AlertDialog.Builder(myNotesActivity)
                    .setTitle(R.string.delete_note_dialog_title)
                    .setMessage(R.string.delete_note_dialog_message)
                    .setPositiveButton(
                            R.string.delete_note_dialog_positive_button_text,
                            new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int which) {
                                    // Try to delete the note, and show an error message if
                                    // something goes wrong.
                                    deleteNoteFromDatabase(viewHolder.getNoteDatabaseKey())
                                        .addOnFailureListener(
                                                myNotesActivity,
                                                new OnFailureListener() {
                                                    @Override
                                                    public void onFailure(Exception e) {
                                                        Log.e(TAG, e.getMessage(), e);
                                                        showSnackbar(R.string.delete_note_failed);
                                                    }
                                                });

                                    // Regardless of whether or not the Note successfully
                                    // gets deleted, close the dialog immediately.
                                    dialog.dismiss();
                                }
                            })
                    .setNegativeButton(
                            R.string.delete_note_dialog_negative_button_text,
                            new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    // Do nothing since the user does not want to delete the Note.
                                    dialog.dismiss();
                                }
                            })
                    .create()
                    .show();

                return true;
            }
        });

        // Finally, show this screen's UI since everything is ready.
        mListView.setVisibility(View.VISIBLE);
        mNewNoteButton.setVisibility(View.VISIBLE);
    }

    @Override
    protected void handleUserSignedOut() {
        super.handleUserSignedOut();

        // The user must be signed in to view this screen, so navigate away from it if the user is
        // signed out.
        finish();
    }

    /**
     * Opens the Edit Note screen for the Note with the provided database key.
     *
     * @param databaseKey The Firebase Realtime Database key of the Note to edit.
     */
    private void openEditScreenForNoteWithKey(final String databaseKey) {
        if (TextUtils.isEmpty(databaseKey)) {
            // This should never happen, but just in case.
            throw new AssertionError("databaseKey must be non-empty");
        }

        final Intent intent = new Intent(this, EditNoteActivity.class);
        intent.putExtra(getString(R.string.extra_note_database_key), databaseKey);
        runOnUiThread(new Runnable() {
            public void run() {
                startActivity(intent);
            }
        });
    }

    /**
     * Handles when the user taps the writeNoteButton.
     *
     * Adds a new Note to the Firebase Realtime Database for the current user,
     * then opens that Note to allow the user to begin writing.
     *
     * @param v The View that called this triggered this handler.
     *          This should only be the writeNoteButton itself.
     */
    public void handleWriteNoteButtonTapped(@Nullable View v) {
        if (!currentUserIsSignedIn() || mNotesRef == null) {
            // This should never happen, but just in case.
            throw new AssertionError(
                    "User must be signed in and their notes database reference must be non-null");
        }

        // Try to add a new, empty Note to the Firebase Realtime Database for the current user.
        addNoteToDatabase(new Note("", ""))
                .addOnSuccessListener(
                        MyNotesActivity.this,
                        new OnSuccessListener<String>() {
                            @Override
                            public void onSuccess(String databaseKey) {
                                // Open the Edit Note screen with this Note.
                                // We do this so that the user may immediately edit the Note,
                                // rather than having to wait for the ListView to update from
                                // Firebase Realtime Database events and then manually tap the
                                // list item for the Note.
                                openEditScreenForNoteWithKey(databaseKey);
                            }
                        })
                .addOnFailureListener(
                        MyNotesActivity.this,
                        new OnFailureListener() {
                            @Override
                            public void onFailure(Exception e) {
                                Log.e(TAG, e.getMessage(), e);
                                showSnackbar(R.string.create_new_note_failed);
                            }
                        });
    }

    /**
     * Attempts to asynchronously add a Note for the current user to the Firebase Realtime Database.
     *
     * This could be modified to go into the Note class, but this is the only place it is used,
     * so this is sufficient for this sample app.
     *
     * @param note The Note to add to the database for the current user.
     * @return A Task which, upon completion, signals whether or not the Note was successfully
     * added to the database. Upon success, the Task provides the database key of the new Note.
     */
    private Task<String> addNoteToDatabase(Note note) {
        final TaskCompletionSource<String> taskCompletion = new TaskCompletionSource<>();
        Task<String> task = taskCompletion.getTask();

        // First, ensure the Note could be valid.
        if (note == null || note.getTitle() == null || note.getContent() == null) {
            taskCompletion.setException(new IllegalArgumentException("note is invalid"));

            return task;
        }

        // Next, ensure the current user is signed in.
        if (FirebaseAuth.getInstance().getCurrentUser() == null) {
            taskCompletion.setException(new IllegalStateException("The user must be signed in"));

            return task;
        }

        // Next, ensure the we have a reference to the current user's Notes.
        if (mNotesRef == null) {
            taskCompletion.setException(new IllegalStateException("No reference to user notes"));

            return task;
        }

        // Finally, attempt to add the Note asynchronously.
        DatabaseReference newNoteRef = mNotesRef.push();
        newNoteRef.setValue(
                note,
                new DatabaseReference.CompletionListener() {
                    @Override
                    public void onComplete(DatabaseError error, DatabaseReference ref) {
                        if (error == null) {
                            // Set that this Task was successful.
                            taskCompletion.setResult(ref.getKey());
                        } else {
                            // Set that this Task was unsuccessful.
                            taskCompletion.setException(error.toException());
                        }
                    }
                });

        return task;
    }

    /**
     * Attempts to asynchronously delete the Note for the current user with the provided database
     * key from the Firebase Realtime Database.
     *
     * This could be modified to go into the Note class, but this is the only place it is used,
     * so this is sufficient for this sample app.
     *
     * @param databaseKey The database key of the Note to delete.
     * @return A Task which, upon completion, signals whether or not the Note with the provided key
     * was successfully deleted from the database.
     */
    private Task<Void> deleteNoteFromDatabase(String databaseKey) {
        final TaskCompletionSource<Void> taskCompletion = new TaskCompletionSource<>();
        Task<Void> task = taskCompletion.getTask();

        // First, ensure the database key could be valid.
        if (TextUtils.isEmpty(databaseKey)) {
            taskCompletion.setException(new IllegalArgumentException("databaseKey is invalid"));

            return task;
        }

        // Next, ensure the current user is signed in.
        if (FirebaseAuth.getInstance().getCurrentUser() == null) {
            taskCompletion.setException(new IllegalStateException("The user must be signed in"));

            return task;
        }

        // Next, ensure the we have a reference to the current user's Notes.
        if (mNotesRef == null) {
            taskCompletion.setException(new IllegalStateException("No reference to user notes"));

            return task;
        }

        // Finally, attempt to delete the Note asynchronously.
        mNotesRef.child(databaseKey).removeValue(
                new DatabaseReference.CompletionListener() {
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
}
