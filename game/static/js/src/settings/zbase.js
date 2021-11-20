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
        this.$login.hide(); // 全部先hide

        this.$register = this.$settings.find(".mzs-game-settings-register");
        this.$register.hide(); // 全部先hide

        this.root.$mzs_game.append(this.$settings);
        this.start();
    }

    start()
    {
        this.getinfo();
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
