function Game(canvas, data, col = 20) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.data = data;
    this.ratio = 1 || window.devicePixelRatio;
    this.col = col;
    console.log('当前像素比为：', window.devicePixelRatio);

    if (!canvas) {
        alert('获取不到canvas对象');
    }
    //确定浏览器支持<canvas>元素
    if (!canvas.getContext) {
        alert('Not support');
    }
}

Game.prototype = {
    /**
     * 初始化游戏
     * @returns {boolean}
     */
    initGame: function () {
        this.gameData = Game.initShakeData(this.data, this.col);
        this.initData();
        this.clearArea();
        this.initArea();
        this.drawBlock(this.gameData);
        this.addGameListener(this.touchStart);
    },
    initTarget: function () {
        this.initData();
        this.clearArea();
        this.initArea();
        let tempPoint = JSON.parse(JSON.stringify(this.data));
        let range = getRange(tempPoint, true);
        let left = Math.ceil((this.col - (range.xMax - range.xMin + 1)) / 2);
        let top = Math.ceil((this.col - (range.yMax - range.yMin + 1)) / 2);
        tempPoint.map((block) => {
            block.map((point) => {
                point.x = point.x + left;
                point.y = point.y + top;
            })
        });
        this.drawBlock(tempPoint);
    },
    initCreate: function () {
        this.initSelectData();
        this.resetCreate(true);
        this.addGameListener(this.createTouchStart)
    },
    resetCreate: function (isInit) {
        this.clearArea();
        this.initArea(0, 0, this.canvas.width, Math.ceil(this.itemWidth * 6));
        this.initArea(0, Math.ceil(this.itemWidth * 6 + 10), this.canvas.width, this.canvas.height);
        this.drawBlock(this.data);
        !isInit && this.drawBlock(this.resultList || [], {x: 0, y: this.itemWidth * 6 + 10});
    },
    initData: function () {
        console.log(this.canvas.clientWidth, this.canvas.clientHeight);
        let length = (this.canvas.clientWidth < this.canvas.clientHeight) ? this.canvas.clientWidth * this.ratio : this.canvas.clientHeight * this.ratio;
        this.canvas.width = length;
        this.canvas.height = length;
        this.canvas.style.width = `${length}px`;
        this.canvas.style.height = `${length}px`;
        this.itemWidth = (length - 2) * this.ratio / this.col;
    },
    initSelectData: function () {
        console.log(this.canvas.clientWidth, this.canvas.clientHeight);
        let length = (this.canvas.clientWidth < this.canvas.clientHeight) ? this.canvas.clientWidth * this.ratio : this.canvas.clientHeight * this.ratio;
        this.itemWidth = (length - 2) * this.ratio / this.col;
        this.canvas.width = length;
        this.canvas.height = length + this.itemWidth * 6 + 10;
        this.canvas.style.width = `${this.canvas.width}px`;
        this.canvas.style.height = `${this.canvas.height}px`;
        let curIndex = 1;
        this.data.map((block) => {
            block.map((point) => {
                point.x = point.x + curIndex;
            });
            let range = getRange(block);
            curIndex = curIndex + (range.xMax - range.xMin) + 1;
        });
    },
    clearArea: function (left = 0, top = 0, width = this.canvas.width, height = this.canvas.height) {
        this.context.clearRect(left, top, width, height);
    },
    initArea: function (left = 0, top = 0, width = this.canvas.width, height = this.canvas.height) {
        this.context.beginPath();
        this.context.lineWidth = `${1 * this.ratio}`;
        this.context.rect(left, top, width, height - top);
        this.context.stroke();
        let x = left, y = top;
        y = y + this.itemWidth;
        while (y + this.itemWidth < height) {
            x = x + this.itemWidth;
            if (x + this.itemWidth < width) {
                this.context.beginPath();
                this.context.arc(x, y, this.ratio, 0, 2 * Math.PI);
                this.context.stroke();
                this.context.fill();
            } else {
                x = left;
                y = y + this.itemWidth;
            }
        }
    },
    drawBlock: function (data, offset) {
        data.map((sub_points) => {
            let block = new Block();
            block.init(sub_points, this.itemWidth, this.context, offset);
            block.draw()
        });
    },
    touchStart: function (e) {
        console.log('start');
        this.gameData.map((sub_points) => {
            let eventClient = e.clientX ? e : e.changedTouches[0];
            let position = Game.getPosition(eventClient, {x: this.canvas.offsetLeft, y: this.canvas.offsetTop});
            if (Game.isPointInPolygon({
                x: position.clientX / this.itemWidth,
                y: position.clientY / this.itemWidth
            }, sub_points)) {
                this.initTouchAction(eventClient, sub_points, this.touchMove, this.touchEnd);
            }
        });
    },
    initTouchAction: function (eventClient, sub_points, moveAction, endAction) {
        this.isDrag = true;
        this.begin = JSON.parse(JSON.stringify(sub_points));
        this.beginX = eventClient.clientX;
        this.beginY = eventClient.clientY;
        this.canvas.onmousemove = moveAction.bind(this, sub_points);
        this.canvas.ontouchmove = moveAction.bind(this, sub_points);
        this.canvas.onmouseup = endAction.bind(this, sub_points);
        this.canvas.ontouchend = endAction.bind(this, sub_points);
    },
    touchMove: function (sub_points, e) {
        if (!this.isDrag) {
            return false;
        }
        console.log('move');
        let _this = this;
        let eventClient = e.clientX ? e : e.changedTouches[0];
        return (debounce((eventClient) => {
            let x = (eventClient.clientX - this.beginX) / this.itemWidth;
            let y = (eventClient.clientY - this.beginY) / this.itemWidth;
            this.beginX = eventClient.clientX;
            this.beginY = eventClient.clientY;
            sub_points.map((point) => {
                point.x = point.x + x;
                point.y = point.y + y;
            });
            _this.clearArea();
            _this.initArea();
            _this.drawBlock(_this.gameData);
        }, 5)(eventClient))
    },
    touchEnd: function (sub_points) {
        if (!this.isDrag) {
            return false;
        }
        console.log('end');
        let isOutSide = false;
        sub_points.map((point) => {
            let x = point.x;
            let y = point.y;
            if (x < 0 || y < 0 || x > this.col || y > this.col) {
                isOutSide = true;
            } else {
                x = x - parseInt(x);
                y = y - parseInt(y);
                point.x = Math.round(parseInt(point.x) + x);
                point.y = Math.round(parseInt(point.y) + y);
            }
        });
        if (isOutSide) {
            sub_points.map((point, index) => {
                point.x = this.begin[index].x;
                point.y = this.begin[index].y;
            })
        }
        this.clearArea();
        this.initArea();
        this.drawBlock(this.gameData);
        if (Game.checkResult(this.gameData, this.data)) {
            showModel();
        }
        this.isDrag = false;
        this.canvas.onmousemove = null;
        this.canvas.touchmove = null;
        this.canvas.mouseup = null;
        this.canvas.touchend = null;
    },
    addGameListener: function (action) {
        this.canvas.onmousedown = action.bind(this);
        this.canvas.ontouchstart = action.bind(this);
    },
    createTouchStart: function (e) {
        console.log('create touch start');
        let eventClient = e.clientX ? e : e.changedTouches[0];
        let position = Game.getPosition(eventClient, {x: this.canvas.offsetLeft, y: this.canvas.offsetTop});
        if (Game.isPointInPolygon({
            x: position.clientX / this.itemWidth,
            y: position.clientY / this.itemWidth
        }, [{x: 0, y: 0}, {x: 20, y: 0}, {x: 20, y: 6}, {x: 0, y: 6}])) {
            console.log('insideSelect');
            this.isDrag = true;
            this.getTarget = false;
            this.data.forEach((block) => {
                if (Game.isPointInPolygon({
                    x: position.clientX / this.itemWidth,
                    y: position.clientY / this.itemWidth
                }, block)) {
                    this.getTarget = new Block();
                    this.getTarget.init(block, this.itemWidth, this.context);
                }
            });
            this.beginX = eventClient.clientX;
            this.beginY = eventClient.clientY;
            this.canvas.onmousemove = this.createTouchMove.bind(this, []);
            this.canvas.ontouchmove = this.createTouchMove.bind(this, []);
            this.canvas.onmouseup = this.createTouchEnd.bind(this, []);
            this.canvas.ontouchend = this.createTouchEnd.bind(this, []);
        }
        if (this.resultList && this.resultList.length > 0) {
            let relPosition = Game.getPosition(eventClient, {
                x: this.canvas.offsetLeft,
                y: this.canvas.offsetTop + 10 + this.itemWidth * 6
            });
            this.resultList.map((sub_points) => {
                if (Game.isPointInPolygon({
                    x: relPosition.clientX / this.itemWidth,
                    y: relPosition.clientY / this.itemWidth
                }, sub_points)) {
                    this.inResultTarget = true;
                    this.initTouchAction(eventClient, sub_points, this.createTouchMove, this.createTouchEnd);
                }
            });
        }
    },
    createTouchMove: function (sub_points, e) {
        if (!this.isDrag) {
            return false;
        }
        console.log('move');
        let _this = this;
        let eventClient = e.clientX ? e : e.changedTouches[0];
        return (debounce((eventClient) => {
            let direction = getDirection(_this.beginX, _this.beginY, eventClient.clientX, eventClient.clientY);
            switch (direction) {
                case 0:
                    console.log("未滑动！");
                    break;
                case 1:
                    console.log("向上！");
                    break;
                case 2:
                    console.log("向下！");
                    if (_this.getTarget) {
                        _this.lock = true;
                    }
                    break;
                case 3: // 左
                case 4: // 右
                    break;
                default:
            }
            if (_this.lock || _this.inResultTarget) {
                let x = (eventClient.clientX - _this.beginX) / _this.itemWidth;
                let y = (eventClient.clientY - _this.beginY) / _this.itemWidth;
                _this.beginX = eventClient.clientX;
                _this.beginY = eventClient.clientY;
                if (_this.inResultTarget) {
                    sub_points.map((point) => {
                        point.x = point.x + x;
                        point.y = point.y + y;
                    });
                }
                _this.clearArea();
                _this.initArea(0, 0, _this.canvas.width, Math.ceil(_this.itemWidth * 6));
                _this.initArea(0, Math.ceil(_this.itemWidth * 6 + 10), _this.canvas.width, _this.canvas.height);
                _this.drawBlock(_this.data);
                _this.drawBlock(_this.resultList || [], {x: 0, y: _this.itemWidth * 6 + 10});
                if (_this.lock) {
                    _this.getTarget.updatePoints(x, y);
                    _this.getTarget.draw('source-over');
                }
            } else {
                let curIndex = (eventClient.clientX - this.beginX) / this.itemWidth;
                let tempData = JSON.parse(JSON.stringify(_this.data));
                tempData.map((block) => {
                    block.map((point) => {
                        point.x = point.x + curIndex;
                    });
                });
                _this.clearArea(0, 0, this.canvas.width, Math.ceil(this.itemWidth * 6));
                _this.initArea(0, 0, _this.canvas.width, Math.ceil(_this.itemWidth * 6));
                _this.drawBlock(tempData);
            }
        }, 5)(eventClient))
    },
    createTouchEnd: function (sub_points, e) {
        if (!this.isDrag) {
            return false;
        }
        console.log('end');
        let eventClient = e.clientX ? e : e.changedTouches[0];
        if (this.lock || this.inResultTarget) {
            if (this.inResultTarget) {
                let isOutSide = false;
                sub_points.map((point) => {
                    let x = point.x;
                    let y = point.y;
                    if (x < 0 || y < 0 || x > this.col || y > this.col) {
                        isOutSide = true;
                    } else {
                        x = x - parseInt(x);
                        y = y - parseInt(y);
                        point.x = parseInt(point.x) + (x - 0.5 > 0 ? 1 : 0);
                        point.y = parseInt(point.y) + (y - 0.5 > 0 ? 1 : 0);
                    }
                });
                if (isOutSide) {
                    this.resultList.splice(this.resultList.indexOf(sub_points), 1);
                }
            }
            this.resetCreate(false);
            this.setTargetList();
        } else {
            let curIndex = Math.round((eventClient.clientX - this.beginX) / this.itemWidth);
            // console.log(curIndex);
            // console.log(this.range);
            setTimeout(() => {
                this.data.forEach((block, index) => {
                    if (index === 0) {
                        let range = getRange(block);
                        if (range.xMin + curIndex > 1) {
                            curIndex = 1 - range.xMin;
                        }
                    }
                    if (index === this.data.length - 1) {
                        let range = getRange(block);
                        if (range.xMax + curIndex < 19) {
                            curIndex = 19 - range.xMax;
                        }
                    }
                });
                this.data.map((block, index) => {
                    block.map((point) => {
                        point.x = point.x + curIndex;
                    });
                });
                this.clearArea(0, 0, this.canvas.width, Math.ceil(this.itemWidth * 6));
                this.initArea(0, 0, this.canvas.width, Math.ceil(this.itemWidth * 6));
                this.drawBlock(this.data);
            }, 20);
        }
        this.isDrag = false;
        this.getTarget = false;
        this.lock = false;
        this.canvas.onmousemove = null;
        this.canvas.touchmove = null;
        this.canvas.mouseup = null;
        this.canvas.touchend = null;
    },
    setTargetList: function () {
        let isInTarget = true;
        let target;
        if (this.lock) {
            target = JSON.parse(JSON.stringify(this.getTarget.points));
            target.forEach((point) => {
                point.x = Math.round(point.x / this.itemWidth);
                point.y = Math.round((point.y - 10) / this.itemWidth - 6);
                isInTarget = isInTarget && point.x >= 0 && point.y >= 0;
            });
        }
        if (isInTarget) {
            if (!this.resultList) {
                this.resultList = [];
            }
            if (this.lock) {
                if (this.resultList.length >= 6) {
                    alert('目前游戏最多支持6个图形');
                } else {
                    this.resultList.push(target);
                }
            }
            this.drawBlock(this.resultList || [], {x: 0, y: this.itemWidth * 6 + 10});
        } else {
            alert('请把小黑块整体移动到目标区域');
        }
    },
};

