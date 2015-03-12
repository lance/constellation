$(function() {

  // Initialize varibles
  var $window = $(window);
  var $nodes = $('#nodes'); 
  var socket = io();


  // Whenever the server emits 'view', update the nodes view
  socket.on('view', function (data) {
    updateView(data);
  });

  function updateView(data) {
    $('.node').remove();
    data.forEach(function(node) {
      var $el = $('<li>').addClass('node').text(node);
      $nodes.append($el);
    });
  }

  socket.emit('add client');

});
