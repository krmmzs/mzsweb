class MzsGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div class="mzs-game-playground"></div>`);

        this.hide(); // The initial state is hide
        

        this.start();
    }


    start()
    {

    }

    update()
    {

    }

    get_random_color()
    {
        let colors = ["blue", "red", "pink", "grey", "green", "cyan", "purple"];
        return colors[Math.floor(Math.random() * 7)];
    }
    
    show()
    {
        this.$playground.show();
        this.root.$mzs_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        
        for(let i = 0; i < 5; i ++)
        {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
    }

    hide()
    {
        this.$playground.hide();
    }
}
