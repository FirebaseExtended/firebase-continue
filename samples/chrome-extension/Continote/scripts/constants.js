/**
 * Copyright (c) 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a
 * copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * This object provides global constants.
 *
 * Remember to include this script in the <head> of a page if you plan on
 * using any of these constants within that page.
 *
 * @type {!Object}
 * @const
 */
var Constants = (function() {
  'use strict';

  return {

    /**
     * The name of this application.
     * This is used to get the Firebase Continue instance for Continote.
     *
     * @type {!string}
     * @const
     */
    appName: "continote"
  }
}());
