class MzsGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div>游戏界面</div>`);

        this.hide(); // The initial state is hide
        this.root.$mzs_game.append(this.$playground);

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
