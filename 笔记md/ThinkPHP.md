# 伪静态

## ♬Ngins

```javascript
location / {
    if (!-e $request_filename){
    	rewrite  ^(.*)$  /index.php?s=$1  last;   break;
    }
}
```

## ♬windows							

```javascript
<IfModule mod_rewrite.c> 
    Options +FollowSymlinks -Multiviews 
    RewriteEngine on 
    RewriteCond %{REQUEST_FILENAME} !-d                                                                                       
    RewriteCond %{REQUEST_FILENAME} !-f 
    RewriteRule ^(.*)$ index.php [L,E=PATH_INFO:$1] 
</IfModule>
```

# 导航-栏目-列表-详情

## ♬导航

```php
<li {if (isset($catTreeList['topCate']['id']) && empty($catTreeList['topCate']['id'])) || !isset($catTreeList['topCate']['id'])}class="nav_cen"{/if}>
    <a href="/">首页</a>
</li>
{foreach name="nav" item="navValue"}
 <li {if (isset($catTreeList['topCate']['id']) && $catTreeList['topCate']['id']==$navValue.id) || (isset($catTreeList['topCate']['id']) && isset($function->getCatInfo($catTreeList['topCate']['id'])['parent_id']) && $function->getCatInfo($catTreeList['topCate']['id'])['parent_id'] == $navValue.id)}class="nav_cen"{/if} >
    <a {if isset($navValue.url)}href="{$navValue.url}"{/if}> {$navValue.title}</a>
    {if $navValue.listCount > 0}
        <div class="nav_ul">
            {foreach name="navValue.childList" item="childValue"}
            <a href="{$childValue.url}">{$childValue.title}</a> 
            {/foreach}           
         </div>
    {/if}
</li>
{/foreach}
/** 判断四级 **/
<li {if (isset($catTreeList['topCate']['id']) && $catTreeList['topCate']['id']==$navValue.id) || (isset($catTreeList['topCate']['id']) && isset($function->getCatInfo($catTreeList['topCate']['id'])['parent_id']) && $function->getCatInfo($catTreeList['topCate']['id'])['parent_id'] == $navValue.id)}class="nav_cen"{/if} >
    <a href="/">首页</a>
</li>
```

## ♬栏目

```php
**{foreach name="function->getCatChildList('栏目ID',数量)" key='n' item="cat"}
{/foreach}
{$function->getCatInfo($function->getCatInfo($catId)['parent_id'])['字段名称']}            // 调用父级栏目
{$function->getCatInfo('栏目ID')['字段名称']|raw|nl2br}           // 调用栏目信息
id                                                              // 栏目ID
title                                                           // 栏目名称
keywords                                                        // 关键词
desc_text                                                       // 栏目描述
force_link                                                      // 栏目链接
logo                                                            // 栏目图片
<?=count($function->getCatArticle($cat['id']))?>                // 循环栏目获取每个栏目下的内容数量
|raw|nl2br
    
/** 判断class相关 **/
{$function->getCatInfo($function->getCatInfo($catId)['parent_id'])['logo']}                                      // 调用父级
{if $article.id == $art.id}class="mulu_nav"{/if}                                                                 // 详情页判断内容
{if $catId == $cat.id}class="uro_op"{/if}                                                                        // 判断栏目
{if $cat.is_best == 1}{/if}                                                                                      // 栏目推荐
{if isset($catId) && $catId == $childValue.id}class="nav_ul_pu"{/if}                                             // 首页判断栏目
{if $function->getCatInfo($function->getCatInfo($catId)['parent_id'])['id'] == $cat.id} class="uro_op" {/if}     // 详情页判断导航
{if count($function->getCatChildList($cat.id))>0} {/if}                                                          // 判断是否有二级栏目
{if $n == count($function->getCatChildList($catId))-1}{/if}                                                      // 判断最后一个元素
{if $catTreeList.topCate.id == $catId}{/if}                                                                      // 判断当前页面是否是二级页面
```

## ♬列表

```php
{foreach name="function->getCatArticle('栏目id','数量')" key='n' item="art"}
{/foreach}
/site-List/show-{$art.cat_id}-{$art.id}.html
{$art.url}                                        // 链接
{$art.logo}                                       // 图片
{$art.title}                                      // 标题
{$art.keywords}                                   // 关键词    
{$art.subtitle|raw}                               // 摘要
{$art.content|raw}                                // 内容
<?=date("Y-m-d",strtotime($art['create_at']))?>   // 时间
{$art.read_count}                                 // 阅读次数
|raw|nl2br

/** 调用指定栏目下所有次级栏目的内容 **/
{foreach name="GLOBALS['function']->getCatAllArticle(5,12)['list']" item="art"}
{/foreach}
{$GLOBALS['function']->getCatAllArticle(5,12)['page']|raw}

/** 调用指定栏目下所有次级栏目的内容 **/ 
/** 新版可以调用所有得下级分类 **/ 
/** 在破烂里【获取指定栏目下所有得下级分类】注意模型 **/
{foreach name="$GLOBALS['function']->getCatAllArticleRecursive($catId, 3)['list']" item="art"}
{/foreach}
{$GLOBALS['function']->getCatAllArticleRecursive($catId, 3)['page']|raw}
{$function->getCatAllArticleCount($catId)}                               // 获取当前栏目下所有内容得总数量
{$function->getCatInfo($atc['cat_id'])['title']}                         // 获取当前内容所属栏目名

/** getCatAllArticle(参数1,参数2,参数3) **/
/** 参数1：栏目ID，此项必须填写 **/
/** 参数2：分页时每页显示多少条，不需要分页直接写数字 0 即可，此项必须填写 **/
/** 参数3：排序方式，如果不填写则默认为后台设置的按排充号、ID进行倒序，即"DESC"；如果要正序，请填写"ASC" **/

/** 当前列表页获得分页 **/
{if !isset($catId) || (isset($catId) && $catId==7)} class="no" {/if}      // 判断class
{foreach name="articleList" key='n' item="art"}
    {$total}                                                              // 内容总数量
    {$lastPage}                                                           // 总页数
    {$currentPage}                                                        // 当前第几页
    <a href="/index/Article/show/cat_id/{$art.cat_id}/id/{$art.id}">      // 此处为后台调用的对应内容页url
    {$art.logo}                                                           // {$atc.logo}为内容封面图  
    {$art.title}                                                          // {$atc.title}为内容标题  
    {$art.subtitle|raw|nl2br}                                             // {$atc.subtitle|raw|nl2br}为内容摘要
    {$art.read_count}                                                     // {$atc.read_count}为阅读次数                                            
    <?=date("Y-m-d H:i:s",strtotime($art['create_at']))?>                 // 为内容创建时间
{/foreach}
{$page|raw}
```

## ♬详情

```php
{$catTreeList.topCate.title}    // 当前内容所属的栏目的顶级栏目名称
{$catTreeList.topCate.logo}     // 当前内容所属的栏目的顶级栏目图

{$catId}或{$catInfo.id}         // 当前内容所属的栏目ID
{$catInfo.title}                // 当前内容所属的栏目名称
{$catInfo.logo}                 // 当前内容所属的栏目图

{$article.read_count}                               // 当前内容浏览次数
{$article.title}                                    // 内容页标题
{$article.create_at|mb_substr=0,100,'utf-8'}        // 内容页标题，截取前100个字符
{$article.create_at}                                // 内容页创建时间
{$article.content|raw}                              // 内容页详情内容，raw是将html代码解析出来
|raw|nl2br

/** 调用指定内容 **/ 
{$function->getArticle('内容ID','内容所属栏目ID')['字段名']}

/** 如果调用指定内容的字段是多图片类型，使用以下标签。多图片类型字段要求有2张以上图片 **/
{foreach name="$function->getArticle('内容ID','内容所属栏目ID')['多图片类型字段']" item="img"} 
<li><img src="{$img}"></li>
{/foreach}

/** 上一篇，下一篇 **/ 
<a href="{if $prev}/index/Article/show/id/{$prev.id}/cat_id/{$prev.cat_id}{else}javascript:;{/if}">上一篇：{if $prev} {$prev.title}{else}暂无{/if}</a>
<a href="{if $next}/index/Article/show/id/{$next.id}/cat_id/{$next.cat_id}{else}javascript:;{/if}">下一篇： {if $next}{$next.title}{else}暂无{/if}</a>
```

# 网站名称、关键字、描述

```php
{$function->getConfig()['pic']}
name                     // 网站名称
host                     // 网站域名
pic                      // 网站LOGO
footer_pic               // 网站页脚LOGO
content                  // 描述
keyword                  // 关键字
beian                    // ICP备案号
copy                     // 版权声明
Nsbeian                  // 网安备案号
tel                      // 联系电话
email                    // 联系邮箱
address                  // 联系地址
```

# 表单

## ♬主表单

```php
{$function->getForm('表单类型ID')['form']['form_name']}   // 表单类型名称
<form onsubmit="return false;" id="thisForm" data-auto="true" method="post" autocomplete="off">
    // 下拉框
    <select  name="{$function->getForm('3')['param']['xingbie']['name']}">
        {foreach  name="$function->getForm('3')['param']['xingbie']['value']" item="v"}
        <option value="{$v}">{$v}</option>
        {/foreach}                
    </select>  
    // 文本框
    <input type="text" name="{$function->getForm('表单类型ID')['param']['表单参数名称']['name']}" placeholder="{$function->getForm('表单类型ID')['param']['表单参数名称']['value']}">
    // 单选框--后台用下拉框
    {foreach name="$function->getForm('表单类型ID')['param']['表单参数名称']['value']" item="v"} 
         <input type="radio" name="{$function->getForm('表单类型ID')['param']['表单参数名称']['name']}" value="{$v}">{$v}</input> 
    {/foreach}
    // 多选直接在前端写死值
    <input type="checkbox" name="Height[]" value="值1">
    // 单独调用参数End
    <input type="hidden" name="form_id" value="{$function->getForm(3)['form']['id']}">
    <input type="hidden" name="type" value="{$function->getForm(3)['form']['form_type']}">
    <input type="submit" name="submitAdd" id="submitAdd" value="发送" class="submit"/>
</form>
```

## ♬自己组件

```javascript
if (document.getElementById('submitAdd')) {
    document.getElementById('submitAdd').addEventListener('click', function () {
        const nameValue = document.querySelector("input[name='name']").value;
        if (nameValue === '') {
            new ZhenshangyinMessage({
                message: '请输入名称!',
                type: 'error',
                duration: 2000
            });
            return false;
        }

        const targetUrl = "/admin/Zhenshangyin/form_handle";
        const form = document.getElementById("thisForm");
        const formData = new FormData(form);

        axios.post(targetUrl, formData)
            .then(function (response) {
                const data = response.data;
                if (data.code > 0) {
                    new ZhenshangyinMessage({
                        message: data.info,
                        type: 'success',
                        duration: 2000,
                    });
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    new ZhenshangyinMessage({
                        message: data.info,
                        type: 'error',
                        duration: 2000,
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
                new ZhenshangyinMessage({
                    message: '提交失败，请稍后再试!',
                    type: 'error',
                    duration: 2000,
                });
                setTimeout(() => window.location.reload(), 2000);
            });
    })
}
```

## ♬后台查看表单判断显示方式

```php
<label class="relative block">
{if $key == '验光单'}
<a style="font-size: 14px; color: #000" target="_blank" href="{$vo|nl2br|raw}">{$vo|nl2br|raw}</a>
{else}
    {$vo|nl2br|raw}
{/if}
{empty name="vo"}未填写{/empty}
</label>

{if is_array($vo)}{foreach name='vo' item='v'}{$v}<br>{/foreach}{else} {$vo|nl2br|raw}{/if}{empty name="vo"}未填写{/empty}   // 多选查看报错
```

## ♬多选提交邮件失败修改

```php
// 添加
if(is_array($v)){
    $v = implode(",",$v);
}
// 处理表单内容为邮件内容
if(!empty($config['email'])){
    $html = "";
    foreach ($data AS $k => $v){
        $form_label = DB::name('DataFormParam')->where(['form_name'=>$k,'form_id'=>$formId])->value('form_label');
        
        if(is_array($v)){
            $v = implode(",",$v);
        }

        $html .= "<p>".$form_label."：".$v."</p>";
    }
    $this->send_mail($config['email'],$data['name'],'['.$config['name'].']客户提交信息',$html);
}
```

