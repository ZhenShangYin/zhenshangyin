# 加载进度条

```javascript
document.addEventListener('DOMContentLoaded', function () {
    const loadingBar = new ZhenshangyinLoadingBar({
        height: '4px',  // 设置加载条的高度
        backgroundColor: '#ff0000'   // 设置加载条的背景色
    });
    loadingBar.bindToScroll();  //绑定滚动事件，更新加载条进度
    loadingBar.updateScrollProgress();  //更新加载条的滚动进度
});
```

# Message 消息提示

```javascript
new ZhenshangyinMessage({ 
    message: '成功了',
    type: 'success',
    duration: 2000
});

new ZhenshangyinMessage({ 
    message: '出错了',
    type: 'error',
    duration: 2000
});

new ZhenshangyinMessage({ 
    message: '这是一个警告',
    type: 'warning',
    duration: 2000
});

new ZhenshangyinMessage({ 
    message: '这是一个信息',
    type: 'info',
    duration: 2000
});
```

# Notification 通知

```javascript

new ZhenshangyinNotification({ 
    title: '提示',
    message: '成功了',
    type: 'success',
    duration: 2000
});

new ZhenshangyinNotification({ 
    title: '提示',
    message: '出错了',
    type: 'error',
    duration: 2000
});

new ZhenshangyinNotification({ 
    title: '提示',
    message: '这是一个警告',
    type: 'warning',
    duration: 2000
});

new ZhenshangyinNotification({ 
    title: '提示',
    message: '这是一个信息',
    type: 'info',
    duration: 2000
});
```

# DatePicker 日期选择器

## 日期时间

```javascript
new ZhenshangyinDateSelector('#datePickerWithTime', {
    type: 'date', 
    language: 'en',  //语言选择
    dateFormat: 'YYYY-MM-DD HH:mm:ss',  // 选择日期格式，是否显示时间
    multiSelect: true,  // 日期多选
    dateDelimiter: ',',  // 日期多选分隔符
    onDateSelect: (formattedDate) => {
        new ZhenshangyinMessage({ message: '选择的日期: ' + formattedDate, type: 'success', duration: 2000 });
    }
});
```

## 日期范围

```javascript
new ZhenshangyinDateSelector('#dateRangePickerWithTime', {  // 启用分离模式为数组['#dateRangePickerStartSeparate', '#dateRangePickerEndSeparate']
    type: 'dateRange',
    language: 'en',  //语言选择
    dateFormat: 'YYYY-MM-DD HH:mm:ss',  // 选择日期格式，是否显示时间
    separator: '至',  // 日期范围分隔符
    isSeparate: true,  // 启用分离模式
    onDateRangeSelect: (formattedRange) => {
         new ZhenshangyinMessage({ message: '选择的日期范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});
```

## 周选择器

```javascript
new ZhenshangyinDateSelector('#weekPicker', {
    type: 'week',
    language: 'en',  //语言选择
    dateFormat: 'YYYY-MM-DD',
    separator: ' 至 ',  // 周选择器分隔符
    onWeekSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的周: ' + formattedRange, type: 'success', duration: 2000 });
    }
});
```

## 月份选择

```javascript
new ZhenshangyinDateSelector('#monthPickerSimple', {
    type: 'month',
    language: 'en',  //语言选择
    dateFormat: 'YYYY-MM',
    multiSelect: true,  // 选择多个月份
    separator: ' / ',  // 多选月份分隔符
    onMonthSelect: (selectedMonth) => {
        new ZhenshangyinMessage({ message: '选择的月份: ' + selectedMonth, type: 'success', duration: 2000 });
    }
});
```

## 月份范围

```javascript
new ZhenshangyinDateSelector('#monthRangePicker', {  // 启用分离模式['#monthRangePickerStartSeparate', '#monthRangePickerEndSeparate']
    type: 'monthRange',
    language: 'en',  //语言选择
    dateFormat: 'YYYY-MM',
    separator: '至',  // 月分范围分隔符
    isSeparate: true, // 启用分离模式
    onMonthRangeSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的月份范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});
```

## 年份选择

