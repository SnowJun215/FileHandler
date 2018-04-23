/**
 * ProjectSet.git
 * starry-sky
 * Created by June_z on 2018/4/23.
 * Create time 10:19
 */
class StarrySky {
    paint (ctx, paintSize, properties) {
        // 黑色夜空
        ctx.fillRect(0, 0, paintSize.width, paintSize.height);

        if(!this.counter) {
            this.counter = 1;
        }else{
            this.counter++;
        }
        if(this.counter === 2) {
            console.log(paintSize.height);
            let starDensity = +properties.get('--star-density').toString() || 1;

            const ONE_HOUR = 36000 * 1000;

            this.seed = +(properties.get('--star-key-seed').toString() || 0) + Date.now() / ONE_HOUR >> 0;

            this.addStars(paintSize.width, paintSize.height, starDensity);
        }
        if(this.stars) {
            for (let star of this.stars) {
                ctx.fillRect(star.x, star.y, star.size, star.size);
                ctx.fillStyle = `hsla(${star.hue}, 30%, 80%, .${star.opacityOne + star.opacityTwo})`;
            }
        }
    }

    random () {
        let x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    addStars (xMax, yMax, starDensity = 1) {
        // 最大只能为1
        starDensity > 1 && (starDensity = 1);

        // 星星数量
        let hmTimes = Math.round((xMax + yMax) * starDensity );
        this.stars = new Array(hmTimes);
        for(let i = 0; i <= hmTimes; i++){
            this.stars[i] = {
                // 星星的xy坐标， 随机
                x: Math.floor((this.random() * xMax) + 1),
                y: Math.floor((this.random() * yMax) + 1),
                // 星星的大小
                size: Math.floor((this.random() * 2) + 1),
                // 星星的暗亮
                opacityOne: Math.floor((this.random() * 9) + 1),
                opacityTwo: Math.floor((this.random() * 9) + 1),
                hue: Math.floor((this.random() * 360) + 1),
            };
        }
    }

    static get inputProperties() {
        return ['--star-density', '--star-key-seed'];
    }
}

registerPaint('starry-sky', StarrySky);