## ♬自己接口

```php
public function form_handle()
{
    if (request()->isPost()) {
        $data = $_POST;

        $formId = $data['form_id'];
        $formType = $data['type'];
        unset($data['form_id'], $data['type']);

        $list = [];
        foreach ($data as $key => $val) {
            $param = DB::name('DataFormParam')
                ->field("form_label,is_required,type")
                ->where(['form_name' => $key])
                ->find();

            if (empty($val) && $param['is_required'] == 1) {
                $this->error("请" . ($param['type'] == 1 ? "选择" : "填写") . $param['form_label'] . "！", '');
            }
            $list[$param['form_label']] = $val;
        }

        $formContent = json_encode($list);
        $ip = $this->get_client_ip();
        $member_id = $this->app->session->get('user_id') ?? 0;

        if ($this->is_duplicate_submission($formId, $member_id, $formContent)) {
            $this->error("您已提交过申请，请不要重复提交！", '');
        } else {
            $this->handle_email_notification($formId, $data);

            DB::name('DataFormList')->insert([
                'form_id' => $formId,
                'member_id' => $member_id,
                'member_IP' => $ip,
                'form_content' => $formContent,
                'type' => $formType,
                'status' => 0,
                'is_deleted' => 0
            ]);

            $this->success("提交成功！请耐心等待后台审核！", '');
        }
    }
}

private function get_client_ip()
{
    $ip = $_SERVER['REMOTE_ADDR'];
    if (isset($_SERVER['HTTP_CLIENT_IP']) && $this->is_valid_ip($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        foreach (explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']) as $xip) {
            if ($this->is_valid_ip($xip) && !preg_match('#^(10|172\.16|192\.168)\.#', $xip)) {
                $ip = $xip;
                break;
            }
        }
    }
    return $ip;
}

private function is_valid_ip($ip)
{
    return preg_match('/^([0-9]{1,3}\.){3}[0-9]{1,3}$/', $ip);
}

private function is_duplicate_submission($formId, $member_id, $formContent)
{
    return DB::name("DataFormList")
        ->where(['form_id' => $formId, 'member_id' => $member_id, 'status' => 0])
        ->whereLike('form_content', '%' . $formContent . '%')
        ->count("id") > 0;
}
l
private function handle_email_notification($formId, $data)
{
    $isEmail = DB::name("DataForm")->where(['id' => $formId])->value('is_email');
    if ($isEmail) {
        $html = "";
        foreach ($data as $k => $v) {
            $form_label = DB::name('DataFormParam')->where(['form_name' => $k, 'form_id' => $formId])->value('form_label');
            $html .= "<p>{$form_label}：{$v}</p>";
        }
        $this->send_mail('1723164967@qq.com', $data['name'], '客户提交信息', $html);
    }
}

private function send_mail($toemail, $name, $title, $html)
{
    $mail = new PHPMailer();
    $mail->isSMTP();
    $mail->CharSet = "utf8";
    $mail->Host = 'smtp.163.com'; 
    $mail->SMTPAuth = true;
    $mail->Username = 'LvFengCMS@163.com';
    $mail->Password = 'AVQEWROKVZQASKZL';
    $mail->SMTPSecure = "ssl";
    $mail->Port = 465;

    $mail->setFrom('LvFengCMS@163.com', '客户提交信息');
    $mail->addAddress($toemail, $name);
    $mail->Subject = $title;
    $mail->IsHTML(true);
    $mail->Body = $html;

    if (!$mail->send()) {
        return ['code' => 0, 'info' => "发送错误：" . $mail->ErrorInfo];
    } else {
        return ['code' => 1, 'info' => "邮件发送成功!"];
    }
}
```

# 筛选

## ♬Article.php⋙替换方法筛选里面的筛选位置

```php
// 获取筛选项
$filterListmun = DB::table($prefix . "data_template_field")
    ->field("field_name, field_other_name, filed_setting")
    ->where(["template_id" => $articleCate['content_template_id'], "status" => 1, "is_filter" => 1])
    ->select()->toArray();

foreach ($filterListmun as $key => &$value) {
    $filed_setting = explode("\r\n", $value['filed_setting']);
    foreach ($filed_setting as $k => $v) {
        list($name, $filterValue) = explode("|", $v);
        $value['filter'][] = ['name' => $name, 'value' => $filterValue];
    }
}
unset($value);

$this->assign('filterListmun', $filterListmun);

$whereGet = [];
if ($this->request->param('filter') == 1) {
    foreach ($filterListmun as $field) {
        $fieldName = $field['field_name'];
        $paramValue = $this->request->param($fieldName);
        if ($paramValue) {
            $whereGet[$fieldName] = $paramValue;
            $this->assign($fieldName, $paramValue);
        }
    }
}

//从着往下是点击显示当前的选中项名称
$getSelectedName = function($paramName) use ($filterListmun) {
    $selectedName = '';
    $paramValue = $this->request->param($paramName);

    if (!empty($paramValue)) {
        foreach ($filterListmun as $field) {
            if ($field['field_name'] == $paramName) {
                foreach ($field['filter'] as $flt) {
                    if ($paramValue == $flt['value']) {
                        $selectedName = $flt['name'];
                        break 2;
                    }
                }
            }
        }
    }

    return $selectedName;
};

$this->assign('selectedGuojiaName', $getSelectedName('guojia')); //筛选字段
$this->assign('selectedZhiyeName', $getSelectedName('zhiye'));
$this->assign('selectedDidianName', $getSelectedName('didian'));
$this->assign('selectedLeixingName', $getSelectedName('leixing'));
```

## ♬前端

```php
{foreach name="filterListmun" item="field"}
{if $field.field_name == 'leixing'}
{foreach name="field.filter" item="flt"}
<li class="getSelect {if isset($leixing) && $leixing == $flt.value}selected{/if}" data-name="leixing"
    data-value="{$flt.value}">{$flt.name}</li>
{/foreach}
{/if}
{/foreach}

// 判断当前的选中项名称
{if isset($selectedGuojiaName) && $selectedGuojiaName != ""}
{$selectedGuojiaName}
{else}
选择国家
{/if}
```

## ♬JS

```javascript
<script>
    document.querySelectorAll(".getSelect").forEach(function (element) {
        element.addEventListener("click", function () {
            const id = {$catId};
            const name = this.getAttribute("data-name");
            const value = this.getAttribute("data-value");
            const url = new URL(`/site-List-${id}.html`, window.location.origin);
            const currentParams = new URLSearchParams(window.location.search);
            if (!currentParams.has('filter')) {
                currentParams.set('filter', '1');
            }
            if (this.classList.contains('selected')) {
                currentParams.delete(name);
            } else {
                currentParams.set(name, value);
            }
            url.search = currentParams.toString();
            window.location.href = url.toString();
        });
    });
</script>
```

# 组图、轮播图

## ♬轮播图

```javascript
{foreach name="banner" item="val"}
    <div class="swiper-slide">
        <a href="{$val.url}"><img src="{$val.img}" value="{$val.title}"></a>
    </div>
{/foreach}
```

## ♬组图

```javascript
{if is_array($article.zutu)}
{foreach name="article.zutu" item="imgb"}
    <div class="swiper-slide">
        <img src="{$imgb}" />
    </div>
{/foreach}
{else}
    <div class="swiper-slide">
        <img src="{$article.zutu}" />
    </div>
{/if}

{if isset($article.zutu)}
    {php}
        $images = is_array($article.zutu) ? implode('|', $article.zutu) : $article.zutu;
        $images = trim($images);
    {/php}
    {if $images !== ''}
        {php}
            $images = explode('|', $images);
        {/php}
        {foreach $images as $imgb}
            {if trim($imgb) !== ''}
                {php}
                    $imageSrc = trim($imgb);
                {/php}
                {if !empty($imageSrc)}
                    <div class="swiper-slide">
                        <img src="{$imageSrc}" />
                    </div>
                {/if}
            {/if}
        {/foreach}
    {/if}
{/if}

```

## ♬栏目添加组图

```javascript
$('input[name="fenlei1"]').uploadMultipleImage();

// 前端调用
{if isset($function->getCatInfo($catId)['fenlei4'])}
    {php}
        $images = $function->getCatInfo($catId)['fenlei4'];
        $images = is_array($images) ? implode('|', $images) : $images;
        $images = trim($images);
    {/php}
    {if $images !== ''}
        {php}
            $images = explode('|', $images);
        {/php}
        {foreach $images as $imgb}
            {if trim($imgb) !== ''}
                {php}
                    $imageSrc = trim($imgb);
                {/php}
                {if !empty($imageSrc)}
                <li>
                    <img src="{$imageSrc}" />
                </li>
                {/if}
            {/if}
        {/foreach}
    {/if}
{/if}
```

## ♬标题+摘要

```php
$('#yongtu').MultiplefileuploadSubtitlea();
```

### ♫admin.js

```php
$.fn.MultiplefileuploadSubtitlea = function () {
    return this.each(function () {
        if ($(this).data('inited')) return true;
        $(this).data('inited', true);
        var $in = $(this),
            imgs = this.value ? this.value.split('|') : [];
        var $bt = $('<a class="layui-btn layui-btn-normal" style="margin-top: 15px">新增项</a>')
            .attr('data-size', $in.data('size') || 0)
            .attr('data-type', $in.data('type') || 'jpg,jpeg,png,gif,bmp,svg,webp,ico,tiff');
        var $container = $('<div class="layui-list2" style="margin-top: 15px"></div>');
        $in.after($container);
        $container.after($bt);
        $bt.on('click', function () {
            let newIndex = imgs.length;
            imgs.push(',');
            showImageContainer(imgs);
        });
        if (imgs.length > 0) showImageContainer(imgs);
        function showImageContainer(srcs) {
            $('.layui-list2').empty();
            $(srcs).each(function (idx, src) {
                let [imageTitle, imageSummary] = src.split(',');
                imageSummary = imageSummary ? imageSummary.replace(/\\n/g, '\n') : '';
                let $image = $(`
                  <div class="layui-row layui-col-space20 uploadimagemtal" style="display: flex;align-items: center;">
                        <div class="layui-col-xs7 layui-col-space5">
                            <div class="">
                                <label class="layui-form-label">请输入标题</label>
                                <div class="layui-input-block">
                                    <input type="text" class="layui-input image-title" placeholder="请输入标题" value="${imageTitle || ''}" />
                                </div>
                            </div>
                            <div class="">
                                <label class="layui-form-label">请输入摘要</label>
                                <div class="layui-input-block">
                                   <textarea class="layui-textarea image-summary" placeholder="请输入摘要">${imageSummary || ''}</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="layui-col-xs5">
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-up move-left" title="向左移动"></a>
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-down move-right" title="向右移动"></a>
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-delete remove-image" title="删除"></a>
                        </div>
                    </div>
                `);
                $image.find('.image-title, .image-summary').on('change', function () {
                    let newTitle = $image.find('.image-title').val();
                    let newSummary = $image.find('.image-summary').val().replace(/\n/g, '\\n');
                    imgs[idx] = newTitle + ',' + newSummary;
                    $in.val(imgs.join('|'));
                });
                $image.on('click', '.move-left, .move-right, .remove-image', function (event) {
                    event.stopPropagation();
                    let $item = $(this).closest('.uploadimagemtal');

                    if ($(this).hasClass('move-right')) {
                        $item.insertAfter($item.next());
                    } else if ($(this).hasClass('move-left') && $item.index() > 0) {
                        $item.insertBefore($item.prev());
                    } else if ($(this).hasClass('remove-image')) {
                        $item.remove();
                    }
                    imgs = [];
                    $('.layui-list2 .uploadimagemtal').each(function () {
                        let title = $(this).find('.image-title').val();
                        let summary = $(this).find('.image-summary').val().replace(/\n/g, '\\n');
                        imgs.push(title + ',' + summary);
                    });
                    $in.val(imgs.join('|'));
                });
                $('.layui-list2').append($image);
            });
        }
    });
};
```

### ♫前端，指定栏目

