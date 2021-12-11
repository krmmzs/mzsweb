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
            Logout
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
let MZS_GAME_OBJECTS = [];

class MzsGameObject
{
    constructor()
    {
        MZS_GAME_OBJECTS.push(this);

        this.has_called_start = false; // 是否执行过start函数
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
        this.uuid = this.create_uuid();
    }

    create_uuid()
    {
        let res = "";
        for(let i = 0; i < 20; i ++)
        {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;

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

class GameMap extends MzsGameObject
{
    constructor(playground)
    {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`); // tabindex=0 let canvas Monitor keyboard
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start()
    {
        this.$canvas.focus();
    }

    resize()
    {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
class NoticeBoard extends MzsGameObject
{
    constructor(playground)
    {
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "Ready: 0";
    }

    start()
    {
    }

    write(text)
    {
        this.text = text;

    }

    update()
    {
        this.render();
    }

    render()
    {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
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
        this.eps = 0.01;
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends MzsGameObject
{
    constructor(playground, x, y, radius, color, speed, character, username, photo)
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.friction = 0.9; // 击退效果会有个摩擦力的物理状态
        this.spent_time = 0;
        this.fireballs = [];

        this.cur_skill = null; // 当前选的技能是什么

        if(this.character !== "robot")
        {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if(this.character === "me")
        {
            this.fireball_coldtime = 3; // unit is second
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 6; // unit is second
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start()
    {
        this.playground.player_count ++;
        this.playground.notice_board.write("Ready: " + this.playground.player_count);

        if(this.playground.player_count >= 3)
        {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if(this.character === "me")
        {
            this.add_listening_events();
        }
        else if (this.character === "me")
        {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
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
            if(outer.playground.state !== "fighting")
                return true;

            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3)
            {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty); // e.clientX, e.clientY is the coordinates of the mouse click

                if(outer.playground.mode === "multi mode")
                {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }
            else if(e.which === 1)
            {

                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if(outer.cur_skill === "fireball")
                {
                    if(outer.fireball_coldtime > outer.eps)
                    {
                         return false;
                    }

                    let fireball = outer.shoot_fireball(tx, ty);

                    if(outer.playground.mode === "multi mode")
                    {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }
                else if(outer.cur_skill === "blink")
                {
                    if(outer.blink_coldtime > outer.eps)
                        return false;

                    outer.blink(tx, ty);

                    if(outer.playground.mode === "multi mode")
                    {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }

                outer.cur_skill = null;
            }
        });

        this.playground.game_map.$canvas.keydown(function(e)
        {
            if(e.which === 13) // enter
            {
                if(outer.playground.mode === "multi mode") // open chat_filed
                {
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }
            else if(e.which === 27) // esc
            {
                if(outer.playground.mode === "multi mode") // close chat_filed
                {
                    outer.playground.chat_field.hide_input();
                }
            }

            if(outer.playground.state !== "fighting")
                return true;

            if(e.which === 81) // q
            {
                if(outer.fireball_coldtime > outer.eps)
                {
                    return true;
                }
                outer.cur_skill = "fireball";
                return false;
            }
            if(e.which === 70)
            {
                if(outer.blink_coldtime > outer.eps)
                {
                    return true;
                }
                outer.cur_skill = "blink";
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
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball; // need to get uuid of fireball
    }

    destroy_fireball(uuid)
    {
        for(let i = 0; i < this.fireballs.length; i ++)
        {
            let fireball = this.fireballs[i];
            if(fireball.uuid === uuid)
            {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty)
    {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.4);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 6; // reset coldtime
        this.move_length = 0; // after blink stop
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
        if(this.radius < this.eps)
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

    receive_attack(x, y, angle, damage, ball_uuid, attacker)
    {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }


    update()
    {
        this.spent_time += this.timedelta / 1000;

        if(this.character === "me" && this.playground.state === "fighting")
        {
            this.update_coldtime();
        }

        this.update_move();

        this.render();
    }

    update_coldtime()
    {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }


    update_move() // update players moving
    {
        if(this.character === "robot" && this.spent_time > 4 && Math.random() < 1 / 300.0) // 希望理论上5秒1发, 所以如果随机数产生是小于1/300, 实际上可能会产生连发, 但是后面会有一段时间不发...所以是期望的
        {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            while(player === this && this.playground.players.length > 1)
                player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);

        }

        if(this.damage_speed > this.eps) // 失去原先的方向和速度, 被击退的方向和速度替代, 此时速度受到摩擦力影响
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
                if(this.character === "robot")
                {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
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
    }

    render()
    {
        let scale = this.playground.scale;

        if(this.character !== "robot")
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        }
        else
        {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if(this.character === "me" && this.playground.state === "fighting")
        {
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime()
    {
        let scale = this.playground.scale;
        let x = 1.5;
        let y = 0.9;
        let r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.fireball_coldtime > 0)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.blink_coldtime > 0)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 6) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy()// 当自己被销毁, 从队列里消除自己
    {
        if(this.character === "me")
        {
            this.playground.state = "over";
        }

        for(let i = 0; i < this.playground.players.length; i ++)
        {
            if(this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
                break;
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
        this.eps = 0.01;
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

        this.update_move();

        if(this.player.character !== "enemy") //  only judge in player's client
        {
            this.update_attack();
        }
        this.render();
    }

    update_move()
    {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack()
    {
        for(let i = 0; i < this.playground.players.length; i ++) // 判断火球撞击和敌人
        {
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)) // 如果不是自己, 且碰撞那就触发攻击效果
            {
                this.attack(player);
                break;
            }
        }
    }

    is_collision(player) // judge the impact
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

        if(this.playground.mode === "multi mode")
        {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy()
    {
        let fireballs = this.player.fireballs;
        for(let i = 0; i < fireballs.length; i ++)
        {
            if(fireballs[i] === this)
            {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
class MultiPlayerSocket
{
    constructor(playground)
    {
        this.playground = playground;

        this.ws = new WebSocket("wss://app188.acapp.acwing.com.cn/wss/multiplayer/"); // notice : you need sure "/" be added

        this.start();
    }

    start()
    {
        this.receive();
    }

    receive()
    {
        let outer = this;

        this.ws.onmessage = function(e)
        {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if(uuid === outer.uuid)
                return false;

            let event = data.event;
            if(event === "create_player")
            {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            else if (event === "move_to")
            {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
            else if(event === "shoot_fireball")
            {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if(event === "attack")
            {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }
            else if(event === "blink")
            {
                outer.receive_blink(uuid, data.tx, data.ty);
            }
            else if(event === "message")
            {
                outer.receive_message(uuid, data.username, data.text);
            }
        };
    }

    send_create_player(username, photo)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    get_player(uuid)
    {
        let players = this.playground.players;
        for(let i = 0; i < players.length; i ++)
        {
            let player = players[i];
            if(player.uuid === uuid)
                return player;
        }

        return null;
    }


    receive_create_player(uuid, username, photo)
    {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    send_move_to(tx, ty)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty)
    {
        let player = this.get_player(uuid);

        if(player)
        {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid)
    {
        let player = this.get_player(uuid);
        if(player)
        {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid)
    {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attacker && attackee)
        {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }

    }

    send_blink(tx, ty)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink(uuid, tx, ty)
    {
        let player = this.get_player(uuid);
        if(player)
        {
            player.blink(tx, ty);
        }
    }

    send_message(username, text)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(uuid, username, text)
    {
        this.playground.chat_field.add_message(username, text);
    }
}
class MzsGamePlayground
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div class="mzs-game-playground"></div>`);

        this.hide(); // The initial state is hide
        this.root.$mzs_game.append(this.$playground);

        this.start();
    }


    start()
    {
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }

    update()
    {

    }

    get_random_color()
    {
        let colors = ["blue", "red", "pink", "grey", "green", "cyan", "purple"];
        return colors[Math.floor(Math.random() * 7)];
    }

    resize()
    {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height; // Reference unit

        if(this.game_map) this.game_map.resize();
    }

    show(mode) // open the playground interface
    {
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; // waiting -> fighting -> over // state machine
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5 , 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode")
        {
            for(let i = 0; i < 5; i ++)
            {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if(mode === "multi mode")
        {
            this.chat_field = new ChatField(this); // chat field build
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid; // the players[0] always not robot

            this.mps.ws.onopen = function()
            {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
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
        <!--<div class="mzs-game-settings-acwing">
            <img width="30" src="https://app188.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                Acwing一键登录
            </div>
        </div>-->
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
        <!--<div class="mzs-game-settings-acwing">
            <img width="30" src="https://app188.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
            Acwing一键登录
            </div>
        </div>-->
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
        if(this.platform === "ACAPP")
        {
            this.root.acos.api.window.close();
        }
        else
        {
            $.ajax({
                url: "https://app188.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp)
                {
                    if(resp.result === "success")
                    {
                        location.reload();
                    }
                }
            });
        }
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
