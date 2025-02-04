# 导航跟随

```javascript
<div class="showio_r"> 
    <ul>
        <li class="showio_nav"></li>
        <li></li>
        <li></li>
    </ul>
</div>
<div class="showio">
    <div class="listy"></div>
    <div class="listy"></div>
    <div class="listy"></div>
</div>
<script>
    const listys = document.querySelectorAll('.showio .listy');  // 获取class为'showio'下class为'listy'的所有元素
    const showioNavItems = document.querySelectorAll('.showio_r li');  // 获取class为'showio'下class为'showio_r'下所有li元素  //导航

    window.addEventListener('scroll', () => {  // 监听滚动事件
        listys.forEach((listy, index) => {  // 遍历listys数组
            const distanceFromTop = listy.getBoundingClientRect().top;  // 获取元素距离视口顶部的距离
            const listyHeight = listy.getBoundingClientRect().height;  // 获取元素的高度
            if (distanceFromTop < window.innerHeight / 2 && distanceFromTop + listyHeight > window.innerHeight / 2) {  // 判断元素是否在视口中间位置
                showioNavItems.forEach((item) => {  // 遍历showioNavItems数组
                    item.classList.remove('showio_nav');  // 移除所有元素的'showio_nav'类
                });
                showioNavItems[index].classList.add('showio_nav');  // 给当前元素添加'showio_nav'类
            }
        });
    });

    showioNavItems.forEach((item, index) => {  // 遍历showioNavItems数组
        item.addEventListener('click', () => {  // 给每个元素添加点击事件监听
            listys[index].scrollIntoView({ behavior: 'smooth', block: 'center' });  // 平滑滚动到对应的listy元素，并确保其顶部在屏幕的中间位置
        });
    });
</script>
```

- 点击导航项时页面会滚动到相应的列表顶部位置减去100像素的位置。

```javascript
const listys = document.querySelectorAll('main .main_list');
const showioNavItems = document.querySelectorAll('.nav ul li.MaoIdan');

window.addEventListener('scroll', () => {
    listys.forEach((listy, index) => {
        const distanceFromTop = listy.getBoundingClientRect().top;
        if (distanceFromTop <= 100 && distanceFromTop + listy.getBoundingClientRect().height >= 100) {
            showioNavItems.forEach((item) => {
                item.classList.remove('nav_cen');
            });
            showioNavItems[index].classList.add('nav_cen');
        }
    });
});

showioNavItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        window.scrollTo({ top: listys[index].offsetTop - 100, behavior: 'smooth' });
    });
});
```

# 点击显示点击任意位置隐藏

```javascript
const searchElements = document.querySelectorAll('.sousuo');
searchElements.forEach(function(searchElement) {
    searchElement.addEventListener('click', function(e) {
        const footerElement = document.querySelector('.fooer');
        footerElement.style.top = '50%';
        function handleDocumentClick() {
            footerElement.style.top = '-100%';
            document.removeEventListener('click', handleDocumentClick);
        }
        document.addEventListener('click', handleDocumentClick, { once: true });
        e.stopPropagation();
    });
});

const footerElements = document.querySelectorAll('.fooer');
footerElements.forEach(function(footerElement) {
    footerElement.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});


/** 缩放显示 **/
document.querySelector(".Suoou").addEventListener("click", function (e) {
    document.querySelector(".suosouaa").style.transform = "translate(-50%,-50%) scale(1)";
    document.addEventListener("click", function closeSearch(e) {
        document.querySelector(".suosouaa").style.transform = "translate(-50%,-50%) scale(0)";
        document.removeEventListener("click", closeSearch);
    }, { once: true });
    e.stopPropagation();
});

document.querySelector(".suosouaa").addEventListener("click", function (e) {
    e.stopPropagation();
});
```

# 购物车

![](F:\笔记md\image3.png)

## ♬HTML

```javascript
<div class="GouWuChe">
    <form action="">
        <h2>购物车</h2>
        <div class="GOuwuc">
            <div class="GOuwuc_max">
                <table>
                    <tbody>
                        <tr>
                            <th>产品名</th>
                            <th>单价</th>
                            <th>数量</th>
                            <th>小计</th>
                            <th>操作</th>
                        </tr>
                        <tr>
                            <td>
                                <div class="ShangPin">
                                    <input type="checkbox">
                                    <img src="public/home/images/ren.png" alt="">
                                    <div class="ShangPin_Text">
                                        <h2>天丝四件套A类</h2>
                                        <p>1.5米/1.8米床单款四件套</p>
                                    </div>
                                </div>
                            </td>
                            <td class="DanJian" id="DanJai">
                                ￥<span>120.00</span>
                            </td>
                            <td class="JinE">
                                <div class="quantity_Shw">
                                    <input type="number" id="quantity_input" value="1">
                                    <div class="quantity_Shw_r">
                                        <button type="button" id="jia">
                                            <i class="layui-icon layui-icon-left"></i>
                                        </button>
                                        <button type="button" id="jian">
                                            <i class="layui-icon layui-icon-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td class="XIaoJi">
                                ￥<span>120.00</span>
                            </td>
                            <td class="GuanBi" id="Shanchu"><i class="layui-icon layui-icon-close"></i></td>
                        </tr>
                        <tr>
                            <td>
                                <div class="ShangPin">
                                    <input type="checkbox">
                                    <img src="public/home/images/ren.png" alt="">
                                    <div class="ShangPin_Text">
                                        <h2>天丝四件套A类</h2>
                                        <p>1.5米/1.8米床单款四件套</p>
                                    </div>
                                </div>
                            </td>
                            <td class="DanJian" id="DanJai">
                                ￥<span>120.00</span>
                            </td>
                            <td class="JinE">
                                <div class="quantity_Shw">
                                    <input type="number" id="quantity_input" value="1">
                                    <div class="quantity_Shw_r">
                                        <button type="button" id="jia">
                                            <i class="layui-icon layui-icon-left"></i>
                                        </button>
                                        <button type="button" id="jian">
                                            <i class="layui-icon layui-icon-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td class="XIaoJi">
                                ￥<span>120.00</span>
                            </td>
                            <td class="GuanBi" id="Shanchu"><i class="layui-icon layui-icon-close"></i></td>
                        </tr>
                        <tr>
                            <td>
                                <div class="ShangPin">
                                    <input type="checkbox">
                                    <img src="public/home/images/ren.png" alt="">
                                    <div class="ShangPin_Text">
                                        <h2>天丝四件套A类</h2>
                                        <p>1.5米/1.8米床单款四件套</p>
                                    </div>
                                </div>
                            </td>
                            <td class="DanJian" id="DanJai">
                                ￥<span>120.00</span>
                            </td>
                            <td class="JinE">
                                <div class="quantity_Shw">
                                    <input type="number" id="quantity_input" value="1">
                                    <div class="quantity_Shw_r">
                                        <button type="button" id="jia">
                                            <i class="layui-icon layui-icon-left"></i>
                                        </button>
                                        <button type="button" id="jian">
                                            <i class="layui-icon layui-icon-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td class="XIaoJi">
                                ￥<span>120.00</span>
                            </td>
                            <td class="GuanBi" id="Shanchu"><i class="layui-icon layui-icon-close"></i></td>
                        </tr>
                    </tbody>
                </table>
                <div class="JieSuan">
                    <div class="JieSuan_L">
                        <label>
                            <input id="Quanxuan" type="checkbox">全选
                        </label>
                        <a id="ShanChu">删除选中的商品</a>
                    </div>
                    <div class="JieSuan_R">
                        <div class="ZhongJIn">
                            <div class="ZhongJIn_Shuj">已选择 <span>0</span> 件商品</div>
                            <div class="ZhongJIn_Zhong">
                                总价:
                                <p>￥<span>0</span></p>
                            </div>
                        </div>
                        <div class="JieSuan_Sub">
                            <input type="submit" value="提 交">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const quanlityInputs = document.querySelectorAll('.quantity_Shw input[type="number"]');
        const jiaButtons = document.querySelectorAll('#jia');
        const jianButtons = document.querySelectorAll('#jian');
        const danJiaPrices = document.querySelectorAll('.DanJian span');
        const xiaoJiPrices = document.querySelectorAll('.XIaoJi span');
        const quanxuanCheckbox = document.getElementById('Quanxuan');
        const shanchuLink = document.getElementById('ShanChu');
        const jieSuanSubmit = document.querySelector('.JieSuan_Sub input[type="submit"]');
        const zhongjinSpan = document.querySelector('.ZhongJIn_Shuj span');
        const totalPriceSpan = document.querySelector('.ZhongJIn_Zhong span');

        // 选择商品
        const selectProduct = (checkbox) => {
            const row = checkbox.closest('tr');
            row.classList.toggle('selected');
            updateTotal();
        };

        // 计算小计
        const calculateXiaoJi = (price, quantity) => {
            return (parseFloat(price) * parseInt(quantity)).toFixed(2);
        };

        // 更新总价
        const updateTotal = () => {
            let total = 0;
            let selectedCount = 0;
            xiaoJiPrices.forEach((item, index) => {
                const row = item.closest('tr');
                if (!row || !row.parentNode) { // 检查行是否已被删除
                    return;
                }
                if (row.classList.contains('selected')) {
                    total += parseFloat(item.textContent);
                    selectedCount++;
                }
            });
            totalPriceSpan.textContent = total;
            zhongjinSpan.textContent = selectedCount;
        };

        // 更新选中商品状态
        const updateSelectedStatus = (checkbox) => {
            const row = checkbox.closest('tr');
            if (checkbox.checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
            updateTotal();
        };

        // 绑定商品选择事件
        const productCheckboxes = document.querySelectorAll('.ShangPin input[type="checkbox"]');
        productCheckboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                updateSelectedStatus(checkbox);
            });
        });

        jiaButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const input = quanlityInputs[index];
                input.value = parseInt(input.value) + 1;
                const xiaoJiPrice = xiaoJiPrices[index];
                const price = danJiaPrices[index].textContent;
                xiaoJiPrice.textContent = calculateXiaoJi(price, input.value);
                updateTotal();
            });
        });

        jianButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const input = quanlityInputs[index];
                if (parseInt(input.value) > 1) {
                    input.value = parseInt(input.value) - 1;
                    const xiaoJiPrice = xiaoJiPrices[index];
                    const price = danJiaPrices[index].textContent;
                    xiaoJiPrice.textContent = calculateXiaoJi(price, input.value);
                    updateTotal();
                }
            });
        });

        // 全选/全不选
        quanxuanCheckbox.addEventListener('change', () => {
            const checkboxes = document.querySelectorAll('.ShangPin input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = quanxuanCheckbox.checked;
                updateSelectedStatus(checkbox); // 更新总价
            });
        });

        // 删除商品
        document.querySelectorAll('.GuanBi').forEach((icon, index) => {
            icon.addEventListener('click', () => {
                const row = icon.closest('tr');
                row.remove();
                updateTotal();
            });
        });

        // 删除选中的商品
        shanchuLink.addEventListener('click', () => {
            const selectedRows = document.querySelectorAll('tr.selected');
            Array.from(selectedRows).forEach((row) => {
                row.remove();
            });
            updateTotal();
            quanxuanCheckbox.checked = false;
        });

        // 提交购物车
        jieSuanSubmit.addEventListener('click', (event) => {
            event.preventDefault();
            // 这里可以添加提交购物车的逻辑
            // 例如，发送一个请求到服务器，包含选中的商品信息
        });
    });
</script>
```

## ♬CSS

