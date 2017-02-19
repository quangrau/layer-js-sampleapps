/* global layer */
'use strict';

document.addEventListener('DOMContentLoaded', function() {

  /**
   * layerSample global utility
   *
   * @param {String}    appId - Layer Staging Application ID
   * @param {String}    userId - User ID to log in as
   * @param {Function}  challenge - Layer Client challenge function
   * @param {Function}  dateFormat - Get a nice date string
   */
  window.layerSample = {
    appId: '',
    userId: null,
    validateSetup: function(client) {
    },
    getIdentityToken: function(nonce, callback) {
      layer.xhr({
        url: 'https://sample-provider.herokuapp.com/authenticate',
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        data: {
          nonce: nonce,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        }
      }, function(res) {
        if (res.success && res.data.identity_token) {
          console.log('challenge: ok');

          callback(res.data.identity_token);

          // Cleanup identity dialog
          var node = document.getElementById('identity');
          node.parentNode.removeChild(node);
        } else {
          console.error('challenge error: ', res.data);
        }
      });
    },
    dateFormat: function(date) {
      var now = new Date();
      if (!date) return now.toLocaleDateString();

      if (date.toLocaleDateString() === now.toLocaleDateString()) return date.toLocaleTimeString();
      else return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  /**
   * Dirty HTML dialog injection
   */
  var div = document.createElement('div');
  div.innerHTML += '<img src="http://static.layer.com/logo-only-blue.png" />';
  div.innerHTML += '<h1>Welcome to Layer sample app!</h1>';
  div.innerHTML += '<div class="login-group"><label for="email">Email</label><input type="text" id="email" /></div>';
  div.innerHTML += '<div class="login-group"><label for="password">Password</label><input type="password" id="password" /></div>';

  var button = document.createElement('button');
  button.appendChild(document.createTextNode('Login'));

  div.appendChild(button);

  var container = document.createElement('div');
  container.setAttribute('id', 'identity');
  container.appendChild(div);
  document.body.insertBefore(container, document.querySelectorAll('.main-app')[0]);

  button.addEventListener('click', function() {
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    if (email && password) {
      window.postMessage('layer:identity', '*');
    } else {
      alert("Please fill in an email address and password");
    }
  });
});
