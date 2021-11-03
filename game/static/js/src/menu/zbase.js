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
