# 基础

```javascript
// swiper自适应高度 
.ChanPin_Swiper .swiper-slide {
    height: 1px;
}
.ChanPin_Swiper .swiper-slide-active {
    height: auto;
}
// 无缝匀速滚动 
.swiper-wrapper {
    transition-timing-function: linear !important;
    -webkit-transition-timing-function: linear !important;
    -moz-transition-timing-function: linear !important;
    -ms-transition-timing-function: linear !important;
    -o-transition-timing-function: linear !important;
    transition-timing-function: linear !important;
}
```

```javascript
speed: 3000, //动画切换时间
observer:true,  //初始化
observeParents:true,  //初始化
autoplay: {
    delay: 3000,  //自动轮播
    disableOnInteraction: false,  //触碰后不会停止自动切换
    pauseOnMouseEnter: true,  //鼠标置于swiper时暂停自动切换，鼠标离开时恢复自动切换。
}
noSwipingClass : 'swiper-slide'// 禁止了手滑动的元素
breakpoints: {
  768: {
    slidesPerView: 3,
    spaceBetween: 80,
  },
  0: {
    slidesPerView: 3,
    spaceBetween: 20,
  }
}
```

# 增加一个分页器⋙数字分页

```javascript
<div class="swiper-num">
    <span class="activea"></span>/
    <span class="totala"></span>
</div>

on: {
    init: function () {
        var total = this.slides.length - 0;
        $('.totala').text('0' + total);
        this.emit('transitionEnd');
    },
    transitionEnd: function () {
        var index = this.realIndex + 1;
        $(".activea").text("0" + index);
    }
}
```

# swiper图片叠加切换

```javascript
<div class="certify">
    <div class="swiper-container">
        <div class="swiper-wrapper">
            {foreach name="function->getCatArticle('3')" key='n' item="art"}
            <div class="swiper-slide">
                <img src="{$art.logol}" />
            </div>
           {/foreach}
        </div>
    </div>
</div>

const certifySwiper = new Swiper('.certify .swiper-container', {
    watchSlidesProgress: true,
    slidesPerView: 'auto',
    centeredSlides: true,
    loop: true,
    loopedSlides: 5,
    autoplay: true,
    on: {
        progress: function (progress) {
            for (let i = 0; i < this.slides.length; i++) {
                let slide = this.slides.eq(i);
                let slideProgress = this.slides[i].progress;
                let modify = 1;
                if (Math.abs(slideProgress) > 1) {
                    modify = (Math.abs(slideProgress) - 1) * 0.3 + 1;
                }
                let translate = slideProgress * modify * 44 + '%';
                let scale = 1 - Math.abs(slideProgress) / 5;
                let zIndex = 999 - Math.abs(Math.round(10 * slideProgress));

                slide.css({
                    transform: `translateX(${translate}) scale(${scale})`,
                    zIndex: zIndex,
                    opacity: Math.abs(slideProgress) > 3 ? 0 : 1
                });
            }
        },
        setTransition: function (swiper, transition) {
            for (let i = 0; i < this.slides.length; i++) {
                let slide = this.slides.eq(i);
                slide.transition(transition);
            }
        }
    }
});
```

# swiper整屏滚动

```javascript
<div class="pageSwier swiper-container">
    <div class="swiper-wrapper">
        <div class="swiper-slide">
        </div>
        <div class="swiper-slide">
        </div>
        <div class="swiper-slide foot-out">
        </div>
    </div>
</div>
<style type="text/css">
    .pageSwier {
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }
    .bannerSwiper .swiper-slide {
        height: 100%;
    }
    .foot-out {
        height: auto !important;
    }
</style>
<script>
    var swiper = new Swiper('.pageSwier', {
        direction: 'vertical',
        slidesPerView: 'auto',
        speed: 1000,
        mousewheel: true,
    });
</script>
```

# 给小点添加文字

```javascript
var swiper = new Swiper(".mySwiper", {
    direction: "vertical",
    slidesPerView: 1,
    spaceBetween: 30,
    mousewheel: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + '</span>';
        },
        renderBullet: function (index, className) {
            switch (index) {
                case 0: text = '首页'; break;
                case 1: text = '产品'; break;
                case 2: text = '新闻'; break;
            }
            return '<span class="' + className + '">' + text + '</span>';
        },
    },
});
```

# swiper联动切换⋙多个

```javascript
<div class="swiper mySwiper2">
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
        <div class="swiper-slide">Slide 4</div>
        <div class="swiper-slide">Slide 5</div>
        <div class="swiper-slide">Slide 6</div>
        <div class="swiper-slide">Slide 7</div>
        <div class="swiper-slide">Slide 8</div>
        <div class="swiper-slide">Slide 9</div>
    </div>
</div>

<div class="swiper amySwiper">
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
        <div class="swiper-slide">Slide 4</div>
        <div class="swiper-slide">Slide 5</div>
        <div class="swiper-slide">Slide 6</div>
        <div class="swiper-slide">Slide 7</div>
        <div class="swiper-slide">Slide 8</div>
        <div class="swiper-slide">Slide 9</div>
    </div>
</div>

<div class="swiper mySwiper3">
    <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
        <div class="swiper-slide">Slide 4</div>
        <div class="swiper-slide">Slide 5</div>
        <div class="swiper-slide">Slide 6</div>
        <div class="swiper-slide">Slide 7</div>
        <div class="swiper-slide">Slide 8</div>
        <div class="swiper-slide">Slide 9</div>
    </div>
</div>

//amySwiper是主切换项
<script>
    var swiper1 = new Swiper(".amySwiper", {
        slidesPerView: 6,
        spaceBetween: 30,
        direction: "vertical",
        centeredSlides: true,
        loop: false,
        initialSlide: 2,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        on: {
            click: function () {
                var clickedSlide = this.clickedIndex;
                var slides = document.querySelectorAll('.amySwiper .swiper-slide');
                for (var i = 0; i < slides.length; i++) {
                    slides[i].classList.remove('active');
                }
                slides[clickedSlide].classList.add('active');
                this.slideTo(clickedSlide, 500);
                swiper2.slideTo(clickedSlide, 500);
                swiper3.slideTo(clickedSlide, 500);
            },

            
        },
    });
    var swiper2 = new Swiper(".mySwiper2", {
        spaceBetween: 10,
        direction: "vertical",
        initialSlide: 2,
    });

    var swiper3 = new Swiper(".mySwiper3", {
        spaceBetween: 10,
        direction: "vertical",
        initialSlide: 2,
    });
    swiper2.slideTo(swiper1.activeIndex);
    swiper3.slideTo(swiper1.activeIndex);
</script>
```

