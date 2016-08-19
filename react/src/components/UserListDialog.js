/**
 * This Component renders a dialog for selecting users for a new Conversation.
 */
import React, { Component, PropTypes } from 'react';
import UserList from './UserList';

export default class UserListDialog extends Component {

  onSave = () => {
    if (this.props.selectedUsers.length) this.props.onSave();
  }

  /**
   * Render the User List Dialog
   */
  render() {
    const { selectedUsers, onUserSelected, onUserDeselected, appId } = this.props;
    return (
      <div className="participant-list-container dialog-container">
        <div className="panel-header">
          <span className="title">Select Participants</span>
        </div>
        <UserList
          appId={appId}
          onUserSelected={onUserSelected}
          onUserDeselected={onUserDeselected}
          selectedUsers={selectedUsers}
        />
        <div className="button-panel">
          <button onClick={this.onSave} className="button-ok">OK</button>
        </div>
      </div>
    );
  }
}
