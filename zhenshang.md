    <div class="MainRight">
            <div class="MainRightList">
                <h2>LoadingBar 加载进度条</h2>
                <div class="code">
                    <code>new ZhenshangyinLoadingBar(options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>height</code></td>
                                <td><code>string</code></td>
                                <td><code>'2px'</code></td>
                                <td>进度条高度</td>
                            </tr>
                            <tr>
                                <td><code>backgroundColor</code></td>
                                <td><code>string</code></td>
                                <td><code>'#000000'</code></td>
                                <td>进度条背景色</td>
                            </tr>
                            <tr>
                                <td><code>bindToScroll</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>绑定滚动事件，根据滚动位置更新进度</td>
                            </tr>
                            <tr>
                                <td><code>updateProgress</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>手动更新进度，参数为进度值(0-100)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Message 消息提示</h2>
                <ul class="grid4">
                    <li>
                        <button id="showSuccessMessageA">成功提示</button>
                    </li>
                    <li>
                        <button id="showWarningMessageA">警告提示</button>
                    </li>
                    <li>
                        <button id="showInfoMessageA">信息提示</button>
                    </li>
                    <li>
                        <button id="showErrorMessageA">错误提示</button>
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinMessage(options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>message</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>消息内容</td>
                            </tr>
                            <tr>
                                <td><code>type</code></td>
                                <td><code>string</code></td>
                                <td><code>'info'</code></td>
                                <td>消息类型，可选值：<code>'info'</code>、<code>'success'</code>、<code>'warning'</code>、<code>'error'</code>
                                </td>
                            </tr>
                            <tr>
                                <td><code>duration</code></td>
                                <td><code>number</code></td>
                                <td><code>2000</code></td>
                                <td>显示时长(毫秒)，设为 0 则不会自动关闭</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Notification 通知</h2>
                <ul class="grid4">
                    <li>
                        <button id="showSuccessNotification">成功通知</button>
                    </li>
                    <li>
                        <button id="showWarningNotification">警告通知</button>
                    </li>
                    <li>
                        <button id="showInfoNotification">信息通知</button>
                    </li>
                    <li>
                        <button id="showErrorNotification">错误通知</button>
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinNotification(options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>title</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>通知标题</td>
                            </tr>
                            <tr>
                                <td><code>message</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>通知内容</td>
                            </tr>
                            <tr>
                                <td><code>type</code></td>
                                <td><code>string</code></td>
                                <td><code>'info'</code></td>
                                <td>通知类型，可选值：<code>'info'</code>、<code>'success'</code>、<code>'warning'</code>、<code>'error'</code>
                                </td>
                            </tr>
                            <tr>
                                <td><code>duration</code></td>
                                <td><code>number</code></td>
                                <td><code>2000</code></td>
                                <td>显示时长(毫秒)，设为 0 则不会自动关闭</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>DatePicker 日期选择器</h2>
                <ul class="grid2">
                    <li>
                        <h3>基础用法</h3>
                        <input type="text" id="datePickerSimple" placeholder="请选择日期">
                    </li>
                    <li>
                        <h3>日期时间</h3>
                        <input type="text" id="datePickerWithTime" placeholder="请选择日期时间">
                    </li>
                </ul>
                <ul class="grid2">
                    <li>
                        <h3>日期范围</h3>
                        <input type="text" id="dateRangePickerSimple" placeholder="请选择日期范围">
                    </li>
                    <li>
                        <h3>日期时间范围</h3>
                        <input type="text" id="dateRangePickerWithTime" placeholder="请选择日期时间范围">
                    </li>
                </ul>
                <ul class="grid3">
                    <li>
                        <h3>月份选择</h3>
                        <input type="text" id="monthPickerSimple" placeholder="请选择月份">
                    </li>
                    <li>
                        <h3>月份多选</h3>
                        <input type="text" id="multiMonthPicker" placeholder="请选择多个月份">
                    </li>
                    <li>
                        <h3>月份范围</h3>
                        <input type="text" id="monthRangePicker" placeholder="请选择月份范围">
                    </li>
                </ul>
                <ul class="grid3">
                    <li>
                        <h3>年份选择</h3>
                        <input type="text" id="yearPickerSimple" placeholder="请选择年份">
                    </li>
                    <li>
                        <h3>年份多选</h3>
                        <input type="text" id="multiYearPicker" placeholder="请选择多个年份">
                    </li>
                    <li>
                        <h3>年份范围</h3>
                        <input type="text" id="yearRangePicker" placeholder="请选择年份范围">
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinDateSelector('inputSelector', options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>type</code></td>
                                <td><code>string</code></td>
                                <td><code>'date'</code></td>
                                <td>选择器类型，可选值：<code>'date'</code>(日期)、<code>'dateRange'</code>(日期范围)、<code>'month'</code>(月份)、<code>'monthRange'</code>(月份范围)、<code>'year'</code>(年份)、<code>'yearRange'</code>(年份范围)
                                </td>
                            </tr>
                            <tr>
                                <td><code>dateFormat</code></td>
                                <td><code>string</code></td>
                                <td><code>'YYYY-MM-DD'</code></td>
                                <td>日期格式，支持：<code>YYYY</code>(年)、<code>MM</code>(月)、<code>DD</code>(日)、<code>HH</code>(时)、<code>mm</code>(分)、<code>ss</code>(秒)
                                </td>
                            </tr>
                            <tr>
                                <td><code>separator</code></td>
                                <td><code>string</code></td>
                                <td><code>'至'</code></td>
                                <td>范围选择的分隔符</td>
                            </tr>
                            <tr>
                                <td><code>multiSelect</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否开启多选（仅月份和年份选择支持）</td>
                            </tr>
                            <tr>
                                <td><code>onDateSelect</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>日期选择的回调函数</td>
                            </tr>
                            <tr>
                                <td><code>onDateRangeSelect</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>日期范围选择的回调函数</td>
                            </tr>
                            <tr>
                                <td><code>onMonthSelect</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>月份选择的回调函数</td>
                            </tr>
                            <tr>
                                <td><code>onMonthRangeSelect</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>月份范围选择的回调函数</td>
                            </tr>
                            <tr>
                                <td><code>onYearSelect</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>年份选择的回调函数</td>
                            </tr>
                            <tr>
                                <td><code>onYearRangeSelect</code></td>
                                <td><code>function</code></td>
                                <td>-</td>
                                <td>年份范围选择的回调函数</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>TimePicker 时间选择器</h2>
                <ul class="grid2">
                    <li>
                        <h3>基础用法</h3>
                        <input type="text" id="timeInput" placeholder="请选择时间">
                    </li>
                    <li>
                        <h3>时间范围</h3>
                        <input type="text" id="timeRangeInput" placeholder="请选择时间范围">
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinTimePicker('inputSelector', options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>inputSelector</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>输入框选择器</td>
                            </tr>
                            <tr>
                                <td><code>dateFormat</code></td>
                                <td><code>string</code></td>
                                <td><code>'HH:mm:ss'</code></td>
                                <td>时间格式，支持：<code>'HH'</code>、<code>'HH:mm'</code>、<code>'HH:mm:ss'</code></td>
                            </tr>
                            <tr>
                                <td><code>onTimeSelect</code></td>
                                <td><code>function</code></td>
                                <td><code>() => {}</code></td>
                                <td>时间选择的回调函数</td>
                            </tr>
                            <tr>
                                <td><code>isRange</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否为时间范围选择</td>
                            </tr>
                            <tr>
                                <td><code>separator</code></td>
                                <td><code>string</code></td>
                                <td><code>' - '</code></td>
                                <td>范围选择的分隔符</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Select 选择器</h2>
                <ul class="grid3">
                    <li>
                        <h3>基础用法</h3>
                        <input type="text" id="dropdownSingleSelect">
                    </li>
                    <li>
                        <h3>多选删除</h3>
                        <div id="dropdownMultiSelectWithDelete"></div>
                    </li>
                    <li>
                        <h3>多选</h3>
                        <input type="text" id="dropdownMultiSelect">
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinDropdown(options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>container</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>选择器容器</td>
                            </tr>
                            <tr>
                                <td><code>data</code></td>
                                <td><code>array</code></td>
                                <td>-</td>
                                <td>选项数据</td>
                            </tr>
                            <tr>
                                <td><code>customParams</code></td>
                                <td><code>object</code></td>
                                <td><code>{}</code></td>
                                <td>自定义参数</td>
                            </tr>
                            <tr>
                                <td><code>onSelect</code></td>
                                <td><code>function</code></td>
                                <td><code>() => {}</code></td>
                                <td>选择的回调函数</td>
                            </tr>
                            <tr>
                                <td><code>searchEnabled</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否开启搜索</td>
                            </tr>
                            <tr>
                                <td><code>inputSearchEnabled</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否开启输入框搜索</td>
                            </tr>
                            <tr>
                                <td><code>defaultSelected</code></td>
                                <td><code>string/array</code></td>
                                <td><code>null</code></td>
                                <td>默认选中项</td>
                            </tr>
                            <tr>
                                <td><code>grouped</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否开启分组</td>
                            </tr>
                            <tr>
                                <td><code>multiSelect</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否开启多选</td>
                            </tr>
                            <tr>
                                <td><code>inputMultiSelect</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否在输入框显示多选结果</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Cascader 联级选择器</h2>
                <ul class="grid3">
                    <li>
                        <h3>基础用法</h3>
                        <input type="text" id="cascaderProvinceCityDistrict" placeholder="请选择">
                    </li>
                    <li>
                        <h3>无限级联</h3>
                        <input type="text" id="cascaderInfinite" placeholder="请选择">
                    </li>
                    <li>
                        <h3>多级联动</h3>
                        <div class="grid3">
                            <input type="text" id="cascaderProvinceInput" placeholder="请选择">
                            <input type="text" id="cascaderCityInput" placeholder="请选择">
                            <input type="text" id="cascaderDistrictInput" placeholder="请选择">
                        </div>
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinLinkage(options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>container</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>选择器容器</td>
                            </tr>
                            <tr>
                                <td><code>multiInputs</code></td>
                                <td><code>string[]</code></td>
                                <td>-</td>
                                <td>多选择器容器数组</td>
                            </tr>
                            <tr>
                                <td><code>data</code></td>
                                <td><code>object[]</code></td>
                                <td>-</td>
                                <td>级联数据</td>
                            </tr>
                            <tr>
                                <td><code>separator</code></td>
                                <td><code>string</code></td>
                                <td><code>'-'</code></td>
                                <td>选项分隔符</td>
                            </tr>
                            <tr>
                                <td><code>callback</code></td>
                                <td><code>function</code></td>
                                <td><code>() => {}</code></td>
                                <td>选择的回调函数</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Digital scrolling 数字滚动</h2>
                <ul class="grid3">
                    <li class="number-scroll">500</li>
                    <li class="number-scroll">5000</li>
                    <li class="number-scroll">10000</li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinNumberScroll('inputSelector', options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>className</td>
                                <td>string</td>
                                <td>-</td>
                                <td>选择器容器</td>
                            </tr>
                            <tr>
                                <td>duration</td>
                                <td>number</td>
                                <td>2000</td>
                                <td>动画持续时间（毫秒）</td>
                            </tr>
                            <tr>
                                <td>fps</td>
                                <td>number</td>
                                <td>60</td>
                                <td>动画帧率</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Seamless scrolling 无缝滚动</h2>
                <ul>
                    <li>
                        <h3>用法</h3>
                        <div class="zhenshangyin-scroll" id="scrollContainer">
                            <div class="zhenshangyin-scroll-wrapper">
                                <div class="slide">
                                    <img src="1.jpg">
                                </div>
                                <div class="slide">
                                    <img src="2.jpg">
                                </div>
                                <div class="slide">
                                    <img src="3.jpg">
                                </div>
                                <div class="slide">
                                    <img src="4.jpg">
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinInfiniteScroll('inputSelector', options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>container</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>选择器容器</td>
                            </tr>
                            <tr>
                                <td><code>direction</code></td>
                                <td><code>string</code></td>
                                <td><code>'left'</code></td>
                                <td>滚动方向，可选值：<code>'left'</code>、<code>'right'</code>、<code>'up'</code>、<code>'down'</code>
                                </td>
                            </tr>
                            <tr>
                                <td><code>speed</code></td>
                                <td><code>number</code></td>
                                <td><code>1</code></td>
                                <td>滚动速度，单位为像素/帧</td>
                            </tr>
                            <tr>
                                <td><code>pauseOnHover</code></td>
                                <td><code>boolean</code></td>
                                <td><code>true</code></td>
                                <td>鼠标悬停时是否暂停滚动</td>
                            </tr>
                            <tr>
                                <td><code>autoplay</code></td>
                                <td><code>boolean</code></td>
                                <td><code>true</code></td>
                                <td>是否自动播放</td>
                            </tr>
                            <tr>
                                <td><code>hoverPlay</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>鼠标悬停时是否继续播放</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Swiper 轮播图</h2>
                <ul>
                    <li>
                        <div class="swiper-container">
                            <ul class="zhenshangyin-wrap">
                                <li>
                                    <img src="1.jpg" alt="Slide 1">
                                    <h1>1</h1>
                                </li>
                                <li>
                                    <img src="2.jpg" alt="Slide 2">
                                    <h1>2</h1>
                                </li>
                                <li>
                                    <img src="3.jpg" alt="Slide 3">
                                    <h1>3</h1>
                                </li>
                                <li>
                                    <img src="4.jpg" alt="Slide 4">
                                    <h1>4</h1>
                                </li>
                            </ul>
                            <div class="pager"></div>
                            <div class="prev">
                                <svg viewBox="0 0 24 24">
                                    <path fill="white" d="M15.2 7.1L14.7 6.5L9.1 12l5.6 5.5l0.5-0.6L10.4 12z"/>
                                </svg>
                            </div>
                            <div class="next">
                                <svg viewBox="0 0 24 24">
                                    <path fill="white" d="M8.8 16.9L9.3 17.5L14.9 12L9.3 6.5L8.8 7.1L13.6 12z"/>
                                </svg>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinSwiper('selector', options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>direction</td>
                                <td>string</td>
                                <td>'horizontal'</td>
                                <td>轮播方向，可选值：'horizontal' | 'vertical'</td>
                            </tr>
                            <tr>
                                <td>effect</td>
                                <td>string</td>
                                <td>'slide'</td>
                                <td>切换效果，可选值：'slide' | 'fade'</td>
                            </tr>
                            <tr>
                                <td>loop</td>
                                <td>boolean</td>
                                <td>false</td>
                                <td>是否开启循环播放</td>
                            </tr>
                            <tr>
                                <td>speed</td>
                                <td>number</td>
                                <td>300</td>
                                <td>切换动画时长(ms)</td>
                            </tr>
                            <tr>
                                <td>autoplay</td>
                                <td>boolean</td>
                                <td>false</td>
                                <td>是否自动播放</td>
                            </tr>
                            <tr>
                                <td>interval</td>
                                <td>number</td>
                                <td>3000</td>
                                <td>自动播放间隔时间(ms)</td>
                            </tr>
                            <tr>
                                <td>pauseOnHover</td>
                                <td>boolean</td>
                                <td>false</td>
                                <td>鼠标悬停时是否暂停自动播放</td>
                            </tr>
                            <tr>
                                <td>slidesPerView</td>
                                <td>number | 'auto'</td>
                                <td>1</td>
                                <td>同时显示的slide数量，设为'auto'时根据容器宽度自动计算</td>
                            </tr>
                            <tr>
                                <td>slidesPerGroup</td>
                                <td>number</td>
                                <td>1</td>
                                <td>每次切换的slide数量</td>
                            </tr>
                            <tr>
                                <td>spaceBetween</td>
                                <td>number</td>
                                <td>0</td>
                                <td>slide之间的间距(px)</td>
                            </tr>
                            <tr>
                                <td>centeredSlides</td>
                                <td>boolean</td>
                                <td>false</td>
                                <td>是否居中显示当前slide</td>
                            </tr>
                            <tr>
                                <td>breakpoints</td>
                                <td>object</td>
                                <td>{}</td>
                                <td>断点配置对象，可针对不同屏幕宽度设置不同配置</td>
                            </tr>
                            <tr>
                                <td>pagination.bullets</td>
                                <td>object</td>
                                <td>null</td>
                                <td>圆点分页器配置，包含el和clickable属性</td>
                            </tr>
                            <tr>
                                <td>pagination.numbers</td>
                                <td>object</td>
                                <td>null</td>
                                <td>数字分页器配置，包含el、clickable和names属性</td>
                            </tr>
                            <tr>
                                <td>pagination.fraction</td>
                                <td>object</td>
                                <td>null</td>
                                <td>分式分页器配置，包含el和style属性</td>
                            </tr>
                            <tr>
                                <td>pagination.progressbar</td>
                                <td>object</td>
                                <td>null</td>
                                <td>进度条分页器配置，包含el属性</td>
                            </tr>
                            <tr>
                                <td>navigation</td>
                                <td>object</td>
                                <td>null</td>
                                <td>包含prevEl和nextEl属性，分别设置上一个、下一个按钮的选择器</td>
                            </tr>
                            <tr>
                                <td>mousewheel</td>
                                <td>boolean</td>
                                <td>false</td>
                                <td>是否启用鼠标滚轮控制</td>
                            </tr>
                            <tr>
                                <td>keyboard</td>
                                <td>boolean</td>
                                <td>false</td>
                                <td>是否启用键盘控制</td>
                            </tr>
                            <tr>
                                <td>touchable</td>
                                <td>boolean</td>
                                <td>true</td>
                                <td>是否启用触摸滑动</td>
                            </tr>
                            <tr>
                                <td>threshold</td>
                                <td>number</td>
                                <td>50</td>
                                <td>触发切换的滑动距离阈值(px)</td>
                            </tr>
                            <tr>
                                <td>touchRatio</td>
                                <td>number</td>
                                <td>1</td>
                                <td>触摸距离与slide移动距离的比率</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="code">
                    <code>on: {}</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>事件名</th>
                                <th>参数</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>slideChange</td>
                                <td>
                                    {<br>
                                    &nbsp;&nbsp;activeIndex: number,<br>
                                    &nbsp;&nbsp;activeSlide: HTMLElement,<br>
                                    &nbsp;&nbsp;activeClasses: string[]<br>
                                    }
                                </td>
                                <td>slide切换时触发</td>
                            </tr>
                            <tr>
                                <td>slideChangeTransitionStart</td>
                                <td>
                                    {<br>
                                    &nbsp;&nbsp;activeIndex: number,<br>
                                    &nbsp;&nbsp;activeSlide: HTMLElement,<br>
                                    &nbsp;&nbsp;activeClasses: string[],<br>
                                    &nbsp;&nbsp;direction: 'next' | 'prev'<br>
                                    }
                                </td>
                                <td>slide切换动画开始时触发</td>
                            </tr>
                            <tr>
                                <td>slideChangeTransitionEnd</td>
                                <td>
                                    {<br>
                                    &nbsp;&nbsp;activeIndex: number,<br>
                                    &nbsp;&nbsp;activeSlide: HTMLElement,<br>
                                    &nbsp;&nbsp;activeClasses: string[],<br>
                                    &nbsp;&nbsp;direction: 'next' | 'prev'<br>
                                    }
                                </td>
                                <td>slide切换动画结束时触发</td>
                            </tr>
                            <tr>
                                <td>slideActiveIndexChange</td>
                                <td>
                                    {<br>
                                    &nbsp;&nbsp;activeIndex: number,<br>
                                    &nbsp;&nbsp;previousIndex: number,<br>
                                    &nbsp;&nbsp;activeSlide: HTMLElement,<br>
                                    &nbsp;&nbsp;activeClasses: string[]<br>
                                    }
                                </td>
                                <td>活动slide索引改变时触发</td>
                            </tr>
                            <tr>
                                <td>touchStart</td>
                                <td>
                                    {<br>
                                    &nbsp;&nbsp;event: Event,<br>
                                    &nbsp;&nbsp;activeIndex: number,<br>
                                    &nbsp;&nbsp;activeSlide: HTMLElement,<br>
                                    &nbsp;&nbsp;activeClasses: string[]<br>
                                    }
                                </td>
                                <td>触摸开始时触发</td>
                            </tr>
                            <tr>
                                <td>touchMove</td>
                                <td>
                                    {<br>
                                    &nbsp;&nbsp;event: Event,<br>
                                    &nbsp;&nbsp;activeIndex: number,<br>
                                    &nbsp;&nbsp;moveX: number,<br>
                                    &nbsp;&nbsp;moveY: number<br>
                                    }
                                </td>
                                <td>触摸移动时触发</td>
                            </tr>
                            <tr>
                                <td>touchEnd</td>
                                <td>
                                    {<br>
                                    &nbsp;&nbsp;event: Event,<br>
                                    &nbsp;&nbsp;activeIndex: number,<br>
                                    &nbsp;&nbsp;moveDistance: number,<br>
                                    &nbsp;&nbsp;duration: number<br>
                                    }
                                </td>
                                <td>触摸结束时触发</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="MainRightList">
                <h2>Slider 滑块</h2>
                <ul>
                    <li>
                        <h3>用法</h3>
                        <div id="slider"></div>
                    </li>
                </ul>
                <div class="code">
                    <code>new ZhenshangyinSlider('selector', options);</code>
                </div>
                <div class="table">
                    <table>
                        <thead>
                            <tr>
                                <th>参数</th>
                                <th>类型</th>
                                <th>默认值</th>
                                <th>说明</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>container</code></td>
                                <td><code>string</code></td>
                                <td>-</td>
                                <td>选择器容器</td>
                            </tr>
                            <tr>
                                <td><code>range</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否为区间选择</td>
                            </tr>
                            <tr>
                                <td><code>value</code></td>
                                <td><code>number/array</code></td>
                                <td><code>-</code></td>
                                <td>初始值，区间选择时为数组</td>
                            </tr>
                            <tr>
                                <td><code>min</code></td>
                                <td><code>number</code></td>
                                <td><code>0</code></td>
                                <td>最小值</td>
                            </tr>
                            <tr>
                                <td><code>max</code></td>
                                <td><code>number</code></td>
                                <td><code>100</code></td>
                                <td>最大值</td>
                            </tr>
                            <tr>
                                <td><code>showStops</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否显示间断点</td>
                            </tr>
                            <tr>
                                <td><code>step</code></td>
                                <td><code>number</code></td>
                                <td><code>1</code></td>
                                <td>步长</td>
                            </tr>
                            <tr>
                                <td><code>height</code></td>
                                <td><code>number</code></td>
                                <td><code>6</code></td>
                                <td>滑块轨道高度(px)</td>
                            </tr>
                            <tr>
                                <td><code>buttonSize</code></td>
                                <td><code>number</code></td>
                                <td><code>20</code></td>
                                <td>滑块按钮(px)</td>
                            </tr>
                            <tr>
                                <td><code>primaryColor</code></td>
                                <td><code>string</code></td>
                                <td><code>'#000000'</code></td>
                                <td>主题色</td>
                            </tr>
                            <tr>
                                <td><code>backgroundColor</code></td>
                                <td><code>string</code></td>
                                <td><code>'#00000020'</code></td>
                                <td>背景题色</td>
                            </tr>
                            <tr>
                                <td><code>showInput</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否显示输入框</td>
                            </tr>
                            <tr>
                                <td><code>showTooltip</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否显示提示框</td>
                            </tr>
                            <tr>
                                <td><code>vertical</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否垂直模式</td>
                            </tr>
                            <tr>
                                <td><code>disabled</code></td>
                                <td><code>boolean</code></td>
                                <td><code>false</code></td>
                                <td>是否禁用</td>
                            </tr>
                            <tr>
                                <td><code>tooltipFormatter</code></td>
                                <td><code>function</code></td>
                                <td><code>value => `${value}%`</code></td>
                                <td>提示框格式化函数</td>
                            </tr>
                            <tr>
                                <td><code>onChange</code></td>
                                <td><code>function</code></td>
                                <td><code>() => {}</code></td>
                                <td>值改变时的回调函数</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
