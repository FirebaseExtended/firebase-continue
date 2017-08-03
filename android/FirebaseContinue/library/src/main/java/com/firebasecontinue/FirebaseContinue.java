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

package com.firebasecontinue;

import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ServerValue;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * The Firebase Continue for Android library.
 *
 * Firebase Continue enables mobile developers to easily integrate activity transitioning
 * from their mobile apps to the web by way of Chrome extensions.
 * For more details, see: https://github.com/firebase/firebase-continue.
 *
 * Please see the usage instructions in the relevant README file(s).
 * There is also more specific documentation within the library itself below.
 *
 * TODO: Add unit tests, including tests while the app/Firebase is offline.
 */
public final class FirebaseContinue {

    /**
     * Attempts to asynchronously broadcast an Activity (codified as a URL) within an application
     * that the currently signed in user may wish to continue elsewhere (in the immediate future)
     * to all potential clients (i.e. Chrome extension(s)) which could allow the user to do so by
     * opening said URL.
     *
     * Note that, by design, only the most recently successfully broadcast Activity (for a given
     * application) could possibly be relevant to the user. The Firebase Continue database rules
     * and libraries enforce this. For more details, please see the relevant README file(s).
     *
     * @param activityUrl The URL which, if the current user were to navigate to,
     *                    would allow the user to continue their Activity.
     * @param applicationName The name of the application, as defined in the Firebase Realtime
     *                        Database rules for Firebase Continue, that the user's Activity is
     *                        within.
     * @return A Task which, upon completion, signals whether or not the Firebase Continue Activity
     * with the provided URL (within the context of the application with the provided appName)
     * was successfully broadcast to all potential clients which could allow the user to continue
     * the Activity, or that the broadcast failed. To understand how to use Tasks,
     * see: https://developers.google.com/android/guides/tasks.
     */
    public static Task<Void> broadcastActivityToContinue(final String activityUrl,
                                                         final String applicationName) {
        // Use a chain of Tasks to eventually set the value for the current user of the most
        // recent Activity they may wish to continue within the application.
        return Tasks.call(new Callable<DatabaseReference>() {
            @Override
            public DatabaseReference call() throws Exception {
                // First, ensure the inputs could be valid.
                if (activityUrl == null || activityUrl.trim().length() == 0) {
                    throw new IllegalArgumentException("activityUrl is invalid");
                } else if (applicationName == null || applicationName.trim().length() == 0) {
                    throw new IllegalArgumentException("applicationName is invalid");
                }

                // Next, ensure the current user is signed in.
                FirebaseUser currentUser = FirebaseAuth.getInstance().getCurrentUser();
                if (currentUser == null) {
                    throw new IllegalStateException("The current user must be signed in");
                }

                // Provide the proceeding Task with the DatabaseReference for the most recent
                // Activity the current user may wish to continue (within the context of the
                // "applicationName" application).
                return FirebaseDatabase.getInstance().getReference()
                        .child("firebaseContinue")
                        .child(applicationName)
                        .child(currentUser.getUid());
            }
        }).continueWithTask(new Continuation<DatabaseReference, Task<DatabaseReference>>() {
            @Override
            public Task<DatabaseReference> then(Task<DatabaseReference> task) throws Exception {
                // Since we now have a DatabaseReference for it, delete any current value for the
                // most recent Activity the user may wish to continue.
                // We do this because Activities are considered immutable within the database, so
                // before setting a value any existing value must first be deleted.

                final TaskCompletionSource<DatabaseReference> deletionTaskCompletion =
                        new TaskCompletionSource<>();
                DatabaseReference mostRecentActivityRef = task.getResult();
                mostRecentActivityRef.removeValue(
                        new DatabaseReference.CompletionListener() {
                            @Override
                            public void onComplete(DatabaseError error, DatabaseReference ref) {
                                if (error == null) {
                                    // Set that this Task was successful and pass along the
                                    // DatabaseReference to the next Task.
                                    deletionTaskCompletion.setResult(ref);
                                } else {
                                    // Set that this Task was unsuccessful.
                                    deletionTaskCompletion.setException(error.toException());
                                }
                            }
                        });

                return deletionTaskCompletion.getTask();
            }
        }).continueWithTask(new Continuation<DatabaseReference, Task<Void>>() {
            @Override
            public Task<Void> then(Task<DatabaseReference> task) throws Exception {
                // Now we can set the new value for the most recent Activity the user may wish
                // to continue within the application, since any previous value has been deleted.

                // Create a Firebase Continue Activity to use as the new most recent Activity
                // the user may wish to continue within the application.
                // The schema of each Activity is defined in
                // sample-firebase-continue-database.rules.json.
                Map<String, Object> activityMetadata = new HashMap<>();
                activityMetadata.put("addedAt", ServerValue.TIMESTAMP);
                Map<String, Object> activity = new HashMap<>();
                activity.put("url", activityUrl);
                activity.put("metadata", activityMetadata);

                final TaskCompletionSource<Void> setValueTaskCompletion =
                        new TaskCompletionSource<>();
                DatabaseReference mostRecentActivityRef = task.getResult();
                mostRecentActivityRef.setValue(
                        activity,
                        new DatabaseReference.CompletionListener() {
                            @Override
                            public void onComplete(DatabaseError error, DatabaseReference ref) {
                                if (error == null) {
                                    // Set that this Task was successful.
                                    setValueTaskCompletion.setResult(null);
                                } else {
                                    // Set that this Task was unsuccessful.
                                    setValueTaskCompletion.setException(error.toException());
                                }
                            }
                        });

                return setValueTaskCompletion.getTask();
            }
        });
    }

    // TODO: Possibly add a "dismissActivityToContinue(String activityUrl, String appName)"
    // method akin to dismissing within the Chrome extensions library.
    // This could be used by mobile apps when an Activity that
    // was broadcast would certainly no longer be relevant to the user (rather than letting the
    // Chrome extension library itself (or the user within a Chrome extension) decide that).

    /**
     * This library only exposes static methods, so no instances are necessary.
     */
    private FirebaseContinue() {
        throw new UnsupportedOperationException("FirebaseContinue cannot be instantiated");
    }
}