```javascript
new ZhenshangyinDateSelector('#yearPickerSimple', {
    type: 'year',
    language: 'en',  //语言选择
    multiSelect: true,  // 选择多个年份
    separator: ' / ',  // 多选年份分隔符
    onYearSelect: (selectedYear) => {
        new ZhenshangyinMessage({ message: '选择的年份: ' + selectedYear, type: 'success', duration: 2000 });
    }
});
```

## 年份范围

```javascript
new ZhenshangyinDateSelector('#yearRangePicker', {  // 启用分离模式['#yearRangePickerStartSeparate', '#yearRangePickerEndSeparate']
    type: 'yearRange',
    language: 'en',  //语言选择
    separator: '至',  // 年份范围分隔符
    isSeparate: true, // 启用分离模式
    onYearRangeSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的年份范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});
```

# TimePicker 时间选择器

## 时间选择

```javascript
new ZhenshangyinTimePicker('#timeInput', {
    dateFormat: 'HH:mm:ss',
    language: 'en',
    onTimeSelect: (time) => {
        new ZhenshangyinMessage({ message: '选择的日期时间: ' + time, type: 'success', duration: 2000 });
    }
});
```

## 时间范围

```javascript
new ZhenshangyinTimePicker('#timeRangeInput', {
    dateFormat: 'HH:mm:ss',
    isRange: true,  // 开启时间范围
    separator: ' 至 ',
    onTimeSelect: (timeRange) => {
        new ZhenshangyinMessage({ message: '选择的日期时间范围: ' + timeRange, type: 'success', duration: 2000 });
    }
});
```

# Select 选择器

```javascript

new ZhenshangyinDropdown({
     /** 主输入框的容器，指定下拉框关联的输入框位置 **/
    container: '.aaa',

    /** 默认列表，包含一些简单的数据项 **/
    data: [
        { title: '选项1', param1: '参数1', param2: '参数2' },
        { title: '选项2', param1: '参数3', param2: '参数4' },
        { title: '选项3', param1: '参数5', param2: '参数6' }
    ],

    /** 启用分组功能，数据按组展示 **/
    data: [
        {
            groupTitle: '分组1',
            children: [
                { title: '选项1', param1: '参数1', param2: '参数2' }, 
                { title: '选项2', param1: '参数3', param2: '参数4' }, 
            ]
        },
        {
            groupTitle: '分组2',
            children: [
                { title: '选项3', param1: '参数5', param2: '参数6' },
                { title: '选项4', param1: '参数7', param2: '参数8' },
            ]
        }
    ],
    
    /** 自定义参数，可以在其他地方使用 **/
    customParams: {
        自定义参数1: 'param1',  // 自定义参数1
        自定义参数2: 'param2',  // 自定义参数2
    },
    
    /** 选项选择时的回调函数 **/
    onSelect: function (item) {
        console.log('回调函数被调用，选中的项:', item.title);  // 输出当前选中的项
        console.log('当前选中的项:', item);  // 输出当前选中的项，通常是对象，包括 `title` 和额外的参数
        const selectedTitles = this.selectedItems.map(selected => selected.title); // 获取所有选中项的标题
        console.log('当前选中的标题:', selectedTitles);  // 输出标题数组
        console.log(selectedTitles.join(', '));  // 将标题拼接为字符串显示
    },
    
    searchEnabled: true,  // 启用下拉框中的搜索框，允许用户搜索选项
    inputSearchEnabled: true,  // 启用主输入框内的搜索，实时搜索
    defaultSelected: '选项4',   // 默认选中项，单选，多选为数组 ['选项4']
    grouped: true,  // 启用分组功能，数据将分成多个组进行展示
    multiSelect: true,  // 启用多选功能，允许选择多个项
    inputMultiSelect: true,  // 启用输入框内的多选功能，允许同时选择多个项
    language: 'en',  //启用英文
});

```

# Cascader 联级选择器

