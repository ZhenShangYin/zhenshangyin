new ZhenshangyinSmoothScroll({

});

document.getElementById('showSuccessMessageA').addEventListener('click', function () {
    new ZhenshangyinMessage({ message: '成功了', type: 'success', duration: 2000 });
});

document.getElementById('showWarningMessageA').addEventListener('click', function () {
    new ZhenshangyinMessage({ message: '这是一个警告', type: 'warning', duration: 2000 });
});

document.getElementById('showInfoMessageA').addEventListener('click', function () {
    new ZhenshangyinMessage({ message: '这是一个信息', type: 'info', duration: 2000 });
});

document.getElementById('showErrorMessageA').addEventListener('click', function () {
    new ZhenshangyinMessage({ message: '出错了', type: 'error', duration: 2000 });
});

document.getElementById('showSuccessNotification').addEventListener('click', function () {
    new ZhenshangyinNotification({ title: '提示', message: '成功了', type: 'success', duration: 2000 });
});

document.getElementById('showWarningNotification').addEventListener('click', function () {
    new ZhenshangyinNotification({ title: '提示', message: '这是一个警告', type: 'warning', duration: 2000 });
});

document.getElementById('showInfoNotification').addEventListener('click', function () {
    new ZhenshangyinNotification({ title: '提示', message: '这是一个信息', type: 'info', duration: 2000 });
});

document.getElementById('showErrorNotification').addEventListener('click', function () {
    new ZhenshangyinNotification({ title: '提示', message: '出错了', type: 'error', duration: 2000 });
});

