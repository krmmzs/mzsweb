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
</div>
`);
        this.root.$mzs_game.append(this.$settings);
        this.start();
    }

    start()
    {
        this.getinfo();
    }

    login() // 打开登录界面
    {

    }

    register() // 打开注册页面
    {
        
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