```javascript
/**
* 数据示例：包含省市区层级结构的数据。
* @type {Array<Object>}
* @property {string} name - 地区名称，如省、市、区。
* @property {Array<Object>} children - 子级数据，表示市或区等。
*/
const dataa = [
    {
        name: '省1',
        children: [
            {
                name: '市1',
                children: [
                    { name: '区1' },
                    { name: '区2' }
                ]
            },
            {
                name: '市2',
                children: [
                    { name: '区3' },
                    { name: '区4' }
                ]
            }
        ]
    },
    {
        name: '省2',
        children: [
            {
                name: '市3',
                children: [
                    { name: '区5' },
                    { name: '区6' }
                ]
            },
            {
                name: '市4',
                children: [
                    { name: '区7' },
                    { name: '区8' }
                ]
            }
        ]
    }
];

new ZhenshangyinLinkage({
    /** 绑定选择框容器 **/
    container: '#addressinput', 
    /** 联动选择的多个输入框 **/
    multiInputs: ['#cascaderProvinceInput', '#cascaderCityInput', '#cascaderDistrictInput'], 
    /** 传入的联动数据 **/
    data: dataa, 
    /** 设置自定义分隔符，默认是 '/' **/
    separator: '-', 
    /** 选择即执行回调函数 **/
    callback: (value) => {
        console.log('选中的地址：', value);
    }
    /** 选择完成后的回调函数 **/
    onFinish: (value) => {
        console.log('选中的地址：', value);
    }
});
```

# Digital scrolling 数字滚动

```javascript
new ZhenshangyinNumberScroll({
    className: 'number-scroll',  // 目标元素的类名
    duration: 1000,              // 动画持续时间（毫秒）
    fps: 60                      // 动画帧率
});
```

# Seamless scrolling 无缝滚动

```javascript
<div class="zhenshangyin-scroll">
    <div class="zhenshangyin-scroll-wrapper">
        <div>
            <img src="1.jpg" >
        </div>
    </div>
</div>

new ZhenshangyinInfiniteScroll('#scrollContainer', {
    direction: 'left',      // 滚动方向为从右向左，默认left，可选项 left | right | up down
    speed: 1,               // 滚动速度为1像素/帧，默认1
    pauseOnHover: true,     // 鼠标悬停时暂停滚动，默认true
    autoplay: true,         // 自动播放，默认false  
    hoverPlay: true         // 鼠标悬停时播放，默认false 
})
```

# Viewer 图片查看器

```javascript
const viewer = new ZhenshangyinImageViewer('.viewer', {
    zoomRatio: 0.1,         // 每次缩放的比例，默认0.1（即每次缩放10%）
    minZoom: 0.1,           // 最小缩放比例，默认0.1（即最小可以缩小到原图的10%）
    maxZoom: 10,            // 最大缩放比例，默认10（即最大可以放大到原图的1000%）
    showThumbnails: true,   // 是否显示缩略图，默认true
    autoplayInterval: 3000, // 自动播放间隔时间，默认3000ms（3秒）
    imageSelector: 'img',    // 选择特定类名的图片
    /**
     * imageSelector配置，支持以下格式：
     * 1. 'img' - 选择所有图片
     * 2. '.class' - 选择指定类名的图片
     * 3. '#id' - 选择指定ID的图片
     * 4. '[attr=value]' - 选择指定属性值的图片
     * 5. 'parent > img' - 选择指定父元素下的图片
     * 6. '.container img:not(.excluded)' - 选择容器下非指定类的图片
     */
});
```

# Swiper 轮播图

## 实例

```javascript
<div class="Swiper">
    <ul class="zhenshangyin-wrap">
        <li>
            <img src="1.jpg" alt="">
        </li>
    </ul>
    <div class="prev">
        <svg viewBox="0 0 24 24">
            <path fill="white" d="M15.2 7.1L14.7 6.5L9.1 12l5.6 5.5l0.5-0.6L10.4 12z" />
        </svg>
    </div>
    <div class="next">
        <svg viewBox="0 0 24 24">
            <path fill="white" d="M8.8 16.9L9.3 17.5L14.9 12L9.3 6.5L8.8 7.1L13.6 12z" />
        </svg>
    </div>
</div>
```

## 配置项