```javascript
.GouWuChe {
    width: var(--max);
    overflow: hidden;
    margin: 20px auto;
    background: rgb(255, 255, 255);
    padding: var(--top30);
}
.GouWuChe h2{
    font-size: var(--size24);
    color: rgb(0, 0, 0);
    line-height: 1;
}
.GouWuChe table{
    width: 100%;
    margin-top: var(--top30);
}
.GouWuChe table tr{
    border-bottom: 1px solid rgb(0, 0, 0,0.15);
}
.GouWuChe table tr th{
    padding: 20px 0;
    font-size: var(--size14);
    color: rgb(153, 153, 153);
    font-family: 'siyuanheiti';
    text-align: center;
}
.GouWuChe table tr th:nth-child(1){
    width: 40%;
}
.GouWuChe table tr td{
    padding: 20px 0;
    font-size: var(--size14);
    color: rgb(153, 153, 153);
    font-family: 'siyuanheiti';
    text-align: center;
}
.ShangPin{
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
}
.ShangPin input{
    width: 15px;
    height: 15px;
}
.ShangPin img{
    width: 85px;
    height: auto;
    margin: 0 10px;
}
.ShangPin_Text{
    flex: 1;
}
.ShangPin_Text h2{
    font-size: var(--size16);
    color: rgb(0, 0, 0);
    text-align: left;
}
.ShangPin_Text p{
    font-size: 12px;
    color: rgb(153, 153, 153);
    margin-top: 10px;
    text-align: left;
}
.JinE .quantity_Shw{
    margin: auto;
}
.GuanBi{
    cursor: pointer;
}
.JieSuan{
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: var(--top20);
}
.JieSuan_L{
    width: max-content;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.JieSuan_L label{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: var(--size14);
    color: rgb(0, 0, 0);
}
.JieSuan_L input{
    width: 15px;
    height: 15px;
    margin-right: 10px;
}
.JieSuan_L a{
    font-size: var(--size14);
    color: rgb(0, 0, 0);
    margin-left: var(--top30); 
}
.JieSuan_R{
    flex: 1;
}

.ZhongJIn{
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
}
.ZhongJIn_Shuj{
    width: max-content;
    font-size: var(--size14);
    color: rgb(0, 0, 0);
}
.ZhongJIn_Zhong{
    width: max-content;
    font-size: var(--size14);
    color: rgb(0, 0, 0);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-left: var(--top30);
}
.ZhongJIn_Zhong p{
    font-size: var(--size30);
    color: rgb(252, 97, 93);
    line-height: 1;
}
.JieSuan_Sub{
    width: 100%;
    overflow: hidden;
    margin-top: var(--top30);
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
}
.JieSuan_Sub>input {
    width: 170px;
    height: 50px;
    background: rgb(237, 28, 36);
    border: transparent;
    font-size: var(--size16);
    color: rgb(255, 255, 255);
    margin-left: 10px;
}
```

# 唤起微信扫一扫并返回结果

```javascript
<input type="text" id="result">
<input type="button" value="Scan" id="saoma">
<script type="text/javascript">
    var qr = GetQueryString("qrresult");
    if (qr) {
        $("#result").val(qr);
    }

    $("#saoma").click(function () {
        window.open("//996315.com/api/scan/?redirect_uri=" + encodeURIComponent(location.href), "_self");
    });

    function GetQueryString(name) {
        var reg = new RegExp("\\b" + name + "=([^&]*)");
        var r = decodeURIComponent(location.href).match(reg);
        if (r != null) return r[1];
    }
</script>
```

# 粒子背景

```javascript
<div id="mydiv" style="height:800px;"></div>
<script type="text/javascript">
    window.onload = function() {
        //配置
        var config = {
            vx: 4,    //小球x轴速度,正为右，负为左
            vy: 4,    //小球y轴速度
            height: 2,    //小球高宽，其实为正方形，所以不宜太大
            width: 2,
            count: 200,        //点个数
            color: "121, 162, 185",     //点颜色
            stroke: "130,255,255",         //线条颜色
            dist: 6000,     //点吸附距离
            e_dist: 20000,     //鼠标吸附加速距离
            max_conn: 10     //点到点最大连接数
        }
        //调用
        CanvasParticle(config);
    }
    var CanvasParticle = (function(){
        function getElementByTag(name){
            return document.getElementsByTagName(name);
        }
        function getELementById(id){
            return document.getElementById(id);
        }
        // 根据传入的config初始化画布
        function canvasInit(canvasConfig){
            canvasConfig = canvasConfig || {};
            var html = getElementByTag("html")[0];
            // 获取body作为背景
            // var body = getElementByTag("body")[0];

            // 获取特定div作为背景
            // mydiv是你想要将其作为背景的div的ID
            var body = document.getElementById("mydiv");
            var canvasObj = document.createElement("canvas");

            var canvas = {
                element: canvasObj,
                points : [],
                // 默认配置
                config: {
                    vx: canvasConfig.vx || 4,
                    vy:  canvasConfig.vy || 4,
                    height: canvasConfig.height || 2,
                    width: canvasConfig.width || 2,
                    count: canvasConfig.count || 100,
                    color: canvasConfig.color || "121, 162, 185",
                    stroke: canvasConfig.stroke || "130,255,255",
                    dist: canvasConfig.dist || 6000,
                    e_dist: canvasConfig.e_dist || 20000,
                    max_conn: 10
                }
            };
            // 获取context
            if(canvas.element.getContext("2d")){
                canvas.context = canvas.element.getContext("2d");
            }else{
                return null;
            }
            body.style.padding = "0";
            body.style.margin = "0";
            // body.replaceChild(canvas.element, canvasDiv);
            body.appendChild(canvas.element);

            canvas.element.style = "position: fixed; top: 0; left: 0; z-index: -1;";
            canvasSize(canvas.element);
            window.onresize = function(){
                canvasSize(canvas.element);
            }
            body.onmousemove = function(e){
                var event = e || window.event;
                canvas.mouse = {
                    x: event.clientX,
                    y: event.clientY
                }
            }
            document.onmouseleave = function(){
                canvas.mouse = undefined;
            }
            setInterval(function(){
                drawPoint(canvas);
            }, 40);
        }
        // 设置canvas大小
        function canvasSize(canvas){
            // 获取窗口的宽高
            // canvas.width = window.innerWeight || document.documentElement.clientWidth || document.body.clientWidth;
            // canvas.height = window.innerWeight || document.documentElement.clientHeight || document.body.clientHeight;

            // 获取特定div的宽高
            var width = document.getElementById("mydiv").style.width;
            var height = document.getElementById("mydiv").style.height;
            width = parseInt(width);
            height = parseInt(height);
            canvas.width = width || window.innerWeight || document.documentElement.clientWidth || document.body.clientWidth;
            canvas.height = height || window.innerWeight || document.documentElement.clientHeight || document.body.clientHeight;
        }
        // 画点
        function drawPoint(canvas){
            var context = canvas.context,
                point,
                dist;
            context.clearRect(0, 0, canvas.element.width, canvas.element.height);
            context.beginPath();
            context.fillStyle = "rgb("+ canvas.config.color +")";
            for(var i = 0, len = canvas.config.count; i < len; i++){
                if(canvas.points.length != canvas.config.count){
                    // 初始化所有点
                    point = {
                        x: Math.floor(Math.random() * canvas.element.width),
                        y: Math.floor(Math.random() * canvas.element.height),
                        vx: canvas.config.vx / 2 - Math.random() * canvas.config.vx,
                        vy: canvas.config.vy / 2 - Math.random() * canvas.config.vy
                    }
                }else{
                    // 处理球的速度和位置，并且做边界处理
                    point =    borderPoint(canvas.points[i], canvas);
                }
                context.fillRect(point.x - canvas.config.width / 2, point.y - canvas.config.height / 2, canvas.config.width, canvas.config.height);

                canvas.points[i] = point;
            }
            drawLine(context, canvas, canvas.mouse);
            context.closePath();
        }
        // 边界处理
        function borderPoint(point, canvas){
            var p = point;
            if(point.x <= 0 || point.x >= canvas.element.width){
                p.vx = -p.vx;
                p.x += p.vx;
            }else if(point.y <= 0 || point.y >= canvas.element.height){
                p.vy = -p.vy;
                p.y += p.vy;
            }else{
                p = {
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vx: p.vx,
                    vy: p.vy
                }
            }
            return p;
        }
        // 画线
        function drawLine(context, canvas, mouse){
            context = context || canvas.context;
            for(var i = 0, len = canvas.config.count; i < len; i++){
                // 初始化最大连接数
                canvas.points[i].max_conn = 0;
                // point to point
                for(var j = 0; j < len; j++){
                    if(i != j){
                        dist = Math.round(canvas.points[i].x - canvas.points[j].x) * Math.round(canvas.points[i].x - canvas.points[j].x) + 
                                Math.round(canvas.points[i].y - canvas.points[j].y) * Math.round(canvas.points[i].y - canvas.points[j].y);
                        // 两点距离小于吸附距离，而且小于最大连接数，则画线
                        if(dist <= canvas.config.dist && canvas.points[i].max_conn <canvas.config.max_conn){
                            canvas.points[i].max_conn++;
                            // 距离越远，线条越细，而且越透明
                            context.lineWidth = 0.5 - dist / canvas.config.dist;
                            context.strokeStyle = "rgba("+ canvas.config.stroke + ","+ (1 - dist / canvas.config.dist) +")"
                            context.beginPath();
                            context.moveTo(canvas.points[i].x, canvas.points[i].y);
                            context.lineTo(canvas.points[j].x, canvas.points[j].y);
                            context.stroke();

                        }
                    }
                }
                // 如果鼠标进入画布
                // point to mouse
                if(mouse){
                    dist = Math.round(canvas.points[i].x - mouse.x) * Math.round(canvas.points[i].x - mouse.x) + 
                            Math.round(canvas.points[i].y - mouse.y) * Math.round(canvas.points[i].y - mouse.y);
                    // 遇到鼠标吸附距离时加速，直接改变point的x，y值达到加速效果
                    if(dist > canvas.config.dist && dist <= canvas.config.e_dist){
                        canvas.points[i].x = canvas.points[i].x + (mouse.x - canvas.points[i].x) / 20;
                        canvas.points[i].y = canvas.points[i].y + (mouse.y - canvas.points[i].y) / 20;
                    }
                    if(dist <= canvas.config.e_dist){
                        context.lineWidth = 1;
                        context.strokeStyle = "rgba("+ canvas.config.stroke + ","+ (1 - dist / canvas.config.e_dist) +")";
                        context.beginPath();
                        context.moveTo(canvas.points[i].x, canvas.points[i].y);
                        context.lineTo(mouse.x, mouse.y);
                        context.stroke();
                    }
                }
            }
        }
        return canvasInit;
    })();
</script>
```

# 前端表单把数据提交到服务器指定文件夹

## ♬接口upload.php

```javascript
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $target_dir = "/www/wwwroot/suntechled.huizhirh.com/111/222/"; 
    $target_file = $target_dir . basename($_FILES["file"]["name"]);
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    } else {
    }
} else {
    echo "无效的请求.";
}
?>
```

## ♬HTML

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
</head>
<body>
    <form id="txtForm">
        <input type="text" id="name" name="name" required>
        <input type="text" id="phone" name="phone" required>
        <textarea id="content" name="content" required></textarea>
        <button type="submit">提交</button>
    </form>

    <script>
        document.getElementById('txtForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const content = document.getElementById('content').value;
            const txtContent = `姓名: ${name}\n电话: ${phone}\n内容: ${content}`;
            const blob = new Blob([txtContent], { type: 'text/plain' });
            const formData = new FormData();
            formData.append('file', blob, `${name}.txt`);
            fetch('http://suntechled.huizhirh.com/111/upload.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(result => {
                console.error('上传成功: ' + result);
            })
            .catch(error => {
                console.error('上传失败:', error);
            });
        });
    </script>
</body>
</html>
```

# 日历带自定义价格

## ♬HTML

```javascript
♬<div class="calendar">
    <div class="calendar-header">
        <button id="prevMonth">Prev</button>
        <div id="monthYear"></div>
        <button id="nextMonth">Next</button>
    </div>
    <div class="days-of-week">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
    </div>
    <div class="calendar-days" id="calendarDays">
    </div>
</div>
```

## CSS

```javascript
.calendar {
    width: 800px;
    margin: 0 auto;
    border: 1px solid #ddd;
    padding: 20px;
    text-align: center;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.calendar-header button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
}

.calendar-header button:hover {
    background-color: #0056b3;
}

.days-of-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 10px;
    font-weight: bold;
}

