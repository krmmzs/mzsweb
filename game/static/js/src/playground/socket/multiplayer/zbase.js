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

    }

    send_create_player()
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
        }));
    }

    receive_create_player()
    {

    }
}
