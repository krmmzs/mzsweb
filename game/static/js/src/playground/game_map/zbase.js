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
