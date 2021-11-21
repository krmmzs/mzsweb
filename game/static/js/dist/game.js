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
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
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
let MZS_GAME_OBJECTS = [];

class MzsGameObject
{
    constructor()
    {
        MZS_GAME_OBJECTS.push(this);

        this.has_called_start = false; // 是否执行过start函数
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
    }

    start() // 只会在第一次执行
    {

    }

    update() // 每一帧均会执行一次(除了第一次)
    {

    }

    on_destroy() // 在被销毁前执行一遍
    {

    }

    destroy()
    {
        this.on_destroy();

        for(let i = 0; i < MZS_GAME_OBJECTS.length; i ++)
        {
            if(MZS_GAME_OBJECTS[i] === this)
            {
                MZS_GAME_OBJECTS.splice(i, 1); // 从i开始删除1个
                break;
            }
        }
    }
}

let last_timestamp;

let MZS_GAME_ANIMATTON = function(timestamp) // 这个参数表示我是在什么时刻调用的这个函数
{
    for(let i = 0; i < MZS_GAME_OBJECTS.length; i ++)
    {
        let obj = MZS_GAME_OBJECTS[i];
        if(!obj.has_called_start)
        {
            obj.start();
            obj.has_called_start = true;
        }
        else
        {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(MZS_GAME_ANIMATTON);
}

requestAnimationFrame(MZS_GAME_ANIMATTON); // 这个参数作为时间戳传给该API:每次都会每一秒执行多少帧
















class GameMap extends MzsGameObject
{
    constructor(playground)
    {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start()
    {
        
    }

    update()
    {
        this.render();

    }

    render()
    {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 第四个参数是可以改变图形覆盖颜色的速度, 这样可以改变球体运动的残影
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }


}
class Particle extends MzsGameObject
{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;
    }

    start()
    {

    }

    update()
    {
        if(this.move_length < this.eps || this.speed < this.eps)
        {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends MzsGameObject
{
    constructor(playground, x, y, radius, color, speed, is_me)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0; // 和y一同表示被击退后的方向
        this.damage_y = 0;
        this.damage_speed = 0; // 被撞击后的速度
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9; // 击退效果会有个摩擦力的物理状态
        this.spent_time = 0;
        
        this.cur_skill = null; // 当前选的技能是什么

        if(this.is_me)
        {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start()
    {
        if(this.is_me)
        {
            
            this.add_listening_events();
        }
        else
        {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events()
    {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function()
        {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e)
        {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3)
            {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top); // e.clientX, e.clientY is the coordinates of the mouse click
            }
            else if(e.which === 1)
            {
                if(outer.cur_skill === "fireball")
                {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill = null;
            }
        });
        
        $(window).keydown(function(e)
        {
            if(e.which === 81) // q
            {
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    move_to(tx, ty)
    {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    shoot_fireball(tx, ty)
    {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    get_dist(x1, y1, x2, y2)
    {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_attacked(angle, damage)
    {
        for(let i = 0; i < 20 + Math.random() * 10; i ++) // 被攻击产生微利
        {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);

        }

        this.radius -= damage;
        if(this.radius < 10)
        {
            this.destroy();
            this.on_destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }


    update()
    {
        this.spent_time += this.timedelta / 1000;
        if(!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) // 希望理论上5秒1发, 所以如果随机数产生是小于1/300, 实际上可能会产生连发, 但是后面会有一段时间不发...所以是期望的
        {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            while(player === this && this.playground.players.length > 1)
                player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);

        }

        if(this.damage_speed > 10) // 失去原先的方向和速度, 被击退的方向和速度替代, 此时速度受到摩擦力影响
        {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else
        {
            if(this.move_length < this.eps)
            {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me)
                {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }
            else
            {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render()
    {
        if(this.is_me)
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }
        else
        {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy()// 当自己被销毁, 从队列里消除自己
    {
        for(let i = 0; i < this.playground.players.length; i ++)
        {
            if(this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
            }
        }
    }

}
class FireBall extends MzsGameObject
{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage)
    {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }
    
    start()
    {

    }

    update()
    {
        if(this.move_length < this.eps)
        {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for(let i = 0; i < this.playground.players.length; i ++) // 判断火球撞击和敌人
        {
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)) // 如果不是自己, 且碰撞那就触发攻击效果
            {
                this.attack(player);
            }

        }

        this.render();
    }

    is_collision(player)
    {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if(distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player)
    {
        let angle = Math.atan2(player.y - this.y, player.x - this.x); // 冲击的角度(便于产生击退效果)
        player.is_attacked(angle, this.damage); // 调用被击中着的被击中产生效果
        this.destroy(); // 火球击中别人就会被销毁
    }

    get_dist(x1, y1, x2, y2)
    {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
class MzsGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div class="mzs-game-playground"></div>`);

        this.hide(); // The initial state is hide
        

        this.start();
    }


    start()
    {

    }

    update()
    {

    }

    get_random_color()
    {
        let colors = ["blue", "red", "pink", "grey", "green", "cyan", "purple"];
        return colors[Math.floor(Math.random() * 7)];
    }
    
    show()
    {
        this.$playground.show();
        this.root.$mzs_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        
        for(let i = 0; i < 5; i ++)
        {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
    }

    hide()
    {
        this.$playground.hide();
    }
}
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
export class MzsGame
{
    constructor(id, acos)
    {
        this.id = id;
        this.$mzs_game = $('#' + id); // find this div
        this.acos = acos;

        this.settings = new Settings(this);
        this.menu = new MzsGameMenu(this); // creat a menu object
        this.playground = new MzsGamePlayground(this);

        this.start();
    }

    start()
    {
        
    }
}
