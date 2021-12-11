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
                return false;

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
                if(outer.fireball_coldtime > outer.eps)
                {
                    return false;
                }

                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if(outer.cur_skill === "fireball")
                {
                    let fireball = outer.shoot_fireball(tx, ty);

                    if(outer.playground.mode === "multi mode")
                    {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }

                outer.cur_skill = null;
            }
        });
        
        $(window).keydown(function(e)
        {
            if(outer.playground.state !== "fighting")
                return false;

            if(outer.fireball_coldtime > outer.eps)
            {
                return false;
            }

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
    }

    on_destroy()// 当自己被销毁, 从队列里消除自己
    {
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
