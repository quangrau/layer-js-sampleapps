import { pushState } from 'redux-router';
import toUUID from '../utils/toUUID';
import {
  CREATE_CONVERSATION,
  SELECT_CONVERSATION,
  SELECT_CONVERSATION_ID,
  SAVE_CONVERSATION_TITLE,
  MARK_MESSAGE_READ,
  ROUTER_DID_CHANGE,
  clientReady,
  selectConversation
} from '../actions/messenger';

function internalSelectConversation(layerClient, state, payload, next) {
  if (state.activeConversationState.conversation) {
    layerClient.getConversation(state.activeConversationState.conversation.id).off(null, null, selectConversation);
  }

  if (payload.conversation.id) {
    layerClient.getConversation(payload.conversation.id).on('conversations:change', function(evt) {
      next(selectConversation(evt.target.toObject()));
    }, selectConversation);
  }
  return next(pushState(null, `/conversations/${toUUID(payload.conversation.id)}`));
}

function handleAction(layerClient, state, action, next) {
  const { type, payload } = action;

  switch(type) {
    /**
     * The app has loaded, it has a conversation id, we want to get from there to having an activeConversation state set.
     */
    case SELECT_CONVERSATION_ID: {
      // Load the Converation, and when its loaded, select it so all of its properties get copied into the redux state
      var onReady = function() {
        var conversation = layerClient.getConversation(payload.id, true);
        conversation.once('conversations:loaded', function() {
          next(selectConversation(conversation.toObject()));
        });

        // Select our incomplete, not yet loaded Conversation and copy what we have into the redux state
        next(selectConversation(conversation.toObject()))
      };
      if (state.app.ready) {
        onReady();
      } else {
        layerClient.once('ready', onReady);
      }
      return;
    }

    /**
     * Select the conversation, and monitor it for changes; set its current any any updates to its state to be a part of our Redux state
     */
    case SELECT_CONVERSATION: {
      return internalSelectConversation(layerClient, state, payload, next);
    }

    /**
     * Create a Conversation, and then select it.
     */
    case CREATE_CONVERSATION: {
      const { participants } = state.participantState;
      const distinct = participants.length === 1;
      const conversation = layerClient.createConversation({
        distinct,
        participants
      });
      return internalSelectConversation(layerClient, state, {conversation}, next);
    }

    /**
     * Update the Conversation metadata
     */
    case SAVE_CONVERSATION_TITLE:
      layerClient
        .getConversation(`layer:///conversations/${state.router.params.conversationId}`, true)
        .setMetadataProperties({ title: state.activeConversationState.title });
      return;

    // We use this for Announcements; <layer-conversation> handles marking messages read for messages in its view
    case MARK_MESSAGE_READ:
      layerClient
        .getMessage(payload.messageId).isRead = true;
      return;

    default:
      return;
  }
}

/**
 * Redux state middleware manager
 */
const layerMiddleware = layerClient => store => {

  layerClient.on('ready', () => {
    store.dispatch(clientReady({ user: layerClient.user.toObject(), appId: layerClient.appId }));
  });

  return next => action => {
    const state = store.getState();

    handleAction(layerClient, state, action, next);

    const nextState = next(action);

    return nextState;
  };
};

export default layerMiddleware;
