const express = require('express');
const socket = require('socket.io');
const body_parser = require('body-parser');
const path = require('path');
const app = express();

//the global variables set in here
clients = []; //an array representing all the clients that have signed in

//the middleware down here
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({
    extended: false
}));

const port_number = 8080 || process.env.PORT;
const server = app.listen(port_number, () => {
    console.log('Server started on port number ' + port_number);
})


//socket.io
const io = socket(server);
io.on('connection', (socket) => {
    console.log('New connection from socket with id ' + socket.id);

    socket.on('userid', (information) => {
        clients.push({
            username: information.username,
            socket_id: socket.id
        });
        console.log(clients);

        io.sockets.emit('clients_list', clients);

    });

    socket.on('disconnect', (information) => {
        console.log(socket.id, information.userid);
        for(let i=0; i<clients.length; i++) {
            if (clients[i].socket_id === socket.id) {
                clients.splice(i, 1);
                break;
            }
        }

        socket.broadcast.emit('clients_list', {clients: clients});
    });

    socket.on('add_request', (data, username) => {
        console.log(data);
        let source_user = {
            username: username,
            socket_id: socket.id
        }
        io.sockets.connected[data.socket_id].emit('add_request', data, source_user);
    });

    socket.on('add_response', (data, username) => {
        let source_user = {
            username: username,
            socket_id: socket.id
        }
        io.sockets.connected[data.socket_id].emit('add_response', data, source_user);
    });

    socket.on('send_message', (message, username, dest_user) => {
        console.log('da');
        let source_user = {
            username: username, 
            socket_id: socket.id
        }

        console.log(source_user);
        console.log(dest_user);
        io.sockets.connected[dest_user.socket_id].emit('receive_message', message, source_user);
    })

    socket.on('exit_conversation', (source_username, dest_user) => {
        let source_user = {
            username: source_username,
            socket_id: dest_user
        }

        io.sockets.connected[dest_user.socket_id].emit('exit_conversation', source_user, dest_user);
    })

});

//defining the routes in here
//the router
const generalRouter = express.Router();
generalRouter.get('/', function(req, res, next) {
    res.send('It works');
});

generalRouter.get('/login', function(req, res, next) {
    res.render(path.join('pages', 'login'));
});

const mainRouter = express.Router();
mainRouter.post('/', function(req, res, next) {
    res.render(path.join('pages', 'main_screen'), {
        username: req.body.username
    });
});

app.use('/', generalRouter);
app.use('/main-screen', mainRouter);
