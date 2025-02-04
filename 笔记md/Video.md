# 基础视频

```css
<video controls="" loop="" autoplay="autoplay" webkit-playsinline='true' playsinline='true' x5-video-player-type="h5-page">
    <source src="" type="video/mp4">
</video>
/* 全屏按钮 */
video::-webkit-media-controls-fullscreen-button {
  display: none;
}
/* 播放按钮 */
video::-webkit-media-controls-play-button {
  display: none;
}
/* 进度条 */
video::-webkit-media-controls-timeline {
  display: none;
}
/* 观看的当前时间 */
video::-webkit-media-controls-current-time-display {
  display: none;
}
/* 剩余时间 */
video::-webkit-media-controls-time-remaining-display {
  display: none;
}
/* 音量按钮 */
video::-webkit-media-controls-mute-button {
  display: none;
}
video::-webkit-media-controls-toggle-closed-captions-button {
  display: none;
}
/* 音量的控制条 */
video::-webkit-media-controls-volume-slider {
  display: none;
}
/* 所有控件 */
video::-webkit-media-controls-enclosure {
  display: none;
}
```

# 禁止手机自动全屏问题

```javascript
 webkit-playsinline='true' playsinline='true' x5-video-player-type="h5-page"
```

# 微信浏览器自动播放

```javascript
<script type="text/javascript" src="https://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
function onBridgeReady(){
    WeixinJSBridge.invoke("getNetworkType", {}, function(){ 
        $('video')[0].currentTime = 0; 
        $('video')[0].play();                       
    });
}
if (typeof WeixinJSBridge == "undefined") {
    if (document.addEventListener) {
        setTimeout(function(){
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady(), true);
        },1000)
    }
} else {
    onBridgeReady() 
}
```

# 一个播放其他暂停

```javascript
var videos = document.querySelectorAll('video');

videos.forEach(function (video) {
    video.addEventListener('play', function () {
        videos.forEach(function (otherVideo) {
            if (otherVideo !== video) {
                otherVideo.pause();
            }
        });
    });
});
```