.days-of-week div,
.calendar-days div {
    padding: 10px;
    border: 1px solid #ddd;
    position: relative;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.price-tag {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: #ff6347;
    color: white;
    padding: 2px 5px;
    font-size: 12px;
    border-radius: 3px;
}
```

## ♬JS

```javascript
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const monthYear = document.getElementById('monthYear');
        const calendarDays = document.getElementById('calendarDays');
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');

        let currentDate = new Date();

        // 定义每个日期的价格信息
        const prices = {
            '2024-08-05': '$50',
            '2024-08-10': '$70',
            '2024-08-15': '$100',
            // 更多日期和价格可以在这里添加
        };

        function renderCalendar() {
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();

            // 显示月份和年份
            monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

            // 获取当前月份的第一天和最后一天
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // 清空之前的日期
            calendarDays.innerHTML = '';

            // 填充前面的空白
            for (let i = 0; i < firstDayOfMonth; i++) {
                const blankDay = document.createElement('div');
                calendarDays.appendChild(blankDay);
            }

            // 填充当前月份的日期
            for (let i = 1; i <= daysInMonth; i++) {
                const day = document.createElement('div');
                day.textContent = i;

                // 检查是否有价格
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                if (prices[dateKey]) {
                    const priceTag = document.createElement('div');
                    priceTag.className = 'price-tag';
                    priceTag.textContent = prices[dateKey];
                    day.appendChild(priceTag);
                }

                calendarDays.appendChild(day);
            }
        }

        // 上一月
        prevMonth.addEventListener('click', function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        // 下一月
        nextMonth.addEventListener('click', function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // 初始化日历
        renderCalendar();
    });

</script>
```

# 世界地图可视化自定义标记

- 数据文件在当前文件夹data.json

```javascript
<div id="map"></div>
<script>
    // 初始化 ECharts 实例
    const chart = echarts.init(document.getElementById('map'));

    // 使用ajax加载世界地图的geoJSON数据
    fetch('/public/home/js/data.json')
        .then(response => response.json())
        .then(geoJson => {
            // 注册地图
            echarts.registerMap('world', geoJson);
            

            const option = {
                geo: {
                    map: 'world',
                    roam: true,
                    itemStyle: {
                        normal: {
                            areaColor: 'rgb(33, 108, 157)',
                            borderColor: '#fff'
                        }
                    }
                },
                series: [
                    {
                        name: 'Markers',
                        type: 'scatter',
                        coordinateSystem: 'geo',
                        data: [
                            {name: '中国', value: [116.4074, 39.9042], info: '中国'}
                        ],
                        symbol: 'image:///public/home/images/bianji.png',
                        symbolSize: 50,
                        label: {
                            show: true,
                            formatter: function(params) {
                                return params.data.info;
                            },
                            position: 'ritopght',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderColor: 'rgb(155, 232, 255)',
                            borderWidth: 1,
                            padding: [10, 10,5],
                            borderRadius: 4
                        }
                    }
                ]
            };


            chart.setOption(option);
        })
        .catch(error => {
            console.error('Error loading the map:', error);
        });
</script>
```

# 鼠标跟随弹字

```javascript
var possibleEmoji = ["HW 产品设计与开发", "🌟", "🎉", "✨", "HW 产品设计与开发", "😂", "😍", "👍", "💖", "🌈"];
(function emojiCursor() {
    var targetElement = document.getElementById('app'); //id app
    var width = targetElement.offsetWidth;
    var height = targetElement.offsetHeight;
    var cursor = { x: width / 2, y: width / 2 };
    var particles = [];

    function init() {
        bindEvents();
        loop();
    }

    function bindEvents() {
        targetElement.addEventListener('mousemove', onMouseMove);
        targetElement.addEventListener('touchmove', onTouchMove);
        targetElement.addEventListener('touchstart', onTouchMove);

        window.addEventListener('resize', onWindowResize);
    }

    function onWindowResize(e) {
        width = targetElement.offsetWidth;
        height = targetElement.offsetHeight;
    }

    function onTouchMove(e) {
        if (e.touches.length > 0) {
            for (var i = 0; i < e.touches.length; i++) {
                addParticle(e.touches[i].clientX, e.touches[i].clientY, possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)]);
            }
        }
    }

    function onMouseMove(e) {
        cursor.x = e.clientX - targetElement.getBoundingClientRect().left;
        cursor.y = e.clientY - targetElement.getBoundingClientRect().top;

        addParticle(cursor.x, cursor.y, possibleEmoji[Math.floor(Math.random() * possibleEmoji.length)]);
    }

    function addParticle(x, y, character) {
        var particle = new Particle();
        particle.init(x, y, character);
        particles.push(particle);
        targetElement.appendChild(particle.element);
    }

    function updateParticles() {

        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
        }

        for (var i = particles.length - 1; i >= 0; i--) {
            if (particles[i].lifeSpan < 0) {
                particles[i].die();
                particles.splice(i, 1);
            }
        }

    }
    function loop() {
        requestAnimationFrame(loop);
        updateParticles();
    }

    function Particle() {

        this.lifeSpan = 150;
        this.initialStyles = {
            "position": "absolute",
            "top": "0",
            "display": "block",
            "pointerEvents": "none",
            "z-index": "10000000",
            "fontSize": "20px",
            "will-change": "transform"
        };

        this.init = function (x, y, character) {

            this.velocity = {
                x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
                y: 1
            };

            this.position = { x: x - 10, y: y - 20 };
            this.color = randomColor();

            this.element = document.createElement('span');
            this.element.innerHTML = character;
            this.element.style.color = this.color;
            applyProperties(this.element, this.initialStyles);
            this.update();
        };

        this.update = function () {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.lifeSpan -= 2;

            this.element.style.transform = "translate3d(" + this.position.x + "px," + this.position.y + "px,0) scale(" + (this.lifeSpan / 120) + ")";
        }

        this.die = function () {
            this.element.parentNode.removeChild(this.element);
        }
    }

    function applyProperties(target, properties) {
        for (var key in properties) {
            target.style[key] = properties[key];
        }
    }

    function randomColor() {
        return 'rgb(' + (Math.floor(Math.random() * 256)) + ',' +
            (Math.floor(Math.random() * 256)) + ',' +
            (Math.floor(Math.random() * 256)) + ')';
    }

    init();
})();
```

# 鼠标圆点跟随

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    cursor.style.background = 'rgba(255, 255, 255)';
    cursor.style.borderRadius = '50%';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999';
    cursor.style.mixBlendMode = 'difference';
    cursor.style.transition = 'transform 0.2s ease';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 8 + 'px';
        cursor.style.top = e.clientY - 8 + 'px';
    });
});
```

# 输入数字联动图表

```javascript
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://www.jq22.com/jquery/jquery-1.10.2.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/echarts/5.5.0/echarts.common.js"></script>
</head>
<body>
    <style>
        #main {
            width: 500px;
            height: 500px;
        }
    </style>
    <div class="a"></div>
    <div class="b"></div>

    <div id="main"></div>

    <input type="text" id="rangeInput" value="10">
    <input type="text" id="rangeInputa" value="20">

    <script>
        // 获取文本输入框元素
        var rangeInput = document.getElementById('rangeInput');
        var rangeInputa = document.getElementById('rangeInputa');

        // 获取 ECharts 实例
        var myChart = echarts.init(document.getElementById('main'));

        // 初始化图表配置
        var option = {
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue']
            },
            yAxis: {
                type: 'value',
                axisLabel: { // 添加这部分来定制y轴刻度标签
                    formatter: function (value, index) {
                        // 这里可以自定义返回的标签文本，例如加上单位或特定文字
                        return value + ' 指'; // 示例：在每个数值后加上'customUnit'
                    },
                    rotate:10
                },
      
            },
            series: [
                {
                    data: [120, 200],
                    type: 'bar',
                    label: {
                        show: true, // 显示数值标签
                        position: 'top', // 标签位置在顶部
                        formatter: '{c}', // 使用内置的数值格式化函数
                        color: '#333' // 标签文字颜色
                    },
                    itemStyle: {
                        color: function (params) {
                            // params 参数中包含当前柱子的信息，可以通过 params.dataIndex 获取索引
                            // 这里根据索引返回不同的颜色
                            if (params.dataIndex === 0) {
                                return '#000000'; // 紫色
                            } else {
                                return '#4caf50'; // 天蓝色
                            }
                        }
                    }
                }
            ]
        };

        // 设置图表的初始配置
        myChart.setOption(option);

        // 获取需要更新的两个 div 元素
        var divA = document.querySelector('.a');
        var divB = document.querySelector('.b');

        // 更新 div 元素文本和图表数据的函数
        function updateDivValuesAndChart() {
            var value = parseFloat(rangeInput.value); // 将输入的值转换为浮点数
            var valuea = parseFloat(rangeInputa.value); // 将输入的值转换为浮点数
            var sum = value + valuea; // 计算两个输入框值的和

            divA.textContent = sum; // 假设 div A 显示两个输入框值的和
            divB.textContent = (sum * 2).toFixed(2); // 假设 div B 显示和的两倍，保留两位小数

            // 更新图表数据
            var newData = [sum * 2 + 56 * 562 / 2, sum * 2 + 25 / 2]; // 根据输入值更新数据
            myChart.setOption({
                series: [{
                    data: newData
                }]
            });
        }

        // 初始化 div 值和图表数据
        updateDivValuesAndChart();

        // 监听文本输入框值变化事件
        rangeInput.addEventListener('input', updateDivValuesAndChart);
        rangeInputa.addEventListener('input', updateDivValuesAndChart);
    </script>
</body>
</html>
```

# 随机换一换

```javascript
<ul id="list">
    <li><h2>1</h2></li>
    <li><h2>2</h2></li>
    <li><h2>3</h2></li>
    <li><h2>4</h2></li>
    <li><h2>5</h2></li>
</ul>

<button class="anniu">随机替换四组数据</button>

<script>
    var lis = Array.from(document.querySelectorAll('ul#list li'));
    var tempArray = [];

    lis.forEach(function (li) {
        tempArray.push(li);
    });

    lis.forEach(function (li) {
        li.remove();
    });

    for (var i = 0; i < 2; i++) {
        var randomIndex = Math.floor(Math.random() * tempArray.length);
        document.querySelector('#list').appendChild(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
    }

    document.querySelector('.anniu').addEventListener('click', function () {
        var listItems = document.querySelectorAll('#list li');
        for (var i = 0; i < 2; i++) {
            var randomIndex = Math.floor(Math.random() * tempArray.length);
            var replacedItem = listItems[i];
            document.querySelector('#list').replaceChild(tempArray[randomIndex], replacedItem);
            tempArray.push(replacedItem);
            tempArray.splice(randomIndex, 1);
        }
    });
</script>
```

# 随机验证码

```javascript
<canvas id="canvas" width="200" height="100"></canvas>
<input type="text" class="input-val">
<button class="btn">提交</button>
<script type="text/javascript">
    $(function() {
        var show_num = [];
        draw(show_num);
        $("#canvas").on('click', function() {
            draw(show_num);
        })
        $(".btn").on('click', function() {
            var val = $(".input-val").val().toLowerCase();
            var num = show_num.join("");
            if (val == '') {
                alert('请输入验证码！');
            } else if (val.toLowerCase() == num) {
                alert('提交成功！');
                $(".input-val").val('');
                draw(show_num);

            } else {
                alert('验证码错误！请重新输入！');
                $(".input-val").val('');
                draw(show_num);
            }
        })
    })
    function draw(show_num) {
        var canvas_width = $('#canvas').width();
        var canvas_height = $('#canvas').height();
        var canvas = document.getElementById("canvas"); //获取到canvas的对象，演员 
        var context = canvas.getContext("2d"); //获取到canvas画图的环境，演员表演的舞台 
        canvas.width = canvas_width;
        canvas.height = canvas_height;
        var sCode = "A,B,C,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0";
        var aCode = sCode.split(",");
        context.font = "bold 53px 微软雅黑";
        var aLength = aCode.length; //获取到数组的长度        
        for (var i = 0; i <= 3; i++) {
            var j = Math.floor(Math.random() * aLength); //获取到随机的索引值 
            var deg = Math.random() * 30 * Math.PI / 180; //产生0~30之间的随机弧度 
            var txt = aCode[j]; //得到随机的一个内容 
            show_num[i] = txt.toLowerCase();
            var x = 10 + i * 20; //文字在canvas上的x坐标 
            var y = 20 + Math.random() * 8; //文字在canvas上的y坐标 
            context.font = "bold 23px 微软雅黑";
            context.translate(x, y);
            context.rotate(deg);
            context.fillStyle = randomColor();
            context.fillText(txt, 0, 0);
            context.rotate(-deg);
            context.translate(-x, -y);
        }
        for (var i = 0; i <= 5; i++) { //验证码上显示线条 
            context.strokeStyle = randomColor();
            context.beginPath();
            context.moveTo(Math.random() * canvas_width, Math.random() * canvas_height);
            context.lineTo(Math.random() * canvas_width, Math.random() * canvas_height);
            context.stroke();
        }
        for (var i = 0; i <= 30; i++) { //验证码上显示小点 
            context.strokeStyle = randomColor();
            context.beginPath();
            var x = Math.random() * canvas_width;
            var y = Math.random() * canvas_height;
            context.moveTo(x, y);
            context.lineTo(x + 1, y + 1);
            context.stroke();
        }
    }
    function randomColor() { //得到随机的颜色值 
        var r = Math.floor(Math.random() * 256);
        var g = Math.floor(Math.random() * 256);
        var b = Math.floor(Math.random() * 256);
        return "rgb(" + r + "," + g + "," + b + ")";
    }
</script>
```

















