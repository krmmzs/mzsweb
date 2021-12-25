class ChatField
{
    constructor(playground)
    {
        this.playground = playground;

        this.$history = $(`<div class="mzs-game-chat-field-history">History</div>`);
        this.$input = $(`<input type="text" class="mzs-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();

        this.func_id = null; // record the history show id(oop)

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start()
    {
        this.add_listening_events();
    }

    add_listening_events()
    {
        let outer = this;

        this.$input.on("contextmenu", function()
        {
            return false;
        });

        this.$history.on("contextmenu", function()
        {
            return false;
        });

        this.$input.keydown(function(e)
        {
            if (e.which === 27) // esc
            {
                outer.hide_input();
                return false;
            }
            else if (e.which === 13) // enter
            {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val(); // get the $input value
                if (text)
                {
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text); // send the message from you client to server 
                }
                return false;
            }
        });
    }

    render_message(message) // encapsulate a html to show message
    {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text)
    {
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight); // api to scroll to the bottom, showing the latest message
    }

    show_history()
    {
        let outer = this;
        this.$history.fadeIn(); // jQurey's api to show gradually

        if (this.func_id) clearTimeout(this.func_id); // the api could close the old history command

        this.func_id = setTimeout(function() // settimeout to close history, the function will return a id(oop)
            {
                outer.$history.fadeOut(); // out gradually
                outer.func_id = null;
            }, 3000
        );
    }

    show_input()
    {
        this.show_history(); // when input, the history need to be showed

        this.$input.show();
        this.$input.focus();
    }

    hide_input()
    {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}