```javascript
const swiper = new LinkedZhenshangyinSwiper('.container', {
    /** 基础配置 **/
    direction: 'horizontal',   // 轮播方向，可选值：'horizontal'(水平) | 'vertical'(垂直)
    effect: 'slide',           // 切换效果，可选值：'slide'(滑动) | 'fade'(淡入淡出)
    loop: true,                // 是否开启循环播放
    speed: 300,                // 切换动画时长(ms)
    
    /** 自动播放相关 **/ **/
    autoplay: true,            // 是否自动播放
    interval: 3000,            // 自动播放间隔时间(ms)
    pauseOnHover: true,        // 鼠标悬停时是否暂停自动播放
    circularProgress: true,    // 启用环形进度，必须开启自动轮播，且联动轮播会有问题
    circularProgressPlayButton: true  // 启用环形进度中间的播放/暂停按钮
    
    /** 布局相关 **/
    slidesPerView: 3,          // 同时显示的slide数量，可以设置具体数字，或者'auto'根据容器宽度自动计算
    slidesPerGroup: 1,         // 每次切换的slide数量
    spaceBetween: 20,          // slide之间的间距(px)
    centeredSlides: true,      // 是否居中显示当前slide
    
    /** 响应式断点配置 **/
    breakpoints: {
        768: {
            slidesPerView: 1,
            spaceBetween: 10
        },
    },
    
    /** 分页器配置 **/
    pagination: {
        el: '.pager3',              // 分页器容器
        type: 'numbers',            // 分页器类型: 'bullets'(圆点分页器) | 'numbers'(数字分页器) | 'fraction'(分数式分页器) | 'progressbar'(进度条分页器)
        clickable: true,            // 是否可点击切换
        hoverChange: true,          // 是否可划入切换
        names: ['一', '二', '三'],  // numbers类型可配置，自定义分页器文字，可以传入任何有效的 HTML 字符串，可选
        style: 'padded'             // fraction类型可配置：'padded'(带前导零) | 'chinese'(中文数字) | 'roman'(罗马数字) | 'progressbar'分式分页器(1/4)
    },
    
    /** 导航按钮配置 **/
    navigation: {
        prevEl: '.prev-button', // 上一个按钮的选择器
        nextEl: '.next-button'  // 下一个按钮的选择器
    },
    
    /** 控制方式配置 **/
    mousewheel: true,          // 是否启用鼠标滚轮控制
    keyboard: true,            // 是否启用键盘控制
    touchable: true,           // 是否启用触摸滑动
    threshold: 50,             // 触发切换的滑动距离阈值(px)
    touchRatio: 1,             // 触摸距离与slide移动距离的比率
    
    /** 放大镜功能配置 **/
    magnifier: true,           // 是否开启放大镜功能
    magnifierType: false,      // 放大镜类型，true为固定位置放大镜，false为跟随鼠标的圆形放大镜
    magnifierSize: 200,        // 跟随鼠标的圆形放大镜尺寸（直径），单位px
    fixedMagnifierSize: 400,   // 固定位置放大镜的尺寸，单位px
    showSelectionBox: true,    // 是否显示选区框（仅在固定放大镜模式下生效）
    selectionBoxSize: 100,     // 选区框的大小，默认根据放大倍率自动计算，单位px
    magnifierMargin: 10,       // 设置放大镜的间距为 10px
    zoomRatio: 2.5,            // 放大倍率
    
    /** 事件回调配置 **/
    on: {
        init: null,                        // 初始化完成时触发
        beforeInit: null,                  // 初始化之前触发
        slideChange: null,                 // slide切换时触发
        slideChangeTransitionStart: null,  // slide切换动画开始时触发
        slideChangeTransitionEnd: null,    // slide切换动画结束时触发
        slideActiveIndexChange: null,      // 活动slide索引改变时触发
        touchStart: null,                  // 触摸开始时触发
        touchMove: null,                   // 触摸移动时触发
        touchEnd: null,                    // 触摸结束时触发
        autoplayStart: null,               // 自动播放开始时触发
        autoplayStop: null,                // 自动播放停止时触发
        autoplayPause: null,               // 自动播放暂停时触发
        autoplayResume: null,              // 自动播放恢复时触发
        beforeSlideChangeStart: null,      // slide切换开始前触发
        beforeTransitionStart: null,       // 过渡动画开始前触发
        transitionStart: null,             // 过渡动画开始时触发
        transitionEnd: null,               // 过渡动画结束时触发
        resize: null,                      // 窗口大小改变时触发
        breakpoint: null,                  // 断点切换时触发
        a11y: null,                        // 可访问性事件触发时
        beforeDestroy: null,               // 销毁之前触发
        destroy: null,                     // 销毁时触发
        beforeUpdate: null,                // 更新之前触发
        update: null,                      // 更新时触发
        click: null,                       // 点击时触发
        doubleClick: null,                 // 双击时触发
        scroll: null,                      // 滚动时触发
        imagesReady: null,                 // 所有图片加载完成时触发
        lazyImageLoad: null,               // 懒加载图片加载开始时触发
        lazyImageReady: null               // 懒加载图片加载完成时触发
    },
});
```

