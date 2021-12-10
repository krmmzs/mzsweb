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
        let outer = this;

        this.ws.onmessage = function(e)
        {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if(uuid === outer.uuid)
                return false;

            let event = data.event;
            if(event === "create_player")
            {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            else if (event === "move_to")
            {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
        };
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

    get_player(uuid)
    {
        let players = this.playground.players;
        for(let i = 0; i < players.length; i ++)
        {
            let player = players[i];
            if(player.uuid === uuid)
                return player;
        }

        return null;
    }


    receive_create_player(uuid, username, photo)
    {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    send_move_to(tx, ty)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty)
    {
        let player = this.get_player(uuid);

        if(player)
        {
            player.move_to(tx, ty);
        }
    }

}