# 网页明暗切换

## ♬HTML

```javascript
<label id="switch" class="switch">
    <input type="checkbox" onchange="toggleTheme()" id="slider">
</label>

<script>
    function setTheme(themeName) {
        localStorage.setItem('theme', themeName);
        document.documentElement.className = themeName;
    }
    function toggleTheme() {
        if (localStorage.getItem('theme') === 'theme-dark') {
            setTheme('theme-light');  // 给html添加class
        } else {
            setTheme('theme-dark');
        }
    }
    (function () {
        if (localStorage.getItem('theme') === 'theme-dark') {
            setTheme('theme-dark');
            document.getElementById('slider').checked = false;
        } else {
            setTheme('theme-light');
            document.getElementById('slider').checked = true;
        }
    })();
</script>
```

## ♬炫酷得切换效果HTML

```javascript
<label for="sync" class="zhuti">
    <button class="toggle" aria-pressed="false" title="Toggle Dark Mode">
        <span class="toggle__content">
            <svg aria-hidden=true class="toggle__backdrop" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 290 228">
                <g class="clouds">
                    <path fill="#D9D9D9"
                        d="M335 147.5c0 27.89-22.61 50.5-50.5 50.5a50.78 50.78 0 0 1-9.29-.853c-2.478 12.606-10.595 23.188-21.615 29.011C245.699 243.749 228.03 256 207.5 256a50.433 50.433 0 0 1-16.034-2.599A41.811 41.811 0 0 1 166 262a41.798 41.798 0 0 1-22.893-6.782A42.21 42.21 0 0 1 135 256a41.82 41.82 0 0 1-19.115-4.592A41.84 41.84 0 0 1 88 262c-1.827 0-3.626-.117-5.391-.343C74.911 270.448 63.604 276 51 276c-23.196 0-42-18.804-42-42s18.804-42 42-42c1.827 0 3.626.117 5.391.343C64.089 183.552 75.396 178 88 178a41.819 41.819 0 0 1 19.115 4.592C114.532 176.002 124.298 172 135 172a41.798 41.798 0 0 1 22.893 6.782 42.066 42.066 0 0 1 7.239-.773C174.137 164.159 189.749 155 207.5 155c.601 0 1.199.01 1.794.031A41.813 41.813 0 0 1 234 147h.002c.269-27.66 22.774-50 50.498-50 27.89 0 50.5 22.61 50.5 50.5Z" />
                </g>
            </svg>

            <span aria-hidden=true class="pilot__container">
                <span class="pilot-bear">
                    <img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f13edbe752dd4d11b7c394aaf0f68637~tplv-k3u1fbpfcp-watermark.image?"
                        alt="pilot-bear" class="pilot" />
                </span>
            </span>

            <svg aria-hidden=true class="toggle__backdrop" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 290 228">
                <g class="clouds">
                    <path fill="#fff"
                        d="M328 167.5c0 15.214-7.994 28.56-20.01 36.068.007.31.01.621.01.932 0 23.472-19.028 42.5-42.5 42.5-3.789 0-7.461-.496-10.957-1.426C249.671 263.676 233.141 277 213.5 277a42.77 42.77 0 0 1-7.702-.696C198.089 284.141 187.362 289 175.5 289a42.338 42.338 0 0 1-27.864-10.408A42.411 42.411 0 0 1 133.5 281c-4.36 0-8.566-.656-12.526-1.876C113.252 287.066 102.452 292 90.5 292a42.388 42.388 0 0 1-15.8-3.034A42.316 42.316 0 0 1 48.5 298C25.028 298 6 278.972 6 255.5S25.028 213 48.5 213a42.388 42.388 0 0 1 15.8 3.034A42.316 42.316 0 0 1 90.5 207c4.36 0 8.566.656 12.526 1.876C110.748 200.934 121.548 196 133.5 196a42.338 42.338 0 0 1 27.864 10.408A42.411 42.411 0 0 1 175.5 204c2.63 0 5.204.239 7.702.696C190.911 196.859 201.638 192 213.5 192c3.789 0 7.461.496 10.957 1.426 2.824-10.491 9.562-19.377 18.553-24.994-.007-.31-.01-.621-.01-.932 0-23.472 19.028-42.5 42.5-42.5s42.5 19.028 42.5 42.5Z" />
                </g>
            </svg>
            <span class="toggle__indicator-wrapper">
                <span class="toggle__indicator">
                    <span class="toggle__star">
                        <span class="sun">
                            <span class="moon">
                                <span class="moon__crater"></span>
                                <span class="moon__crater"></span>
                                <span class="moon__crater"></span>
                            </span>
                        </span>
                    </span>
                </span>
            </span>

            <svg aria-hidden=true class="toggle__backdrop" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 290 228">
                <g>
                    <g class="stars">
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M61 11.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.749 3.749 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.749 3.749 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813a3.749 3.749 0 0 0 2.576-2.576l.813-2.846A.75.75 0 0 1 61 11.5Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M62.5 45.219a.329.329 0 0 1 .315.238l.356 1.245a1.641 1.641 0 0 0 1.127 1.127l1.245.356a.328.328 0 0 1 0 .63l-1.245.356a1.641 1.641 0 0 0-1.127 1.127l-.356 1.245a.328.328 0 0 1-.63 0l-.356-1.245a1.641 1.641 0 0 0-1.127-1.127l-1.245-.356a.328.328 0 0 1 0-.63l1.245-.356a1.641 1.641 0 0 0 1.127-1.127l.356-1.245a.328.328 0 0 1 .315-.238Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M32 31.188a.28.28 0 0 1 .27.204l.305 1.067a1.405 1.405 0 0 0 .966.966l1.068.305a.28.28 0 0 1 0 .54l-1.068.305a1.405 1.405 0 0 0-.966.966l-.305 1.068a.28.28 0 0 1-.54 0l-.305-1.068a1.406 1.406 0 0 0-.966-.966l-1.067-.305a.28.28 0 0 1 0-.54l1.067-.305a1.406 1.406 0 0 0 .966-.966l.305-1.068a.281.281 0 0 1 .27-.203Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M41.5 74.219a.329.329 0 0 1 .315.238l.356 1.245a1.641 1.641 0 0 0 1.127 1.127l1.245.356a.328.328 0 0 1 0 .63l-1.245.356a1.641 1.641 0 0 0-1.127 1.127l-.356 1.245a.328.328 0 0 1-.63 0l-.356-1.245a1.641 1.641 0 0 0-1.127-1.127l-1.245-.356a.328.328 0 0 1 0-.63l1.245-.356a1.641 1.641 0 0 0 1.127-1.127l.356-1.245a.328.328 0 0 1 .315-.238Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M34 83.188a.28.28 0 0 1 .27.203l.305 1.068a1.405 1.405 0 0 0 .966.966l1.068.305a.28.28 0 0 1 0 .54l-1.068.305a1.405 1.405 0 0 0-.966.966l-.305 1.068a.28.28 0 0 1-.54 0l-.305-1.068a1.406 1.406 0 0 0-.966-.966l-1.068-.305a.28.28 0 0 1 0-.54l1.068-.305a1.406 1.406 0 0 0 .966-.966l.305-1.068a.281.281 0 0 1 .27-.204Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M63 89.25a.375.375 0 0 1 .36.272l.407 1.423a1.874 1.874 0 0 0 1.288 1.288l1.423.406a.374.374 0 0 1 0 .722l-1.423.406a1.874 1.874 0 0 0-1.288 1.288l-.407 1.423a.374.374 0 0 1-.72 0l-.407-1.423a1.874 1.874 0 0 0-1.288-1.288l-1.423-.406a.374.374 0 0 1 0-.722l1.423-.406a1.874 1.874 0 0 0 1.288-1.288l.407-1.423a.376.376 0 0 1 .36-.272Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M110.5 53.156a.236.236 0 0 1 .225.17l.254.89a1.174 1.174 0 0 0 .805.805l.89.254a.23.23 0 0 1 .122.084.233.233 0 0 1-.122.366l-.89.254a1.167 1.167 0 0 0-.805.805l-.254.89a.232.232 0 0 1-.225.17.235.235 0 0 1-.225-.17l-.254-.89a1.174 1.174 0 0 0-.805-.805l-.89-.254a.23.23 0 0 1-.122-.084.233.233 0 0 1 .122-.366l.89-.254a1.167 1.167 0 0 0 .805-.805l.254-.89a.232.232 0 0 1 .225-.17Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M120 27.188a.279.279 0 0 1 .27.204l.305 1.067a1.41 1.41 0 0 0 .966.966l1.067.305a.283.283 0 0 1 .148.1.286.286 0 0 1 0 .34.283.283 0 0 1-.148.1l-1.067.305a1.403 1.403 0 0 0-.966.966l-.305 1.067a.279.279 0 0 1-.439.147.275.275 0 0 1-.101-.147l-.305-1.067a1.41 1.41 0 0 0-.966-.966l-1.068-.305a.284.284 0 0 1-.147-.1.286.286 0 0 1 0-.34.284.284 0 0 1 .147-.1l1.068-.305a1.405 1.405 0 0 0 .966-.966l.305-1.067a.279.279 0 0 1 .27-.204Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M155 28.5a.753.753 0 0 1 .721.544l.813 2.846a3.746 3.746 0 0 0 2.576 2.576l2.846.813a.747.747 0 0 1 .543.721.75.75 0 0 1-.543.721l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.747.747 0 0 1-.721.543.749.749 0 0 1-.721-.543l-.813-2.846a3.746 3.746 0 0 0-2.576-2.576l-2.846-.813a.747.747 0 0 1-.543-.721.75.75 0 0 1 .543-.721l2.846-.813a3.75 3.75 0 0 0 2.576-2.576l.813-2.846A.751.751 0 0 1 155 28.5Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M147 60.25a.377.377 0 0 1 .36.272l.407 1.423a1.883 1.883 0 0 0 1.288 1.288l1.423.407a.375.375 0 0 1 0 .72l-1.423.407a1.875 1.875 0 0 0-1.288 1.288l-.407 1.423a.371.371 0 0 1-.36.272.377.377 0 0 1-.36-.272l-.407-1.423a1.883 1.883 0 0 0-1.288-1.288l-1.423-.406a.375.375 0 0 1 0-.722l1.423-.406a1.875 1.875 0 0 0 1.288-1.288l.407-1.423a.372.372 0 0 1 .36-.272Z"
                                clip-rule="evenodd" />
                        </g>
                        <g>
                            <path fill="#fff" fill-rule="evenodd"
                                d="M125.5 76.344a.513.513 0 0 1 .496.374l.559 1.956a2.574 2.574 0 0 0 1.771 1.771l1.956.56a.514.514 0 0 1 .27.805.514.514 0 0 1-.27.186l-1.956.559a2.57 2.57 0 0 0-1.771 1.77l-.559 1.957a.514.514 0 0 1-.806.27.514.514 0 0 1-.186-.27l-.559-1.956a2.574 2.574 0 0 0-1.771-1.771l-1.956-.56a.514.514 0 0 1-.27-.805.514.514 0 0 1 .27-.186l1.956-.559a2.57 2.57 0 0 0 1.771-1.77l.559-1.957a.515.515 0 0 1 .496-.374Z"
                                clip-rule="evenodd" />
                        </g>
                    </g>
                </g>
            </svg>
            <span class="astrobear__container">
                <span class="astrobear">
                    <svg aria-hidden=true xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 316 432">
                        <circle cx="158" cy="143" r="140" fill="#444" />
                        <circle cx="158" cy="143" r="140" fill="url(#a)" fill-opacity=".2" />
                        <circle cx="158" cy="143" r="140" stroke="#000" stroke-width="6" />
                        <path fill="#AF7128" fill-rule="evenodd"
                            d="M65.98 159.61C49.913 155.643 38 141.134 38 123.842 38 103.495 54.495 87 74.842 87c14.337 0 26.761 8.19 32.85 20.146C119.687 100.674 133.414 97 148 97h20c14.52 0 28.19 3.641 40.146 10.059C214.251 95.15 226.65 87 240.952 87c20.347 0 36.842 16.495 36.842 36.842 0 17.222-11.818 31.685-27.787 35.72A85.104 85.104 0 0 1 253 182v66.56l10.054-10.054c11.325-11.325 29.687-11.325 41.012 0s11.325 29.687 0 41.012l-44.548 44.548a29.004 29.004 0 0 1-6.518 4.906V407c0 12.15-9.85 22-22 22h-44c-12.15 0-22-9.85-22-22v-28.69a41.072 41.072 0 0 1-14 .174V407c0 12.15-9.85 22-22 22H85c-12.15 0-22-9.85-22-22v-77.797a28.99 28.99 0 0 1-6.946-5.137l-44.548-44.548c-11.325-11.325-11.325-29.687 0-41.012 11.326-11.325 29.687-11.325 41.013 0L63 248.988V182a85.106 85.106 0 0 1 2.98-22.39Z"
                            clip-rule="evenodd" />
                        <path fill="#000"
                            d="m65.98 159.61 2.894.789a3.002 3.002 0 0 0-2.175-3.701l-.72 2.912Zm41.712-52.464-2.673 1.362a3 3 0 0 0 4.098 1.279l-1.425-2.641Zm100.454-.087-1.419 2.643a3 3 0 0 0 4.089-1.274l-2.67-1.369Zm41.861 52.503-.735-2.908a2.997 2.997 0 0 0-2.159 3.698l2.894-.79ZM253 248.56h-3a3 3 0 0 0 5.121 2.121L253 248.56Zm10.054-10.054-2.121-2.121 2.121 2.121Zm41.012 0-2.121 2.122 2.121-2.122Zm0 41.012 2.121 2.122-2.121-2.122ZM253 328.972l-1.448-2.627a3 3 0 0 0-1.552 2.627h3Zm-88 49.338h3a3 3 0 0 0-3.548-2.949l.548 2.949Zm-14 .174.475-2.963a3 3 0 0 0-3.475 2.963h3Zm-88-49.281h3a3 3 0 0 0-1.597-2.651L63 329.203Zm-6.946-5.137-2.121 2.121 2.121-2.121Zm-44.548-44.548-2.121 2.122 2.121-2.122Zm0-41.012 2.122 2.122-2.122-2.122Zm41.013 0-2.122 2.122 2.122-2.122ZM63 248.988l-2.121 2.121A2.999 2.999 0 0 0 66 248.988h-3ZM35 123.842c0 18.704 12.886 34.391 30.26 38.681l1.439-5.825C51.941 153.054 41 139.721 41 123.842h-6ZM74.842 84C52.838 84 35 101.838 35 123.842h6C41 105.151 56.151 90 74.842 90v-6Zm35.524 21.785C103.785 92.862 90.351 84 74.842 84v6c13.165 0 24.58 7.517 30.177 18.508l5.347-2.723ZM148 94c-15.095 0-29.311 3.803-41.733 10.506l2.85 5.281C120.685 103.544 133.924 100 148 100v-6Zm20 0h-20v6h20v-6Zm41.565 10.416C197.183 97.769 183.027 94 168 94v6c14.013 0 27.196 3.512 38.727 9.702l2.838-5.286ZM240.952 84c-15.471 0-28.878 8.82-35.476 21.691l5.34 2.737C216.427 97.481 227.819 90 240.952 90v-6Zm39.842 39.842c0-22.004-17.838-39.842-39.842-39.842v6c18.69 0 33.842 15.151 33.842 33.842h6Zm-30.052 38.629c17.269-4.364 30.052-20 30.052-38.629h-6c0 15.816-10.853 29.104-25.522 32.812l1.47 5.817ZM256 182a88.09 88.09 0 0 0-3.099-23.228l-5.788 1.58A82.082 82.082 0 0 1 250 182h6Zm0 66.56V182h-6v66.56h6Zm-.879 2.121 10.054-10.053-4.242-4.243-10.054 10.054 4.242 4.242Zm10.054-10.053c10.154-10.154 26.616-10.154 36.77 0l4.242-4.243c-12.496-12.497-32.758-12.497-45.254 0l4.242 4.243Zm36.77 0c10.153 10.153 10.153 26.615 0 36.769l4.242 4.243c12.497-12.497 12.497-32.758 0-45.255l-4.242 4.243Zm0 36.769-44.548 44.548 4.243 4.242 44.547-44.547-4.242-4.243Zm-44.548 44.548a26.013 26.013 0 0 1-5.845 4.4l2.896 5.255a32.006 32.006 0 0 0 7.192-5.413l-4.243-4.242ZM256 360v-31.028h-6V360h6Zm0 47v-47h-6v47h6Zm-25 25c13.807 0 25-11.193 25-25h-6c0 10.493-8.506 19-19 19v6Zm-44 0h44v-6h-44v6Zm-25-25c0 13.807 11.193 25 25 25v-6c-10.493 0-19-8.507-19-19h-6Zm0-28.69V407h6v-28.69h-6Zm-4.5 3.69c2.74 0 5.429-.253 8.048-.74l-1.096-5.899c-2.261.42-4.583.639-6.952.639v6Zm-6.975-.554c2.279.365 4.608.554 6.975.554v-6c-2.047 0-4.058-.163-6.025-.479l-.95 5.925ZM154 407v-28.516h-6V407h6Zm-25 25c13.807 0 25-11.193 25-25h-6c0 10.493-8.506 19-19 19v6Zm-44 0h44v-6H85v6Zm-25-25c0 13.807 11.193 25 25 25v-6c-10.493 0-19-8.507-19-19h-6Zm0-47v47h6v-47h-6Zm0-30.797V360h6v-30.797h-6Zm-6.067-3.016a32.008 32.008 0 0 0 7.664 5.668l2.806-5.303a26.002 26.002 0 0 1-6.228-4.607l-4.242 4.242ZM9.385 281.64l44.548 44.547 4.242-4.242-44.547-44.548-4.243 4.243Zm0-45.255c-12.497 12.497-12.497 32.758 0 45.255l4.243-4.243c-10.154-10.154-10.154-26.616 0-36.769l-4.243-4.243Zm45.255 0c-12.497-12.497-32.758-12.497-45.255 0l4.243 4.243c10.153-10.154 26.616-10.154 36.77 0l4.242-4.243Zm10.481 10.481L54.64 236.385l-4.243 4.243 10.482 10.481 4.242-4.243ZM60.001 182v66.988h6V182h-6Zm3.084-23.178A88.1 88.1 0 0 0 60 182h6c0-7.48 1.001-14.722 2.874-21.601l-5.789-1.577Z" />
                        <path fill="#fff" fill-rule="evenodd"
                            d="M267.721 234.712C241.49 266.061 202.073 286 158 286c-43.749 0-82.91-19.647-109.141-50.598-11.328-8.104-27.18-7.069-37.353 3.104-11.325 11.325-11.325 29.687 0 41.012l44.548 44.548A28.99 28.99 0 0 0 63 329.203V407c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22v-28.517c2.123.341 4.293.517 6.5.517 2.555 0 5.06-.236 7.5-.69V407c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22V328.972a29.004 29.004 0 0 0 6.518-4.906l44.548-44.548c11.325-11.325 11.325-29.687 0-41.012-9.875-9.875-25.099-11.139-36.345-3.794Z"
                            clip-rule="evenodd" />
                        <path fill="url(#b)" fill-opacity=".5" fill-rule="evenodd"
                            d="M267.721 234.712C241.49 266.061 202.073 286 158 286c-43.749 0-82.91-19.647-109.141-50.598-11.328-8.104-27.18-7.069-37.353 3.104-11.325 11.325-11.325 29.687 0 41.012l44.548 44.548A28.99 28.99 0 0 0 63 329.203V407c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22v-28.517c2.123.341 4.293.517 6.5.517 2.555 0 5.06-.236 7.5-.69V407c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22V328.972a29.004 29.004 0 0 0 6.518-4.906l44.548-44.548c11.325-11.325 11.325-29.687 0-41.012-9.875-9.875-25.099-11.139-36.345-3.794Z"
                            clip-rule="evenodd" />
                        <path fill="#000"
                            d="m267.721 234.712-1.64-2.511c-.248.162-.47.359-.66.586l2.3 1.925Zm-218.862.69 2.289-1.94a3.026 3.026 0 0 0-.544-.5l-1.745 2.44Zm-37.353 3.104 2.122 2.121-2.122-2.121Zm0 41.012-2.121 2.122 2.121-2.122Zm44.548 44.548-2.121 2.121 2.121-2.121ZM63 329.203h3a2.999 2.999 0 0 0-1.597-2.651L63 329.203Zm88 49.28.475-2.962a3 3 0 0 0-3.475 2.962h3Zm14-.173h3a3 3 0 0 0-3.548-2.949l.548 2.949Zm88-49.338-1.448-2.627a3 3 0 0 0-1.552 2.627h3Zm51.066-49.454 2.121 2.122-2.121-2.122Zm0-41.012-2.121 2.121 2.121-2.121Zm-38.645-5.719C239.735 263.484 201.148 283 158 283v6c44.999 0 85.245-20.361 112.022-52.362l-4.601-3.851ZM158 283c-42.831 0-81.167-19.23-106.852-49.538l-4.578 3.879C73.347 268.937 113.332 289 158 289v-6ZM13.628 240.627c9.118-9.118 23.331-10.049 33.486-2.785l3.49-4.88c-12.502-8.944-29.991-7.805-41.219 3.423l4.243 4.242Zm0 36.77c-10.154-10.154-10.154-26.616 0-36.77l-4.243-4.242c-12.497 12.497-12.497 32.758 0 45.255l4.243-4.243Zm44.547 44.548-44.547-44.548-4.243 4.243 44.548 44.547 4.242-4.242Zm6.228 4.607a26.002 26.002 0 0 1-6.228-4.607l-4.242 4.242a32.008 32.008 0 0 0 7.664 5.668l2.806-5.303ZM66 360v-30.797h-6V360h6Zm0 47v-47h-6v47h6Zm19 19c-10.493 0-19-8.507-19-19h-6c0 13.807 11.193 25 25 25v-6Zm44 0H85v6h44v-6Zm19-19c0 10.493-8.506 19-19 19v6c13.807 0 25-11.193 25-25h-6Zm0-28.517V407h6v-28.517h-6Zm9.5-2.483c-2.047 0-4.058-.163-6.025-.479l-.95 5.925c2.279.365 4.608.554 6.975.554v-6Zm6.952-.639c-2.261.42-4.583.639-6.952.639v6c2.74 0 5.429-.253 8.048-.74l-1.096-5.899ZM168 407v-28.69h-6V407h6Zm19 19c-10.493 0-19-8.507-19-19h-6c0 13.807 11.193 25 25 25v-6Zm44 0h-44v6h44v-6Zm19-19c0 10.493-8.506 19-19 19v6c13.807 0 25-11.193 25-25h-6Zm0-47v47h6v-47h-6Zm0-31.028V360h6v-31.028h-6Zm7.397-7.027a26.043 26.043 0 0 1-5.845 4.4l2.896 5.255a32.036 32.036 0 0 0 7.192-5.413l-4.243-4.242Zm44.548-44.548-44.548 44.548 4.243 4.242 44.547-44.547-4.242-4.243Zm0-36.77c10.153 10.154 10.153 26.616 0 36.77l4.242 4.243c12.497-12.497 12.497-32.758 0-45.255l-4.242 4.242Zm-32.583-3.403c10.081-6.585 23.732-5.447 32.583 3.403l4.242-4.242c-10.898-10.899-27.697-12.29-40.106-4.184l3.281 5.023Z" />
                        <path fill="#000"
                            d="M292.654 245.606a3 3 0 1 1-4.243-4.242l4.243 4.242Zm8.485-8.485-8.485 8.485-4.243-4.242 8.485-8.486 4.243 4.243ZM301.208 254.161a3 3 0 1 1-4.242-4.243l4.242 4.243Zm8.486-8.485-8.486 8.485-4.242-4.243 8.485-8.485 4.243 4.243ZM21.919 246.606a3 3 0 1 0 4.242-4.242l-4.242 4.242Zm-8.486-8.485 8.486 8.485 4.242-4.242-8.485-8.486-4.243 4.243ZM13.364 255.161a3 3 0 1 0 4.243-4.243l-4.243 4.243Zm-8.485-8.485 8.485 8.485 4.243-4.243-8.486-8.485-4.242 4.243Z" />
                        <path fill="#FF1E1E" d="M113.322 154.665h88.371v13.25h-88.371z" />
                        <path fill="#000" fill-rule="evenodd"
                            d="M225.3 113.481c17.939 14.394 28.018 37.148 28.018 57.504H191.67c-.087-13.669-11.194-24.723-24.883-24.723h-18.56c-13.689 0-24.796 11.054-24.883 24.723H62c0-20.356 10.078-43.11 28.018-57.504C107.957 99.087 132.289 91 157.659 91c25.37 0 49.701 8.087 67.641 22.481Z"
                            clip-rule="evenodd" />
                        <circle cx="212.665" cy="197.079" r="8.079" fill="#000" />
                        <circle cx="104.079" cy="197.079" r="8.079" fill="#000" />
                        <path fill="#000"
                            d="M179.165 211.683c0 8.21-9.868 17.451-20.845 17.451-10.977 0-20.845-9.241-20.845-17.451 0-8.211 9.868-12.281 20.845-12.281 10.977 0 20.845 4.07 20.845 12.281Z" />
                        <path stroke="#000" stroke-linecap="round" stroke-width="6"
                            d="M198 417v12M222 417v12M95 417v12M119 417v12" />
                        <circle cx="158" cy="143" r="140" fill="url(#c)" stroke="#000" stroke-width="6" />
                        <g clip-path="url(#d)">
                            <path fill="#F5D949" stroke="#000" stroke-width="6"
                                d="m217.543 305.943.704 1.692 1.826.146 12.818 1.027h.001a.17.17 0 0 1 .059.011l.002.001a.147.147 0 0 1 .037.065.15.15 0 0 1 .008.075l-.001.002c0 .001-.01.017-.041.044h-.001l-9.765 8.365-1.391 1.192.425 1.782 2.981 12.506h.001c.009.04.008.058.008.06l-.001.002a.148.148 0 0 1-.05.056.146.146 0 0 1-.069.031h-.002c-.002-.001-.02-.005-.054-.026l-10.974-6.702-1.564-.955-1.564.955-10.974 6.702a.177.177 0 0 1-.053.025l-.002.001c-.004-.001-.032-.005-.069-.032a.146.146 0 0 1-.051-.056l-.001-.002s-.001-.018.008-.058l.001-.001 2.981-12.506.425-1.782-1.391-1.192-9.765-8.365h-.001c-.031-.027-.04-.043-.041-.044l-.001-.002a.15.15 0 0 1 .008-.075.147.147 0 0 1 .037-.065l.002-.001a.17.17 0 0 1 .059-.011h.001l12.818-1.027 1.826-.146.704-1.692 4.938-11.875a.161.161 0 0 1 .028-.051l.001-.001a.146.146 0 0 1 .076-.016c.047 0 .072.013.076.016l.001.001c.001 0 .012.013.028.051l4.938 11.875Z" />
                        </g>
                        <path stroke="#000" stroke-linecap="round" stroke-width="16"
                            d="M56.884 247.116A143.01 143.01 0 0 0 158 289a143.002 143.002 0 0 0 101.116-41.884" />
                        <path stroke="#000" stroke-width="6"
                            d="M65.035 404s25.382-6.618 41.965-6.5c17.059.121 43.035 7.5 43.035 7.5M164.012 403.977s25.961-5.606 42.932-5.472C224.402 398.642 251 405 251 405M25 290l7.769-4.072a57.001 57.001 0 0 0 25.067-26.121L62 251M254.363 252l3.867 7.873a57.002 57.002 0 0 0 25.452 25.746l8.694 4.394" />
                        <defs>
                            <linearGradient id="a" x1="158" x2="158" y1="0" y2="286" gradientUnits="userSpaceOnUse">
                                <stop offset=".219" />
                                <stop offset="1" stop-color="#fff" />
                            </linearGradient>
                            <linearGradient id="b" x1="254" x2="100" y1="419" y2="325"
                                gradientUnits="userSpaceOnUse">
                                <stop stop-opacity=".98" />
                                <stop offset="1" stop-opacity="0" />
                            </linearGradient>
                            <radialGradient id="c" cx="0" cy="0" r="1"
                                gradientTransform="matrix(165.9998 58.9999 -60.6938 170.7657 210 171)"
                                gradientUnits="userSpaceOnUse">
                                <stop offset=".771" stop-color="#D9D9D9" stop-opacity="0" />
                                <stop offset="1" stop-color="#fff" stop-opacity=".63" />
                            </radialGradient>
                            <clipPath id="d">
                                <path fill="#fff" d="M189 291h47v45h-47z" />
                            </clipPath>
                        </defs>
                    </svg>
                </span>
            </span>
        </span>
    </button>
    <input type="checkbox" onchange="toggleTheme()" id="sync">
</label>
```

