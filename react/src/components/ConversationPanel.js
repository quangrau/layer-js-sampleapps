/**
 * The ConversationList is nothing more than a Wrapper around the `<layer-conversation>` widget.
 * Whatever properties you pass into ConversationList get passed along into the `<layer-conversation>` widget.
 * Why not use the widget directly? Because React will use innerHTML to set properties, and if your property is a function
 * with scope, bindings, etc... that will all be lost.  If your property is an object rather than a string, it will be lost.
 */

import React, { Component } from 'react';
import ReactDom from 'react-dom';


export default class ConversationList extends Component {

  /**
   * Copy all properties into the dom node, but never let React recreate this widget.
   */
  shouldComponentUpdate(nextProps) {
    var didConversationChange = nextProps.conversationId !== this.node.conversationId;

    // Copy in all properties
    Object.keys(nextProps).forEach(function(propName) {
      this.node[propName] = nextProps[propName];
    }, this);

    // Create a Query if one was not provided
    if (!this.node.query && this.node.client) {
      this.node.query = this.node.client.createQuery({
        model: layer.Query.Message,
        dataType: layer.Query.InstanceDataType,
        paginationWindow: 50
      });
    }

    // Update the Query if the Conversation ID changed
    if (didConversationChange && this.node.query) {
      this.node.query.update({
        predicate: 'conversation.id = "' + nextProps.conversationId + '"'
      });
    }
    return false;
  }

  /**
   * Component is now mounted and we can get the dom node for future manipulation.
   */
  componentDidMount() {
    this.node = ReactDom.findDOMNode(this);
  }

  /**
   * Render every Conversation in this.props.conversations
   * in the Conversation List.
   */
  render() {
    return (
      <layer-conversation></layer-conversation>
    );
  }
}