```javascript
{if is_array($function->getCatInfo('1')['fenlei7'])}
    {foreach name="$function->getCatInfo('1')['fenlei7']" item="imgb"}
    {php}
        $parts = explode(',', $imgb);
        $title = isset($parts[0]) ? $parts[0] : '';
        $summary = isset($parts[1]) ? $parts[1] : '';
    {/php}
    <div>
        {$summary}
        <h3>{$title}</h3>
    </div>
    {/foreach}
{else}
    {php}
        $images = explode('|', $function->getCatInfo('1')['fenlei7']);
    {/php}
    {foreach $images as $imgb}
    {php}
        $parts = explode(',', $imgb);
        $title = isset($parts[0]) ? $parts[0] : '';
        $summary = isset($parts[1]) ? $parts[1] : '';
    {/php}
    <div>
        {$summary}
        <h3>{$title}</h3>
    </div>
    {/foreach}
{/if}
```

### ♫前端⋙列表页，详情

```javascript
{if is_array($article['yongtu'])}
    {foreach $article['yongtu'] as $imgb}
        {php}
            $parts = explode(',', $imgb);
            $title = isset($parts[0]) ? $parts[0] : '';
            $summary = isset($parts[1]) ? $parts[1] : '';
        {/php}
        <div>
            <h3>{$title}</h3>
            <p>{$summary}</p>
        </div>
    {/foreach}
{else}
    {php}
        $images = explode('|', $article['yongtu']);
    {/php}
    {foreach $images as $imgb}
    {php}
        $parts = explode(',', $imgb);
        $title = isset($parts[0]) ? $parts[0] : '';
        $summary = isset($parts[1]) ? $parts[1] : '';
    {/php}
    <div>
        <h3>{$title}</h3>
        <p>{$summary}</p>
    </div>
    {/foreach}
{/if}
```

## ♬图片+标题

```php+HTML
$('input[name="fenlei1"]').Multiplefileupload();
```

### ♫admin.js

```javascript
$.fn.uploadFileMultiplefileupload = function (callable, initialize) {
    return this.each(function () {
        if ($(this).data('inited')) return false;
        var that = $(this), mult = '|one|btn|'.indexOf(that.data('file') || 'one') > -1 ? 0 : 1;
        that.data('inited', true).data('multiple', mult);
        require(['upload'], function (apply) {
            apply(that, callable);
            if (typeof initialize === 'function') {
                setTimeout(initialize, 100);
            }
            that.trigger('click');
        });
    });
};

$.fn.Multiplefileupload = function () {
    return this.each(function () {
        if ($(this).data('inited')) return true;
        $(this).data('inited', true);
        var $in = $(this),
            imgs = this.value ? this.value.split('|') : [];
        var $bt = $('<a class="layui-btn layui-btn-normal" style="margin-top: 15px">新增项</a>').attr('data-size', $in.data('size') || 0)
            .attr('data-type', $in.data('type') || 'jpg,jpeg,png,gif,bmp,svg,webp,ico,tiff');
        var $container = $('<div class="layui-list1" style="margin-top: 15px"></div>');
        $in.after($container);
        $container.after($bt);
        $bt.on('click', function () {
            imgs.push(",");
            showImageContainer(imgs);
            $in.val(imgs.join('|'));
        });
        if (imgs.length > 0) showImageContainer(imgs);
        function showImageContainer(srcs) {
            $('.layui-list1').empty();
            $(srcs).each(function (idx, src) {
                let [imageSrc, imageTitle] = src.split(',');
                let $image = $(`
                    <div class="layui-row layui-col-space20 uploadimagemtal" style="display: flex;align-items: center;">
                        <div class="layui-col-xs2" style="width: 100px; height: 100px;">
                            <input data-upload-image="" name="img[]" type="hidden" value="${imageSrc}">
                            <a data-file class="dingyi uploadimage transition" data-size="0" data-type="jpg,jpeg,png,gif,webp,pdf,doc,docx,ppt,pptx,xls,xlsx,txt,zip,rar,7z,tar,gz,mp4,mp3"
                               style="background-image: url(${imageSrc ? encodeURI(imageSrc) : '/public/static/theme/img/upimg.png'});">
                                <span class="layui-icon layui-icon-zoom" style="right: 0px;">&#xe615;</span>
                            </a>
                        </div>
                        <div class="layui-col-xs7 layui-col-space5">
                            <div class="">
                                <label class="layui-form-label">请输入标题</label>
                                <div class="layui-input-block">
                                    <input type="text" class="layui-input image-title" placeholder="请输入标题" value="${imageTitle || ''}" />
                                </div>
                            </div>
                        </div>
                        <div class="layui-col-xs3">
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-up move-left" title="向左移动"></a>
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-down move-right" title="向右移动"></a>
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-delete remove-image" title="删除"></a>
                        </div>
                    </div>
                `);
                $image.find('.image-title').on('change', function () {
                    let newTitle = $image.find('.image-title').val();
                    imgs[idx] = $image.find('input[name="img[]"]').val() + ',' + newTitle;
                    $in.val(imgs.join('|'));
                });
                $image.find('.dingyi').off('click').on('click', function () {
                    $(this).uploadFileMultiplefileupload(function (newSrc) {
                        let newTitle = $image.find('.image-title').val();
                        imgs[idx] = newSrc + ',' + newTitle;
                        $in.val(imgs.join('|'));
                        $image.find('.dingyi').css('background-image', `url(${encodeURI(newSrc)})`);
                        $image.find('input[name="img[]"]').val(newSrc);
                    });
                });
                $image.find('.layui-icon-zoom').on('click', function (event) {
                    event.stopPropagation();
                    $.previewImage(encodeURI(imageSrc));
                });
                $image.on('click', '.move-left, .move-right, .remove-image', function (event) {
                    event.stopPropagation();
                    let $item = $(this).closest('.uploadimagemtal');

                    if ($(this).hasClass('move-right')) {
                        $item.insertAfter($item.next());
                    } else if ($(this).hasClass('move-left') && $item.index() > 0) {
                        $item.insertBefore($item.prev());
                    } else if ($(this).hasClass('remove-image')) {
                        $item.remove();
                    }
                    imgs = [];
                    $('.layui-list1 .uploadimagemtal').each(function () {
                        let imageSrc = $(this).find('input[name="img[]"]').val();
                        let title = $(this).find('.image-title').val();
                        imgs.push(imageSrc + ',' + title);
                    });
                    $in.val(imgs.join('|'));
                });

                $('.layui-list1').append($image);
            });
        }
    });
};
```

### ♫前端⋙指定栏目

```javascript
{if is_array($function->getCatInfo('3')['fenlei1'])}
    {foreach name="$function->getCatInfo('3')['fenlei1']" item="imgb"}
    {php}
        $parts = explode(',', $imgb);
        $imageSrc = $parts[0];
        $title = isset($parts[1]) ? $parts[1] : '';
    {/php}
    <div>
        <img src="{$imageSrc}" />
        <h3>{$title}</h3>
    </div>
    {/foreach}
{else}
    {php}
        $images = explode('|', $function->getCatInfo('3')['fenlei1']);
    {/php}
    {foreach $images as $imgb}
    {php}
        $parts = explode(',', $imgb);
        $imageSrc = $parts[0];
        $title = isset($parts[1]) ? $parts[1] : '';
    {/php}
    <div>
        <img src="{$imageSrc}" />
        <h3>{$title}</h3>
    </div>
    {/foreach}
{/if}
```

### ♫前端⋙列表页，详情

```javascript
{if isset($art['fenlei1']) && is_array($art['fenlei1']) && count($art['fenlei1']) > 0}
    {foreach $art['fenlei1'] as $imgb}
        {if trim($imgb) !== ''}
            {php}
                $parts = explode(',', $imgb);
                $imageSrc = isset($parts[0]) ? $parts[0] : '';
                $title = isset($parts[1]) ? $parts[1] : '';
            {/php}
        <div>
            <img src="{$imageSrc}" />
            <h3>{$title}</h3>
        </div>
        {/if}
    {/foreach}
{else}
    {if isset($art['fenlei1']) && trim($art['fenlei1']) !== ''}
        {php}
            $images = explode('|', $art['fenlei1']);
        {/php}
        {foreach $images as $imgb}
            {if trim($imgb) !== ''}
                {php}
                    $parts = explode(',', $imgb);
                    $imageSrc = isset($parts[0]) ? $parts[0] : '';
                    $title = isset($parts[1]) ? $parts[1] : '';
                {/php}
            <div>
                <img src="{$imageSrc}" />
                <h3>{$title}</h3>
            </div>
            {/if}
        {/foreach}
    {/if}
{/if}
```

## ♬图片+标题+摘要

```javascript
$('input[name="fenlei2"]').MultiplefileuploadSubtitle();
```

### ♫admin.js,摘要可以直接修改为单行文本

```javascript
$.fn.uploadFileMultiplefileupload = function (callable, initialize) {
    return this.each(function () {
        if ($(this).data('inited')) return false;
        var that = $(this), mult = '|one|btn|'.indexOf(that.data('file') || 'one') > -1 ? 0 : 1;
        that.data('inited', true).data('multiple', mult);
        require(['upload'], function (apply) {
            apply(that, callable);
            if (typeof initialize === 'function') {
                setTimeout(initialize, 100);
            }
            that.trigger('click');
        });
    });
};

 $.fn.MultiplefileuploadSubtitle = function () {
    return this.each(function () {
        if ($(this).data('inited')) return true;
        $(this).data('inited', true);
        var $in = $(this),
            imgs = this.value ? this.value.split('|') : [];
        var $bt = $('<a class="layui-btn layui-btn-normal" style="margin-top: 15px">新增项</a>')
            .attr('data-size', $in.data('size') || 0)
            .attr('data-type', $in.data('type') || 'jpg,jpeg,png,gif,bmp,svg,webp,ico,tiff');
        var $container = $('<div class="layui-list2" style="margin-top: 15px"></div>');
        $in.after($container);
        $container.after($bt);
        $bt.on('click', function () {
            let newIndex = imgs.length;
            imgs.push(',,');

            showImageContainer(imgs);
        });
        if (imgs.length > 0) showImageContainer(imgs);
        function showImageContainer(srcs) {
            $('.layui-list2').empty();
            $(srcs).each(function (idx, src) {
                let [imageSrc, imageTitle, imageSummary] = src.split(',');
                imageSummary = imageSummary ? imageSummary.replace(/\\n/g, '\n') : ''; // 恢复换行符
                let $image = $(`
                  <div class="layui-row layui-col-space20 uploadimagemtal" style="display: flex;align-items: center;">
                        <div class="layui-col-xs2" style="width: 100px; height: 100px;">
                            <input data-upload-image="" name="img[]" type="hidden" value="${imageSrc}">
                            <a data-file class="dingyi uploadimage transition" data-size="0" data-type="jpg,jpeg,png,gif,webp,pdf,doc,docx,ppt,pptx,xls,xlsx,txt,zip,rar,7z,tar,gz,mp4,mp3"
                            style="background-image: url(${imageSrc ? encodeURI(imageSrc) : '/public/static/theme/img/upimg.png'}); display: block; width: 100%; height: 100%; background-size: cover; background-position: center;">
                            <span class="layui-icon layui-icon-zoom" style="right: 0px;">&#xe615;</span>
                            </a>
                        </div>
                        <div class="layui-col-xs7 layui-col-space5">
                            <div class="">
                                <label class="layui-form-label">请输入标题</label>
                                <div class="layui-input-block">
                                    <input type="text" class="layui-input image-title" placeholder="请输入标题" value="${imageTitle || ''}" />
                                </div>
                            </div>
                            <div class="">
                                <label class="layui-form-label">请输入摘要</label>
                                <div class="layui-input-block">
                                   <textarea class="layui-textarea image-summary" placeholder="请输入摘要">${imageSummary || ''}</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="layui-col-xs5">
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-up move-left" title="向左移动"></a>
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-down move-right" title="向右移动"></a>
                            <a class="layui-btn layui-btn-primary layui-icon layui-icon-delete remove-image" title="删除"></a>
                        </div>
                    </div>
                `);
                $image.find('.image-title, .image-summary').on('change', function () {
                    let newTitle = $image.find('.image-title').val();
                    let newSummary = $image.find('.image-summary').val().replace(/\n/g, '\\n');
                    imgs[idx] = $image.find('input[name="img[]"]').val() + ',' + newTitle + ',' + newSummary;
                    $in.val(imgs.join('|'));
                });
                $image.find('.dingyi').off('click').on('click', function () {
                    $(this).uploadFileMultiplefileupload(function (newSrc) {
                        let newTitle = $image.find('.image-title').val();
                        let newSummary = $image.find('.image-summary').val().replace(/\n/g, '\\n');
                        imgs[idx] = newSrc + ',' + newTitle + ',' + newSummary;
                        $in.val(imgs.join('|'));
                        $image.find('.dingyi').css('background-image', `url(${encodeURI(newSrc)})`);
                        $image.find('input[name="img[]"]').val(newSrc);
                    });
                });
                $image.find('.layui-icon-zoom').on('click', function (event) {
                    event.stopPropagation();
                    $.previewImage(encodeURI(imageSrc));
                });
                $image.on('click', '.move-left, .move-right, .remove-image', function (event) {
                    event.stopPropagation();
                    let $item = $(this).closest('.uploadimagemtal');

                    if ($(this).hasClass('move-right')) {
                        $item.insertAfter($item.next());
                    } else if ($(this).hasClass('move-left') && $item.index() > 0) {
                        $item.insertBefore($item.prev());
                    } else if ($(this).hasClass('remove-image')) {
                        $item.remove();
                    }
                    imgs = [];
                    $('.layui-list2 .uploadimagemtal').each(function () {
                        let imageSrc = $(this).find('input[name="img[]"]').val();
                        let title = $(this).find('.image-title').val();
                        let summary = $(this).find('.image-summary').val().replace(/\n/g, '\\n');
                        imgs.push(imageSrc + ',' + title + ',' + summary);
                    });
                    $in.val(imgs.join('|'));
                });
                $('.layui-list2').append($image);
            });
        }
    });
};
```

