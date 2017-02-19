import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import * as Layer from 'layer-websdk';
import { LayerProvider } from 'layer-react';
import Messenger from './containers/Messenger';
import ActiveConversation from './containers/ActiveConversation';
import DefaultPanel from './components/DefaultPanel';
import configureStore from './store/configureStore';
import { ownerSet } from './actions/messenger';
import { IndexRoute, Route } from 'react-router';
import { ReduxRouter } from 'redux-router';

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
    client = new Layer.Client({
      appId: window.layerSample.appId
    });
  }

  /**
   * Client authentication challenge.
   * Sign in to Layer sample identity provider service.
   */
  client.once('challenge', e => {
    window.layerSample.challenge(e.nonce, e.callback);
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
  var identityQuery = client.createQuery({
    model: Layer.Query.Identity,
    dataType: Layer.Query.ObjectDataType,
    change: function(evt) {
      if (evt.type === 'data') {
        window.layerSample.validateSetup(client);
      }
    }
  });

  // Render the UI wrapped in a LayerProvider
  render(
    <LayerProvider client={client}>
      <Provider store={store}>
        <ReduxRouter>
          <Route path='/' component={Messenger}>
            <IndexRoute component={DefaultPanel}/>
            <Route path='/conversations/:conversationId' component={ActiveConversation}/>
          </Route>
        </ReduxRouter>
      </Provider>
    </LayerProvider>,
    document.getElementById('root')
  );
});
