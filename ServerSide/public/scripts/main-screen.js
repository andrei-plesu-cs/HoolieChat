
//referencing the username of the current user and sending it to the server
const username = document.getElementById('username_span').innerHTML;
clients = [] //the list of connected clients


//using the socket.io api on the client
const socket = io.connect('http://localhost:8080');
socket.on('connect', () => {
    socket.emit('userid', {userid: username});
});

socket.on('disconnect', () => {
    socket.emit('disconnect', {userid: username});
});

socket.on('clients_list', (data) => {
    console.log('New data: ', data.clients);
    clients = normalizeVector(data.clients, username);

    let temp_array = document.getElementsByClassName('show-info');
    if (clients.length === 0) {
        let temp_node = document.createElement('p');
        p.setAttribute('id', 'no_user');
        p.innerText = "There are no users connected yet... there has to be something wrong with them not with us";

    } else {

    }

    clients.forEach(element => {
        document.getElementsByClassName('show-info')
    })
});

//adding the events to the elements
let selectedItem = -1;
users = document.getElementsByClassName('under-section');
users_buttons = document.getElementsByClassName('buttons-section');

for(let i=0; i<users.length; i++) {
    users[i].addEventListener('click', function(event) {
        
        if (selectedItem === -1) {
            users_buttons[i].className = 'buttons-section invisible-goodie';
            selectedItem = i;
        } else if (selectedItem === i) {
            users_buttons[i].className = 'buttons-section';
            selectedItem = -1;
        } else {
            users_buttons[selectedItem].className = 'buttons-section';
            users_buttons[i].className = 'buttons-section invisible-goodie';
            selectedItem = i;
        }

    });
};


//function that eliminates some elements from the clients vector
function normalizeVector(clients, username) {
    for(let i=0; i<clients.length; i++) {
        if (clients[i].username === username) {
            clients.splice(i, 1);
        }
    }

    return clients;
}