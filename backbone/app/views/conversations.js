'use strict';

var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  el: 'layer-conversation-list',
  initialize: function(client) {
    /**
     * Create Conversation List Query
     */
    this.query = client.createQuery({
      model: layer.Query.Conversation
    });

    /**
     * Setup the <layer-conversation-list /> widget
     */
    this.$el[0].query = this.query;
    this.$el[0].client = client;
    this.$el[0].onConversationSelected = function(evt) {
      location.hash = evt.detail.conversation.id.replace(/^layer:\/\/\//, '') ;
    };
  }
});
