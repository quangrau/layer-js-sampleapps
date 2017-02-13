/* global angular layer */
'use strict';

var sampleControllers = angular.module('sampleAppControllers', []);
var identityReady;

/**
 * Notes: data in this application is driven by Queries.  Queries can be set
 * to return Conversation, Message and Identity Objects or Instances.  Using a return of type Object
 * lets us have an immutable object that simplifies angular's scope comparisons.
 * An Instance provides methods that let us interact with the layer services.
 * Both are used in this application: Objects for managing angular state,
 * Instances for interacting with the WebSDK.
 */

/**
 * Wait for the user to specify who they are before we procede
 */
window.addEventListener('message', function(evt) {
  if (evt.data === 'layer:identity') {
    identityReady();
  }
});

/**
 * The Main Application Controller initializes the client
 * and loads the Chat Controller
 */
sampleControllers.controller('appCtrl', function ($scope) {

  $scope.appCtrlState = {
    isReady: false,
    client: null
  };

  /**
   * Start by creating a client; it will authenticate asynchronously,
   * so the UI needs to account for the fact that it won't have any data
   * when first rendering.
   */
  identityReady = function() {

    /**
     * Initialize Layer Client with `appId`
     */
    $scope.appCtrlState.client = new layer.Client({
      appId: window.layerSample.appId
    });

    /**
     * Client authentication challenge.
     * Sign in to Layer sample identity provider service.
     */
    $scope.appCtrlState.client.on('challenge', function(evt) {
      window.layerSample.getIdentityToken(evt.nonce, evt.callback);
    });

    /**
     * Once the client is ready, get our users (static data
     * for this sample) and render.
     */
    $scope.appCtrlState.client.on('ready', function() {
      $scope.appCtrlState.isReady = true;
    });

    // Create the User List query; this query will automatically wait to fire
    // until after the client has finished authenticating.
    // Note that this is used Solely for validating your account is setup, and would not
    // typically be in an app.  This is NOT used for generating an Identity List.
    // <layer-identities-list /> generates that Query for you.
    $scope.identityQuery = $scope.appCtrlState.client.createQuery({
      model: layer.Query.Identity,
      dataType: 'object',
      paginationWindow: 500,
      change: function(evt) {

        // Any changes to the query, update our rendering
        $scope.$apply();
        if (evt.type === 'data') {
          window.layerSample.validateSetup($scope.appCtrlState.client);
        }
      }
    });

    // Start the authentication process
    $scope.appCtrlState.client.connect(window.layerSample.userId);
  };
});

/**
 * The Main Application Controller manages:
 * 1. Whether to show the identities-list or announcements dialog
 * 2. Tracking the currentConversation
 * 2. All routing (current conversation or new conversation)
 */
sampleControllers.controller('chatCtrl', function ($scope, $location) {
  $scope.chatCtrlState = {
    showParticipants: false,
    showAnnouncements: false,
    unreadAnnouncements: 0,
    currentConversation: null
  };

  /**
   * Get the Conversation from cache... or from the server if not cached.
   * Once loaded, set it as our currentConversation.
   */
  $scope.loadConversation = function loadConversation(id) {
    var conversation = $scope.appCtrlState.client.getConversation(id, true);
    conversation.once('conversations:loaded', function() {
      $scope.chatCtrlState.currentConversation = conversation.toObject();
      $scope.$digest();
    });
  };

  /*
   * Whenever the url changes, Load the requested Conversation
   * (if any), update our state and render
   */
  function handleLocation() {
    var matches = $location.$$url.match(/\/conversations\/.{8}-.{4}-.{4}-.{4}-.{12}$/);

    // If the url matches a Conversation URL, show it.
    if (matches) {
      if ($scope.appCtrlState.client.isReady) {
        $scope.loadConversation('layer://' + matches[0]);
      } else {
        $scope.appCtrlState.client.once('ready', function() {
          $scope.loadConversation('layer://' + matches[0]);
        });
      }
      $scope.chatCtrlState.showParticipants = false;
    }
  }

  // Handle any change in location
  $scope.$on('$locationChangeSuccess', handleLocation);

  // Handle the initial url state we loaded the app with.
  handleLocation();


  // Start the process of creating a new Conversation
  $scope.showNewConversation = function() {
    $scope.chatCtrlState.showParticipants = true;
  };

  /**
   * The user selects a Conversation in the <layer-conversations-list>
   */
  $scope.selectConversation = function(evt) {
    $scope.updateSelectedConversation(evt.detail.conversation);
    $scope.$apply();
  };

  $scope.updateSelectedConversation = function(conversation) {
    $scope.chatCtrlState.currentConversation = conversation.toObject();
    $location.path(conversation.id.substring(8));
  };

  /**
   * Utility for getting the title for a Conversation
   */
  $scope.getConversationTitle = function(conversationObject) {
    if (conversationObject) {
      // Metadata.title is the preferred title
      if (conversationObject.metadata.title) return conversationObject.metadata.title;

      // A join of all participants names is the backup title.
      return conversationObject.participants
      .filter(function(identity) {
        return !identity.sessionOwner;
      })
      .map(function(identity) {
        return identity.displayName;
      }).join(', ');
    }
    return '';
  };

  $scope.onMessageNotification = function(evt) {
    if ((!$scope.chatCtrlState.currentConversation ||
        evt.detail.message.conversationId === $scope.chatCtrlState.currentConversation.id) &&
        !evt.detail.isBackground) {
      evt.preventDefault();
    }
  };

  $scope.onNotificationClick = function(evt) {
    var message = evt.detail.message;
    $scope.chatCtrlState.currentConversation = message.getConversation().toObject();
    $location.path(message.conversationId.replace(/^layer:\/\/\//, ''));
    $scope.$apply();
  };
});
