import React from 'react';
import { render } from 'react-dom';

import { Client, Query } from 'layer-websdk';
import configureStore from './store/configureStore';
import { ownerSet } from './actions/messenger';
import ChatView from './ChatView'

let client;
/**
 * Wait for identity dialog message to complete
 */
window.addEventListener('message', function(evt) {
  if (evt.data !== 'layer:identity') return;

  /**
   * Initialize Layer Client with `appId`
   */
  if (!client) {
    client = new Client({
      appId: window.layerSample.appId
    });
  }

  /**
   * Client authentication challenge.
   * Sign in to Layer sample identity provider service.
   *
   * See http://static.layer.com/sdk/docs/#!/api/layer.Client-event-challenge
   */
  client.once('challenge', e => {
    window.layerSample.getIdentityToken(e.nonce, e.callback);
  });

  client.on('ready', () => {
    store.dispatch(ownerSet(client.user.toObject()));
  });

  /**
   * Start authentication
   */
  client.connect(window.layerSample.userId);

  /**
   * Share the client with the middleware layer
   */
  const store = configureStore(client);

  /**
   * Run a quick query to verify that this app is correctly setup
   * for running this sample app.  This Query is not used for
   * anything else.  Note that we do query for Identities properly
   * in Messenger.js using `QueryBuilder.identities()`
   */
  let identityQuery = client.createQuery({
    model: Query.Identity,
    dataType: Query.ObjectDataType,
    change: function(evt) {
      if (evt.type === 'data') {
        window.layerSample.validateSetup(client);
      }
    }
  });

  // Render the Chat UI passing in the client and store
  render(
    <ChatView client={client} store={store} />,
    document.getElementById('root')
  );
});