## ♬JS

```javascript
setTimeout(function(){
    if($("html").hasClass("theme-light")){
        $(".toggle").attr("aria-pressed","false");
    }else{
        $(".toggle").attr("aria-pressed","true");
    }
}, 1);

const BUTTON = document.querySelector("button");
const SYNC = document.querySelector("#sync")

const TOGGLE = () => {
    const IS_PRESSED = BUTTON.matches("[aria-pressed=true]");
    if (SYNC.checked)
        document.body.setAttribute("data-dark-mode", IS_PRESSED ? false : true);
    BUTTON.setAttribute("aria-pressed", IS_PRESSED ? false : true);
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
};

BUTTON.addEventListener("click", TOGGLE);
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

(function () {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-dark');
        document.getElementById('sync').checked = false;
    } else {
        setTheme('theme-light');
        document.getElementById('sync').checked = true;
    }
})();
```

## ♬CSS

```javascript
*,
*:after,
*:before {
    box-sizing: border-box;
}

:root {
    --slide-ease: cubic-bezier(.4, -0.3, .6, 1.3);
    --easing: var(--slide-ease);
    --speed: 0.5s;
    --width: 500px;
    --ar: 8 / 3;
    --ray: hsl(0 0% 100% / 0.5);
    --sun: hsl(47, 91%, 58%);
    --moon: hsl(212, 13%, 82%);
    --crater: hsl(221, 16%, 68%);
    --bg: hsl(219, 30%, 88%);
    --bear-speed: 10s;
    --color: hsl(219 30% 20%);
}

[data-dark-mode=true] {
    --bg: hsl(219, 30%, 12%);
    --color: hsl(219 30% 98%);
}

.toggle__backdrop:first-of-type .clouds path:first-of-type {
    fill: var(--ray);
}

.toggle {
    -webkit-tap-highlight-color: transparent;
    width: var(--width);
    z-index: 10;
    will-change: transform;
    isolation: isolate;
    transform: translate3d(0, 0, 0);
    /* End of workaround city   */
    aspect-ratio: var(--ar);
    border-radius: 100vh;
    border: 0;
    position: relative;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    transition: background var(--speed) var(--easing);
    --sky: hsl(204, 53%, 47%);
    --night: hsl(229, 25%, 16%);
    outline-color: transparent;
    background: hsl(calc(204 + (var(--dark, 0) * 25)) calc((53 - (var(--dark, 0) * 28)) * 1%) calc((47 - (var(--dark, 0) * 31)) * 1%));
    /* box-shadow:
calc(var(--width) * 0) calc(var(--width) * 0.02) calc(var(--width) * 0.01) calc(var(--width) * -0.0025) hsl(210 10% 100% / 0.95),
calc(var(--width) * 0) calc(var(--width) * -0.02) calc(var(--width) * 0.01) calc(var(--width) * -0.0025) hsl(210 10% 10% / 0.2),
calc(var(--width) * 0) calc(var(--width) * 0.02) calc(var(--width) * 0.5) 0 hsl(210 10% 100% / 0.15); */
}

.toggle:after {
    content: "";
    position: absolute;
    inset: 0;
    box-shadow:
        calc(var(--width) * 0) calc(var(--width) * -0.025) calc(var(--width) * 0.025) 0 hsl(210 10% 10% / 0.15) inset,
        calc(var(--width) * 0) calc(var(--width) * 0.025) calc(var(--width) * 0.025) 0 hsl(210 10% 10% / 0.65) inset;
    border-radius: 100vh;
}

.toggle__content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    border-radius: 100vh;
    display: block;
    clip-path: inset(0 0 0 0 round 100vh);
}

.toggle__backdrop {
    overflow: visible !important;
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
    transition: translate var(--speed) var(--easing);
    translate: 0 calc(var(--dark, 0) * (100% - (3 / 8 * var(--width))));
}

[aria-pressed=false] .toggle__backdrop:last-of-type {
    transition-timing-function: cubic-bezier(.2, -0.6, .7, 1.6);
}

[aria-pressed=false] .stars path {
    transition-delay: 0s;
}

.stars path {
    transform-box: fill-box;
    transform-origin: 25% 50%;
    scale: calc(0.25 + (var(--dark, 0) * 0.75));
    transition: scale var(--speed) calc(var(--speed) * 0.5) var(--easing);
}

.toggle__indicator {
    height: 100%;
    aspect-ratio: 1;
    border-radius: 0%;
    display: grid;
    place-items: center;
    padding: 3%;
}

.pilot-bear {
    position: absolute;
    width: 25%;
}

.toggle__star {
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    position: relative;
    transition: translate var(--speed) var(--easing);
    translate: calc((var(--dark, 0) * -10%) + 5%) 0;
}

.sun {
    background: var(--sun);
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    box-shadow:
        calc(var(--width) * 0.01) calc(var(--width) * 0.01) calc(var(--width) * 0.02) 0 hsl(210 10% 100% / 0.95) inset,
        calc(var(--width) * -0.01) calc(var(--width) * -0.01) calc(var(--width) * 0.02) 0 hsl(210 10% 20% / 0.5) inset;
}

.moon {
    position: absolute;
    inset: -1%;
    border-radius: 50%;
    background: var(--moon);
    transition: translate var(--speed) ease-in-out;
    translate: calc((100 - (var(--dark, 0) * 100)) * 1%) 0%;
    box-shadow:
        calc(var(--width) * 0.01) calc(var(--width) * 0.01) calc(var(--width) * 0.02) 0 hsl(210 10% 100% / 0.95) inset,
        calc(var(--width) * -0.01) calc(var(--width) * -0.01) calc(var(--width) * 0.02) 0 hsl(210 10% 10% / 0.95) inset;
}

.moon__crater {
    position: absolute;
    background: var(--crater);
    border-radius: 50%;
    width: calc(var(--size, 10) * 1%);
    aspect-ratio: 1;
    left: calc(var(--x) * 1%);
    top: calc(var(--y) * 1%);
    box-shadow:
        calc(var(--width) * 0.01) calc(var(--width) * 0.01) calc(var(--width) * 0.01) 0 hsl(210 10% 6% / 0.25) inset,
        0 calc(var(--width) * 0.005) calc(var(--width) * 0.01) 0 hsl(210 10% 100% / 0.25);
}

.moon__crater:nth-of-type(1) {
    --size: 18;
    --x: 40;
    --y: 15;
}

.moon__crater:nth-of-type(2) {
    --size: 20;
    --x: 65;
    --y: 58;
}

.moon__crater:nth-of-type(3) {
    --size: 34;
    --x: 18;
    --y: 40;
}

.toggle__star:before {
    content: "";
    z-index: -1;
    width: 356%;
    background:
        radial-gradient(hsl(0 0% 100% / 0.25) 40%, transparent 40.5%),
        radial-gradient(hsl(0 0% 100% / 0.25) 56%, transparent 56.5%) hsl(0 0% 100% / 0.25);
    border-radius: 50%;
    aspect-ratio: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transition: translate var(--speed) var(--easing);
    translate: calc((50 - (var(--dark, 0) * 4)) * -1%) -50%;
}

.toggle__star:after {
    content: "";
    position: absolute;
    inset: 0;
    display: block;
    background: hsl(0 0% 0% / 0.5);
    filter: blur(4px);
    translate: 2% 4%;
    border-radius: 50%;
    z-index: -1;
}

.toggle__indicator-wrapper {
    position: absolute;
    inset: 0;
    transition: translate var(--speed) var(--slide-ease);
    translate: calc(var(--dark, 0) * (var(--width) - (3 / 8 * var(--width)))) 0;
}

[aria-pressed=true] {
    --dark: 1;
}

.stars g {
    transform-box: fill-box;
    transform-origin: 50% 50%;
}

.stars g:nth-of-type(3) {
    animation: twinkle 4s -2s infinite;
}

.stars g:nth-of-type(11) {
    animation: twinkle 6s -2s infinite;
}

.stars g:nth-of-type(9) {
    animation: twinkle 4s -1s infinite;
}

@keyframes twinkle {

    0%,
    40%,
    60%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(0);
    }
}

.astrobear {
    width: 12%;
    position: absolute;
    top: 100%;
    left: 0%;
    transition: translate calc(var(--speed) + (var(--dark, 0) * (var(--bear-speed) - var(--speed)))) calc(var(--bear-speed) * (0.4 * var(--dark, 0))) linear;
    translate: calc(var(--dark, 0) * 400%) calc(var(--dark, 0) * -350%);
}

.astrobear svg {
    transform-origin: 50% 75%;
    scale: var(--dark, 0);
    rotate: calc(var(--dark, 0) * 360deg);
    transition: rotate calc(var(--speed) + (var(--dark, 0) * (var(--bear-speed) - var(--speed)))) calc(var(--bear-speed) * 0.4) linear, scale var(--speed) ease-in-out;
}


.astrobear__container {
    position: absolute;
    overflow: hidden;
    inset: 0;
    clip-path: inset(0 0 0 0);
    opacity: var(--dark, 0);
    translate: 0 calc(-200% + (var(--dark, 0) * 200%));
    transition: opacity var(--speed) var(--easing), translate var(--speed) var(--easing);
}

.pilot__container {
    position: absolute;
    overflow: hidden;
    inset: 0;
    clip-path: inset(0 0 0 0);
    opacity: calc(1 - var(--dark, 0));
    translate: 0 calc(var(--dark, 0) * 200%);
    transition: opacity var(--speed) var(--easing), translate var(--speed) var(--easing);
}

.pilot-bear {
    width: 18%;
    position: absolute;
    top: 70%;
    left: 100%;
    transition:
        translate calc(var(--speed) + ((1 - var(--dark, 0)) * ((var(--bear-speed) * 0.5) - var(--speed)))) calc((var(--bear-speed) * 0.5) * ((1 - var(--dark, 0)) * 0.4)) linear;
    translate:
        calc((0 - (1 - var(--dark, 0))) * (var(--width) + 100%)) calc((0 - (1 - var(--dark, 0))) * (200%));
}

.pilot {
    rotate: 12deg;
    animation: fly 4s infinite ease-in-out;
    width: 100%;
}

@keyframes fly {
    50% {
        translate: 0 -25%;
    }
}

.controls {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: sans-serif;
    color: var(--color);
    transition: color var(--speed) var(--easing);
}

[type=checkbox] {
    accent-color: var(--color);
    transition: accent-color var(--speed) var(--easing);
}
```

