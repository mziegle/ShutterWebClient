var connection = new WebSocket('ws://192.168.178.26:8082/shutters'); // 'ws://localhost:8082/shutters'

connection.onopen = () => {
    connection.send(JSON.stringify({type: 'GET_SHUTTERS'}));
};

// Log messages from the server
connection.onmessage = (message) => {

    const serverMessage = JSON.parse(message.data);
    
    switch(serverMessage.type) {

        case 'SHUTTERS': {
            generateShutterPanels(serverMessage);
            break;
        }

        case 'UPDATE': {
            handleUpdate(serverMessage.data);
            break;
        }
    }

};

handleUpdate = (update) => {

    var closingStatePercent = (update.progress * 100).toFixed();
    var progressbarId = '#progressbar_' + update.shutterId;
    console.log(progressbarId);
    console.log(closingStatePercent);

    $(progressbarId)
    .css("width", closingStatePercent + "%")
    .attr("aria-valuenow", closingStatePercent)
    .text(closingStatePercent + "%");

}

moveShutterUp = (shutterId) => {
    console.log(shutterId);
    connection.send(JSON.stringify({type: 'UP', shutterId: shutterId}));
}

moveShutterDown = (shutterId) => {
    console.log(shutterId);
    connection.send(JSON.stringify({type: 'DOWN',  shutterId: shutterId}));
}

generateShutterPanels = (serverMessage) => {

    var shutters = serverMessage.data;
    
    for(var i = 0; i < shutters.length; i++){

        var shutter = shutters[i];

        var div = document.createElement('div');
        document.body.appendChild(div);

        templateData = {
            shutter: {
                id: shutter.id,
                name: shutter.name,
                closingStatePercent: (shutter.closingState * 100).toFixed()
            }
        }

        var template = nano('<div class="panel panel-default"><div class="container"><h2>{shutter.name}</h2>'+
                            '<div class="btn-group btn-group-justified">'+
                                '<div class="btn-group">' +
                                    '<button id="up_{shutter.id}" "type="button" class="btn btn-success">UP</button>' +
                                '</div>' +
                                    '<div class="btn-group">' +
                                        '<button id="down_{shutter.id}" type="button" class="btn btn-danger">DOWN</button>'+
                                    '</div>' +
                                '</div>' +
                                '<br>' +
                                '<div class="progress">' +
                                    '<div id="progressbar_{shutter.id}" class="progress-bar" role="progressbar" aria-valuenow="{shutter.closingStatePercent}" aria-valuemin="0" aria-valuemax="100" style="width:{shutter.closingStatePercent}%">' +
                                        '{shutter.closingStatePercent}%' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>', templateData);

        div.innerHTML = template;

        $(document).on('click', '#up_' + shutter.id, function(event) {
                moveShutterUp(this.id.replace(/^\D+/g, ''));
            }
        );

        $(document).on('click', '#down_' + shutter.id, function(event) {
                moveShutterDown(this.id.replace(/^\D+/g, ''));
            }
        );

    }
}