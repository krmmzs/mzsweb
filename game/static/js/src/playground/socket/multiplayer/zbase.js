class MultiPlayerSocket
{
    constructor(playground)
    {
        this.playground = playground;

        this.ws = new WebSocket("wss://app188.acapp.acwing.com.cn/wss/multiplayer/"); // notice : you need sure "/" be added

        this.start();
    }

    start()
    {
        this.receive();
    }

    receive()
    {
        this.ws.onmessage = function(e)
        {
            let data = JSON.parse(e.data);
            console.log(data);
        }
    }

    send_create_player(username, photo)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player()
    {
        
    }
}
