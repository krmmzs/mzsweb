class MzsGame
{
    constructor(id)
    {
        this.id = id;
        this.$mzs_game = $('#' + id); // find this div
        this.menu = new MzsGameMenu(this); // creat a menu object
    }
}