/**
 * 获取点的偏移后位置
 * @param point
 * @param offset
 * @returns {{clientY: number, clientX: number}}
 */
Game.getPosition = function (point, offset = {}) {
    return {
        clientX: point.clientX - (offset.x || 0),
        clientY: point.clientY - (offset.y || 0)
    }
};

/**
 * 判断点是否在多边形内/边上
 * @param p
 * @param poly
 * @returns {boolean}
 */
Game.isPointInPolygon = function (p, poly) {
    let px = p.x,
        py = p.y,
        sum = 0;

    for (let i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        let sx = poly[i].x,
            sy = poly[i].y,
            tx = poly[j].x,
            ty = poly[j].y;

        // 点与多边形顶点重合或在多边形的边上
        if ((sx - px) * (px - tx) >= 0 &&
            (sy - py) * (py - ty) >= 0 &&
            (px - sx) * (ty - sy) === (py - sy) * (tx - sx)) {
            return true
        }

        // 点与相邻顶点连线的夹角
        let angle = Math.atan2(sy - py, sx - px) - Math.atan2(ty - py, tx - px);

        // 确保夹角不超出取值范围（-π 到 π）
        if (angle >= Math.PI) {
            angle = angle - Math.PI * 2
        } else if (angle <= -Math.PI) {
            angle = angle + Math.PI * 2
        }
        sum += angle
    }

    // 计算回转数并判断点和多边形的几何关系
    return Math.round(sum / Math.PI) !== 0
};

