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
 * This object provides some simple utility functions.
 *
 * Remember to include this script in the <head> of a page if you plan on
 * using any of these utilities within that page.
 *
 * TODO: Consider setting up a "common" folder for the Chrome extension sample
 * and the web app sample to share code, and putting this file there since it
 * currently has plenty of overlap (as of July 21, 2017).
 * If this change is made, remember to update the installation/setup guides!
 *
 * @type {!Object}
 * @const
 */
var Utils = (function() {
  'use strict';

  /**
   * This is the class which, if applied to an element, hides that element.
   *
   * @type {!string}
   * @const
   */
  var hiddenClass_ = "hidden";

  /**
   * This is the name of the click event type.
   *
   * @type {!string}
   * @const
   */
  var clickEventType_ = "click";

  return {
    /**
     * Shows the provided DOM element if it is currently hidden.
     *
     * @function
     * @param {!Element} element
     * @const
     */
    showElement: function(element) {
      element.classList.remove(hiddenClass_);
    },

    /**
     * Hides the provided DOM element if it is currently shown.
     *
     * @function
     * @param {!Element} element
     * @const
     */
    hideElement: function(element) {
      element.classList.add(hiddenClass_);
    },

    /**
     * Enables the provided button element if it is currently disabled,
     * and adds the provided click event listener to the button
     * if the event listener is not already attached to it.
     *
     * @function
     * @param {!Element} button
     * @param {?ClickEventListener} clickEventListener
     * @const
     */
    enableButtonAndAddClickListener: function(button, clickEventListener) {
      button.disabled = false;
      if (clickEventListener) {
        button.addEventListener(clickEventType_, clickEventListener);
      }
    },

    /**
     * Disables the provided button element if it is currently enabled,
     * and removes the provided click event listener from the button
     * if the event listener is currently attached to it.
     *
     * @function
     * @param {!Element} button
     * @param {?ClickEventListener} clickEventListener
     * @const
     */
    disableButtonAndRemoveClickListener: function(button, clickEventListener) {
      button.disabled = true;
      if (clickEventListener) {
        button.removeEventListener(clickEventType_, clickEventListener);
      }
    }
  }
}());

// Below are extra JSDoc definitions to describe the callback functions
// this utility object expects.

/**
 * The standard click event callback.
 *
 * @callback ClickEventListener
 * @param {!Object} event
 */
