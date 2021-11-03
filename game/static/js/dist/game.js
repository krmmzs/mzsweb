class MzsGameMenu
{
    constructor(root) 
    {
        this.root = root;
        this.$menu = $(`
<div class="mzs-game-menu">
    
</div>
`);
        this.root.$mzs_game.append(this.$menu);
    }
}
class MzsGame
{
    constructor(id)
    {
        this.id = id;
        this.$mzs_game = $('#' + id); // find this div
        this.menu = new MzsGameMenu(this); // creat a menu object
    }
}