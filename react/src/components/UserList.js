/**
 * The UserList is nothing more than a Wrapper around the `<layer-User-list>` widget.
 * Whatever properties you pass into UserList get passed along into the `<layer-User-list>` widget.
 * Why not use the widget directly? Because React will use innerHTML to set properties, and if your property is a function
 * with scope, bindings, etc... that will all be lost.  If your property is an object rather than a string, it will be lost.
 *
 * This component will create a User Query if one was not passed in as a parameter.
 */

import React, { Component } from 'react';
import ReactDom from 'react-dom';


export default class UserList extends Component {

  /**
   * Copy all properties into the dom node, but never let React recreate this widget.
   */
  shouldComponentUpdate(nextProps) {

    // Copy in all of the properties
    Object.keys(nextProps).forEach(function(propName) {
      // Don't onUserSelected/onUserDeselected/etc
      if (typeof this[propName] !== 'function') {
        this.node[propName] = nextProps[propName];
      }
    }, this);

    // Setup a Query if one was not provided
    if (!this.node.query && this.node.client) {
      this.node.query = this.node.client.createQuery({
        model: layer.Query.Identity,
        dataType: layer.Query.InstanceDataType,
        paginationWindow: 500
      });
    }
    return false;
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
   * Component is now mounted and we can get the dom node for future manipulation.
   */
  componentDidMount() {
    this.node = ReactDom.findDOMNode(this);
    this.shouldComponentUpdate(this.props);
    this.node.onUserSelected = this.onUserSelected;
    this.node.onUserDeselected = this.onUserDeselected;
  }

  /**
   * Render our WebComponent.
   */
  render() {
    return (
      <layer-user-list />
    );
  }
}
