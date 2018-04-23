/**
 * ProjectSet.git
 * starry-sky
 * Created by June_z on 2018/4/23.
 * Create time 10:19
 */
class StarrySky {
    paint (ctx, paintSize, properties) {
        let starDensity = +properties.get('--star-density').toString() || 1;
        // 最大只能为1
        starDensity > 1 && (starDensity = 1);

        let xMax = paintSize.width;
        let yMax = paintSize.height;
        // 黑色夜空
        ctx.fillRect(0, 0, xMax, yMax);

        // 星星数量
        let hmTimes = Math.round((xMax + yMax) * starDensity );
        for(let i = 0; i <= hmTimes; i++){
            // 星星的xy坐标， 随机
            let x = Math.floor((Math.random() * xMax) + 1);
            let y = Math.floor((Math.random() * yMax) + 1);
            // 星星的大小
            let size = Math.floor((Math.random() * 2) + 1);
            // 星星的暗亮
            let opacityOne = Math.floor((Math.random() * 9) + 1);
            let opacityTwo = Math.floor((Math.random() * 9) + 1);
            let hue = Math.floor((Math.random() * 360) + 1);

            ctx.fillRect(x, y, size, size);
            ctx.fillStyle = `hsla(${hue}, 30%, 80%, .${opacityOne + opacityTwo})`;
        }
    }

    static get inputProperties() {
        return ['--star-density'];
    }
}

registerPaint('starry-sky', StarrySky);