/**
 * 初始化图形位置
 * @param points
 * @param col
 * @returns {array}
 */
Game.initShakeData = function (points, col) {
    let newPoints = JSON.parse(JSON.stringify(points));
    let position = [];
    let center = {
        x: Math.ceil(col / 2),
        y: Math.ceil(col / 2)
    };
    switch (newPoints.length) {
        case 3:
        case 4:
        case 5:
            position = shuffle([1, 2, 3, 4, 5].slice(0, newPoints.length));
            break;
        case 6:
            position = shuffle([6, 7, 2, 3, 4, 5]);
            break;
    }
    console.log(position);
    newPoints.map((sub_points) => {
        let newPos = position.shift();
        let range = getRange(sub_points);
        switch (newPos) {
            case 1:
                sub_points.map((point) => {
                    point.x = Math.round(point.x + center.x - Math.ceil((range.xMax - range.xMin) / 2) - range.xMin);
                    point.y = Math.round(point.y + 1 - range.yMin);
                });
                break;
            case 2:
                sub_points.map((point) => {
                    point.x = Math.round(point.x + 1 - range.xMin);
                    point.y = Math.round(point.y + center.y - Math.ceil((range.yMax - range.yMin) / 2) - range.yMin);
                });
                break;
            case 3:
                sub_points.map((point) => {
                    point.x = Math.round(point.x + (col - 1 - (range.xMax - range.xMin)) - range.xMin);
                    point.y = Math.round(point.y + center.y - Math.ceil((range.yMax - range.yMin) / 2) - range.yMin);
                });
                break;
            case 4:
                sub_points.map((point) => {
                    point.x = Math.round(point.x + center.x - Math.ceil((range.xMax - range.xMin) / 2) - range.xMin);
                    point.y = Math.round(point.y + (col - 1 - (range.yMax - range.yMin)) - range.yMin);
                });
                break;
            case 5:
                sub_points.map((point) => {
                    point.x = Math.round(point.x + center.x - Math.ceil((range.xMax - range.xMin) / 2) - range.xMin);
                    point.y = Math.round(point.y + center.y - Math.ceil((range.yMax - range.yMin) / 2) - range.yMin);
                });
                break;
            case 6:
                sub_points.map((point) => {
                    point.x = Math.round(point.x + Math.ceil(center.x / 2) - Math.ceil((range.xMax - range.xMin) / 2) - range.xMin);
                    point.y = Math.round(point.y + Math.ceil(center.y / 2) - Math.ceil((range.yMax - range.yMin) / 2) - range.yMin);
                });
                break;
            case 7:
                sub_points.map((point) => {
                    point.x = Math.round(point.x + col - Math.ceil(center.x / 2) - Math.ceil((range.xMax - range.xMin) / 2) - range.xMin);
                    point.y = Math.round(point.y + Math.ceil(center.y / 2) - Math.ceil((range.yMax - range.yMin) / 2) - range.yMin);
                });
                break;
        }
    });
    console.log(points, newPoints);
    return newPoints;
};

