/**
 * This is a Container with direct access to all actions and state, and
 * is responsible for managing the UI of the left panel of the app.
 * That consists of the Conversation List Header and the Conversation List and all Dialogs.
 */


import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { QueryBuilder } from 'layer-sdk';
import { connectQuery } from 'layer-react';
import * as MessengerActions from '../actions/messenger';
import ConversationList from '../components/ConversationList';
import ConversationListHeader from '../components/ConversationListHeader';
import AnnouncementsList from '../components/announcements/MessageList';
import UserListDialog from '../components/UserListDialog';

/**
 * Copy data from reducers into our properties
 */
function mapStateToProps({ app, announcementState, participantState, activeConversationState, router }) {
  return {
    user: app.user,
    appId: app.appId,
    ready: app.ready,
    showAnnouncements: announcementState.showAnnouncements,
    participantState,

    // Note: We might have an activeConversationId but no activeConversation during app initialization if the URL
    // references a Conversation
    activeConversation: activeConversationState.conversation,
    activeConversationId: `layer:///conversations/${router.params.conversationId}`,
  };
}

/**
 * Copy all actions into this.props.actions
 */
function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(MessengerActions, dispatch) };
}

/**
 * Setup all of the Queries whose data needs to be in our Redux State.
 *
 * Why are announcements the only thing here? Because Messages, Conversations and Users
 * are no longer needed in the redux state; the data is managed by the WebSDK UI Components.
 */
function getQueries() {
  return {
    announcements: QueryBuilder.announcements()
  };
}


@connect(mapStateToProps, mapDispatchToProps)
@connectQuery({}, getQueries)
export default class Messenger extends Component {

  /**
   * Hide the Announcements Dialog
   */
  hideAnnouncements = (event) => {
    const { actions } = this.props;
    const { hideAnnouncements } = actions;
    if (event.target.parentNode.classList.contains('announcements-dialog')) {
      hideAnnouncements();
    }
  }

  /**
   * Hide the Participants Dialog
   */
  hideParticipants = (event) => {
    const { actions } = this.props;
    const { hideParticipants } = actions;
    if (event.target.parentNode.classList.contains('participants-dialog')) {
      hideParticipants();
    }
  }

  /**
   * Update the selected Conversation state
   */
  onConversationSelected = (event) => {
    const { actions } = this.props;
    actions.selectConversation(event.detail.conversation.toObject());
  }

  /**
   * After loading the app, see if we need to select the conversation ID to get the props.activeConversation.
   */
  componentDidMount() {
    if (this.props.activeConversationId && !this.props.activeConversation) {
      this.props.actions.selectConversationId(this.props.activeConversationId);
    }
  }

  /**
   * Render the left panel with the Conversation List and List Header
   */
  renderLeftPanel() {
    const {
      user,
      announcements,
      activeConversationId,
      actions,
      appId,
    } = this.props;
    return (
      <div className='left-panel'>
        <ConversationListHeader
          user={user}
          unreadAnnouncements={Boolean(announcements.filter(item => item.isUnread).length)}
          onShowAnnouncements={actions.showAnnouncements}
          onShowParticipants={actions.showParticipants}/>
        <ConversationList
          appId={appId}
          selectedConversationId={activeConversationId}
          onConversationSelected={this.onConversationSelected}/>
      </div>
    );
  }

  /**
   * Render the Announcements dialog.
   */
  renderAnnouncementDialog() {
    const { announcements, actions } = this.props;
    return (
      <div
        onClick={this.hideAnnouncements}
        className="announcements-dialog dialog">
        <div>
          <AnnouncementsList
            messages={announcements}
            onMarkMessageRead={actions.markMessageRead}/>
        </div>
      </div>
    );
  }

  /**
   * Render the Participants dialog.
   */
  renderParticipantDialog() {
    const { owner, participantState, actions, appId } = this.props;
    const selectedParticipants = participantState.participants;

    return (
      <div
        onClick={this.hideParticipants}
        className="participants-dialog dialog">
        <div>
          <UserListDialog
            appId={appId}
            selectedUsers={selectedParticipants}
            onUserSelected={actions.addParticipant}
            onUserDeselected={actions.removeParticipant}
            onSave={actions.createConversation}/>
        </div>
      </div>
    );
  }

  /**
   * Render the Main UI
   */
  renderMessenger() {
    const {
      showAnnouncements,
      participantState,
      conversations,
      announcements
    } = this.props;
    const { showParticipants } = participantState;

    // Render the left-panel which contains the Conversation List
    // and the right-panel which consists of the child components
    // (currently IndexRoute and Route with ActiveConversation)
    return (
      <div className='messenger'>
        {this.renderLeftPanel()}
        {this.props.children && React.cloneElement(this.props.children, {
          conversations
        })}
        {showAnnouncements ? this.renderAnnouncementDialog() : <span />}
        {showParticipants ? this.renderParticipantDialog() : <span />}
      </div>
    );
  }

  /**
   * Render every users favorite screen
   */
  renderEmptyScreen() {
    return (
      <div className='messenger'></div>
    );
  }

  /**
   * If we are ready, render the Messenger, else render a blank screen
   */
  render() {
    if (this.props.ready) {
      return this.renderMessenger();
    } else {
      return this.renderEmptyScreen();
    }
  }
}