### ♫前端⋙指定栏目

```javascript
{if isset($function->getCatInfo('3')['fenlei2'])}
    {php}
        $images = $function->getCatInfo('3')['fenlei2'];
        $images = is_array($images) ? implode('|', $images) : $images;
        $images = trim($images);
    {/php}
    {if $images !== ''}
        {php}
            $images = explode('|', $images);
        {/php}
        {foreach $images as $imgb}
            {if trim($imgb) !== ''}
                {php}
                    $parts = explode(',', $imgb);
                    $imageSrc = isset($parts[0]) ? $parts[0] : '';
                    $title = isset($parts[1]) ? $parts[1] : '';
                    $summary = isset($parts[2]) ? $parts[2] : '';
                    $summary = str_replace('\n', "\n", $summary);
                {/php}
                {if !empty($imageSrc)}
                <div>
                    <img src="{$imageSrc}" />
                    <h3>{$title}</h3>
                    <p>
                        <?php echo nl2br(htmlspecialchars($summary)); ?>
                    </p>
                </div>
                {/if}
            {/if}
        {/foreach}
    {/if}
{/if}
```

### ♫前端⋙列表页，详情

```javascript
{if isset($art['fenlei2'])}
    {php}
        $images = is_array($art['fenlei2']) ? implode('|', $art['fenlei2']) : $art['fenlei2'];
        $images = trim($images);
    {/php}
    {if $images !== ''}
        {php}
            $images = explode('|', $images);
        {/php}
        {foreach $images as $imgb}
            {if trim($imgb) !== ''}
                {php}
                    $parts = explode(',', $imgb);
                    $imageSrc = isset($parts[0]) ? $parts[0] : '';
                    $title = isset($parts[1]) ? $parts[1] : '';
                    $summary = isset($parts[2]) ? $parts[2] : '';
                    $summary = str_replace('\n', "\n", $summary);
                {/php}
                {if !empty($imageSrc)}
                <div>
                    <img src="{$imageSrc}" />
                    <h3>{$title}</h3>
                    <p>
                        <?php echo nl2br(htmlspecialchars($summary)); ?>
                    </p>
                </div>
                {/if}
            {/if}
        {/foreach}
    {/if}
{/if}
```

## ♬多组图+标题

```javascript
$('input[name="fenlei3"]').uploadMultipleImageGroupZutu();
```

### ♫admin.js

```javascript
$.fn.uploadMultipleImageGroupZutu = function (fieldName) {
    var savedData = $('input[name="' + fieldName + '"]').val();
    return this.each(function () {
        const $addGroupButton = $('<button type="button" class="layui-btn layui-btn-normal">添加组图</button>');
        $(this).after($addGroupButton);
        if (savedData) {
            const groups = savedData.split('|');
            groups.forEach(function (group) {
                const [title, ...images] = group.split(',');
                createGroupContainer(title, images);
            });
        }
        $addGroupButton.on('click', function () {
            createGroupContainer('', []);
        });
        function createGroupContainer(title, images) {
            const $groupContainer = $('<div class="upload-group layui-form-item" style="margin-top: 15px"></div>');
            const $titleInput = $('<input style="margin-bottom: 10px;" type="text" placeholder="请输入标题" class="layui-input">').val(title);
            const $imageInput = $('<input type="hidden" class="upload-image-input">').val(images.join(','));
            const $imageDisplayContainer = $('<div class="image-display-container"></div>');
            const $uploadButton = $('<a data-file="mul" class="uploadimage transition"></a>');
            const $deleteButton = $('<button style="display: block;margin-top: 10px;" type="button" class="layui-btn layui-btn-danger layui-btn-sm">删除组图</button>');
            $groupContainer.append($titleInput, $imageInput, $imageDisplayContainer, $deleteButton);
            $addGroupButton.before($groupContainer);
            const imgs = [...images];
            $uploadButton.attr('data-size', $(this).data('size') || 0)
                .attr('data-type', 'jpg,jpeg,png,gif,webp')
                .uploadFile(function (src) {
                    imgs.push(src);
                    $imageInput.val(imgs.join(','));
                    showImageContainer($imageDisplayContainer, [src]);
                    updateFenlei3Field();
                });
            if (images.length > 0) {
                showImageContainer($imageDisplayContainer, images);
            }
            $imageDisplayContainer.append($uploadButton);
            $deleteButton.on('click', function () {
                $groupContainer.remove();
                updateFenlei3Field();
            });
            function showImageContainer($container, srcs) {
                $(srcs).each(function (idx, src) {
                    const $image = $('<div class="uploadimage uploadimagemtl transition" style="margin-top: 0px !important">' +
                        '<div><a class="layui-icon">&#xe603;</a>' +
                        '<a class="layui-icon">&#x1006;</a>' +
                        '<a class="layui-icon">&#xe602;</a></div>' +
                        '</div>'
                    );
                    $image.attr('data-tips-image', encodeURI(src))
                        .css('backgroundImage', 'url(' + encodeURI(src) + ')')
                        .on('click', 'a', function (event) {
                            event.stopPropagation();
                            let $item = $(this).parent().parent();
                            let index = $(this).index();

                            if (index === 2) {
                                const currentImgIndex = imgs.indexOf(src);
                                if (currentImgIndex >= 0 && currentImgIndex < imgs.length - 1) {
                                    [imgs[currentImgIndex], imgs[currentImgIndex + 1]] = [imgs[currentImgIndex + 1], imgs[currentImgIndex]];
                                    $item.next().after($item);
                                    $imageInput.val(imgs.join(','));
                                    updateFenlei3Field();
                                }
                            } else if (index === 0) {
                                const currentImgIndex = imgs.indexOf(src);
                                if (currentImgIndex > 0) {
                                    [imgs[currentImgIndex], imgs[currentImgIndex - 1]] = [imgs[currentImgIndex - 1], imgs[currentImgIndex]];
                                    $item.prev().before($item);
                                    $imageInput.val(imgs.join(','));
                                    updateFenlei3Field();
                                } else if (currentImgIndex === 0) {
                                    console.log("已经在第一张，无法再移动到前面。");
                                }
                            } else if (index === 1) {
                                const imgIndex = imgs.indexOf(src);
                                if (imgIndex > -1) {
                                    $item.remove();
                                    imgs.splice(imgIndex, 1);
                                    $imageInput.val(imgs.join(','));
                                    updateFenlei3Field();
                                }
                            }
                        });
                    $container.append($image);
                });
                $container.append($uploadButton);
            }
            function updateFenlei3Field() {
                let groupsData = [];
                $('.upload-group').each(function () {
                    const title = $(this).find('input[type="text"]').val().trim();
                    const images = $(this).find('.upload-image-input').val().trim();
                    if (title || images) {
                        groupsData.push((title || '') + ',' + (images || ''));
                    }
                });
                $('input[name="' + fieldName + '"]').val(groupsData.join('|')).trigger('input');
            }
            $titleInput.on('input', updateFenlei3Field);
        }
    });
};
```

### ♫前端⋙指定栏目

```javascript
{php}
    $data = $function->getCatInfo('3')['fenlei3'];
    $groups = explode('|', $data);
{/php}
{foreach $groups as $group}
    {php}
        $parts = explode(',', $group);
        $title = array_shift($parts);
    {/php}
    <div>
        <h3>{$title}</h3>
        {foreach $parts as $imageSrc}
            <img src="{$imageSrc}" />
        {/foreach}
    </div>
{/foreach}
```

### ♫前端⋙列表页，详情页

```javascript
{if isset($art['fenlei3'])}
    {php}
        $images = is_array($art['fenlei3']) ? implode('|', $art['fenlei3']) : $art['fenlei3'];
        $images = explode('|', $images);
    {/php}
    {foreach $images as $imgb}
        {php}
            $parts = explode(',', $imgb);
            $title = array_shift($parts);
            $imageSrcs = $parts;
        {/php}
        <div>
            <h3>{$title}</h3>
            {foreach $imageSrcs as $imageSrc}
                <img src="{$imageSrc}" />
            {/foreach}
        </div>
    {/foreach}
{/if}
```

# 后台相关

## ♬判断栏目

```php
{if $vc.id == 2 or $vc.parent_id == 2}{/if}                      // 栏目id是否为2，或者父级栏目id是否为2，如果是的话就显示对应的内容。  // 判断得后台栏目
{if isset($vo.id) && ($vo.id == 26 or $vo.parent_id == 26)}      // 上面报错可以用它
{if isset($vo.parent_id) && $vo.parent_id == 0}                  // 判断以一级栏目显示
{if $catInfo.id == 4 || $catInfo.parent_id == 4}                 // 判断id为4得栏目或者父级id为4得栏目显示【不是循环里面使用】
```

## ♬判断内容

```php
{if $cateId==4}   // 4 == 栏目ld
{if $vo.cate.parent_id == 3} // 父级栏目id是否为3，如果是的话就显示对应的内容。 index
{if $catInfo.parent_id == 2} // 父级栏目id是否为3，如果是的话就显示对应的内容。 form
```

## ♬路径

> 分页            \vendor\topthink\think-orm\src\paginator\driver
> 菜单管理         /admin.html#/admin/menu/index.html?spm=m-64-38-43
> 栏目管理         data/article.article_cate/index.html
> 内容管理         data/article.article/cate.html
> 表单类型         data/form.form/index.html
> 表单列表         ata/form.form/list.html
> 栏目模型         data/article.template/index.html      链接参数type=0
> 内容模型         data/article.template/index.html      链接参数type=1
> 会员用户管理      data/member.index/index.html
> 系统参数配置      admin/config/index.html
> 系统菜单管理      admin/menu/index.html
> 系统日志管理      admin/oplog/index.html
> 系统用户管理      admin/user/index.html
> 访问权限管理      admin/auth/index.html
> 商品信息管理      data/store.goods/index
> 商品分类管理      data/store.goods_cate/index
> 订单列表管理      data/store.order/index

## ♬自定义字段修改

```php
<input name="{$field.field_name}"  //后面加
{if $field.field_name == 'a8'}id='a8'{elseif $field.field_name == 'a12'}id='a12'{/if}
```

## ♬输入日志

```php
$captcha = $this->createCaptcha($length);
Log::info("输出信息" . $captcha); // 输入日志
```

## ♬后台点击显示形式

```php
// /index/zhenshangyin/get_user_comments ,为接口地址
<a data-title="弹出" class="layui-btn layui-btn-sm layui-btn-primary" data-modal='/index/zhenshangyin/searchContenta?user_id={$vo.id}'>弹出</a>
<a data-dbclick class="layui-btn layui-btn-sm" data-open='{:url("searchContenta")}'>新页面</a>
```

## ♬打开页面得方法【将当前内容得id传过去】

