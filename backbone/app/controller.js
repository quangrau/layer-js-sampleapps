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
    'conversations/new': 'conversation:new',
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
  var participantsView = new ParticipantsView();
  var announcementsView = new AnnouncementsView();

  participantsView.user = client.user;



  /**
   * Create Announcements Query
   */
  var announcementsQuery = client.createQuery({
    model: layer.Query.Announcement,
    paginationWindow: 30
  });

  /**
   * Create Identity List Query
   */
  var identityQuery = client.createQuery({
    model: layer.Query.Identity
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
  identityQuery.on('change', function(evt) {
    if (evt.type === 'data') {
      window.layerSample.validateSetup(client);
    }
    participantsView.users = identityQuery.data;
    participantsView.render();
  });




  /**
   * View event listeners
   */
  conversationsView.on('conversation:delete', function(conversationId) {
    var conversation = client.getConversation(conversationId);
    if (confirm('Are you sure you want to delete this conversation?')) {
      conversation.delete(layer.Constants.DELETION_MODE.ALL);
    }
  });

  participantsView.on('conversation:create', function(participants) {
    // See http://static.layer.com/sdk/docs/#!/api/layer.Conversation
    var conversation = client.createConversation({
      participants: participants,
      distinct: participants.length === 1
    });

    // Update our location.
    var uuid = conversation.id.substr(conversation.id.lastIndexOf('/') + 1);
    router.navigate('conversations/' + uuid, {trigger: true});
  });

  /**
   * Routing
   */
  router.on('route:conversation:selected', function(uuid) {
    activeConversationId = 'layer:///conversations/' + uuid;
    var conversation = client.getConversation(activeConversationId, true);

    messagesView.setConversation(conversation);

    titlebarView.conversation = conversation;

    renderAll();
  });

  router.on('route:conversation:new', function() {
    participantsView.show();
  });

  router.on('route:announcements', function() {
    announcementsView.show();
  });

  function renderAll() {
    titlebarView.render();
    participantsView.render();
  }

  if (window.location.hash) Backbone.history.loadUrl(Backbone.history.fragment);
};

Backbone.history.start();
