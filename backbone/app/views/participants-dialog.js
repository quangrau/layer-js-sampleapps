'use strict';

/**
 * A dialog for selecting users for a new Conversation.
 *
 * Can also be used for updating participants in an existing Conversation.
 *
 * Manages a Dialog and a `<layer-user-list/>` widget
 */


var Backbone = require('backbone');
const LayerUIWidgets = window.layerUI.adapters.backbone(Backbone);
var UserList = LayerUIWidgets.UserList;

module.exports = Backbone.View.extend({
  el: '.participants-dialog',
  initialize: function(client) {
    this.$el.find('.button-ok').on('click', this.createConversation.bind(this));
    this.userList = new UserList(client);
  },

  /**
   * In the future, you may want this to be setParticipants so
   * you can use it to update the participants in a Conversation.
   */
  clearParticipants: function() {
    this.userList.selectedUsers = [];
  },

  /**
   * Tell the Controller to create the Conversation.
   */
  createConversation: function() {
    var participants = this.userList.selectedUsers;
    if (participants.length) {
      this.hide();
      this.trigger('conversation:create', participants);
    }
  },
  events: {
    'click .participant-list-container': 'clickStopPropagation',
    'click': 'hide'
  },
  clickStopPropagation: function(e) {
    e.stopPropagation();
  },
  show: function() {
    this.$el.removeClass('hidden');
  },
  hide: function() {
    this.$el.addClass('hidden');
  }
});