```php
public function searchContenta($user_id)
{
    $vo = Db::name('data_article_show_gean')->where('id', $user_id)->find();  // 获取具体内容
    return $this->fetch('/page/beizhu', ['vo' => $vo]);  // 传递 vo 到模板
}

// 弹出页面得获取id
<input type="hidden" name="id" value="<?php echo htmlentities($vo['id'], ENT_QUOTES); ?>">
<button class="layui-btn" type="submit" onclick="saveRemark()">保存数据</button>
```

## ♬新建页面路径

```php
// 返回得页面是当前接口的上级目录  /app/index/view
    
public function searchContenta() {
    return $this->fetch('/page/user_comments_modal');  // 指定模板的相对路径
    return $this->fetch('/page/user_submissions_modal', [ // 指定模板的相对路径，可以渲染标签在下方
            'submissions' => $submissions
        ]);
}

{volist name="submissions" id="submission"}
{/volist}
```

## 保存数据得基础方法

```php
public function saveRemark(Request $request)
{
    $data = Request::post();  // 注意这里，其他方式容易出现编码错误
    $id = $data['id'];
    $beizhu = $data['beizhu']; // 备注字段

    try {
        $result = Db::name('data_article_show_gean')
                ->where('id', $id)
                ->update(['beizhu' => $beizhu]);

    if ($result) {
        return json(['success' => true, 'message' => '备注保存成功']);
    } else {
        return json(['success' => false, 'message' => '保存失败']);
    }
        if ($result) {
            return json(['code' => 200, 'message' => 'Submission updated successfully']);
        } else {
            return json(['code' => 500, 'message' => 'Update failed, please try again later']);
        }
    } catch (\Exception $e) {
        return json(['code' => 500, 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
}
```

## ♬后台添加新栏目方法

| ![](F:\笔记md\image.png) | ![](F:\笔记md\image1.png) |
| ------------------------ | ------------------------- |

### ♫DataBook数据表名/注意sort排序字段不要忘加

```php
<?php
namespace app\data\controller\book;
use think\admin\Controller;
use think\facade\Db;

class Book extends Controller
{
    protected $table = 'DataBook';  //数据表

    /**
     * 这个必须有强制登陆
     * @login true 
     */
    public function index(){
        $this->title = '列表';
        $this->_query($this->table)->order("id desc")->page();

    }

    public function add()
    {
        $this->_form($this->table, 'form');
    }

    public function edit()
    {
        $this->_form($this->table, 'form');
    }

    public function remove()
    {
        $id = input("id",0);
        Db::name("data_book")->where(["id"=>$id])->delete();
        return $this->success("删除成功");
    }
}
```

### ♫index.html

```php
{extend name="../../admin/view/main"}
{block name="button"}
<button data-modal='{:url("add")}' data-title="添加书" class='layui-btn layui-btn-sm layui-btn-primary'>添加书</button>
<button data-action='{:url("remove")}' data-rule="id#{key}" data-confirm="确定要删除选中的书籍吗？" class='layui-btn layui-btn-sm layui-btn-danger'>批量删除</button>
{/block}
{block name="content"}
<style>
    .layui-table td, .layui-table th {
        padding: 10px 15px !important;
    }
    .layui-card-body::-webkit-scrollbar {
        width: 5px;
    }

    .layui-card-body::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background: #000000;
    }

    .layui-card-body::-webkit-scrollbar-track {
        border-radius: 0;
        background: #999999;
    }
</style>
<div class="think-box-shadow">
    <table class="layui-table margin-top-10" lay-skin="line">
        {notempty name='list'}
        <thead>
        <tr>
            <th class='list-table-check-td think-checkbox'>
                <input data-auto-none data-check-target='.list-check-box' type='checkbox'>
            </th>
            <th class='list-table-sort-td'>
                <button type="button" data-reload class="layui-btn layui-btn-xs">排序</button>
            </th>
            <th class='text-center'>ID</th>
            <th class='text-center '>书名</th>
            <th></th>
        </tr>
        </thead>
        {/notempty}
        <tbody>
        {foreach $list as $keyTop=>$vo}
        <tr>
            <td class='list-table-check-td think-checkbox'>
                <input class="list-check-box" value='{$vo.id}' type='checkbox'>
            </td>
            <td class='list-table-sort-td'><input data-action-blur="{:request()->url()}" data-value="id#{$vo.id};action#sort;sort#{value}" data-loading="false" value="{$vo.sort}" class="list-sort-input"></td>
            <td class='text-center '>
                {$vo.id}
            </td>
            <td class='text-center '>{$vo.book_name}</td>
            <td class='text-right nowrap'>
                <a data-title="修改书" class="layui-btn  layui-btn-sm layui-btn-warm" data-modal='{:url("edit")}?id={$vo.id}'>修改</a>
                <a class="layui-btn layui-btn-sm layui-btn-danger" data-confirm="确定删除吗?" data-action="{:url('remove')}" data-value="id#{$vo.id}">删除</a>
            </td>
        </tr>
        {/foreach}
        </tbody>
    </table>
    {empty name='list'}<span class="notdata">No record</span>{else}{$pagehtml|raw|default=''}{/empty}
</div>
{/block}
```

### ♫form.html

```php
<style>
    .layui-form.layui-card > .layui-card-body {
        padding: 20px 40px !important;
    }
     .think-radio input[type=radio]{
         display: none !important;
     }
     .cke_inner,
        #edui_fixedlayer,
        #edui1,
        .cke_reset_all,
        .cke{
            z-index: 99999999999999999999999 !important;
        }
        .cke_dialog_background_cover{
            z-index: 999999999999999999 !important;
        }
        .margin-bottom-15{
            display: flex;
            align-items: center;
            align-content: center;
        }
        .margin-bottom-15 .think-form-label{
            color: #0099CC;
            font-size: 12px;
            font-weight: bold;
        }
</style>
<form onsubmit="return false;" action="{:request()->url()}" data-auto="true" method="post" class='layui-form layui-card' autocomplete="off">
    <div class="layui-card-body" style="max-height: 70vh; overflow: auto;">
        <div class="layui-row margin-bottom-15">
            <label class="layui-col-xs2 think-form-label">书名</label>
            <label class="layui-col-xs10">
                <input name="book_name" value='{$vo.book_name|default=""}' placeholder="请输入书名" class="layui-input">
            </label>
        </div>
    </div>
    <div class="hr-line-dashed"></div>
    <div class="layui-form-item text-center">
        {notempty name='vo.id'}<input type='hidden' value='{$vo.id}' name='id'>{/notempty}
        <button class="layui-btn" type='submit'>保存数据</button>
        <button class="layui-btn layui-btn-danger" type='button' data-confirm="确定取消设置？" data-close>取消</button>
    </div>
</form>
<script>
    form.render();
    laydate.render({ elem: '#date'});
</script>
```

# 前端上传文件

## ♬接口

```php
public function upload_file()
{
    $errorInfo = [
        1001 => '文件超过php.ini限',
        1002 => '文件超过html限制',
        1003 => '文件上传不完整',
        1004 => '没有选择文件',
        1006 => '服务器内部错误',
        1007 => '服务器内部错误',
        1008 => '文件太大',
        1009 => '文件类型不合法',
        1010 => '文件移动失败'
    ];
    $dir = date("Y", time()) . "/" . date("md", time()) . "/";
    $path = "public/upload/files/" . $dir;
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }
    $maxsize = 1024 * 1024 * 900;
    $mime = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/gif', 'image/png', 'image/jpeg', 'image/bmp', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon',
        'application/zip', 'application/x-zip-compressed', 'application/x-gzip', 'application/x-rar-compressed'];
    $file = $_FILES['file'];
    switch ($file['error']) {
        case 1: return 1001;
        case 2: return 1002;
        case 3: return 1003;
        case 4: return 1004;
        case 6: return 1006;
        case 7: return 1007;
    }
    if ($file['size'] > $maxsize) return 1008;
    if (!in_array($file['type'], $mime)) return 1009;
    $tmp = $file['tmp_name'];
    $fileName = date('YmdHis') . substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 6);
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $basename = $fileName . '.' . $ext;
    $dest = $path . $basename;
    if (move_uploaded_file($tmp, $dest)) {
        $file_url = "/" . $path . $basename;
        $this->success("文件上传成功", $file_url);
    } else {
        $this->error("上传文件错误：" . $errorInfo[1010]);
    }
}
```

## ♬前端

```javascript
<div class="upboxlae">
    <input type="text" name="headimg" readonly>
    <input type="file" id="file">
</div>

<script>
    document.querySelector("#file").addEventListener("change", function () {
        const fileInput = this.files[0];

        if (!fileInput) {
            new ZhenshangyinMessage({
                message: '请选择一个文件！',
                type: 'warning',
                duration: 2000
            });
            return;
        }

        const allowedExtensions = ['jpeg', 'png', 'jpg', 'gif'];
        const extension = fileInput.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            new ZhenshangyinMessage({
                message: '仅支持jpeg, png, jpg, gif格式文件！',
                type: 'warning',
                duration: 2000
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput);
        
        axios.post('/admin/zhenshangyin/upload_file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(response => {
                const { data } = response;
                if (data.code === 1) {
                    document.querySelector("[name='headimg']").value = data.data; // 更新隐藏字段
                    new ZhenshangyinMessage({
                        message: '文件上传成功！',
                        type: 'success',
                        duration: 2000
                    });
                } else {
                    new ZhenshangyinMessage({
                        message: data.msg || '文件上传失败！',
                        type: 'error',
                        duration: 2000
                    });
                }
            })
            .catch(error => {
                console.error('上传失败:', error);
                new ZhenshangyinMessage({
                    message: '网络错误，文件上传失败！',
                    type: 'error',
                    duration: 2000
                });
            });
    });
</script>
```

# 内容模板获取指定栏目信息

1. ☂查找⋙\app\data\controller\article⋙Article.php
2. ☂搜索⋙表单数据处理，找到⋙$this->contentTemplateId = $contentTemplateId;⋙在下面加
3. ☂data_article_show_moren⋙对应数据表
4. ☂'parent_id' => 3⋙对应栏目id
5. ☂这是获取指定id的所有下级栏目⋙下面是获取指定栏目下的所有分类

```php
$subCategoryData = Db::name("data_article_cate")
    ->field("id, title as name")
    ->where(['status' => 1, 'parent_id' => 3])
    ->select(); // 使用 select 方法获取完整的记录

$this->subCategoryIds = json_encode($subCategoryData); // 直接编码为 JSON
```

## ♬在表单数据处理上面加

```php
// 递归获取所有子分类的方法
protected function getSubCategories($parentId) {
    $categories = Db::name("data_article_cate")
        ->field("id, force_link, title as name")
        ->where(['status' => 1, 'parent_id' => $parentId])
        ->select()
        ->toArray();

    // 用于存储最终的所有分类
    $allCategories = [];

    // 遍历当前层级的分类
    foreach ($categories as $category) {
        $allCategories[] = $category; // 添加当前分类
        // 递归获取子分类
        $subCategories = $this->getSubCategories($category['id']);
        if (!empty($subCategories)) {
            $allCategories = array_merge($allCategories, $subCategories); // 合并子分类
        }
    }

    return $allCategories;
}

//表单数据处理里面加⋙//获取自定义字段上面加就行
$subCategoryData = $this->getSubCategories(3); // 传入父级ID 3
$this->subCategoryIds = json_encode($subCategoryData); // 转换为 JSON
```

1. ☂查找⋙获得指定栏目图文列表信息⋙getCatArticle，
2. ☂搜索⋙$list[$key]['url'] = "site-".$linkName."/show-".$value['cat_id']."-".$value['id'].".html"⋙在下面加
3. ☂field("id,cat_id,title")⋙这里的字段可以随便添加⋙上面也要加

```php
//只需要一项的时候可以用它
 if (isset($value['lanmu']) && !empty($value['lanmu'])) {
    $jiazaiInfo = Db::name("DataArticleCate")->field("id,title")->where(['id' => $value['lanmu'], 'status' => 1])->find();
    $list[$key]['lanmu'] = $jiazaiInfo;
}

//多项的时候用它
if (isset($value['lanmu']) && !empty($value['lanmu'])) {
// 将逗号分隔的字符串转换为数组
$lanmuIds = explode(',', $value['lanmu']);

// 只查询一次数据
$lanmuIds = Db::name("DataArticleCate")
                ->field("id,title")
                ->whereIn('id', $lanmuIds)
                ->where(['status' => 1])
                ->select(); // 使用 select 方法获取完整的记录

// 确保 $list[$key]['jiazai'] 是一个数组
if (!isset($list[$key]['lanmu']) || !is_array($list[$key]['lanmu'])) {
    $list[$key]['lanmu'] = []; // 初始化为数组
}

// 遍历获取到的结果，逐项处理
foreach ($lanmuIds as $info) {
    $list[$key]['lanmu'][] = $info;
} else {
	$list[$key]['lanmu'] = []; // 如果没有 lanmu
}
```