# 下拉加载数据

## ♬单个加载

```javascript
<style>
    .hidden {
        display: none;
    }

    .loading {
        width: 100%;
        overflow: hidden;
    }

    .loading ul.ltabulation {
        width: 100%;
        overflow: hidden;
    }

    .loading ul.ltabulation li {
        width: 100%;
        height: 150px;
        overflow: hidden;
    }

    .loading .loadmore {
        width: max-content;
        margin: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        font-size: 16px;
        color: #000000;
        cursor: pointer;
    }

    .more {
        width: 25px;
        height: 25px;
        display: none;
    }

    .more svg {
        width: 100%;
        height: 100%;
        animation: more 1s steps(12, end) infinite;
    }

    @-webkit-keyframes more {
        0% {
            transform: rotate3d(0, 0, 1, 0deg);
        }

        100% {
            transform: rotate3d(0, 0, 1, 360deg);
        }
    }

   
</style>

<div class="loading">
    <ul class="hidden">
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
        <li>5</li>
        <li>6</li>
        <li>7</li>
        <li>8</li>
        <li>9</li>
        <li>10</li>
        <li>11</li>
        <li>12</li>
        <li>13</li>
        <li>14</li>
        <li>15</li>
        <li>16</li>
        <li>17</li>
        <li>18</li>
        <li>19</li>
        <li>20</li>
    </ul>
    <ul class="ltabulation">数据加载中，请稍后...</ul>
    <div class="loadmore">
        加载更多
        <i class="more">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100">
                <path fill="none" d="M0 0h100v100H0z"></path>
                <rect width="7" height="20" x="46.5" y="40" fill="#E9E9E9" rx="5" ry="5" transform="translate(0 -30)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#989697" rx="5" ry="5"
                    transform="rotate(30 105.98 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#9B999A" rx="5" ry="5"
                    transform="rotate(60 75.98 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#A3A1A2" rx="5" ry="5" transform="rotate(90 65 65)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#ABA9AA" rx="5" ry="5"
                    transform="rotate(120 58.66 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#B2B2B2" rx="5" ry="5"
                    transform="rotate(150 54.02 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#BAB8B9" rx="5" ry="5" transform="rotate(180 50 65)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#C2C0C1" rx="5" ry="5"
                    transform="rotate(-150 45.98 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#CBCBCB" rx="5" ry="5"
                    transform="rotate(-120 41.34 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#D2D2D2" rx="5" ry="5" transform="rotate(-90 35 65)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#DADADA" rx="5" ry="5"
                    transform="rotate(-60 24.02 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#E2E2E2" rx="5" ry="5"
                    transform="rotate(-30 -5.98 65)"></rect>
            </svg>
        </i>
    </div>
</div>

<script>
    const defaultDisplayCount = 10;
    const loadMoreCount = 5;
    let content = [];

    function init() {
        const ulList = document.querySelector(".loading .ltabulation");
        ulList.innerHTML = "";
        const lis = document.querySelectorAll(".loading .hidden li");
        const length = Math.min(defaultDisplayCount, lis.length);
        for (let n = 0; n < length; n++) {
            ulList.appendChild(lis[n].cloneNode(true));
        }
        for (let i = length; i < lis.length; i++) {
            content.push(lis[i].cloneNode(true));
        }
        document.querySelector(".loading .hidden").innerHTML = "";
    }

    function loadMore() {
        const more = document.querySelector(".more");
        more.style.display = "block";
        setTimeout(() => {
            const ulList = document.querySelector(".loading .ltabulation");
            const mLis = ulList.querySelectorAll("li").length;
            for (let i = 0; i < loadMoreCount; i++) {
                const target = content.shift();
                if (!target) {
                    const loadmore = document.querySelector('.loadmore');
                    loadmore.innerHTML = "全部加载完毕...";
                    break;
                }
                ulList.appendChild(target.cloneNode(true));
            }
            more.style.display = "none";
            viewer.destroy(); 
            viewer = new Viewer(document.getElementById('swiper'), { title: false });  //下拉加载不显示新加载得图片
        }, 1500);
    }

    init();

    const loadmoreLink = document.querySelector('.loadmore');
    loadmoreLink.addEventListener('click', function(event) {
        if (event.target.classList.contains('loadmore')) {
            loadMore();
        }
    });

    const ob = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            loadMore();
        }
    }, {
        threshold: 0
    });
    const loadingDom = document.querySelector(".loadmore");
    ob.observe(loadingDom);
</script>
```