## 回调函数

```javascript
on: {
    // 1. 初始化相关
    beforeInit: (swiper) => {                    // Swiper初始化前触发
        console.log('beforeInit - Swiper初始化前');
    },
    init: (swiper) => {                          // Swiper初始化完成后触发
        console.log('init - Swiper初始化完成');
    },

    // 2. 切换相关
    slideChange: (data) => {                     // 幻灯片切换时触发
        console.log('slideChange - 幻灯片切换', {
            activeIndex: data.activeIndex,       // 当前活动幻灯片索引
            activeSlide: data.activeSlide,       // 当前活动幻灯片元素
            activeClasses: data.activeClasses    // 当前活动幻灯片的class列表
        });
    },
    beforeSlideChangeStart: (data) => {          // 幻灯片开始切换之前触发
        console.log('beforeSlideChangeStart - 幻灯片即将开始切换', {
            activeIndex: data.activeIndex,       // 当前索引
            targetIndex: data.targetIndex        // 目标索引
        });
    },
    beforeTransitionStart: (data) => {          // 过渡动画开始之前触发
        console.log('beforeTransitionStart - 过渡动画即将开始', {
            activeIndex: data.activeIndex,
            targetIndex: data.targetIndex
        });
    },
    transitionStart: (data) => {                // 过渡动画开始时触发
        console.log('transitionStart - 过渡动画开始', {
            activeIndex: data.activeIndex,
            targetIndex: data.targetIndex
        });
    },
    transitionEnd: (data) => {                  // 过渡动画结束时触发
        console.log('transitionEnd - 过渡动画结束', {
            activeIndex: data.activeIndex,
            previousIndex: data.previousIndex
        });
    },
    slideChangeTransitionStart: (data) => {     // 幻灯片切换过渡开始时触发
        console.log('slideChangeTransitionStart - 幻灯片切换过渡开始', {
            activeIndex: data.activeIndex,
            direction: data.direction           // 切换方向
        });
    },
    slideChangeTransitionEnd: (data) => {       // 幻灯片切换过渡结束时触发
        console.log('slideChangeTransitionEnd - 幻灯片切换过渡结束', {
            activeIndex: data.activeIndex,
            direction: data.direction
        });
    },
    slideActiveIndexChange: (data) => {         // 活动幻灯片索引改变时触发
        console.log('slideActiveIndexChange - 活动幻灯片索引改变', {
            activeIndex: data.activeIndex,
            previousIndex: data.previousIndex
        });
    },

    // 3. 自动播放相关
    autoplayStart: (swiper) => {                // 自动播放开始时触发
        console.log('autoplayStart - 自动播放开始');
    },
    autoplayStop: (swiper) => {                 // 自动播放停止时触发
        console.log('autoplayStop - 自动播放停止');
    },
    autoplayPause: (swiper) => {                // 自动播放暂停时触发(如鼠标悬停)
        console.log('autoplayPause - 自动播放暂停');
    },
    autoplayResume: (swiper) => {               // 自动播放恢复时触发
        console.log('autoplayResume - 自动播放恢复');
    },

    // 4. 触摸相关
    touchStart: (data) => {                      // 触摸开始时触发
        console.log('touchStart - 触摸开始', {
            activeIndex: data.activeIndex,
            event: data.event
        });
    },
    touchMove: (data) => {                       // 触摸移动时触发
        console.log('touchMove - 触摸移动', {
            moveX: data.moveX,                   // X轴移动距离
            moveY: data.moveY                    // Y轴移动距离
        });
    },
    touchEnd: (data) => {                        // 触摸结束时触发
        console.log('touchEnd - 触摸结束', {
            moveDistance: data.moveDistance,     // 移动总距离
            duration: data.duration              // 触摸持续时间
        });
    },

    // 5. 交互相关
    click: (swiper, event) => {                 // 点击幻灯片时触发
        console.log('click - 点击幻灯片', {
            target: event.target
        });
    },
    doubleClick: (swiper, event) => {           // 双击幻灯片时触发
        console.log('doubleClick - 双击幻灯片', {
            target: event.target
        });
    },
    scroll: (swiper, event) => {                // 鼠标滚轮滚动时触发
        console.log('scroll - 鼠标滚轮事件', {
            deltaY: event.deltaY                // 滚动距离
        });
    },

    // 6. 响应式相关
    resize: (swiper) => {                       // 容器尺寸改变时触发
        console.log('resize - 容器尺寸改变');
    },
    breakpoint: (swiper, breakpoint) => {       // 断点切换时触发
        console.log('breakpoint - 断点切换', {
            breakpoint: breakpoint               // 当前断点值
        });
    },

    // 7. 可访问性相关
    a11y: (swiper, event) => {                   // 键盘操作或屏幕阅读器操作时触发
        console.log('a11y - 可访问性操作', {
            key: event.key                       // 按键值
        });
    },

    // 8. 图片加载相关
    imagesReady: (swiper) => {                  // 所有图片加载完成时触发
        console.log('imagesReady - 所有图片加载完成');
    },
    lazyImageLoad: (slideEl, imageEl) => {      // 懒加载图片开始加载时触发
        console.log('lazyImageLoad - 懒加载图片开始加载', {
            src: imageEl.src
        });
    },
    lazyImageReady: (slideEl, imageEl) => {     // 懒加载图片加载完成时触发
        console.log('lazyImageReady - 懒加载图片加载完成', {
            src: imageEl.src
        });
    },

    // 9. 更新相关
    beforeUpdate: (swiper) => {                 // Swiper更新前触发
        console.log('beforeUpdate - Swiper更新前');
    },
    update: (swiper) => {                      // Swiper更新后触发
        console.log('update - Swiper更新后');
    },

    // 10. 销毁相关
    beforeDestroy: (swiper) => {               // Swiper销毁前触发
        console.log('beforeDestroy - Swiper销毁前');
    },
    destroy: (swiper) => {                     // Swiper销毁后触发
        console.log('destroy - Swiper已销毁');
    }
}
```

