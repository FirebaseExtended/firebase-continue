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

@import Foundation;

NS_ASSUME_NONNULL_BEGIN

/**
 * A block which is invoked on the main thread when something the Firebase Continue library
 * attempted to do asynchronously completed. The error provided to the block will be non-nil if
 * the it was unsuccessful. See the library method documentation below for more details.
 */
typedef void (^FCNContinueCompletionBlock)(NSError *_Nullable firebaseContinueError);

/**
 * @class FCNContinue
 * @brief The Firebase Continue for iOS library.
 *
 * Firebase Continue enables developers to easily integrate activity transitioning from their
 * iOS apps to the web, by way of Firebase and Chrome extensions (or Apple Handoff for users with
 * both an iOS device and macOS computer that are Apple Handoff enabled).
 * For more details, see: https://github.com/firebase/firebase-continue
 *
 * Please see the usage instructions in the relevant README file(s).
 * There is also more specific documentation within the library itself below.
 *
 * TODO: Add unit tests, including tests while the app/Firebase is offline.
 */
@interface FCNContinue : NSObject

/**
 * Attempts to asynchronously broadcast an Activity (codified as a URL) within an application
 * that the currently signed in user may wish to continue elsewhere (in the immediate future)
 * to all potential clients (ex. Chrome extension(s) and/or Apple Handoff enabled macOS computers)
 * which could allow the user to do so by opening said URL.
 *
 * Note that, by design, only the most recently successfully broadcast Activity (for a given
 * application) could possibly be relevant to the user. The Firebase Continue database rules
 * and libraries enforce this. For more details, please see the relevant README file(s).
 *
 * @param activityUrl The URL which, if the current user were to navigate to, would allow the user
 * to continue their Activity.
 * @param applicationName The name of the application, as defined in the Firebase Realtime
 * Database rules for Firebase Continue, that the user's Activity is within.
 * @param completionBlock An optional completion block which is invoked on the main thread when the
 * broadcast attempt is complete. The error provided to the block will be non-nil if the broadcast
 * was unsuccessful.
 */
+ (void)broadcastToContinueActivityWithUrl:(NSString *)activityUrl
                 withinApplicationWithName:(NSString *)applicationName
                       withCompletionBlock:(nullable FCNContinueCompletionBlock)completionBlock
    NS_SWIFT_NAME(broadcastToContinueActivity(withUrl:withinApplication:onComplete:));

/**
 * TODO: Possibly add a "dismissActivityToContinue" method akin to dismissing within the Chrome
 * extensions library. This could be used by mobile apps when an Activity that was broadcast would
 * certainly no longer be relevant to the user (rather than letting the Chrome extension library
 * itself (or the user within a Chrome extension) decide that).
 */

- (id)init __attribute__((unavailable("FCNContinue cannot be instantiated")));

@end

NS_ASSUME_NONNULL_END
