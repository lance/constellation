$(function() {

  // Initialize varibles
  var $window = $(window);
  var $nodes = $('#nodes'); 
  var $start = $('#start');
  var socket = io();

  $start.click(startNode);

  // Whenever the server emits 'view', update the nodes view
  socket.on('view', function (data) {
    updateView(data);
  });

  function updateView(data) {
    $('.node').remove();
    data.forEach(function(node) {
      var $el = $('<li>').addClass('node').addClass('live').text(node);
      $el.click(killNode(node, $el));
      $nodes.append($el);
    });
  }

  function killNode(node, el) {
    return function() {
      if (confirm('Do you really want to kill ' + node + '?')) {
        $(el).removeClass('live').addClass('almost-dead');
        $(el).append(' (going down)');
        socket.emit('kill node', node);
      }
    };
  }

  function startNode() {
    if (confirm('Are you sure you want to start a new node?')) {
      socket.emit('start node');
    }
  }

  socket.emit('add client');

});
