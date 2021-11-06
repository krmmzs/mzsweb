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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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
