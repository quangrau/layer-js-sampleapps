/**
 * This is a Container with direct access to all actions and state, and
 * is responsible for managing the UI of the right panel of the app.
 * That consists of the Conversation Header and the Conversation Panel
 */

import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';

import { bindActionCreators } from 'redux';
import { connect as connectRedux } from 'react-redux';
import { QueryBuilder } from 'layer-sdk';
import { connectQuery } from 'layer-react';
import * as MessengerActions from '../actions/messenger';
import ConversationHeader from '../components/ConversationHeader';
const LayerUIWidgets = window.layerUI.adapters.react(React, ReactDom);
const ConversationPanel  = LayerUIWidgets.Conversation;

/**
 * Copy data from reducers into our properties
 */
function mapStateToProps({ activeConversationState, router }) {
  return {
    ...activeConversationState,
    activeConversation: activeConversationState.conversation,
    activeConversationId: router.params.conversationId ? `layer:///conversations/${router.params.conversationId}` : ''
  };
}

/**
 * Copy all actions into this.props.actions
 */
function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(MessengerActions, dispatch) };
}

@connectRedux(mapStateToProps, mapDispatchToProps)
export default class ActiveConversation extends Component {
  componentDidMount() {
    var node = ReactDom.findDOMNode(this.refs.conversationPanel);
    debugger;
    node.composeButtons = [
      document.createElement('layer-file-upload-button')
    ];
  }

  /**
   * Render the Right Panel which contains the Header, and the Conversation Panel
   */
  render() {
    const {
      editingTitle,
      title,
      composerMessage,
      activeConversation,
      activeConversationId,
      activeConversationState,
      conversations,
      messages,
      actions
    } = this.props;

    return (
      <div className='right-panel'>
        <ConversationHeader
          title={title}
          activeConversation={activeConversation}
          editingTitle={editingTitle}
          onEditConversationTitle={actions.editConversationTitle}
          onChangeConversationTitle={actions.changeConversationTitle}
          onSaveConversationTitle={actions.saveConversationTitle}
          onCancelEditConversationTitle={actions.cancelEditConversationTitle}/>
        <ConversationPanel
          ref='conversationPanel'
          appId={window.layerSample.appId}
          conversationId={activeConversationId}/>
      </div>
    );
  }
}
