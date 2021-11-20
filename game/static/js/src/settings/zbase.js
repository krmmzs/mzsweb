class Settings
{
    constructor(root)
    {
        this.root = root;
        this.platform = "WEB"; //js里的字符要与views.setting下的getinfo.py里的字符对应
        if (this.root.acos) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";
        this.$settings = $(`
<div class="mzs-game-settings">
    <div class="mzs-game-settings-login">
        <div class="mzs-game-settings-title">
            登录
        </div>
        <div class="mzs-game-settings-username">
            <div class="mzs-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="mzs-game-settings-password">
            <div class="mzs-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="mzs-game-settings-submit">
            <div class="mzs-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="mzs-game-settings-error-message">
        </div>
        <div class="mzs-game-settings-option">
            注册
        </div>
        <br>
        <div class="mzs-game-settings-acwing">
            <img width="30" src="https://app188.acapp.acwing.com.cn/static/image/settings/githublogo.png">
            <br>
            <div>
                Github一键登录
            </div>
        </div>
    </div>
    
    <div class="mzs-game-settings-register">
        <div class="mzs-game-settings-title">
            注册
        </div>
        <div class="mzs-game-settings-username">
            <div class="mzs-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="mzs-game-settings-password mzs-game-settings-password-first">
            <div class="mzs-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="mzs-game-settings-password mzs-game-settings-password-second">
            <div class="mzs-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="mzs-game-settings-submit">
            <div class="mzs-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="mzs-game-settings-error-message">
        </div>
        <div class="mzs-game-settings-option">
            登录
        </div>
        <br>
        <div class="mzs-game-settings-acwing">
            <img width="30" src="https://app188.acapp.acwing.com.cn/static/image/settings/githublogo.png">
            <br>
            <div>
                Github一键登录
            </div>
        </div>
    </div>

</div>

`);
        this.$login = this.$settings.find(".mzs-game-settings-login");
        this.$login_username = this.$login.find(".mzs-game-settings-username input");
        this.$login_password = this.$login.find(".mzs-game-settings-password input");
        this.$login_submit = this.$login.find(".mzs-game-settings-submit button");
        this.$login_error_message = this.$login.find(".mzs-game-settings-error-message");
        this.$login_register = this.$login.find(".mzs-game-settings-option");

        this.$login.hide(); // 全部先hide

        this.$register = this.$settings.find(".mzs-game-settings-register");
        this.$register_username = this.$register.find(".mzs-game-settings-username input");
        this.$register_password = this.$register.find(".mzs-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".mzs-game-settings-password-second input");
        this.$register_submit = this.$register.find(".mzs-game-settings-submit button");
        this.$register_error_message = this.$register.find(".mzs-game-settings-error-message");
        this.$register_login = this.$register.find(".mzs-game-settings-option");

        this.$register.hide(); // 全部先hide

        this.root.$mzs_game.append(this.$settings);

        this.start();
    }

    start()
    {
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events()
    {
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login()
    {
        let outer = this;
        
        this.$login_register.click(function() {
            outer.register();
        });
    }

    add_listening_events_register()
    {
        let outer = this;

        this.$register_login.click(function() {
            outer.login();
        });
    }


    login() // 打开登录界面
    {
        this.$register.hide();
        this.$login.show();
    }

    register() // 打开注册页面
    {
        this.$login.hide();
        this.$register.show();
    }



    getinfo()
    {
        let outer = this;

        $.ajax({
            url: "https://app188.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data:{
                platform: outer.platform,
            },
            success: function(resp)
            {
                console.log(resp); // 这里与gitinfo.py里的JsonResponse对应
                if (resp.result === "success")
                {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else
                {
                    outer.login();
                    //outer.register();
                }
            }

        });
    }

    hide()
    {
        this.$settings.hide();

    }

    show()
    {
        this.$settings.show();
    }

}
