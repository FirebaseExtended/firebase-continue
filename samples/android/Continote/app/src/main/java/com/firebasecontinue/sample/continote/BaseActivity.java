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

import android.support.annotation.StringRes;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.view.View;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

/**
 * The abstract Activity which all other Activities in this app must subclass.
 *
 * It provides functionality needed by all Activities, such as setting up Firebase Auth to listen
 * for authentication state changes.
 */
public abstract class BaseActivity extends AppCompatActivity {

    // Firebase-related
    private final FirebaseAuth.AuthStateListener mHandleAuthStateChanged =
            new FirebaseAuth.AuthStateListener() {
                @Override
                public void onAuthStateChanged(FirebaseAuth firebaseAuth) {
                    FirebaseUser user = firebaseAuth.getCurrentUser();
                    if (user != null) {
                        // Since the user object is non-null, the current user is now signed in.
                        BaseActivity.this.handleUserSignedIn(user);
                    } else {
                        // Since the user object is null, the current user is now signed out.
                        BaseActivity.this.handleUserSignedOut();
                    }
                }
            };

    @Override
    protected void onStart() {
        super.onStart();

        // Start listening for Firebase Auth state changes.
        FirebaseAuth.getInstance().addAuthStateListener(mHandleAuthStateChanged);
    }

    @Override
    protected void onStop() {
        super.onStop();

        // Stop listening for Firebase Auth state changes.
        FirebaseAuth.getInstance().removeAuthStateListener(mHandleAuthStateChanged);
    }

    /**
     * Displays the provided message in a snackbar.
     *
     * See: https://developer.android.com/reference/android/support/design/widget/Snackbar.html
     */
    protected void showSnackbar(@StringRes final int messageRes) {
        runOnUiThread(new Runnable() {
            public void run() {
                View rootView = findViewById(android.R.id.content);
                if (rootView != null) {
                    Snackbar.make(rootView, messageRes, Snackbar.LENGTH_LONG).show();
                }
            }
        });
    }

    /**
     * Determines and then returns whether or not the current user is signed in.
     *
     * @return true iff the current user is signed into this app, false otherwise.
     */
    protected boolean currentUserIsSignedIn() {
        return FirebaseAuth.getInstance().getCurrentUser() != null;
    }

    /**
     * Handles when the user signs in.
     *
     * Override in subclasses to respond to this authentication state change.
     *
     * @param user The user who is now signed in.
     */
    protected void handleUserSignedIn(FirebaseUser user) {}

    /**
     * Handles when the user signs out.
     *
     * Override in subclasses to respond to this authentication state change.
     */
    protected void handleUserSignedOut() {}
}
