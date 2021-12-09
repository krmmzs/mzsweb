class MzsGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div class="mzs-game-playground"></div>`);

        this.hide(); // The initial state is hide
        this.root.$mzs_game.append(this.$playground);

        this.start();
    }


    start()
    {
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }

    update()
    {

    }

    get_random_color()
    {
        let colors = ["blue", "red", "pink", "grey", "green", "cyan", "purple"];
        return colors[Math.floor(Math.random() * 7)];
    }

    resize()
    {
        console.log("resize");

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height; // Reference unit

        if(this.game_map) this.game_map.resize();
    }

    show(mode) // open the playground interface
    {
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5 , 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode")
        {
            for(let i = 0; i < 5; i ++)
            {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if(mode === "multi mode")
        {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid; // the players[0] always not robot

            this.mps.ws.onopen = function()
            {
                outer.mps.send_create_player();
            }
        }

    }

    hide()
    {
        this.$playground.hide();
    }
}