/**
 * 获取偏移前图形坐标
 * @param points
 * @returns {Array}
 */
Game.getOriginData = function (points) {
    let testPoints = JSON.parse(JSON.stringify(points));
    let range = getRange(testPoints, true);
    testPoints.map((block) => {
        block.map((point) => {
            point.x = point.x - range.xMin;
            point.y = point.y - range.yMin;
        })
    });
    return testPoints;
};

/**
 * 校验两个图形
 * @param points
 * @param target
 * @returns {boolean}
 */
Game.checkResult = function (points, target) {
    let result = Game.getOriginData(points).every((item) => {
        return !!target.find((shake) => {
            return JSON.stringify(shake) === JSON.stringify(item);
        });
    });
    console.log(result);
    return result;
};

/**
 * 绘制多边型
 * @constructor
 */
function Block() {
}

Block.prototype = {
    init: function (points, itemWidth, ctx, offset = {}) {
        this.points = [];
        this.itemWidth = itemWidth; // 单位长度
        this.ctx = ctx;
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            this.points.push({
                x: point.x * this.itemWidth + (offset.x || 0),
                y: point.y * this.itemWidth + (offset.y || 0)
            })
        }
    },
    updatePoints: function (x = 0, y = 0) {
        this.points.map((point) => {
            point.x = point.x + x * this.itemWidth;
            point.y = point.y + y * this.itemWidth;
        });
    },
    draw: function (type = 'xor') {
        this.ctx.globalCompositeOperation = type;
        // this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            let point = this.points[i];
            this.ctx.lineTo(point.x, point.y)
        }
        this.ctx.closePath();
        this.ctx.fill()
    }
};

