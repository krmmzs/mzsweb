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
            <img width="30" src="https://app188.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Acwing一键登录
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
            <img width="30" src="https://app188.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
            Acwing一键登录
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

        this.$acwing_login = this.$settings.find('.mzs-game-settings-acwing img');

        this.root.$mzs_game.append(this.$settings);

        this.start();
    }

    start()
    {
        if(this.platform === "ACAPP")
        {
            this.getinfo_acapp();
        }
        else
        {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events()
    {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function(){
            outer.acwing_login();
        })
    }

    add_listening_events_login()
    {
        let outer = this;
        
        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register()
    {
        let outer = this;

        this.$register_login.click(function() {
            outer.login();
        });

        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    acwing_login()
    {
        $.ajax
        ({
            url: "https://app188.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp)
            {
                if(resp.result === "success")
                {
                    window.location.replace(resp.apply_code_url);
                }
            }
        })

    }
    
    login_on_remote()
    {
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty(); // 每次把错误信息清空
        
        $.ajax({
            url: "https://app188.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data:{
                username: username,
                password: password,
            },
            success: function(resp)
            {
                console.log(resp);
                if (resp.result === "success")
                {
                    location.reload();
                }
                else
                {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    register_on_remote()
    {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app188.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp)
            {
                console.log(resp);
                if(resp.result === "success")
                {
                    location.reload();
                }
                else
                {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }


    logout_on_remote() // 在远程服务器上退出
    {
        if(this.platform === "ACAPP") return false;

        $.ajax({
            url: "https://app188.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function(resp)
            {
                console.log(resp);
                if(resp.result === "success")
                {
                    location.reload();
                }
            }
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

    acapp_login(appid, redirect_uri, scope, state)
    {
        let outer = this;
        this.root.acos.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            console.log(resp);
            if(resp.result === "success")
            {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp()
    {
        let outer = this;

        $.ajax({
            url: "https://app188.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp)
            {
                if(resp.result === "success")
                {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web()
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
