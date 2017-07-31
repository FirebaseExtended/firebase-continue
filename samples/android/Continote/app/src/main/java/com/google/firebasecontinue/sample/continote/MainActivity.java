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

package com.google.firebasecontinue.sample.continote;

import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.firebase.ui.auth.AuthUI;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseUser;

import java.util.Arrays;
import java.util.List;

/**
 * The Activity that the user initially sees.
 * It presents the user with an initial screen to either sign in and then navigate to other screens,
 * or sign out.
 */
public class MainActivity extends BaseActivity {

    // The authentication methods this app allows.
    private static final List<AuthUI.IdpConfig> AUTH_PROVIDERS =
            Arrays.asList(
                    new AuthUI.IdpConfig.Builder(AuthUI.GOOGLE_PROVIDER).build(),
                    new AuthUI.IdpConfig.Builder(AuthUI.FACEBOOK_PROVIDER).build());

    // UI elements
    @Nullable
    private TextView authMessageTextView = null;
    @Nullable
    private Button authButton = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        // Gather the UI elements for this Activity for future manipulation.
        authMessageTextView = (TextView) findViewById(R.id.authMessageTextView);
        authButton = (Button) findViewById(R.id.authButton);
    }

    @Override
    protected void handleUserSignedIn(@NonNull FirebaseUser user) {
        // Update the UI to reflect the user now being signed in.

        if (authMessageTextView != null) {
            authMessageTextView.setText(
                    getString(R.string.auth_message_when_signed_in,
                              user.getDisplayName(),
                              user.getEmail()));
        }

        if (authButton != null) {
            authButton.setText(R.string.auth_button_text_when_signed_in);
        }
    }

    @Override
    protected void handleUserSignedOut() {
        /// Update the UI to reflect the user now being signed out.

        if (authMessageTextView != null) {
            authMessageTextView.setText(R.string.auth_message_when_signed_out);
        }

        if (authButton != null) {
            authButton.setText(R.string.auth_button_text_when_signed_out);
        }
    }

    /**
     * Handles when the user taps the auth (i.e. "Sign In"/"Sign Out") button.
     *
     * @param v The View that called this triggered this handler.
     *          This should only be the authButton itself.
     */
    public void handleAuthButtonTapped(View v) {
        if (currentUserIsSignedIn()) {
            // The current user is signed in, so attempt to sign them out.
            AuthUI.getInstance()
                    .signOut(this)
                    .addOnCompleteListener(new OnCompleteListener<Void>() {
                        @Override
                        public void onComplete(@NonNull Task<Void> task) {
                            if (!task.isSuccessful()) {
                                // Inform the user that signing out failed.
                                showSnackbar(R.string.error_sign_out_failed);
                            }
                        }
                    });
        } else {
            // The current user is signed out, so present them with a sign in screen.
            startActivityForResult(
                    AuthUI.getInstance()
                            .createSignInIntentBuilder()
                            .setAvailableProviders(AUTH_PROVIDERS)
                            .setIsSmartLockEnabled(false)
                            .setTheme(R.style.AppTheme)
                            .build(),
                    0);
        }
    }
}