## ♬多个加载

```html
<style>
    .hidden {
        display: none;
    }

    .loading {
        width: 100%;
        overflow: hidden;
    }

    .loading ul.ltabulation {
        width: 100%;
        overflow: hidden;
    }

    .loading ul.ltabulation li {
        width: 100%;
        height: 150px;
        overflow: hidden;
    }

    .loading .loadmore {
        width: max-content;
        margin: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        font-size: 16px;
        color: #000000;
        cursor: pointer;
    }

    .more {
        width: 25px;
        height: 25px;
        display: none;
    }

    .more svg {
        width: 100%;
        height: 100%;
        animation: more 1s steps(12, end) infinite;
    }

    @-webkit-keyframes more {
        0% {
            transform: rotate3d(0, 0, 1, 0deg);
        }

        100% {
            transform: rotate3d(0, 0, 1, 360deg);
        }
    }
</style>


<div class="loading">
    <ul class="hidden">
        <li>2</li>
        <li>2</li>
        <li>2</li>
        <li>2</li>
        <li>2</li>
        <li>2</li>
    </ul>
    <ul class="ltabulation">数据加载中，请稍后...</ul>
    <div class="loadmore">
        加载更多
        <i class="more">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 100 100">
                <path fill="none" d="M0 0h100v100H0z"></path>
                <rect width="7" height="20" x="46.5" y="40" fill="#E9E9E9" rx="5" ry="5" transform="translate(0 -30)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#989697" rx="5" ry="5"
                    transform="rotate(30 105.98 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#9B999A" rx="5" ry="5"
                    transform="rotate(60 75.98 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#A3A1A2" rx="5" ry="5" transform="rotate(90 65 65)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#ABA9AA" rx="5" ry="5"
                    transform="rotate(120 58.66 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#B2B2B2" rx="5" ry="5"
                    transform="rotate(150 54.02 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#BAB8B9" rx="5" ry="5" transform="rotate(180 50 65)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#C2C0C1" rx="5" ry="5"
                    transform="rotate(-150 45.98 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#CBCBCB" rx="5" ry="5"
                    transform="rotate(-120 41.34 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#D2D2D2" rx="5" ry="5" transform="rotate(-90 35 65)">
                </rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#DADADA" rx="5" ry="5"
                    transform="rotate(-60 24.02 65)"></rect>
                <rect width="7" height="20" x="46.5" y="40" fill="#E2E2E2" rx="5" ry="5"
                    transform="rotate(-30 -5.98 65)"></rect>
            </svg>
        </i>
    </div>
</div>

<script>
    function initLoading(element) {
        const defaultDisplayCount = 12;
        const loadMoreCount = 12;
        let content = [];
        const ulList = element.querySelector(".ltabulation");
        ulList.innerHTML = "";
        const hiddenUl = element.querySelector(".hidden");
        const lis = hiddenUl.querySelectorAll("li");
        hiddenUl.innerHTML = "";
        const length = Math.min(defaultDisplayCount, lis.length);
        for (let n = 0; n < length; n++) {
            ulList.appendChild(lis[n].cloneNode(true));
        }
        for (let i = length; i < lis.length; i++) {
            content.push(lis[i].cloneNode(true));
        }
        const loadmore = element.querySelector('.loadmore');
        loadmore.addEventListener('click', function() {
            loadMore(element, content, loadMoreCount);
        });
    }

    function loadMore(element, content, count) {
        const more = element.querySelector(".more");
        more.style.display = "block";
        setTimeout(() => {
            const ulList = element.querySelector(".ltabulation");
            const mLis = ulList.querySelectorAll("li").length;
            for (let i = 0; i < count; i++) {
                const target = content.shift();
                if (!target) {
                    const loadmore = element.querySelector('.loadmore');
                    loadmore.innerHTML = "全部加载完毕...";
                    break;
                }
                ulList.appendChild(target.cloneNode(true));
            }
            more.style.display = "none";
        }, 1500);
    }

    document.querySelectorAll('.loading').forEach(function(element) {
        initLoading(element);
    });
</script>
```

# 页面生成二维码，将整个页面生成图片