1. ☂Article.php⋙List⋙列表页显示
2. 查找⋙//指定栏目的文章列表⋙里面加

```php
//只需要一项的时候可以用它
$list = DB::table($prefix.$contentTemplateInfo['table_name'])
->where($where)->where($whereGet)->where(['status'=>1])->order('sort desc,id desc')
->paginate(['list_rows'=>$pageNum,'query' => request()->param()])->each(function($item, $key){
    //新增
   if (isset($item['lanmu']) && !empty($item['lanmu'])) {
        // 查询对应的 lanmu 信息
        $lanmuInfo = Db::name("DataArticleCate")
            ->field("id, title")
            ->where(['id' => $item['lanmu'], 'status' => 1])
            ->find();
            
        // 将查询结果赋值给当前项
        $item['lanmu'] = $lanmuInfo ?: null; // 如果没有数据，赋值为 null
    } else {
        $item['lanmu'] = null; // 如果没有 lanmu，赋值为 null
    }
    return $item;
});

//多项的时候用它
 $list = DB::table($prefix.$contentTemplateInfo['table_name'])
->where($where)->where($whereGet)->where(['status'=>1])->order('sort desc,id desc')
->paginate(['list_rows'=>$pageNum,'query' => request()->param()])->each(function($item, $key){
    //新增
    if (isset($item['lanmu']) && !empty($item['lanmu'])) {
        // 将逗号分隔的字符串转换为数组
        $lanmuIds = explode(',', $item['lanmu']);
        
        // 只查询一次数据
        $lanmuInfo = Db::name("DataArticleCate")
            ->field("id, title")
            ->whereIn('id', $lanmuIds)
            ->where(['status' => 1])
            ->select()
            ->toArray();
        // 确保 $item['lanmu'] 是一个数组
        $item['lanmu'] = $lanmuInfo ?: []; // 如果没有数据，赋值为空数组
    } else {
        $item['lanmu'] = []; // 如果没有 lanmu
    }
    
    return $item;
});
```

1. ☂Article.php⋙show⋙单页/详情页显示
2. ☂查找⋙//获得当前图文信息⋙下方新增

```php
//只需要一项的时候可以用它
if (isset($article['lanmu']) && !empty($article['lanmu'])) {
    // 查询对应的 lanmu 信息
    $lanmuInfo = Db::name("DataArticleCate")
        ->field("id, title")
        ->where(['id' => $article['lanmu'], 'status' => 1])
        ->find(); // 使用 find 方法获取单个记录

    // 将查询结果赋值给 $article['lanmu']
    $article['lanmu'] = $lanmuInfo ?: null; // 如果没有数据，赋值为 null
} else {
    $article['lanmu'] = null; // 如果没有 lanmu，赋值为 null
}
        
//多项的时候用它
if (isset($article['lanmu']) && !empty($article['lanmu'])) {
    // 将逗号分隔的字符串转换为数组
    $lanmuIds = explode(',', $article['lanmu']);
    
    // 只查询一次数据
    $lanmuIds = Db::name("DataArticleCate")
                    ->field("id,title")
                    ->whereIn('id', $lanmuIds)
                    ->where(['status' => 1])
                    ->select(); // 使用 select 方法获取完整的记录

    // 确保 $list[$key]['lanmu'] 是一个数组

    if (!isset($article['lanmu']) || !is_array($article['lanmu'])) {
        $article['lanmu'] = []; // 初始化为数组
    }

    // 遍历获取到的结果，逐项处理
    foreach ($lanmuIds as $info) {
        $article['lanmu'][] = $info;

    }
} else {
    $article['jiazai'] = []; // 如果没有 lanmu，初始化为空数组
}
```

1. ☂内容form模板⋙添加下面展示自定义单行文本
2. ☂{if $field.field_name == 'jiazai'}⋙是自定义对应的字段⋙也可以在数据表里新增

```php
{if $field.field_name == 'jiazai'}
<div id="brand_list"></div>
{else}
<div class="layui-form-item layui-row layui-col-space17">
    <span class="color-green block">{$field.field_other_name}</span>
    <input name="{$field.field_name}" class="layui-input" placeholder="请输入{$field.field_other_name}"
        value="<?=isset($vo[$field['field_name']])?$vo[$field['field_name']]:""?>">
</div>
{/if}

<style>
    .lay-ext-mulitsel .tips{position: static;}
    .lay-ext-mulitsel .layui-input.multiple a{background: #3300ff}
</style>
<script>
    var tagData = {$brandList|default=[]|raw};
    layui.config({
        base : ''
    }).extend({
        selectN: 'public/static/selectN',
        selectM: 'public/static/selectM',
    }).use(['layer','form','jquery','selectN','selectM'],function(){
        $ = layui.jquery;
        var form = layui.form
            ,selectN = layui.selectN
            ,selectM = layui.selectM;

        //多选标签-所有配置
        var tagIns2 = selectM({
            //元素容器【必填】
            elem: '#brand_list'
            //候选数据【必填】
            ,data: tagData
            //默认值
            ,selected: [{$vo.jiazai|default=""}]
            //最多选择个数
            ,max: 1
            //input的name 不设置与选择器相同(去#.)
            ,name: 'jiazai'
            //值的分隔符
            ,delimiter: ','
            //候选项数据的键名
            ,field: {idName:'id',titleName:'name'}
        });
    });
</script>
```

## ♬前端调用⋙单项

```php
 {$art.lanmu.title|default=''}
```

## ♬前端调用⋙详情单项

```php
{$article.lanmu.title|default=''}
```

## ♬前端调用⋙列表页多项

```php
{if isset($art.lanmu) && is_array($art.lanmu) && !empty($art.lanmu)}
<div>
    {foreach name="$art.lanmu" key="k" item="item"}
    <a href="{$item.force_link}">{$item.title}</a>
    {/foreach}
</div>
{else}
<div>暂无加载内容</div>
{/if}
```

## ♬前端调用⋙详情页多项

```php
{if isset($article.lanmu) && is_array($article.lanmu) && !empty($article.lanmu)}
<div>
    {foreach name="$article.lanmu" key="k" item="item"}
    <a href="{$item.force_link}">{$item.title}</a>
    {/foreach}
</div>
{else}
<div>暂无加载内容</div>
{/if}
```

# 内容模板获取指定内容信息

1. ☂查找⋙\app\data\controller\article⋙Article.php
2. ☂搜索⋙表单数据处理⋙找到⋙$this->contentTemplateId = $contentTemplateId;⋙在下面加
3. ☂data_article_show_moren⋙对应数据表
4. ☂'cat_id' => 3⋙对应栏目id

```php
$brandList = Db::name("data_article_show_moren")
->field("id, cat_id, subtitle, create_at, logo, keywords, force_link, template_id, title as name")
->where(['status' => 1, 'cat_id' => 3])  // 这里添加栏目ID的条件
->select()
->toArray();
$this->brandList = json_encode($brandList);
```

## ♬获得指定栏目下的所有栏目内容，在⋙表单数据处理，上面加

```php
// 递归获取所有子分类 ID
protected function getSubCategoryIds($parentId) {
    // 获取当前分类的直接子分类
    $categories = Db::name("data_article_cate")
        ->field("id")
        ->where(['status' => 1, 'parent_id' => $parentId])
        ->select()
        ->toArray();
    
    $subCategoryIds = [$parentId]; // 初始化包含父级分类ID

    // 遍历当前分类的子分类
    foreach ($categories as $category) {
        // 递归获取子分类的ID
        $subCategoryIds = array_merge($subCategoryIds, $this->getSubCategoryIds($category['id']));
    }

    return $subCategoryIds;
}

// 表单数据处理里面加  ⋙  // 获取自定义字段上面加就行
// 递归获取栏目3及其所有子级的ID
$categoryIds = $this->getSubCategoryIds(3);

// 使用获取到的所有分类ID查询品牌列表
$brandList = Db::name("data_article_show_moren")
    ->field("id, cat_id, subtitle, create_at, logo, keywords, force_link, template_id, title as name")
    ->where(['status' => 1])
    ->whereIn('cat_id', $categoryIds)  // 使用 in 查询获取所有子分类
    ->select()
    ->toArray();
$this->brandList = json_encode($brandList);
```

1. ☂查找⋙获得指定栏目图文列表信息⋙getCatArticle，
2. ☂搜索⋙$list[$key]['url'] = "site-".$linkName."/show-".$value['cat_id']."-".$value['id'].".html"⋙在下面加
3. ☂field("id,cat_id,title")⋙这里的字段可以随便添加⋙上面也要加

```php
//只需要一项的时候可以用它
if (isset($value['jiazai']) && !empty($value['jiazai'])) {
    $jiazaiInfo = Db::name("DataArticleShowMoren")->field("id,cat_id,subtitle,create_at,logo,keywords,force_link,template_id,title")->where(['id' => $value['jiazai'], 'status' => 1])->find();
    $list[$key]['jiazai'] = $jiazaiInfo;
}

//多项的时候用它
// 检查并处理 jiazai 字段 
if (isset($value['jiazai']) && !empty($value['jiazai'])) {
// 将逗号分隔的字符串转换为数组
$jiazaiIds = explode(',', $value['jiazai']);

// 只查询一次数据
$jiazaiInfo = Db::name("DataArticleShowMoren")
                ->field("id,cat_id,subtitle,create_at,logo,keywords,force_link,template_id, title")
                ->whereIn('id', $jiazaiIds)
                ->where(['status' => 1])
                ->select()
                ->toArray();

// 确保 $list[$key]['jiazai'] 是一个数组
if (!isset($list[$key]['jiazai']) || !is_array($list[$key]['jiazai'])) {
    $list[$key]['jiazai'] = []; // 初始化为数组
}

// 遍历获取到的结果，逐项处理
foreach ($jiazaiInfo as $info) {
    $list[$key]['jiazai'][] = $info;
} else {
	$list[$key]['jiazai'] = []; // 如果没有 jiazai，初始化为空数组
}
```

1. ☂Article.php⋙List⋙列表页显示
2. 查找⋙//指定栏目的文章列表⋙里面加

```php
//只需要一项的时候可以用它
$list = DB::table($prefix.$contentTemplateInfo['table_name'])
->where($where)->where($whereGet)->where(['status'=>1])->order('sort desc,id desc')
->paginate(['list_rows'=>$pageNum,'query' => request()->param()])->each(function($item, $key){
    //新增
    if(isset($item['jiazai']) && !empty($item['jiazai'])){
        $item['jiazai'] = Db::name("DataArticleShowMoren")->field("id,cat_id,subtitle,create_at,logo,keywords,force_link,template_id,title")->where(['id'=>$item['jiazai'],'status'=>1])->find();
    }
    return $item;
});

//多项的时候用它
$list = DB::table($prefix.$contentTemplateInfo['table_name'])
->where($where)->where($whereGet)->where(['status'=>1])->order('sort desc,id desc')
->paginate(['list_rows'=>$pageNum,'query' => request()->param()])->each(function($item, $key){
    //新增
    if (isset($item['jiazai']) && !empty($item['jiazai'])) {
        // 将逗号分隔的字符串转换为数组
        $jiazaiIds = explode(',', $item['jiazai']);
        
        // 只查询一次数据
        $jiazaiInfo = Db::name("DataArticleShowMoren")
            ->field("id, cat_id, subtitle, create_at, logo, keywords, force_link, template_id, title")
            ->whereIn('id', $jiazaiIds)
            ->where(['status' => 1])
            ->select()
            ->toArray();

        // 确保 $item['jiazai'] 是一个数组
        $item['jiazai'] = $jiazaiInfo ?: []; // 如果没有数据，赋值为空数组
    } else {
        $item['jiazai'] = []; // 如果没有 jiazai
    }

    return $item;
});
```

1. ☂Article.php⋙show⋙单页/详情页显示
2. ☂查找⋙//获得当前图文信息⋙下方新增

