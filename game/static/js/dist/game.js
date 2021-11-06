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
            Settings
        </div>
    </div>
</div>
`);
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
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // 第四个参数是可以改变图形覆盖颜色的速度, 这样可以改变球体运动的残影
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        
        this.cur_skill = null; // 当前选的技能是什么
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
            if(e.which === 3)
            {
                outer.move_to(e.clientX, e.clientY); // e.clientX, e.clientY is the coordinates of the mouse click
            }
            else if(e.which === 1)
            {
                if(outer.cur_skill === "fireball")
                {
                    outer.shoot_fireball(e.clientX, e.clientY);
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
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);
    }

    get_dist(x1, y1, x2, y2)
    {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }


    update()
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
class FireBall extends MzsGameObject
{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length)
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

        this.render();
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

        // this.hide(); // The initial state is hide
        this.root.$mzs_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.palyers = [];
        this.palyers.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        
        for(let i = 0; i < 5; i ++)
        {
            this.palyers.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "blue", this.height * 0.15, false));
        }

        this.start();
    }


    start()
    {

    }

    update()
    {

    }
    
    show()
    {
        this.$playground.show();
    }

    hide()
    {
        this.$playground.hide();
    }
}
export class MzsGame
{
    constructor(id)
    {
        this.id = id;
        this.$mzs_game = $('#' + id); // find this div
        // this.menu = new MzsGameMenu(this); // creat a menu object
        this.playground = new MzsGamePlayground(this);
        this.start();
    }

    start()
    {
        
    }
}
