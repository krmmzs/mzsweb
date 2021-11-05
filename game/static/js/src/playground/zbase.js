class MzsGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div class="mzs-game-playground"></div>`);

        // this.hide(); // The initial state is hide
        this.root.$mzs_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.palyers = [];
        this.palyers.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true))

        this.start();
    }


    start()
    {

    }

    update()
    {

    }
    
    show()
    {
        this.$playground.show();
    }

    hide()
    {
        this.$playground.hide();
    }
}
