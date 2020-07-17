/*
  design-system.lib.umich.edu used to be a Gatsby website with
  offline mode enabled and that installed a service worker.

  We need to request that it gets removed so users access this
  new website.

  Resources:
  - https://github.com/NekR/self-destroying-sw
*/

self.addEventListener("install", function(e) {
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  self.registration
    .unregister()
    .then(function() {
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach((client) => client.navigate(client.url));
    });
});
