# 滚动页面，切换图片关键帧

```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/ScrollTrigger.min.js"></script>

<canvas id="lightpass"></canvas>

<script>
    console.clear();

    const canvas = document.getElementById("lightpass");
    const context = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 200;
    // 总帧数
    const frameCount = 147;
    // 当前帧
    const currentFrame = index => (
        `https://www.apple.com/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/large/01-hero-lightpass/${(index + 1).toString().padStart(4, '0')}.jpg`
    );
    console.log(currentFrame);
    const images = []
    const airpods = {
        frame: 0
    };
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }
    gsap.to(airpods, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#lightpass",
            start: "top 80%", // 元素进入视口时触发
            end: "top 30%", // 元素完全进入视口时触发结束
            scrub: 0.5,
        },
        onUpdate: render
    });
    images[0].onload = render;
    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(images[airpods.frame], 0, 0);
    }
</script>
```

# 滚动页面，文字从左向右变颜色

```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/ScrollTrigger.min.js"></script>

<div class="GunDong">
    <p>测试文字文字文字文字文字</p>
</div>

<style>
    .GunDong span {
        color: red
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const gunDongElements = document.querySelectorAll('.GunDong');
        gunDongElements.forEach(gunDongElem => {
            textAddHtml(gunDongElem);
        });
        textAppear();
    });

    function textAppear() {
        const gunDongElements = gsap.utils.toArray(".GunDong");
        gunDongElements.forEach(gunDongElem => {
            const textmove = gsap.timeline({
                scrollTrigger: {
                    trigger: gunDongElem,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1,
                },
            });
            const spans = gsap.utils.toArray(gunDongElem.querySelectorAll("span"));
            spans.forEach(elem => {
                textmove.to(elem, { color: "rgb(0, 0, 0)", duration: 1 });
            });
        });
    }

    function textAddHtml(GunDong) {
        const poemElements = GunDong.querySelectorAll("p");
        let texthtml = '';
        poemElements.forEach(elem => {
            const poemArr = elem.textContent.split('');
            texthtml += '<p>';
            poemArr.forEach(citem => {
                texthtml += '<span>' + citem + '</span>';
            });
            texthtml += '</p>';
        });
        GunDong.innerHTML = texthtml;
    }
</script>
```

# 滚动页面，指定板块左右滚动

```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/ScrollTrigger.min.js"></script>

<div class="wrapper">
    <ul class="items">
        <li class="item">1</li>
        <li class="item">2</li>
        <li class="item">3</li>
    </ul>
</div>
.wrapper{
     transition: auto;
}
.items {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 20px;
}

.item {
    min-width: 50%;
    max-width: 50%;
    height: 190px;
    background: tomato;
}

let items = gsap.utils.toArray(".items"), // 获取所有class为items的元素
    pageWrapper = document.querySelector(".wrapper"); // 获取class为page-wrapper的元素

items.forEach((container, i) => { // 遍历所有class为items的元素
    let localItems = container.querySelectorAll(".item"), // 获取container内所有class为item的元素
        distance = () => { // 定义一个函数，用于计算container内最后一个元素与container右边界之间的距离
            let lastItemBounds = localItems[localItems.length - 1].getBoundingClientRect(), // 获取最后一个元素的clientRect
                containerBounds = container.getBoundingClientRect(); // 获取container的clientRect
            return Math.max(0, lastItemBounds.right - containerBounds.right); // 计算距离并返回
        };
    gsap.to(container, { // 将container元素进行动画
        x: () => -distance(), // x轴移动距离为负的距离
        scrollTrigger: { // 添加滚动触发器
            trigger: container, // 触发器元素为container
            start: "top top", // 开始位置为container顶部顶部
            pinnedContainer: pageWrapper, // 固定容器为pageWrapper
            end: () => "+=" + distance(), // 结束位置为距离加上container内最后一个元素与container右边界之间的距离
            pin: pageWrapper, // 固定元素为pageWrapper
            scrub: true, // 是否平滑滚动
            invalidateOnRefresh: true // 是否在刷新时重新计算
        }
    })
});
```

