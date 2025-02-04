# css控制自定义属性

```html
 li[data-theme='2']
```

# 多选修改样式

```html
<label>
    <input type="checkbox">
    Check me
</label>
input {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #30cfd0;
    border-radius: 5px;
    background-color: transparent;
    display: inline-block;
    position: relative;
    margin-right: 10px;
    cursor: pointer;
}

input:before {
    content: "";
    background-color: #30cfd0;
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 10px;
    height: 10px;
    border-radius: 3px;
    transition: all 0.3s ease-in-out;
}

input:checked:before {
    transform: translate(-50%, -50%) scale(1);
}
```

# 单选修改样式

```css
[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    outline: 0;
    background-color: rgb(36, 35, 35);
}

[type="range"]::-webkit-slider-runnable-track {
    height: 16px;
    background: rgb(36, 35, 35);;
}

[type="range" i]::-webkit-slider-container {
    height: 16px;
    overflow: hidden;
}

[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid transparent;
    border-image: linear-gradient(#fff, #fff) 0 fill / 0 10 0 0 / 0px 0px 0 2000px;
}

```

# 瀑布流

```css
column-count: 4;
column-gap: 0;
```

# 文字多行显示

```css
display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 2;
overflow: hidden;
```

# 文字两端对齐

```css
text-align: justify;
text-align-last: justify;
```

# svg动画

```css
<style>
    .svg {
        stroke: lightblue;
        stroke-width: 1;
        stroke-dasharray: var(--length);
        stroke-dashoffset: var(--length);
        animation: stroke 5s forwards;
        stroke-linecap: round;
    }

    @keyframes stroke {
        to {
            stroke-dashoffset: 0;
        }
    }
</style>

<script>
    const paths = document.querySelectorAll(".svg");
    paths.forEach((path) => {
        const len = path.getTotalLength() + 1;
        path.style.setProperty("--length", len);
    });
</script>
```

# nth-child

```css
1、表示选择列表中的第3个标签，代码如下：
li:nth-child(3)
2、表示选择列表中的偶数标签，即选择 第2、第4、第6…… 标签，代码如下：
li:nth-child(2n)
3、表示选择列表中的奇数标签，即选择 第1、第3、第5、第7……标签，代码如下：
li:nth-child(2n-1)
4、表示选择列表中的标签从第3个开始到最后（正向选择），代码如下：
li:nth-child(n+3)
5、表示选择列表中的标签从0到3，即小于3的标签（逆向选择），代码如下：
li:nth-child(-n+3)
6、表示选择列表中的倒数第3个标签，代码如下：
li:nth-last-child(3)
7、表示选择列表中的第一个标签。代码如下：
li:first-child
8、表示选择列表中的最后一个标签，代码如下：
li:last-child
```

# 滚动条样式

```css
body::-webkit-scrollbar {
    width: 4px;
}

body::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background: #000000;
}

body::-webkit-scrollbar-track {
    border-radius: 0;
    background: #999999;
}
```

