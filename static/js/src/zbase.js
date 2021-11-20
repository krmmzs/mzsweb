export class MzsGame
{
    constructor(id, acos)
    {
        this.id = id;
        this.$mzs_game = $('#' + id); // find this div
        this.acos = acos;

        this.settings = new Settings(this);
        this.menu = new MzsGameMenu(this); // creat a menu object
        this.playground = new MzsGamePlayground(this);

        this.start();
    }

    start()
    {
        
    }
}
