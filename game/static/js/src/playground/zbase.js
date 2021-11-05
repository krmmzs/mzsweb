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
