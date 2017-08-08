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
 * @class FirebaseContinue
 * @brief The Firebase Continue for iOS library enables developers to easily integrate activity
 * transitioning from their iOS apps to the web, by way of Firebase and Chrome extensions.
 * For more details, see: https://github.com/firebase/firebase-continue
 */
@interface FCNContinue : NSObject

/**
 * Broadcasts to all possible clients (such as a Chrome extension) that the user may wish to
 * "continue" the provided activity (via the URL) within the provided application. This uses
 * Firebase Authentication to ensure the activity data is user-specific, and the Firebase
 * Realtime Database to facilitate data storage and transfer to all possible clients which could
 * allow the user to continue the activity.
 *
 * @param activityUrl The URL which, if visited by the user, would allow them to continue their
 * activity.
 * @param applicationName The name of the application the current user's activity is within.
 * This must match an application name listed in your Firebase Realtime Database rules for
 * Firebase Continue (as noted in the Firebase Continue setup guides).
 * @param completionBlock The optional block which is invoked when the broadcasting is complete.
 * The error in the block will be non-nil if the broadcast was unsuccessful.
 */
+ (void)broadcastToContinueActivityWithUrl:(NSString*)activityUrl
                 withinApplicationWithName:(NSString*)applicationName
                                onComplete:(nullable void (^)(NSError* error))completionBlock;

@end

NS_ASSUME_NONNULL_END