```php
//只需要一项的时候可以用它
if(isset($article['jiazai']) && !empty($article['jiazai'])){
    $article['jiazai'] = Db::name("DataArticleShowMoren")->field("id,cat_id,title")->where(['id'=>$article['jiazai'],'status'=>1])->find();
}

//多项的时候用它
if (isset($article['jiazai']) && !empty($article['jiazai'])) {
    // 将逗号分隔的字符串转换为数组
    $jiazaiIds = explode(',', $article['jiazai']);

    // 只查询一次数据
    $jiazaiInfo = Db::name("DataArticleShowMoren")
        ->field("id, cat_id, subtitle, create_at, logo, keywords, force_link, template_id, title")
        ->whereIn('id', $jiazaiIds)
        ->where(['status' => 1])
        ->select()
        ->toArray();

    // 确保 $article['jiazai'] 是一个数组
    if (!isset($article['jiazai']) || !is_array($article['jiazai'])) {
        $article['jiazai'] = []; // 初始化为数组
    }

    // 遍历获取到的结果，逐项处理
    foreach ($jiazaiInfo as $info) {
        $article['jiazai'][] = $info;
    }
} else {
    $article['jiazai'] = []; // 如果没有 jiazai，初始化为空数组
}
```

1. ☂内容form模板⋙添加下面展示自定义单行文本
2. ☂{if $field.field_name == 'jiazai'}⋙是自定义对应的字段⋙也可以在数据表里新增

```php
{if $field.field_name == 'jiazai'}
<div id="brand_list"></div>
{else}
<div class="layui-form-item layui-row layui-col-space17">
    <span class="color-green block">{$field.field_other_name}</span>
    <input name="{$field.field_name}" class="layui-input" placeholder="请输入{$field.field_other_name}"
        value="<?=isset($vo[$field['field_name']])?$vo[$field['field_name']]:""?>">
</div>
{/if}

<style>
    .lay-ext-mulitsel .tips{position: static;}
    .lay-ext-mulitsel .layui-input.multiple a{background: #3300ff}
</style>
<script>
    var tagData = {$brandList|default=[]|raw};
    layui.config({
        base : ''
    }).extend({
        selectN: 'public/static/selectN',
        selectM: 'public/static/selectM',
    }).use(['layer','form','jquery','selectN','selectM'],function(){
        $ = layui.jquery;
        var form = layui.form
            ,selectN = layui.selectN
            ,selectM = layui.selectM;

        //多选标签-所有配置
        var tagIns2 = selectM({
            //元素容器【必填】
            elem: '#brand_list'
            //候选数据【必填】
            ,data: tagData
            //默认值
            ,selected: [{$vo.jiazai|default=""}]
            //最多选择个数
            ,max: 1
            //input的name 不设置与选择器相同(去#.)
            ,name: 'jiazai'
            //值的分隔符
            ,delimiter: ','
            //候选项数据的键名
            ,field: {idName:'id',titleName:'name'}
        });
    });
</script>
```

## ♬前端调用⋙列表页单项

```php
{$art.jiazai.title|default=''}
```

## ♬前端调用⋙详情单项

```php
{$article.jiazai.title|default=''}
```

## ♬前端调用⋙列表页多项

```php
{if isset($art.jiazai) && is_array($art.jiazai) && !empty($art.jiazai)}
<div>
    {foreach name="$art.jiazai" key="k" item="item"}
    <a href="/site-List/show-{$item.cat_id}-{$item.id}.html" data-id="{$item.id}">{$item.title}</a>
    {/foreach}
</div>
{else}
<div>暂无加载内容</div>
{/if}
```

## ♬前端调用⋙详情页多项

```php
{if isset($article.jiazai) && is_array($article.jiazai) && !empty($article.jiazai)}
<div>
    {foreach name="$article.jiazai" key="k" item="item"}
    <a href="/site-List/show-{$item.cat_id}-{$item.id}.html" data-id="{$item.id}">{$item.title}</a>
    {/foreach}
</div>
{else}
<div>暂无加载内容</div>
{/if}
```

# 内容添加循环信息

## ♬执行SQL语句，表名attachment

```sql
CREATE TABLE `attachment` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    `parent_id` INT NOT NULL COMMENT '对应主内容的ID',
    `title` VARCHAR(255) NOT NULL COMMENT '标题',
    `summary` TEXT COMMENT '摘要',
    `cover_image` VARCHAR(255) COMMENT '封面图路径',
    `content` VARCHAR(255) COMMENT '内容',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='信息表';
```

## ♬添加按钮

```html
 <a data-dbclick class="layui-btn layui-btn-sm" data-open='/index/zhenshangyin/edita?id={$vo.id}&parent_id={$vo.id}'>添加内容</a>
```

## ♬后台接口

```PHP
public function edita()
{
    $this->title = '添加分类信息';
    $parent_id = $this->request->post('parent_id', $this->request->get('parent_id', 0));
    $this->assign('parent_id', $parent_id);
    if ($this->request->isPost()) {
        $data = [
            'parent_id' => $parent_id,
            'title' => $this->request->post('title'),
            'summary' => $this->request->post('summary'),
            'cover_image' => $this->request->post('cover_image'),
            'content' => $this->request->post('content'),
            'created_at' => date('Y-m-d H:i:s'),
        ];
        $result = $this->app->db->name('attachment')->insert($data);
        if ($result) {
            $attachments = $this->app->db->name('attachment')->where('parent_id', $parent_id)->select();
            return json([
                'status' => 'success',
                'message' => '添加成功',
                'attachments' => $attachments,
            ]);
        } else {
            return json([
                'status' => 'error',
                'message' => '添加失败',
            ]);
        }
    }
    $attachments = $this->app->db->name('attachment')->where('parent_id', $parent_id)->select();
    $this->assign('attachments', $attachments);
    return $this->fetch('/page/form_form');
}
public function editAttachment()
{
    $id = $this->request->post('id');
    $parent_id = $this->request->post('parent_id');
    $data = [
        'title' => $this->request->post('title'),
        'summary' => $this->request->post('summary'),
        'cover_image' => $this->request->post('cover_image'),
        'content' => $this->request->post('content'),
    ];
    $result = $this->app->db->name('attachment')->where('id', $id)->update($data);
    if ($result !== false) {
        $attachments = $this->app->db->name('attachment')->where('parent_id', $parent_id)->select();
        return json([
            'status' => 'success',
            'message' => '更新成功',
            'attachments' => $attachments,
        ]);
    } else {
        return json([
            'status' => 'error',
            'message' => '更新失败',
        ]);
    }
}
public function deleteAttachment()
{
    $id = $this->request->post('id');

    $result = $this->app->db->name('attachment')->where('id', $id)->delete();

    if ($result) {
        return json([
            'status' => 'success',
            'message' => '删除成功',
        ]);
    } else {
        return json([
            'status' => 'error',
            'message' => '删除失败',
        ]);
    }
}
public function getAttachmentsByContentId()
{
    $content_id = $this->request->get('content_id');
    $attachments = $this->app->db->name('attachment')->where('parent_id', $content_id)->select();

    if ($attachments) {
        return json([
            'status' => 'success',
            'attachments' => $attachments,
        ]);
    } else {
        return json([
            'status' => 'error',
            'message' => '没有找到信息',
        ]);
    }
}
```

## ♬新建后台模板form_form.html

