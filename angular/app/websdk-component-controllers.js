/* global angular layer */
'use strict';

/**
 * Directives for using widgets from Layer's UI for Web.
 *
 * Every property exposed in these widgets should be listed here.
 * Any widget property that is prefixed with `ng-` can be used within quotes
 * in a template, and scope values will be extracted and watched.
 *
 *    <layer-conversation query="myscopeProp.query"></layer-conversation>
 */

var controllers = angular.module('websdkComponentControllers', []);


/**
 * If the property is a complex object rather than a string/number/boolean/null, we'll need
 * to eval it and to watch for changes to it.  Angular seems to know what to do with string/number/boolean/null values
 */
function setupProps(scope, elem, attrs, props) {
  props.forEach(function(propertyName) {
    // Watch for changes to attributes in this list
    attrs.$observe(propertyName, function(value) {

      // Remove the ng prefix to get the actual property name.
      propertyName = propertyName.replace(/^ng/, 'on');
      if (!(propertyName in elem.constructor.prototype)) {
        propertyName = propertyName.replace(/^on(.)/, function(match, oneChar) {
          return oneChar.toLowerCase();
        });
      }

      // Evaluate and watch the value
      elem[propertyName] =  scope.$eval(value);
      scope.$watch(value, function(value) {
        elem[propertyName] = value;
      });
    });
  });
}


controllers.directive('layerConversationList', function() {
  return {
    retrict: 'E',
    link: function(scope, elem, attrs) {
      var functionProps = ['ngDeleteConversationEnabled', 'ngConversationDeleted', 'ngConversationSelected', 'ngRenderListItem', 'ngAppId', 'ngClient', 'ngQuery', 'ngSelectedConversationId'];
      setupProps(scope, elem[0], attrs, functionProps);
    }
  }
});

controllers.directive('layerConversation', function() {
  return {
    retrict: 'E',
    link: function(scope, elem, attrs) {
      var functionProps = ['ngDeleteMessageEnabled', 'ngRenderMessageItem', 'ngQuery', 'ngAppId', 'ngQueryId', 'ngConversationId', 'ngComposeText', 'ngComposeButtons', 'ngClient', 'ngAutoFocusConversation'];
      setupProps(scope, elem[0], attrs, functionProps);
    }
  }
});

controllers.directive('layerUserList', function() {
  return {
    retrict: 'E',
    link: function(scope, elem, attrs) {
      var functionProps = ['ngUserSelected', 'ngRenderListItem', 'ngSelectedUsers', 'ngClient', 'ngFilter', 'ngQuery', 'ngAppId', 'ngQueryId'];
      setupProps(scope, elem[0], attrs, functionProps);
    }
  }
});