```html
<script src="//cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
<script src="//cdn.bootcss.com/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="https://html2canvas.hertzen.com/dist/html2canvas.js"></script>
<div class="post-content clearfix" style="width: 200px;" id="copy_area">
    <div id="qrcode"></div>
    <h2>哈哈哈</h2>
</div>
<p class="generate_img">生成图片，并下载</p>
<script>
    var url = window.location.href;
    var qrcodeContainer = document.getElementById('qrcode');
    new QRCode(qrcodeContainer, url);
</script>
<script>
    for (var i = 0; i < $("#copy_area img").length; i++) {
        $("#copy_area img").eq(i).attr("class", "tt" + i);
        var url = $("#copy_area img").eq(i).attr("src");
        var _class = $("#copy_area img").eq(i).attr("class");
        $(this).attr("crossOrigin", "*")
        getBase64Image(url, document.querySelector('#copy_area ' + "." + _class));
    }

    function getBase64Image(url, ref) {
        var image = new Image();
        image.src = url + "?v=" + Math.random(); // 处理缓存
        image.crossOrigin = "*"; // 支持跨域图片
        image.onload = function () {
            var base64 = drawBase64Image(image);
            ref.src = base64;
        };
    }

    function drawBase64Image(img) {
        console.log(img)
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL;
    }

    // 克隆dom的方法
    function downloadForJS() {
        var cloneDom = $("#copy_area").clone(true);
        //排版，不显示在页面上（不能用display:none，会导致无法生成url）
        cloneDom.css({ "z-index": "-1", "width": 600, "line-height": 2, "font-size": 16 });
        //设置id（用于销毁，否则会导致页面重复生成dom）
        cloneDom.attr("class", "tmp_datatable");
        $("body").append(cloneDom);
        //生成图片下载链接
        html2canvas(cloneDom[0], { useCORS: true, taintTest: true, logging: true }).then(function (canvas) {
            var imgUri = canvas.toDataURL();
            //销毁克隆对象
            cloneDom.empty();
            $(".tmp_datatable").remove();
            $(".pinctut").attr("src", imgUri);
            var saveLink = document.createElement('a');
            saveLink.href = imgUri;
            saveLink.download = 'downLoad.png';
            saveLink.click();
        })
    }

    // 克隆节点的方法 
    //  出现的问题：图片样式和显示样式不一致（获取的宽高是dom的本身的宽高，字体变小，导致截图下面空白）
    function downloadForJS1() {
        // 使用html2canvas 转换html为canvas
        // 获取节点高度，后面为克隆节点设置高度。
        var height = document.querySelector('#copy_area').offsetHeight
        // 克隆节点，默认为false，不复制方法属性，为true是全部复制。
        var cloneDom = document.querySelector('#copy_area').cloneNode(true);
        // 设置克隆节点的style属性，因为之前的层级为0，我们只需要比被克隆的节点层级低即可。
        cloneDom.style.height = height + "px";
        cloneDom.style.zIndex = '-1';
        // 将克隆节点动态追加到body后面。
        document.querySelector('body').append(cloneDom)
        // 插件生成base64img图片。
        html2canvas(cloneDom, { useCORS: true, taintTest: true, }).then(function (canvas) {
            var imgUri = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream') // 获取生成的图片的url
            // $(".pinctut").attr("src",imgUri);
            var saveLink = document.createElement('a');
            saveLink.href = imgUri;
            saveLink.download = 'downLoad.png';
            saveLink.click();
        })
        // 移除复制的节点
        document.querySelector('body').removeChild(cloneDom)
    }

    $(".generate_img").click(function () {
        downloadForJS();
        // downloadForJS1();
    })
</script>
```

# 音乐播放器

## ♬HTML

```html
<div class="playPause">
    <div class="player">
        <div class="player_img"><img id="player_img" src="" alt=""></div>
        <div class="player_cen">
            <div class="current">
                <img id="current_image" src="" alt="">
                <img class="current_img" id="current_img" src="/public/home/images/zhen.png" alt="">
            </div>
            <div class="audio">
                <audio id="audio" controls></audio>
                <div class="controls">
                    <h2 id="title">标题</h2>
                    <p id="descriptio">描述</p>
                    <div class="controls_playPause">
                        <div class="controls_img" id="prev"><img src="/public/home/images/prev.png" alt=""></div>
                        <div class="controls_img" id="playPause"><img id="playPauseImg"
                                src="/public/home/images/play.png" alt=""></div>
                        <div class="controls_img" id="next"><img src="/public/home/images/next.png" alt=""></div>
                        <div class="controls_img" id="togglePlayMode"><img id="playModeImg"
                                src="/public/home/images/order.png" alt=""></div>
                        <div class="controls_ye">
                            <img src="/public/home/images/yinliang.png" alt="">
                            <input class="range" type="range" id="volume" min="0" max="1" step="0.01" value="0.5">
                        </div>
                    </div>
                </div>
                <div class="progress">
                    <input class="range" type="range" id="progress" min="0" max="100" step="0.1" value="0">
                    <div class="progress_cen">
                        <div id="currentTime">00:00</div>
                        <div id="duration">00:00</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

## ♬JS

```javascript
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPause');
const playPauseImg = document.getElementById('playPauseImg');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const togglePlayModeBtn = document.getElementById('togglePlayMode');
const playModeImg = document.getElementById('playModeImg');
const volumeControl = document.getElementById('volume');
const progress = document.getElementById('progress');
const playlist = document.getElementById('playlist');
const currentTrackImage = document.getElementById('current_image');
const player_img = document.getElementById('player_img');
const currentTrackTitle = document.getElementById('title');
const currentTrackDescription = document.getElementById('descriptio');
const currentTimeDisplay = document.getElementById('currentTime');
const current_img = document.getElementById('current_img');
const durationDisplay = document.getElementById('duration');
const playPause = document.getElementById('playPause_in');
const tracks = Array.from(playlist.getElementsByTagName('li'));
let currentTrackIndex = 0;
let isShuffle = false;
let isSeeking = false;

function loadTrack(index) {
    const track = tracks[index];
    audio.src = track.getAttribute('data-src');
    currentTrackImage.src = track.getAttribute('data-image');
    player_img.src = track.getAttribute('data-image');
    currentTrackTitle.textContent = track.getAttribute('data-title');
    currentTrackDescription.textContent = track.getAttribute('data-description');
    audio.currentTime = 0;
    audio.pause();
    progress.value = 0;
    audio.load();
}

function playTrack() {
    audio.play();
    playPauseImg.src = '/public/home/images/pause.png';
    current_img.style.transform = 'rotate(350deg)';
    currentTrackImage.classList.add("current_image");
    playPause.classList.add("SHouqi");
}

function pauseTrack() {
    audio.pause();
    playPauseImg.src = '/public/home/images/play.png';
    current_img.style.transform = 'rotate(335deg)';
    currentTrackImage.classList.remove("current_image");
}

function playPauseTrack() {
    if (audio.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
}

function nextTrack() {
    if (isShuffle) {
        shuffleTrack();
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        playTrack();
    }
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

function shuffleTrack() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * tracks.length);
    } while (randomIndex === currentTrackIndex);
    currentTrackIndex = randomIndex;
    loadTrack(currentTrackIndex);
    playTrack();
}

function togglePlayMode() {
    isShuffle = !isShuffle;
    playModeImg.src = isShuffle ? '/public/home/images/shuffle.png' : '/public/home/images/order.png';
}

function updateProgress() {
    if (!isSeeking) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.value = progressPercent;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    }
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

function setVolume() {
    audio.volume = volumeControl.value;
}

function updateDuration() {
    durationDisplay.textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextTrack);
audio.addEventListener('loadedmetadata', () => {
    progress.value = 0;
    currentTimeDisplay.textContent = "00:00";
    updateDuration();
});

progress.addEventListener('input', (e) => {
    const newTime = (e.target.value / 100) * audio.duration;
    currentTimeDisplay.textContent = formatTime(newTime);
});
progress.addEventListener('change', (e) => {
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
    isSeeking = false;
});
progress.addEventListener('mousedown', () => {
    isSeeking = true;
});
progress.addEventListener('mouseup', () => {
    isSeeking = false;
});

volumeControl.addEventListener('input', setVolume);

playPauseBtn.addEventListener('click', playPauseTrack);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
togglePlayModeBtn.addEventListener('click', togglePlayMode);

playlist.addEventListener('click', (e) => {
    const target = e.target.closest('.ting');
    if (target) {
        const trackElement = target.closest('li');
        currentTrackIndex = tracks.indexOf(trackElement);
        loadTrack(currentTrackIndex);
        playTrack();
        audio.currentTime = 0;
        progress.value = 0;
    }
});

loadTrack(currentTrackIndex);
currentTrackImage.src = tracks[0].getAttribute('data-image');
currentTrackTitle.textContent = tracks[0].getAttribute('data-title');
currentTrackDescription.textContent = tracks[0].getAttribute('data-description');
```

## ♬CSS

```css
.playPause {
    width: 100%;
    overflow: hidden;
    background: rgb(0, 0, 0);
}

.player {
    width: var(--max);
    overflow: hidden;
    margin: var(--top60) auto;
    position: relative;
}

.player_img {
    width: 100%;
    height: 100%;
    border-radius: var(--top30);
    position: absolute;
    top: 0;
    left: 0;
    border-radius: var(--top30);
    overflow: hidden;
}

.player_img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.player_cen {
    width: 100%;
    overflow: hidden;
    border-radius: var(--top30);
    padding: var(--top60);
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(25px);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    z-index: 9;
    box-sizing: border-box;
}

.current {
    width: 335px;
    height: 335px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    position: relative;
    background: #000000;
}

.current #current_image {
    width: 60%;
    height: 60%;
    object-fit: cover;
    border-radius: 50%;
    transition: all 0.2s;
}

.current_image {
    animation: current 10s steps(100000, end) infinite;
}

.current img.current_img {
    width: 100px;
    height: auto;
    position: absolute;
    top: 0;
    right: -7%;
    border-radius: 0px;
    transform-origin: top right;
    transform: rotate(335deg);
    transition: all 0.5s;
}

@-webkit-keyframes current {
    0% {
        transform: rotate3d(0, 0, 1, 0deg);
    }

    100% {
        transform: rotate3d(0, 0, 1, 360deg);
    }
}

.audio {
    flex: 1;
    margin-left: 100px;
}

.controls {
    width: 100%;
    overflow: hidden;
}

.controls>h2 {
    font-size: var(--size30);
    color: rgb(255, 255, 255);
    line-height: 1;
}

.controls>p {
    font-size: var(--size18);
    color: rgb(255, 255, 255);
    line-height: 1;
    margin-top: var(--top20);
}

.controls_playPause {
    width: 100%;
    overflow: hidden;
    margin-top: var(--top50);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.controls_img {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.controls_img img {
    max-width: 100%;
    max-height: 100%;
}

.controls_ye {
    width: max-content;
    margin-left: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}

.controls_ye img {
    width: 30px;
    height: auto;
}

.controls_ye input {
    width: 160px;
    height: 16px;
    background: rgb(36, 35, 35);
    border-radius: 16px;
    margin-left: 10px;
    overflow: hidden;
}

.progress {
    width: 99.7%;
    margin-top: var(--top50);
}

.progress input {
    width: 100%;
    height: 16px;
    background: rgb(36, 35, 35);
    border-radius: 16px;
    overflow: hidden;
}

.range {
    -webkit-appearance: none;
    appearance: none;
    outline: 0;
    background-color: rgb(36, 35, 35);
    cursor: pointer;
    height: 16px;
    background: rgb(36, 35, 35);
    ;
}

.range {
    height: 16px;
    overflow: hidden;
}

.range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0px;
    height: 16px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid transparent;
    border-image: linear-gradient(#fff, #fff) 0 fill / 0 0 0 0 / 0px 0px 0 2000px;
}

.progress_cen {
    width: 100%;
    overflow: hidden;
    margin-top: var(--top30);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
}

.progress_cen div {
    width: max-content;
    line-height: 2;
    background: rgb(39, 31, 34);
    border-radius: 5px;
    padding: 0 10px;
    font-size: var(--size16);
    color: rgb(255, 255, 255);
    letter-spacing: 2px;
}
```

