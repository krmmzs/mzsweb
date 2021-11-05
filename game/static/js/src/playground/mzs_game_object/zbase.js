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

        last_timestamp = timestamp;

        requestAnimationFrame(MZS_GAME_ANIMATTON);
    }
}

requestAnimationFrame(MZS_GAME_ANIMATTON); // 这个参数作为时间戳传给该API:每次都会每一秒执行多少帧
















