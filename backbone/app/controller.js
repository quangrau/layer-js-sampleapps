/* global layer */
'use strict';

var Backbone = require('backbone');

var ConversationsView = require('./views/conversations');
var MessagesView = require('./views/messages');
var TitlebarView = require('./views/titlebar');
var ParticipantsView = require('./views/participants-dialog');
var AnnouncementsView = require('./views/announcements');

/**
 * Client router
 */
var Router = Backbone.Router.extend({
  routes: {
    'conversations/:id': 'conversation:selected',
    'announcements': 'announcements'
  }
});
var router = new Router();

/**
 * Controller initializer
 */
module.exports = function(client) {
  var activeConversationId = null;

  var conversationsView = new ConversationsView(client);
  var messagesView = new MessagesView(client);
  var titlebarView = new TitlebarView();
  var participantsView = new ParticipantsView(client);
  var announcementsView = new AnnouncementsView();

  participantsView.user = client.user;
  Backbone.$('.create-conversation').on('click', newConversation);

  /**
   * Create Announcements Query
   */
  var announcementsQuery = client.createQuery({
    model: layer.Query.Announcement,
    paginationWindow: 30
  });

  announcementsQuery.on('change', function(e) {
    switch (e.type) {
      case 'data':
      case 'insert':
        announcementsView.announcements = announcementsQuery.data;
        announcementsView.render();
        break;
      case 'property':
        break;
    }

    // Mark unread announcements
    var unread = announcementsQuery.data.filter(function(item) {
      return !item.isRead;
    });
    Backbone.$('.announcements-button').toggleClass('unread-announcements', unread.length > 0);
  });

   /**
   * Create Identity List Query; this is solely for validating
   * that the app is setup right, and is not actually used for this UI.
   */
  var identityQuery = client.createQuery({
    model: layer.Query.Identity
  });

  identityQuery.on('change', function(evt) {
    if (evt.type === 'data') {
      window.layerSample.validateSetup(client);
    }
  });


  /**
   * Handle request to start creating a New Conversation
   */
  function newConversation() {
    participantsView.clearParticipants();
    participantsView.show();
  }

  /**
   * Create a Conversation using the WebSDK Client.
   */
  participantsView.on('conversation:create', function(participants) {
    var conversation = client.createConversation({
      participants: participants,
      distinct: participants.length === 1
    });

    // Update our location.
    var uuid = conversation.id.substr(conversation.id.lastIndexOf('/') + 1);
    router.navigate('conversations/' + uuid, {trigger: true});
  });

  /**
   * Handle navigation to a Conversation
   */
  router.on('route:conversation:selected', function(uuid) {
    activeConversationId = 'layer:///conversations/' + uuid;
    var conversation = client.getConversation(activeConversationId, true);
    messagesView.setConversation(conversation);
    titlebarView.setConversation(conversation);
  });

  /**
   * Handle request to view Announcements
   */
  router.on('route:announcements', function() {
    announcementsView.show();
  });

  if (window.location.hash) Backbone.history.loadUrl(Backbone.history.fragment);
};

Backbone.history.start();