## 联动轮播

```javascript
const manager = new LinkedSwipersManager();   // 如果有两处联动得话就需要new一下，如果一处可以直接使用linkedSwipersManager
new LinkedZhenshangyinSwiper('.bb', {
    loop: true,
    speed: 300,
    spaceBetween: 10,
    touchable: true,
    linkedManager: linkedSwipersManager,  // 两处就需要使用单独new得
});
new LinkedZhenshangyinSwiper('.aa', {
    loop: true,
    speed: 300,
    slidesPerView: 4,
    spaceBetween: 10,
    touchable: true,
    linkedManager: linkedSwipersManager,  // 两处就需要使用单独new得
    navigation: {
        prevEl: '.prev1',
        nextEl: '.next1'
    },
});
```

## 缩放轮播【可以切换任意形态】

```javascript
const swiper = new ZhenshangyinSwiper('.dd', {
    loop: true,
    speed: 1000,
    centeredSlides: true,
    slidesPerView: 'auto',
    touchable: true,
    slideSpacing: {
        level1: 40,   // 相邻幻灯片的间距
        level2: 70,   // 距离为2的幻灯片间距
        level3: 100   // 距离为3及以上的幻灯片间距
    },
    on: {
        init: (swiper) => {
            applyScalingEffect(swiper);
            setTransition(swiper.slides, swiper.options.speed);
            const pager = document.querySelector('.pager4');
            if (pager) {
                const bullets = pager.querySelectorAll('.zhenshangyin-pager-bullets-bullet');
                bullets.forEach((bullet, index) => {
                    bullet.addEventListener('click', () => {
                        swiper.slideTo(index + swiper.slides.length / 3);
                        applyScalingEffect(swiper);
                    });
                });
            }
        },
        beforeTransitionStart: () => applyScalingEffect(swiper),
        touchStart: () => setTransition(swiper.slides, swiper.options.speed),
        touchMove: (e) => {
            const slides = swiper.slides;
            const slideCount = swiper.options.loop ? slides.length / 3 : slides.length;
            const slideWidth = slides[0].offsetWidth;
            const moveRatio = e.moveX / slideWidth;
            const currentRealIndex = swiper.options.loop ? 
                swiper.currentIndex - slideCount : 
                swiper.currentIndex;
            const exactIndex = currentRealIndex - moveRatio;
            const estimatedIndex = Math.round(exactIndex);
            setTransition(slides, 0);
            slides.forEach((slide, index) => {
                slide.classList.remove('zhenshangyin-slide-active');
                if (swiper.options.loop) {
                    const realIndex = ((estimatedIndex % slideCount) + slideCount) % slideCount;
                    if (index % slideCount === realIndex) {
                        slide.classList.add('zhenshangyin-slide-active');
                    }
                } else if (index === estimatedIndex) {
                    slide.classList.add('zhenshangyin-slide-active');
                }
            });
            applySlideEffects(slides, exactIndex, slideCount, swiper.options.loop, swiper.options);
            const pagerItems = document.querySelectorAll('.zhenshangyin-pager-bullets-bullet');
            pagerItems.forEach((item, i) => {
                item.classList.remove('active');
                if (swiper.options.loop) {
                    const realIndex = ((estimatedIndex % slideCount) + slideCount) % slideCount;
                    if (i === realIndex) {
                        item.classList.add('active');
                    }
                } else if (i === estimatedIndex) {
                    item.classList.add('active');
                }
            });
        },
        touchEnd: () => {
            setTransition(swiper.slides, swiper.options.speed);
            applyScalingEffect(swiper);
        },
        slideChangeTransitionStart: () => applyScalingEffect(swiper),
        slideChangeTransitionEnd: () => applyScalingEffect(swiper),
        resize: () => applyScalingEffect(swiper)
    }
});
function setTransition(slides, speed) {
    slides.forEach(slide => {
        slide.style.transition = speed ? `all ${speed}ms ease` : 'none';
    });
}
function applySlideEffects(slides, currentIndex, slideCount, isLoop, options) {
    slides.forEach((slide, index) => {
        const realIndex = isLoop ? index % slideCount : index;
        let distance = Math.abs(realIndex - currentIndex);
        if (isLoop) {
            const wrapDistance = slideCount - distance;
            distance = Math.min(distance, wrapDistance);
        }
        const diff = isLoop ? 
            ((realIndex - currentIndex + slideCount) % slideCount) : 
            (realIndex - currentIndex);
        const isLeft = isLoop ? diff < slideCount / 2 : diff < 0;
        const maxScale = 1, minScale = 0.6;
        const scale = Math.max(
            minScale,
            maxScale - (maxScale - minScale) * Math.min(distance, 2) / 2
        );
        let xOffset = 0;
        if (distance > 0) {
            const baseOffset = distance <= 1 ? 
                options.slideSpacing.level1 * distance : 
                options.slideSpacing.level1 + options.slideSpacing.level2 * (Math.min(distance - 1, 1));
            xOffset = isLeft ? -baseOffset : baseOffset;
        }
        slide.style.transform = `scale(${scale}) translateX(${xOffset}%) translateZ(0)`;
        slide.style.zIndex = String(20 - Math.floor(distance));
    });
}
function applyScalingEffect(swiper) {
    if (!swiper?.slides?.length) return;
    const slides = swiper.slides;
    const slideCount = swiper.options.loop ? slides.length / 3 : slides.length;
    let realActiveIndex = swiper.options.loop ? swiper.currentIndex % slideCount : swiper.currentIndex;
    if (realActiveIndex < 0) realActiveIndex += slideCount;
    if (!swiper.isDragging) {
        setTransition(slides, swiper.options.speed);
    }
    applySlideEffects(slides, realActiveIndex, slideCount, swiper.options.loop, swiper.options);
}
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
prevButton.addEventListener('click', () => {
    swiper.slidePrev();
    applyScalingEffect(swiper);
});
nextButton.addEventListener('click', () => {
    swiper.slideNext();
    applyScalingEffect(swiper);
});
```

