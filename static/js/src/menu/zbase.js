class MzsGameMenu
{
    constructor(root) 
    {
        this.root = root;
        this.$menu = $(`
<div class="mzs-game-menu">
    <div class="mzs-game-menu-field">
        <div class="mzs-game-menu-field-item mzs-game-menu-field-item-single-mode">
            SinglePlay
        </div>
        <br>
        <div class="mzs-game-menu-field-item mzs-game-menu-field-item-multi-mode">
            MultPlay
        </div>
        <br>
        <div class="mzs-game-menu-field-item mzs-game-menu-field-item-settings">
            //Settings
            Logout(for the moment)
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$mzs_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.mzs-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.mzs-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.mzs-game-menu-field-item-settings');

        this.start();
    }

    start()
    {
        this.add_listening_events();
    }

    add_listening_events()
    {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }
    show() // show the current page
    {
        this.$menu.show();
    }

    hide() // hide the current page
    {
        this.$menu.hide();
    }

}
