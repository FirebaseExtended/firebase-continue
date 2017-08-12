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

#import "FCNContinue.h"

@import Firebase;

@interface FCNContinue ()

/**
 * Asynchronously executes the provided completion block on the main thread with the provided error.
 *
 * @param completionBlock The optional completion block to execute.
 * @param firebaseContinueError The optional error to invoke the completion block with.
 */
+ (void)executeCompletionBlockOnMainThread:(nullable FCNContinueCompletionBlock)completionBlock
                                 withError:(nullable NSError *)firebaseContinueError;

/**
 * Creates an NSError, within the context of FirebaseContinue, with the provided reason.
 *
 * @param reason The reason to use for the error.
 * @return An error for use with Firebase Continue completion blocks.
 */
+ (nullable NSError *)createErrorWithReason:(NSString *)reason;

/**
 * Determines and then returns whether or not the provided string value is nil or only whitespace.
 *
 * @param value The value to check.
 * @return YES iff the provided value is nil or it consists solely of whitespace, NO otherwise.
 */
+ (BOOL)isNilOrOnlyWhitespace:(nullable NSString *)value;

@end

@implementation FCNContinue

static NSString *_Nullable activityTypeForHandoff = nil;

// We need to retain this value for Apple Handoff to function correctly.
static NSUserActivity *_Nullable lastBroadcastActivityForHandoff = nil;

+ (void)initialize {
  activityTypeForHandoff =
      [NSString stringWithFormat:@"%@.%@", [[NSBundle mainBundle] bundleIdentifier],
                                 @"FirebaseContinueActivity"];
}

+ (void)broadcastToContinueActivityWithUrl:(NSString *)activityUrl
                 withinApplicationWithName:(NSString *)applicationName
                       withCompletionBlock:(nullable FCNContinueCompletionBlock)completionBlock {
  // Use a chain of asynchronously executed blocks to eventually set the value for the current user
  // of the most recent Activity they may wish to continue within the application.
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^(void) {

    // First, ensure the inputs could be valid.
    if ([self isNilOrOnlyWhitespace:activityUrl]) {
      [self
          executeCompletionBlockOnMainThread:completionBlock
                                   withError:[self
                                                 createErrorWithReason:@"activityUrl is invalid"]];
      return;
    } else if ([self isNilOrOnlyWhitespace:applicationName]) {
      [self executeCompletionBlockOnMainThread:completionBlock
                                     withError:[self createErrorWithReason:
                                                         @"applicationName is invalid"]];
      return;
    }

    // Next, ensure the current user is signed in.
    FIRUser *currentUser = [FIRAuth auth].currentUser;
    if (!currentUser) {
      [self executeCompletionBlockOnMainThread:completionBlock
                                     withError:[self createErrorWithReason:
                                                         @"The current user must be signed in"]];
      return;
    }

    // Get the DatabaseReference for the most recent Activity the current user may wish to continue
    // (within the context of the "applicationName" application).
    NSString *databasePathToMostRecentActivity =
        [NSString stringWithFormat:@"firebaseContinue/%@/%@", applicationName, currentUser.uid];
    FIRDatabaseReference *mostRecentActivityRef =
        [[FIRDatabase database] referenceWithPath:databasePathToMostRecentActivity];

    // Since we now have a DatabaseReference for it, delete any current value for the
    // most recent Activity the user may wish to continue.
    // We do this because Activities are considered immutable within the database, so
    // before setting a value any existing value must first be deleted.
    [mostRecentActivityRef removeValueWithCompletionBlock:^(NSError *_Nullable error,
                                                            FIRDatabaseReference *_Nonnull ref) {
      if (error) {
        [self executeCompletionBlockOnMainThread:completionBlock
                                       withError:
                                           [self createErrorWithReason:error.localizedDescription]];
        return;
      }

      // Now we can set the new value for the most recent Activity the user may wish
      // to continue within the application, since any previous value has been deleted.

      // Create a Firebase Continue Activity to use as the new most recent Activity
      // the user may wish to continue within the application.
      // The schema of each Activity is defined in
      // sample-firebase-continue-database.rules.json.
      NSDictionary<NSString *, id> *activityMetadata = @{@"addedAt" : [FIRServerValue timestamp]};
      NSDictionary<NSString *, id> *activity =
          @{@"url" : activityUrl, @"metadata" : activityMetadata};

      [ref setValue:activity
          withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull ref) {
            if (error) {
              [self executeCompletionBlockOnMainThread:completionBlock
                                             withError:[self createErrorWithReason:
                                                                 error.localizedDescription]];
              return;
            }

            // The broadcast via Firebase was successful, so use Apple Handoff as well.
            // TODO: Apple Handoff usage within Firebase Continue has the potential to be vastly
            // improved. For example, possibly look into the user experience of Apple Handoff -
            // figure out how to make it work well in the context of Firebase Continue (ex.
            // invalidate an Apple Handoff Activity if the user opens it in the browser, etc.) This
            // could also mean simply making Firebase Continue more Apple Handoff-like overall (i.e.
            // removing the concept of activity "staleness" and forcing the mobile clients to manage
            // whether or not the user may wish to continue something). This requires some thought,
            // so discussion on GitHub would be wise.
            lastBroadcastActivityForHandoff =
                [[NSUserActivity alloc] initWithActivityType:activityTypeForHandoff];
            lastBroadcastActivityForHandoff.webpageURL = [NSURL URLWithString:activityUrl];
            lastBroadcastActivityForHandoff.eligibleForHandoff = YES;
            [lastBroadcastActivityForHandoff becomeCurrent];

            // Finally, execute the completion block with no error.
            [self executeCompletionBlockOnMainThread:completionBlock withError:nil];
          }];
    }];
  });
}

+ (void)executeCompletionBlockOnMainThread:(nullable FCNContinueCompletionBlock)completionBlock
                                 withError:(nullable NSError *)error {
  if (!completionBlock) {
    // No completion block to execute.
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^(void) {
    completionBlock(error);
  });
}

+ (NSError *)createErrorWithReason:(NSString *)reason {
  // The library does not currently provide error codes for specific issues that can occur, so the
  // error code is hardcoded below.
  return [NSError errorWithDomain:@"FirebaseContinue"
                             code:0
                         userInfo:@{NSLocalizedDescriptionKey : reason}];
}

+ (BOOL)isNilOrOnlyWhitespace:(nullable NSString *)value {
  return [[value stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]]
             length] == 0;
}

@end