# Animation

## Animation  基本用法

```javascript
document.getElementById("fadeInBtn").addEventListener("click", () => {
    ZhenshangyinAnimation("#myDiv").fadeIn();
});

document.getElementById("fadeOutBtn").addEventListener("click", () => {
    ZhenshangyinAnimation("#myDiv").fadeOut();
});

document.getElementById("slideDownBtn").addEventListener("click", () => {
    ZhenshangyinAnimation("#myDiv").slideDown();
});

document.getElementById("slideUpBtn").addEventListener("click", () => {
    ZhenshangyinAnimation("#myDiv").slideUp();
});

document.getElementById("slideToggleBtn").addEventListener("click", () => {
    ZhenshangyinAnimation("#myDiv").slideToggle();
});

document.getElementById("fadeToggleBtn").addEventListener("click", () => {
    ZhenshangyinAnimation("#myDiv").fadeToggle();
});

ZhenshangyinAnimation("#myDiv").fadeOut(500, () => console.log("回调函数"));
```

## HOVER

```javascript
//.Nav ul li  鼠标移入元素
//.Nav_ul     他自己下面得受控制元素
document.querySelectorAll(".Nav ul li").forEach(li => {
    li.addEventListener("mouseenter", () => {
        ZhenshangyinAnimation(li.querySelector(".Nav_ul")).slideDown();
    });
    li.addEventListener("mouseleave", () => {
        ZhenshangyinAnimation(li.querySelector(".Nav_ul")).slideUp();
    });
});
```

