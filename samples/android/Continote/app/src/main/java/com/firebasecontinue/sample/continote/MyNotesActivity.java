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

import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import com.firebasecontinue.FirebaseContinue;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.auth.FirebaseUser;

/**
 * The Activity that presents the user with a list of their Notes in Continote.
 *
 * From here the user can add, delete, or open to edit Notes.
 *
 * TODO: Remove the basic Firebase Continue library testing code and finish this Activity.
 */
public class MyNotesActivity extends BaseActivity {

    // UI elements
    @Nullable
    private Button testFirebaseContinueButton = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_my_notes);

        // Gather the UI elements for this Activity for future manipulation.
        testFirebaseContinueButton = (Button) findViewById(R.id.testFirebaseContinueButton);
    }

    @Override
    protected void handleUserSignedIn(@NonNull FirebaseUser user) {
        super.handleUserSignedIn(user);

        // Update the UI to reflect the user now being signed in.

        if (testFirebaseContinueButton != null) {
            testFirebaseContinueButton.setVisibility(View.VISIBLE);
        }
    }

    @Override
    protected void handleUserSignedOut() {
        super.handleUserSignedOut();

        // The user must be signed in to view this screen, so navigate away from it if the user is
        // signed out.
        finish();
    }

    /**
     * Handles when the user taps the testFirebaseContinueButton.
     *
     * TODO: Remove this and related library testing code when this sample is more fleshed out.
     *
     * @param v The View that called this triggered this handler.
     *          This should only be the testFirebaseContinue itself.
     */
    public void handleTestFirebaseContinueButtonTapped(View v) {
        if (currentUserIsSignedIn()) {
            // The current user is signed in, so allow them to continue writing a Note elsewhere
            // by using Firebase Continue to broadcast the URL to edit the Note.

            // We use what's known as "activity-scoped listeners" here to react to the broadcast
            // Task either succeeding or failing upon its completion.
            // The reason we use activity-scoped listeners here is that they are automatically
            // removed during the onStop method of the Activity so that they are not called when
            // the Activity is no longer visible. For more details about activity-scoped listeners
            // (and Task listeners in general), see:
            // https://developers.google.com/android/guides/tasks#activity-scoped_listeners
            FirebaseContinue.broadcastActivityToContinue(
                    getString(R.string.continote_url_to_edit_note_with_key, "someNoteKey"),
                    getString(R.string.app_name_for_firebase_continue)
            ).addOnSuccessListener(this, new OnSuccessListener<Void>() {
                @Override
                public void onSuccess(Void result) {
                    showSnackbar(R.string.broadcast_to_write_note_elsewhere_successful);
                }
            }).addOnFailureListener(this, new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    showSnackbar(R.string.error_broadcast_to_write_note_elsewhere_failed);
                }
            });
        }
    }
}
