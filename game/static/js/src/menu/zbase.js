class MzsGameMenu
{
    constructor(root) 
    {
        this.root = root;
        this.$menu = $(`
<div class="mzs-game-menu">
    <div class="mzs-game-menu-field">
        <div class="mzs-game-menu-field-item mzs-game-menu-field-item-single">
            SinglePlayer
        </div>
        <br>
        <div class="mzs-game-menu-field-item mzs-game-menu-field-item-multi">
            MultPlayer
        </div>
        <br>
        <div class="mzs-game-menu-field-item mzs-game-menu-field-item-settings">
            Settings
        </div>
    </div>
</div>
`);
        this.root.$mzs_game.append(this.$menu);
        this.$single = this.$menu.find('.mzs-game-menu-field-item-single');
        this.$multi = this.$menu.find('.mzs-game-menu-field-item-multi');
        this.$settings = this.$menu.find('.mzs-game-menu-field-item-settings');
    }
}
