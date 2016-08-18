/* global angular layer */
'use strict';

var controllers = angular.module('announcementListControllers', []);

/**
 * Placeholder; just contains the Announcement Dialog components
 */
controllers.controller('announcementDialogCtrl', function($scope, $rootScope) {

});

/**
 * The Announcement List consists of
 *
 * * A Query
 * * A showAnnouncements State
 * * An array of Announcement Items ($scope.data)
 */
controllers.controller('announcementListCtrl', function($scope, $rootScope) {
  // Store all message data here
  $scope.data = [];

  // Create the Announcements Query
  $scope.query = $scope.appCtrlState.client.createQuery({
    model: layer.Query.Announcement,
    dataType: 'object',
    paginationWindow: 30
  });

  /**
   * Whenever new Announcements arrive, update $scope.data and automatically show the Announcements Dialog.
   *
   * See http://static.layer.com/sdk/docs/#!/api/layer.Query for
   * more information on query change events.
   */
  $scope.query.on('change', function(evt) {

    // Ignore reset events unless we already have data
    if (evt.type !== 'reset' || $scope.data.length) {

      $scope.data = $scope.query.data.concat([]);

      $scope.chatCtrlState.unreadAnnouncements = $scope.data.filter(function(item) {
        return !item.isRead;
      }).length;

      if ($scope.data.length && $scope.data[$scope.data.length - 1].isUnread) {
        $scope.chatCtrlState.showAnnouncements = true;
        $rootScope.$digest();
      }

      // Any time the query's data changes, rerender.
      if ($scope.$$phase !== '$digest') {
        $scope.$digest();
      }
    }
  });
});


/**
 * Each Annoucement Item starts off closed, but can be clocked to toggle it open/closed.
 *
 * Opening it will mark it as read.
 */
controllers.controller('announcementListItemCtrl', function ($scope) {
  // Used by announcements only
  $scope.closed = true;

  $scope.toggleMessageOpen = function() {
    setTimeout(function() {
      var message = $scope.appCtrlState.client.getMessage($scope.message.id);
      if (message) message.isRead = true;
    }, 1);
    $scope.closed = !$scope.closed;
  };

  /**
   * Get the message's read/delivered status.  For this
   * simple example we ignore delivered (see `message.deliveryStatus`).
   *
   * See http://static.layer.com/sdk/docs/#!/api/layer.Message-property-readStatus
   *
   * @method
   * @param  {Object} message - Message object or instance
   * @return {string} - Message to display in the status node
   */
  $scope.getMessageStatus = function(message) {
    switch (message.readStatus) {
      case 'NONE':
        return 'unread';
      case 'SOME':
        return 'read by some';
      case 'ALL':
        return 'read';
    }
  };

  /**
   * Get the message sentAt string in a nice renderable format.
   *
   * See http://static.layer.com/sdk/docs/#!/api/layer.Message-property-sentAt
   *
   * @method
   * @param  {Object} message - Message object or instance
   * @return {string} - Message to display in the sentAt node
   */
  $scope.getMessageDate = function(message) {
    return window.layerSample.dateFormat(message.sentAt);
  };

  $scope.getPartTemplate = function(part) {
    return part.mimeType.replace(/[^a-zA-Z]/g, '') + 'Part.html';
  };
});