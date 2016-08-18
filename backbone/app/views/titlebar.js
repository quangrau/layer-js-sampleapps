'use strict';

var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  el: '.conversation-header',
  initialize: function() {
    this.emptyState = true;
  },

  /**
   * Any time a new Conversation is Selected, watch that Conversation for changes,
   * and render its title.
   */
  setConversation: function(conversation) {
    if (this.conversation) {
      this.conversation.off(null, this.render, this);
    }

    // During initialization we may be given a Conversation that is still loading and for which we don't have metadata
    // nor participants.  We might have gotten the Conversation ID from the window.location URL.  Once its loaded,
    // rerender.  Any change events from the Conversation, rerender.
    this.conversation = conversation;
    if (this.conversation) {
      this.conversation.on('conversations:change conversations:loaded', this.render, this);
    }
    this.render();
  },

  /**
   * Render the title; its either:
   * 1. Empty: No Selected Conversation
   * 2. Editing: Show an input and cancel button to allow user to edit the title
   * 3. Title: Show the selected converation's title
   */
  render: function() {
    var html = '';

    if (this.emptyState) {
      html = '<div class="edit-title new-title">&larr; Create a new conversation or select a conversation from the list.</div>';
      this.emptyState = false;
    }
    else if (this.editTitle) {
      html = '<div class="edit-title">' +
                '<input type="text" placeholder="Conversation title..." value="' + (this.conversation.metadata.title || '') + '">' +
                '<button class="cancel">Cancel</button>' +
              '</div>';
    }
    else if (this.conversation) {
      var title = this.conversation.metadata.title;
      if (!title) {
        title = this.conversation.participants
        .filter(function(user) {
          return !user.sessionOwner;
        })
        .map(function(user) {
          return user.displayName;
        }, this)
        .join(', ').replace(/(.*),(.*?)/, '$1 and$2');
      }
      html = '<div class="title-inner">' + title +
                '<a href="#" class="edit-title-icon" title="Edit conversation title"><i class="fa fa-pencil"></i></a>' +
              '</div>';
    }

    this.$el.html('<div class="title">' + html + '</div>');
  },
  events: {
    'keyup input': 'titleChange',
    'click .edit-title-icon': 'titleEdit',
    'click .cancel': 'titleCancel'
  },
  titleChange: function(e) {
    if (this.editTitle && e.keyCode === 13) {
      this.conversation.setMetadataProperties({title: e.target.value});
      this.titleCancel();
    }
    else this.trigger('conversation:title', e.target.value);
  },
  titleEdit: function(e) {
    e.preventDefault();
    this.editTitle = true;
    this.render();
  },
  titleCancel: function() {
    this.editTitle = false;
    this.render();
  }
});
