A simple application that uses Aquila to create a mesh of several nodes, then
serves a basic HTML page showing all nodes in the cluster. On that page, you
can start new nodes or kill existing ones and watch the list of cluster members
update automagically in real time.


To run the application

    # installs aquila from the parent dir
    $ npm install ../ 

    # installs other dependencies
    $ npm install 

    # start the app
    $ node . 

Then browse to http://localhost:3000
