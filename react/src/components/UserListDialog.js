/**
 * This Component renders a dialog for selecting users for a new Conversation.
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
const LayerUIWidgets = window.layerUI.adapters.react(React, ReactDom);
const UserList = LayerUIWidgets.UserList;

export default class UserListDialog extends Component {

  onSave = () => {
    if (this.props.selectedUsers.length) this.props.onSave();
  }

  /**
   * Extract the User object before forwarding the callback up to the parent.
   */
  onUserSelected = (event) => {
    const { actions } = this.props;
    const user  = event.detail.user.toObject();
    if (this.props.onUserSelected) this.props.onUserSelected(user);
  }

  /**
   * Extract the User object before forwarding the callback up to the parent.
   */
  onUserDeselected = (event) => {
    const { actions } = this.props;
    const user = event.detail.user.toObject();
    if (this.props.onUserSelected) this.props.onUserDeselected(user);
  }


  /**
   * Render the User List Dialog
   */
  render() {
    const { selectedUsers, appId } = this.props;
    return (
      <div className="participant-list-container dialog-container">
        <div className="panel-header">
          <span className="title">Select Participants</span>
        </div>
        <UserList
          appId={appId}
          onUserSelected={this.onUserSelected}
          onUserDeselected={this.onUserDeselected}
          selectedUsers={selectedUsers}
        />
        <div className="button-panel">
          <button onClick={this.onSave} className="button-ok">OK</button>
        </div>
      </div>
    );
  }
}
