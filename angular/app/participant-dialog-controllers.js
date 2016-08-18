/* global angular */
'use strict';

var controllers = angular.module('participantDialogControllers', []);

/**
 * The Participant Dialog Controller provides a UI for creating a new Conversation.
 * It could also be used to edit existing conversations.
 * This Dialog consists of a list of users to select,
 * and a place to enter a first message.
 */
controllers.controller('participantsDialogCtrl', function($scope, $location) {
  $scope.selectedUsers = [];

  $scope.$watch('chatCtrlState.showParticipants', function(newValue, oldValue) {
    $scope.selectedUsers = [];
  });

  $scope.onUserSelectionChange = function(evt) {
    var target = evt.target;
    setTimeout(function() {
      $scope.selectedUsers = target.selectedUsers.map(function(user) {return user.toObject();});
      $scope.$apply();
    }, 1);
  };

  /**
   * Call createConversation if we have participants.
   *
   * Note that this will not be sent to the server until the user sends a Message.
   *
   * Once the Conversation itself has been created, update the URL
   * to point to that Conversation.
   */
  $scope.createConversation = function() {
    // Get the userIds of all selected users
    var participants = $scope.selectedUsers.map(function(identity) {return identity.id;});

    if (participants.length) {

      // Create the Conversation
      var conversationInstance = $scope.appCtrlState.client.createConversation({
        participants: participants,
        distinct: participants.length === 1,
      });

      // Update our location.
      $location.path(conversationInstance.id.substring(8));
    }
  };
});