new ZhenshangyinDatePicker('#datePickerSimple', {
    type: 'date',
    primaryColor: '#ff4d4f',
    dateFormat: 'YYYY-MM-DD',
    disabledDates: [  
        '2025-03-18',
    ],
    onSelect: (formattedDate) => {
        new ZhenshangyinMessage({ message: '选择的日期: ' + formattedDate, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#datePickerMultiple', {
    type: 'date',
    primaryColor: '#000000',
    dateFormat: 'YYYY-MM-DD',
    multiSelect: true,
    dateDelimiter: '--',
    onSelect: (formattedDates) => {
        new ZhenshangyinMessage({ message: '选择的日期时间: ' + formattedDates, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#datePickerWithTime', {
    type: 'date',
    primaryColor: '#652352',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    onSelect: (formattedDate) => {
        new ZhenshangyinMessage({ message: '选择的日期时间: ' + formattedDate, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#dateRangePickerSimple', {
    type: 'dateRange',
    primaryColor: '#824596',
    dateFormat: 'YYYY/MM/DD',
    separator: '至',
    language: 'en',
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的日期范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#dateRangePickerWithTime', {
    type: 'dateRange',
    primaryColor: '#348569',
    language: 'en',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    separator: '至',
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的日期时间范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker(['#dateRangePickerStartSeparate', '#dateRangePickerEndSeparate'], {
    type: 'dateRange',
    primaryColor: '#746952',
    dateFormat: 'YYYY/MM/DD',
    language: 'en',
    isSeparate: true, // 启用分离模式
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的日期范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#weekPicker', {
    type: 'week',
    primaryColor: '#cd5685',
    dateFormat: 'YYYY-MM-DD',
    separator: ' 至 ',
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的周: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#monthPickerSimple', {
    type: 'month',
    dateFormat: 'YYYY-MM',
    primaryColor: '#cd5685',
    onSelect: (selectedMonth) => {
        new ZhenshangyinMessage({ message: '选择的月份: ' + selectedMonth, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#multiMonthPicker', {
    type: 'month',
    dateFormat: 'YYYY-MM',
    multiSelect: true,
    primaryColor: '#846258',
    separator: ' / ',
    onSelect: (selectedMonths) => {
        new ZhenshangyinMessage({ message: '选择的月份: ' + selectedMonths, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#monthRangePicker', {
    type: 'monthRange',
    primaryColor: '#258963',
    dateFormat: 'YYYY-MM',
    separator: '至',
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的月份范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker(['#monthRangePickerStartSeparate', '#monthRangePickerEndSeparate'], {
    type: 'monthRange',
    primaryColor: '#789456',
    dateFormat: 'YYYY-MM',
    separator: '至',
    isSeparate: true,
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的月份范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#yearPickerSimple', {
    type: 'year',
    primaryColor: '#321564',
    disabledYears: [                 // 禁用具体年份列表
        '2025',                      // 禁用2025年
        '2026',                      // 禁用2026年
        '2027'                       // 禁用2027年
    ],
    onSelect: (selectedYear) => {
        new ZhenshangyinMessage({ message: '选择的年份: ' + selectedYear, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#multiYearPicker', {
    type: 'year',
    primaryColor: '#765894',
    disabledYears: [                 // 禁用具体年份列表
        '2025',                      // 禁用2025年
        '2026',                      // 禁用2026年
        '2027'                       // 禁用2027年
    ],
    multiSelect: true,
    separator: ' 哈哈 ',
    onSelect: (selectedYears) => {
        new ZhenshangyinMessage({ message: '选择的年份: ' + selectedYears, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#yearRangePicker', {
    type: 'yearRange',
    primaryColor: '#314698',
    separator: '至',
    disabledYears: [                 // 禁用具体年份列表
        '2025',                      // 禁用2025年
        '2026',                      // 禁用2026年
        '2027'                       // 禁用2027年
    ],
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的年份范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker(['#yearRangePickerStartSeparate', '#yearRangePickerEndSeparate'], {
    type: 'yearRange',
    primaryColor: '#845358',
    separator: '至',
    isSeparate: true,
    disabledYears: [                 // 禁用具体年份列表
        '2025',                      // 禁用2025年
        '2026',                      // 禁用2026年
        '2027'                       // 禁用2027年
    ],
    onSelect: (formattedRange) => {
        new ZhenshangyinMessage({ message: '选择的年份范围: ' + formattedRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#timeInput', {
    type: 'time',
    dateFormat: 'HH:mm:ss',
    primaryColor: '#258963',
    onSelect: (time) => {
        new ZhenshangyinMessage({ message: '选择的日期时间: ' + time, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDatePicker('#timeRangeInput', {
    type: 'timeRange',
    dateFormat: 'HH:mm:ss',
    isRange: true,
    primaryColor: '#874965',
    separator: ' 至 ',
    onSelect: (timeRange) => {
        new ZhenshangyinMessage({ message: '选择的日期时间范围: ' + timeRange, type: 'success', duration: 2000 });
    }
});

new ZhenshangyinDropdown({
    container: '#dropdownSingleSelect',
    data: [
        { title: '选项1', param1: '参数1', param2: '参数2' , disabled: true },
        { title: '选项2', param1: '参数3', param2: '参数4' },
        { title: '选项3', param1: '参数5', param2: '参数6' },
        { title: '选项4', param1: '参数1', param2: '参数2' },
        { title: '选项5', param1: '参数3', param2: '参数4' },
        { title: '选项6', param1: '参数5', param2: '参数6' },
        { title: '选项7', param1: '参数1', param2: '参数2' },
        { title: '选项8', param1: '参数3', param2: '参数4' },
        { title: '选项9', param1: '参数5', param2: '参数6' }
    ],
    customParams: {
        自定义参数1: 'param1',
        自定义参数2: 'param2'
    },
    onSelect: function (item) {
        new ZhenshangyinMessage({ message: '选中的项: ' + item.title, type: 'success', duration: 2000 });
    },
    searchEnabled: true,
    defaultSelected: '选项4',
    primaryColor: '#722ed1'
});

new ZhenshangyinDropdown({
    container: '#dropdownMultiSelectWithDelete',
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
    customParams: {
        自定义参数1: 'param1',
        自定义参数2: 'param2',
    },
    onSelect: function (item) {
        const selectedTitles = this.selectedItems.map(selected => selected.title);
        new ZhenshangyinMessage({ message: '当前选中的标题: ' + selectedTitles.join(', '), type: 'success', duration: 2000 });
    },
    searchEnabled: true,
    inputSearchEnabled: false,
    defaultSelected: ['选项4'],
    grouped: true,
    language: 'en',
    multiSelect: true,
    primaryColor: '#852369'
});

new ZhenshangyinDropdown({
    container: '#dropdownMultiSelect',
    data: [
        { title: '选项1', param1: '参数1', param2: '参数2' },
        { title: '选项2', param1: '参数3', param2: '参数4' },
        { title: '选项3', param1: '参数5', param2: '参数6' }
    ],
    customParams: {
        自定义参数1: 'param1',
        自定义参数2: 'param2',
    },
    onSelect: function (selectedItem) {
        const selectedTitles = this.selectedItems.map(item => item.title);
        new ZhenshangyinMessage({ message: '点击的项: ' + selectedItem.title + '<br>已选择的项: ' + selectedTitles.join(', '), type: 'success', duration: 2000 });
    },
    searchEnabled: true,
    language: 'en',
    defaultSelected: ['选项4'],
    searchEnabled: true,
    multiSelect: true,
    inputMultiSelect: true,
    primaryColor: '#987456'
});

new ZhenshangyinLinkage({
    container: "#cascaderProvinceCityDistrict",
    data: chinaData,
     primaryColor: '#722ed1',
    separator: "-",
    callback: (value) => {
        new ZhenshangyinMessage({ message: '选择的值: ' + value, type: 'success', duration: 2000 });
    },
});

const dataa = [
    {
        name: '省1',
        children: [
            {
                name: '市1',
                children: [
                    {
                        name: '区1',
                        children: [
                            { name: '镇1' },
                            { name: '镇2' }
                        ]
                    }
                ],
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
    container: '#cascaderInfinite',
    data: dataa,
     primaryColor: '#722ed1',
    onFinish: (value) => {
        new ZhenshangyinMessage({ message: '选中的地址：' + value, type: 'success', duration: 2000 });
    }
});

const chinaData = chinaData;
new ZhenshangyinLinkage({
    multiInputs: ['#cascaderProvinceInput', '#cascaderCityInput', '#cascaderDistrictInput'],
    data: chinaData,
    separator: ">",
     primaryColor: '#722ed1',
    callback: (value) => {
        new ZhenshangyinMessage({ message: '选择的值: ' + value, type: 'success', duration: 2000 });
    },
});

new ZhenshangyinNumberScroll({
    className: 'number-scroll',
    duration: 5000,
    fps: 60
});

new ZhenshangyinImageViewer('.Viewer', {
    showThumbnails: true,
});


new ZhenshangyinInfiniteScroll('#scrollContainer', {
    direction: 'left',
    speed: 50,     
    hoverPause: true,
});


new ZhenshangyinSwiper('.cc', {
    loop: true,
    speed: 300,
    pagination: {
        el: '.pager3',
        type: 'numbers',
        clickable: true,
    },
    navigation: {
        prevEl: '.prev3',
        nextEl: '.next3'
    },
});

new ZhenshangyinSwiper('.dd', {
    loop: true,
    speed: 300,
    slidesPerView: 5,
    spaceBetween: 20, 
    pagination: {
        el: '.pager4',
        type: 'progressbar',
    },
    navigation: {
        prevEl: '.prev',
        nextEl: '.next'
    },
});

new ZhenshangyinSwiper('.bb', {
    loop: true,
    speed: 300,
    linkedGroup: 'group',
    magnifier: true,
    fixedMagnifierSize: 400,
});

new ZhenshangyinSwiper('.aa', {
    loop: true,
    speed: 300,
    slidesPerView: 5,
    spaceBetween: 20, 
    linkedGroup: 'group',
    pagination: {
        el: '.pager1',
        type: 'scrollbar',
    },
    navigation: {
        prevEl: '.prev1',
        nextEl: '.next1'
    },
});


document.getElementById("fadeInBtn").addEventListener("click", () => {
    ZhenshangyinAnimate.getInstance("#myDiv").fadeIn();
});

document.getElementById("slideDownBtn").addEventListener("click", () => {
    ZhenshangyinAnimate.getInstance("#myDiv").slideDown();
});

document.getElementById("fadeOutBtn").addEventListener("click", () => {
    ZhenshangyinAnimate.getInstance("#myDiv").fadeOut();
});

document.getElementById("slideUpBtn").addEventListener("click", () => {
    ZhenshangyinAnimate.getInstance("#myDiv").slideUp();
});

document.getElementById("slideToggleBtn").addEventListener("click", () => {
    ZhenshangyinAnimate.getInstance("#myDiv").slideToggle();
});

document.getElementById("fadeToggleBtn").addEventListener("click", () => {
    ZhenshangyinAnimate.getInstance("#myDiv").fadeToggle();
});



const listys = document.querySelectorAll('.MainRightList');
const showioNavItems = document.querySelectorAll('.MainLeftList');




new ZhenshangyinSlider('#slider', {
    range: true,
    value: [20, 50],
    min: 0,
    max: 100,
    showStops: true,
    step: 10,
    height: 10,
    buttonSize: 20,
    primaryColor: '#000000',
    backgroundColor: '#00000050',
    showInput: true,
    showTooltip: true,
    vertical: false,
    disabled: false,
    tooltipFormatter: (value) => `进度${value}%`,
    onChange: (value) => {
        new ZhenshangyinMessage({ message: '当前值: ' + value, type: 'success', duration: 2000 });
    }
});
new ZhenshangyinScrollAnimate({
    repeat: true,
})

new ZhenshangyinBoxReveal({})

new ZhenshangyinTextEffect('#demo1', {
    threshold: 50,
    effects: [
        { scale: ['0.1', '1'] },
        { opacity: [0, 1] },
    ]
});

new ZhenshangyinTextEffect('#demo2', {
    threshold: 50,
    effects: [
        { color: ['#ffffff', '#000000'] },
        { fontSize: ['18px', '28px'] },
    ]
});

new ZhenshangyinTextEffect('#demo3', {
    threshold: 50,
});

new ZhenshangyinDropdown({
    container: '#en',
    data: [
        { title: 'УкраїнськаName', url: 'ukrainian' },
        { title: 'Norge', url: 'norwegian' },
        { title: 'color name', url: 'welsh' },
        { title: 'nederlands', url: 'dutch' },
        { title: 'しろうと', url: 'japanese' },
        { title: 'Pilipino', url: 'filipino' },
        { title: 'English', url: 'english' },
        { title: 'ກະຣຸນາ', url: 'lao' },
        { title: 'తెలుగుQFontDatabase', url: 'telugu' },
        { title: 'Română', url: 'romanian' },
        { title: 'नेपालीName', url: 'nepali' },
        { title: 'Français', url: 'french' },
        { title: 'Kreyòl ayisyen', url: 'haitian_creole' },
        { title: 'český', url: 'czech' },
        { title: 'Svenska', url: 'swedish' },
        { title: 'Русский язык', url: 'russian' },
        { title: 'Malagasy', url: 'malagasy' },
        { title: 'ဗာရမ်', url: 'burmese' },
        { title: 'پښتوName', url: 'pashto' },
        { title: 'คนไทย', url: 'thai' },
        { title: 'Արմենյան', url: 'armenian' },
        { title: '简体中文', url: 'chinese_simplified' },
        { title: 'Persian', url: 'persian' },
        { title: '繁體中文', url: 'chinese_traditional' },
        { title: 'Kurdî', url: 'kurdish' },
        { title: 'Türkçe', url: 'turkish' },
        { title: 'हिन्दी', url: 'hindi' },
        { title: 'български', url: 'bulgarian' },
        { title: 'Malay', url: 'malay' },
        { title: 'Kiswahili', url: 'swahili' },
        { title: 'ଓଡିଆ', url: 'oriya' },
        { title: 'ÍslandName', url: 'icelandic' },
        { title: 'Íris', url: 'irish' },
        { title: 'ខ្មែរKCharselect unicode block name', url: 'khmer' },
        { title: 'ગુજરાતી', url: 'gujarati' },
        { title: 'Slovenská', url: 'slovak' },
        { title: 'ಕನ್ನಡ್Name', url: 'kannada' },
        { title: 'היברית', url: 'hebrew' },
        { title: 'magyar', url: 'hungarian' },
        { title: 'मराठीName', url: 'marathi' },
        { title: 'தாமில்', url: 'tamil' },
        { title: 'eesti keel', url: 'estonian' },
        { title: 'മലമാലം', url: 'malayalam' },
        { title: 'ᐃᓄᒃᑎᑐᑦ', url: 'inuktitut' },
        { title: 'بالعربية', url: 'arabic' },
        { title: 'Deutsch', url: 'deutsch' },
        { title: 'slovenščina', url: 'slovene' },
        { title: 'বেঙ্গালী', url: 'bengali' },
        { title: 'اوردو', url: 'urdu' },
        { title: 'azerbaijani', url: 'azerbaijani' },
        { title: 'português', url: 'portuguese' },
        { title: 'lifiava', url: 'samoan' },
        { title: 'afrikaans', url: 'afrikaans' },
        { title: '汤加语', url: 'tongan' },
        { title: 'ελληνικά', url: 'greek' },
        { title: 'IndonesiaName', url: 'indonesian' },
        { title: 'Español', url: 'spanish' },
        { title: 'dansk', url: 'danish' },
        { title: 'amharic', url: 'amharic' },
        { title: 'ਪੰਜਾਬੀName', url: 'punjabi' },
        { title: 'albanian', url: 'albanian' },
        { title: 'Lietuva', url: 'lithuanian' },
        { title: 'italiano', url: 'italian' },
        { title: 'Tiếng Việt', url: 'vietnamese' },
        { title: '한국어', url: 'korean' },
        { title: 'Malti', url: 'maltese' },
        { title: 'suomi', url: 'finnish' },
        { title: 'català', url: 'catalan' },
        { title: 'hrvatski', url: 'croatian' },
        { title: 'bosnian', url: 'bosnian' },
        { title: 'Polski', url: 'polish' },
        { title: 'latviešu', url: 'latvian' },
        { title: 'Maori', url: 'maori' }
    ],
    customParams: {
        URL: 'url',
    },
    onSelect: function (item) {
        translate.changeLanguage(item.url);
    },
    inputSearchEnabled: true,
});



window.addEventListener('scroll', () => {
    listys.forEach((listy, index) => {
        const distanceFromTop = listy.getBoundingClientRect().top;
        if (distanceFromTop <= 100 && distanceFromTop + listy.getBoundingClientRect().height >= 100) {
            showioNavItems.forEach((item) => {
                item.classList.remove('MainLeftListNav');
            });
            showioNavItems[index].classList.add('MainLeftListNav');
        }
    });
});

showioNavItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        window.scrollTo({ top: listys[index].offsetTop - 100, behavior: 'smooth' });
    });
});