## 手风琴

```javascript
//.Nav ul li  鼠标移入元素
//.Nav_ul - svg     他自己下面得受控制元素
document.querySelectorAll(".Nav ul li").forEach(li => {
    li.addEventListener("click", () => {
        const NavUl = li.querySelector(".Nav_ul");
        const svg = li.querySelector("svg");
        const animation = ZhenshangyinAnimation(NavUl);
        if (!animation.isVisible()) {
            animation.slideDown();
            svg.style.transform = "rotate(90deg)";
            li.parentElement.querySelectorAll("li").forEach(sibling => {
                if (sibling !== li) {
                    const siblingNavUl = sibling.querySelector(".Nav_ul");
                    const siblingSvg = sibling.querySelector("svg");
                    if (siblingNavUl) {
                        ZhenshangyinAnimation(siblingNavUl).slideUp();
                        if (siblingSvg) {
                            siblingSvg.style.transform = "rotate(0deg)";
                        }
                    }
                }
            });
        } else {
            animation.slideUp();
            svg.style.transform = "rotate(0deg)";
        }
    });
});
```

# Slider 滑块

```javascript
new ZhenshangyinSlider('#slider', {
    range: true,                                 // 区间选择模式
    value: [20, 50],                             // 初始值
    min: 0,                                      // 最小值
    max: 100,                                    // 最大值
    step: 10,                                    // 步长
    height: 10,                                  // 轨道高度
    buttonSize: 20,                              // 较大的滑块按钮
    primaryColor: '#000000',                     // 黑色主题
    backgroundColor: '#00000050',                // 浅黑色背景
    showInput: true,                             // 显示输入框
    showTooltip: true,                           // 显示提示框
    showStops: true,                             // 显示间断点
    vertical: false,                             // 水平模式
    disabled: false,                             // 启用状态
    tooltipFormatter: (value) => `${value}%`,    // 提示框格式化
    onChange: (value) => {                       // 回调函数
        console.log('当前值:', value);
    }
});
```

