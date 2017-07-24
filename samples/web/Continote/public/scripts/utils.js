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
   * This is the class which, if applied to an element, means
   * the text within the element should be considered a placeholder.
   *
   * @type {!string}
   * @const
   */
  var placeholderClass_ = "placeholder";

  /**
   * This is the name of the click event type.
   *
   * @type {!string}
   * @const
   */
  var clickEventType_ = "click";

  /**
   * Shows the provided DOM element if it is currently hidden.
   *
   * @function
   * @param {!Element} element
   * @const
   */
  var showElement_ = function(element) {
    element.classList.remove(hiddenClass_);
  };

  /**
   * Hides the provided DOM element if it is currently shown.
   *
   * @function
   * @param {!Element} element
   * @const
   */
  var hideElement_ = function(element) {
    element.classList.add(hiddenClass_);
  };

  return {

    /**
     * Shows all DOM elements with the provided className.
     *
     * @function
     * @param {!string} className
     * @const
     */
    showAllElementsWithClassName: function(className) {
      var elements = document.getElementsByClassName(className);
      for (var i = 0; i < elements.length; i++) {
        showElement_(elements[i]);
      }
    },

    /**
     * Hides all DOM elements with the provided className.
     *
     * @function
     * @param {!string} className
     * @const
     */
    hideAllElementsWithClassName: function(className) {
      var elements = document.getElementsByClassName(className);
      for (var i = 0; i < elements.length; i++) {
        hideElement_(elements[i]);
      }
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
    },

    /**
     * Puts the given text, or the given placeholder if the text
     * is null or empty, within the element.
     *
     * @function
     * @param {?string} text
     * @param {!string} placeholder
     * @param {!Element} element
     * @const
     */
    putTextOrPlaceholderInElement: function(text, placeholder, element) {
      if (text && text.length > 0) {
        element.textContent = text;
        element.classList.remove(placeholderClass_);
      } else {
        element.textContent = placeholder;
        element.classList.add(placeholderClass_);
      }
    },

    /**
     * Appends an element based on the provided template to the provided
     * container.
     *
     * @function
     * @param {!string} template - The template to create the new element
     * based upon.
     * @param {!Element} container - The container to append the new element
     * (created from the template) to.
     * @returns {?Element} - The new element that is now in the container (or
     * null if no element could be appended).
     * @const
     */
    appendElementBasedOnTemplateToContainer: function(template, container) {
      if (!template) {
        // Invalid template, so do nothing.
        // This should never happen, but just in case.
        return null;
      }

      if (!container) {
        // Invalid container, so do nothing.
        // This should never happen, but just in case.
        return null;
      }

      // The template will be added to this container
      // (which will not be anywhere in the actual page DOM) temporarily,
      // and then moved to the final container.
      // This is needed so there is an actual element created from the
      // template.
      var temporaryContainer = document.createElement("div");
      temporaryContainer.innerHTML = template;

      // Get the element to put in the actual container from the temporary
      // container, then append that element to said actual container.
      var element = temporaryContainer.firstElementChild;
      container.appendChild(element);

      return element;
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