```HTML
{extend name="../../admin/view/main"}
{block name="content"}
<style>
    .layui-side {
        display: none;
    }

    .layui-header {
        display: none;
    }

    .layui-body {
        top: 0 !important;
        left: 0 !important;
        overflow: hidden !important;
    }

    .layui-card-html {
        padding: 0 !important;
    }

    .layui-card-header {
        top: 0 !important;
        left: 0 !important;
    }
</style>

<div class="layui-card">
    <div class="layui-card-header">添加信息</div>
    <div class="layui-card-body">
        <form class="layui-form" action="/admin/zhenshangyin/edita" method="post" enctype="multipart/form-data"
            id="attachment-form">
            <input type="hidden" name="parent_id" value="{$parent_id}">
            <div class="layui-row margin-bottom-15">
                <label class="layui-form-label layui-col-xs3">标题</label>
                <div class="layui-input-block layui-col-xs9">
                    <input type="text" name="title" required placeholder="请输入标题" class="layui-input">
                </div>
            </div>
            <div class="layui-row margin-bottom-15">
                <label class="layui-form-label layui-col-xs3">摘要</label>
                <div class="layui-input-block layui-col-xs9">
                    <textarea name="summary" placeholder="请输入摘要" class="layui-textarea"></textarea>
                </div>
            </div>

            <div class="layui-row margin-bottom-15">
                <label class="layui-form-label layui-col-xs2">分类图</label>
                <label class="layui-input-block layui-col-xs7">
                    <input name="cover_image" value='{$vo.cover_image|default=""}' data-tips-image-hover placeholder="请上传分类图" class="layui-input">
                </label>
                <a  class="layui-col-xs2 layui-btn think-form-group-right" data-file="btn" data-field="cover_image">
                    <i class="layui-icon layui-icon-upload"></i> 上传
                </a>
            </div>
            <div class="layui-row margin-bottom-15">
                <label class="layui-form-label layui-col-xs3">详情</label>
                <div class="layui-input-block layui-col-xs9">
                    <textarea id="content" type="text/plain" name="content" style="width:100%;height:300px;">{$vo.content|default=''|raw}</textarea>
                </div>
            </div>
            <script>
                window.form.render();
                var editor = null;
                require(['ckeditor'], function () {
                    if (!editor) {
                        editor = window.createEditor('[name=content]', { 
                            height: 250,
                            removePlugins: 'elementspath,resize'
                        });
                    }
                });
            </script>
            <div class="layui-row margin-bottom-15">
                <label class="layui-form-label layui-col-xs3"></label>
                <div class="layui-input-block layui-col-xs6">
                    <button class="layui-btn  layui-col-xs2" type="submit">提交</button>
                </div>
            </div>
        </form>

        <h3>已上传信息：</h3>
        <table class="layui-table" id="attachments-table">
            <thead>
                <tr>
                    <th>id</th>
                    <th>标题</th>
                    <th>摘要</th>
                    <th>封面图</th>
                    <th>上传时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {volist name="attachments" id="attachment"}
                <tr data-id="{$attachment.id}">
                    <td>{$attachment.id}</td>
                    <td>{$attachment.title}</td>
                    <td>{$attachment.summary}</td>
                    <td><img data-tips-image src="{$attachment.cover_image}" width="100"></td>
                    <td>{$attachment.created_at}</td>
                    <td>
                        <button class="layui-btn layui-btn-sm layui-btn-primary edit-btn">编辑</button>
                        <button class="layui-btn layui-btn-sm layui-btn-danger delete-btn">删除</button>
                    </td>
                </tr>
                {/volist}
            </tbody>
        </table>
    </div>
</div>
{/block}

{block name='script'}
<script>
    // 编辑附件信息
    $(document).on('click', '.edit-btn', function () {
        var attachmentId = $(this).closest('tr').data('id');
        var row = $(this).closest('tr');
        var title = row.find('td').eq(1).text();
        var summary = row.find('td').eq(2).text();
        var coverImage = row.find('td').eq(3).find('img').attr('src');
        // 打开编辑弹窗
        layer.open({
            type: 1,
            title: '编辑附件信息',
            content: `
            <form class="layui-form" id="edit-form" style="padding: 20px">
                <input type="hidden" name="id" value="${attachmentId}">
                <input type="hidden" name="parent_id" value="{$parent_id}">
                <div class="layui-row margin-bottom-15">
                    <label class="layui-form-label layui-col-xs1">标题</label>
                    <div class="layui-input-block layui-col-xs10">
                        <input type="text" name="title" value="${title}" required class="layui-input">
                    </div>
                </div>
                <div class="layui-row margin-bottom-15">
                    <label class="layui-form-label layui-col-xs1">摘要</label>
                    <div class="layui-input-block layui-col-xs10">
                        <textarea name="summary" class="layui-textarea">${summary}</textarea>
                    </div>
                </div>
                <div class="layui-row margin-bottom-15">
                    <label class="layui-form-label layui-col-xs1">分类图</label>
                    <label class="layui-input-block layui-col-xs8">
                        <input name="cover_image" value="${coverImage}" data-tips-image-hover placeholder="请上传分类图" class="layui-input">
                    </label>
                    <a class="layui-col-xs2 layui-btn think-form-group-right" data-file="btn" data-field="cover_image">
                        <i class="layui-icon layui-icon-upload"></i> 上传
                    </a>
                </div>
                <div class="layui-row margin-bottom-15">
                    <label class="layui-form-label layui-col-xs1">详情</label>
                    <div class="layui-input-block layui-col-xs10">
                        <textarea id="edit-content" name="content" style="width:100%;height:300px;"></textarea>
                    </div>
                </div>
                <div class="layui-row margin-bottom-15">
                    <label class="layui-form-label layui-col-xs1"></label>
                    <div class="layui-input-block layui-col-xs10">
                        <button type="submit" class="layui-btn layui-col-xs1">保存</button>
                    </div> 
                </div>
            </form>
            `,
            area: ['90%', '90%'],
            success: function (layero, index) {
                setTimeout(function() {
                    var editEditor = null;
                    require(['ckeditor'], function () {
                        if (!editEditor) {
                            editEditor = window.createEditor('#edit-content', {
                                height: 300,
                                removePlugins: 'elementspath,resize',
                                zIndex: layer.zIndex
                            });
                        }
                        $.ajax({
                            url: '/admin/zhenshangyin/getContent',
                            type: 'POST',
                            data: { id: attachmentId },
                            success: function(response) {
                                if(response.status === 'success' && editEditor) {
                                    editEditor.setData(response.content || '');
                                }
                            }
                        });
                    });
                }, 100);
                $('#edit-form').submit(function (e) {
                    e.preventDefault();
                    var formData = new FormData(this);
                    try {
                        var editorContent = CKEDITOR.instances['edit-content'].getData();
                        formData.set('content', editorContent);
                    } catch (error) {
                        console.error('获取编辑器内容失败:', error);
                        layer.msg('获取编辑器内容失败，请重试', { icon: 2 });
                        return;
                    }
                    $.ajax({
                        url: '/admin/zhenshangyin/editAttachment',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            if (response.status === 'success') {
                                layer.msg('编辑成功', { icon: 1 });
                                updateAttachmentsList(response.attachments);
                                layer.close(index);
                            } else {
                                layer.msg(response.message, { icon: 2 });
                            }
                        },
                        error: function () {
                            layer.msg('网络错误，请重试', { icon: 2 });
                        }
                    });
                });
            }
        });
    });
    function updateAttachmentsList(attachments) {
        var tbody = $('#attachments-table tbody');
        tbody.empty();
        attachments.forEach(function (attachment) {
            var row = $('<tr></tr>').attr('data-id', attachment.id);
            row.append('<td>' + attachment.id + '</td>');
            row.append('<td>' + attachment.title + '</td>');
            row.append('<td>' + attachment.summary + '</td>');
            row.append('<td><img data-tips-image  src="' + attachment.cover_image + '" width="100"></td>');
            row.append('<td>' + attachment.created_at + '</td>');
            row.append('<td>' +
                '<button class="layui-btn layui-btn-sm layui-btn-primary edit-btn">编辑</button>' +
                '<button class="layui-btn layui-btn-sm layui-btn-danger delete-btn">删除</button>' +
                '</td>');
            tbody.append(row);
        });
    }
</script>
<script>
    $(document).on('click', '.delete-btn', function () {
        var row = $(this).closest('tr');
        var attachmentId = row.data('id');
        layer.confirm('确认删除该附件?', {
            btn: ['确定', '取消']
        }, function () {
            $.ajax({
                url: '/admin/zhenshangyin/deleteAttachment',
                type: 'POST',
                data: { id: attachmentId },
                success: function (response) {
                    if (response.status === 'success') {
                        layer.msg('删除成功', { icon: 1 });
                        row.remove();  // 删除表格中的这一行
                    } else {
                        layer.msg(response.message, { icon: 2 });
                    }
                },
                error: function () {
                    layer.msg('网络错误，请重试', { icon: 2 });
                }
            });
        });
    });
</script>
<script>
    $('#attachment-form').submit(function (e) {
        e.preventDefault(); 
        var formData = new FormData(this);
        
        try {
            var editorContent = CKEDITOR.instances['content'].getData();
            formData.set('content', editorContent);
        } catch (error) {
            console.error('获取编辑器内容失败:', error);
            layer.msg('获取编辑器内容失败，请重试', { icon: 2 });
            return;
        }
        $.ajax({
            url: "/admin/zhenshangyin/edita",
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status === 'success') {

                    layer.msg(response.message, { icon: 1 });

                    updateAttachmentsList(response.attachments);

                    $('#attachment-form')[0].reset();

                    try {
                        CKEDITOR.instances['content'].setData('');
                    } catch (error) {
                        console.error('清空编辑器内容失败:', error);
                    }
                } else {

                    layer.msg(response.message, { icon: 2 });
                }
            },
            error: function () {

                layer.msg('网络错误，请重试', { icon: 2 });
            }
        });
    });
    function updateAttachmentsList(attachments) {
        var tbody = $('#attachments-table tbody');
        tbody.empty();
        attachments.forEach(function (attachment) {
            var row = $('<tr></tr>').attr('data-id', attachment.id);
            row.append('<td>' + attachment.id + '</td>');
            row.append('<td>' + attachment.title + '</td>');
            row.append('<td>' + attachment.summary + '</td>');
            row.append('<td><img data-tips-image  src="' + attachment.cover_image + '" width="100"></td>');
            row.append('<td>' + attachment.created_at + '</td>');
            row.append('<td>' +
                '<button class="layui-btn layui-btn-sm layui-btn-primary edit-btn">编辑</button>' +
                '<button class="layui-btn layui-btn-sm layui-btn-danger delete-btn">删除</button>' +
                '</td>');
            tbody.append(row);
        });
    }
</script>
{/block}
```

## ♬前端获取页面

1. 添加页面show_show.html
2. 添加路由

```PHP
Route::rule('site-<listName>/show_anli-<cat_id>-<id>','index/article/show_show');
```

- Article.php添加,也就是详情页跳详情页【内容循环的数据表attachment】【当前内容的数据表data_article_show_moren】

```PHP
public function show_show()
{
    // 获取附件的ID和主内容ID
    $id = $this->request->param('id'); // 这是主内容的ID
    $attachmentId = $this->request->param('id'); // 这是附件的ID

    // 查询附件信息
    $attachment = Db::name('attachment')->where('id', $attachmentId)->find();
    if ($attachment) {
        // 如果附件存在，赋值给视图
        $this->assign('attachment', $attachment);

        $parentId = $attachment['parent_id'];

        $article = Db::name('data_article_show_moren')->where('id', $parentId)->find();
        if ($article) {
            $this->assign('article', $article);
        } else {
            $this->assign('article', []);
        }
    } else {
        $this->assign('attachment', []);
        $this->assign('article', []);
    }

    return $this->fetch();
}
```

## ♬详情页获取内容

```PHP
<div class="LieBiao">
    <div id="container"></div>
</div>
<script>
    const contentId = '{$article.id}'; 
    // 使用 axios 请求附件数据
    axios.get('/index/zhenshangyin/getAttachmentsByContentId', { params: { content_id: contentId } })
        .then(function (response) {
            // 请求成功后处理数据
            if (response.data.status === 'success') {
                renderAttachments(response.data.attachments); // 渲染附件数据
            } else {
                console.error(response.data.message);
            }
        })
        .catch(function (error) {
            console.error('请求附件数据失败：', error);
        });
    // 渲染附件数据的函数
    function renderAttachments(attachments) {
        const container = document.getElementById('container');
        container.innerHTML = ''; // 清空容器
        attachments.forEach(attachment => {
            const attachmentItem = document.createElement('div');
            attachmentItem.className = 'attachment-item';
            attachmentItem.innerHTML = `
                <div class="Min">
                    <a href="/site-List/show_anli-{$article.id}-${attachment.id}.html">查看附件详情</a>

                    <img src="${attachment.cover_image}" alt="" />
                    <h2>${attachment.title}</h2>
                    <p>${attachment.summary}</p>
                </div>
            `;
            container.appendChild(attachmentItem);
        });
    }
</script>
```

## ♬跳转对应的内容页面

```PHP
<h2>附件详情</h2>
<div class="attachment-details">
    {if isset($attachment) && $attachment}
        <h3>{$attachment.title}</h3>
        <img src="{$attachment.cover_image}" alt="附件封面" />
        <p>{$attachment.summary}</p>
        <p>上传时间：{$attachment.created_at}</p>
    {else}
        <p>附件信息未找到。</p>
    {/if}
</div>

<h3>关联主内容</h3>
<div class="article-details">
    {if isset($article) && $article}
        <h4>{$article.title}</h4>
        <p>{$article.subtitle}</p>
    {else}
        <p>主内容信息未找到。</p>
    {/if}
</div>
```

# 验证验证码

## ♬接口

- 需要开启https

```PHP
public function generateCaptcha(): Response
{
    $length = 6;
    $captcha = $this->createCaptcha($length);
    session('captcha', $captcha);
    $width = 120;
    $height = 40;
    $image = imagecreatetruecolor($width, $height);
    $bgColor = imagecolorallocate($image, mt_rand(200, 255), mt_rand(200, 255), mt_rand(200, 255));
    imagefill($image, 0, 0, $bgColor);
    $textColor = imagecolorallocate($image, mt_rand(0, 100), mt_rand(0, 100), mt_rand(0, 100));
    for ($i = 0; $i < 50; $i++) {
        imagesetpixel($image, mt_rand(0, $width), mt_rand(0, $height), $textColor);
    }
    for ($i = 0; $i < 5; $i++) {
        imageline($image, mt_rand(0, $width), mt_rand(0, $height), mt_rand(0, $width), mt_rand(0, $height), $textColor);
    }
    $font = 5; // 字体大小
    $spacing = 10; // 控制字符间距，可以增大或减小
    $textWidth = imagefontwidth($font) * $length + ($spacing * ($length - 1));
    $x = ($width - $textWidth) / 2;
    $y = ($height - imagefontheight($font)) / 2;

    for ($i = 0; $i < $length; $i++) {
        $char = $captcha[$i];
        imagestring($image, $font, $x + ($i * (imagefontwidth($font) + $spacing)), $y, $char, $textColor);
    }
    ob_start();
    imagepng($image);
    $imageData = ob_get_contents();
    ob_end_clean();
    imagedestroy($image);

    return response($imageData)->header(['Content-Type' => 'image/png']);
}

public function validateCaptcha(): Response
{
    $userCaptcha = input('post.captcha');
    $sessionCaptcha = session('captcha');
    if ($userCaptcha && strtoupper($userCaptcha) === strtoupper($sessionCaptcha)) {
        return json(['status' => 'success', 'message' => '验证码正确']);
    } else {
        return json(['status' => 'error', 'message' => '验证码错误']);
    }
}

private function createCaptcha($length = 6): string
{
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $captcha = '';
    for ($i = 0; $i < $length; $i++) {
        $captcha .= $chars[mt_rand(0, strlen($chars) - 1)];
    }
    return $captcha;
}
```

## ♬前端验证

```HTML
<img onclick="refreshCaptcha()" id="captcha-image" src="/admin/zhenshangyin/generateCaptcha" alt="验证码" />
<input type="text" id="captcha" name="captcha" required placeholder="请输入验证码" />
<button onclick="validateCaptcha()">提交</button>

<script>
    // 刷新验证码
    function refreshCaptcha() {
        document.getElementById('captcha-image').src = '/admin/zhenshangyin/generateCaptcha?' + new Date().getTime();
    }
    // 验证验证码
    function validateCaptcha() {
        const captcha = document.getElementById('captcha').value.trim(); // 去除前后空格
        axios.post('/admin/zhenshangyin/validateCaptcha', { captcha })
            .then(response => {
                if (response.data.status === 'success') {
                    new ZhenshangyinMessage({ 
                        message: '验证码正确',
                        type: 'success',
                        duration: 2000
                    });
                } else {
                    new ZhenshangyinMessage({ 
                        message: '验证码错误',
                        type: 'error',
                        duration: 2000
                    });
                }
            })
            .catch(error => {
                console.error(error);
                new ZhenshangyinMessage({ 
                    message: '验证失败',
                    type: 'error',
                    duration: 2000
                });
            });
    }
</script>
```