let debounce = function (fn, delay) {
    let timerId;
    return function (...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
};

function showModel() {
    document.getElementsByClassName('model')[0].classList.add('active');
}

function hideModel() {
    document.getElementsByClassName('model')[0].classList.remove('active');
}

/**
 * 获取形状的区域
 * @param shake
 * @param type true——组合图形， false——单个图形
 * @returns {{yMin: *, yMax: *, xMax: *, xMin: *}}
 */
function getRange(shake, type = false) {
    let xMin, xMax, yMin, yMax;
    if (type) {
        shake.forEach((block) => {
            block.forEach((point) => {
                xMin = xMin !== undefined ? (xMin < point.x ? xMin : point.x) : point.x;
                xMax = xMax !== undefined ? (xMax > point.x ? xMax : point.x) : point.x;
                yMin = yMin !== undefined ? (yMin < point.y ? yMin : point.y) : point.y;
                yMax = yMax !== undefined ? (yMax > point.y ? yMax : point.y) : point.y;
            });
        })
    } else {
        shake.forEach((point) => {
            xMin = xMin !== undefined ? (xMin < point.x ? xMin : point.x) : point.x;
            xMax = xMax !== undefined ? (xMax > point.x ? xMax : point.x) : point.x;
            yMin = yMin !== undefined ? (yMin < point.y ? yMin : point.y) : point.y;
            yMax = yMax !== undefined ? (yMax > point.y ? yMax : point.y) : point.y;
        });
    }
    return {
        xMin, xMax, yMin, yMax
    }
}

function changePosition(shake, angle) {
    let center = {};
    let range = getRange(shake);
    // 确定中心坐标
    center.x = (range.xMax - range.xMin) / 2 + range.xMin;
    center.y = (range.yMax - range.yMin) / 2 + range.yMin;
    console.log(center);

    let target = [];
    switch (Math.abs(angle)) {
        case 90:
        case 270:
            shake.forEach((point) => {
                let x = point.x - center.x;
                let y = point.y - center.y;
                if (angle === 90 || angle === -270) {
                    y = -y;
                } else {
                    x = -x;
                }
                target.push({
                    x: center.x + y,
                    y: center.y + x
                })
            });
            break;
        case 180:
            shake.forEach((point) => {
                let x = point.x - center.x;
                let y = point.y - center.y;
                y = -y;
                x = -x;
                target.push({
                    x: center.x + x,
                    y: center.y + y
                })
            });
            break;
        default:
            alert('unknown angle');
    }
    range = getRange(target);
    target.map((point) => {
        point.x = point.x - range.xMin;
        if (range.yMin < 0 || range.yMax > 6) {
            point.y = point.y - range.yMin;
        }
    });
    console.log(angle, JSON.stringify(target).replace(/"/g, ''));
    return target;
}

/**
 * 获取角度
 * @param angX
 * @param angY
 * @returns {number}
 */
function getAngle(angX, angY) {
    return Math.atan2(angY, angX) * 180 / Math.PI;
}

/**
 * 根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 * @returns {number}
 */
function getDirection(startX, startY, endX, endY) {
    let angX = endX - startX;
    let angY = endY - startY;
    let result = 0;

//如果滑动距离太短
    if (Math.abs(angX) < 2 && Math.abs(angY) < 2) {
        return result;
    }

    let angle = getAngle(angX, angY);
    if (angle >= -135 && angle <= -45) {
        result = 1;
    } else if (angle > 45 && angle < 135) {
        result = 2;
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3;
    } else if (angle >= -45 && angle <= 45) {
        result = 4;
    }

    return result;
}

/**
 * 数组乱序
 * @param arr
 * @returns {*}
 */
function shuffle(arr) {
    let length = arr.length,
        randomIndex,
        temp;
    while (length) {
        randomIndex = Math.floor(Math.random() * (length--));
        temp = arr[randomIndex];
        arr[randomIndex] = arr[length];
        arr[length] = temp
    }
    return arr;
}