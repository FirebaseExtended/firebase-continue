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

#import "FCNViewController.h"

@import FirebaseContinue;

/**
 * Important Note: This is not a working example of using Firebase Continue.
 *
 * The Firebase Continue for iOS library is planned to eventually be available via Cocoapods
 * (rather than being required to manually copy-paste its source into your project), so this
 * Cocoapods-provided development environment lays the groundwork for that.
 *
 * For an actual, working sample of Firebase Continue, see the samples/ios subdirectory
 * from the root of the repository at:
 * https://github.com/firebase/firebase-continue/tree/master/samples/ios
 */
@interface FCNViewController ()

@end

@implementation FCNViewController

- (void)viewDidAppear:(BOOL)animated
{
  [super viewDidAppear:animated];

  // Attempt to use Firebase Continue here. This should fail for any number of reasons,
  // including that Firebase has not been set up for this app.
  [FCNContinue broadcastToContinueActivityWithUrl: @"http://some.url.com"
                        withinApplicationWithName: @"SomeApplicationName"
                                       onComplete:^(NSError* error) {
                                         if (error) {
                                           printf("FirebaseContinue: Broadcast failed");
                                           return;
                                         }

                                         printf("FirebaseContinue: Broadcast successful");
                                       }];
}

@end
