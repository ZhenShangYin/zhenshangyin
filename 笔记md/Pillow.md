# 初始化

- 仅获得所有数据，可再此功能上进行无限延展

```php
public function getCatArticleZhen($catId = 0, $num = 9999, $page = 1, $title = '') 
{
    // Get content template ID and table name
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // If category ID is 0, use default model table
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // If table name doesn't exist, return false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => []]);
    }

    $tableName = strtolower($tableName);
    $where = ['status' => 1];

    // Category ID condition
    if (!empty($catId)) {
        $where['cat_id'] = $catId;
    }

    // Fetch all data without pagination
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->order("id desc")
        ->select()
        ->toArray();

    // Add link items
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // Return data structure
    return json([
        'total' => count($list), // Return total count of items
        'items' => $list ?? []  // Ensure it returns an empty array even if there's no data
    ]);
}
```

## ♬HTML

```javascript
<div id="container"></div>
<script>
    //日期报错加他
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const dataContainer = document.getElementById('container');
    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <li>
                    <h2>${item.title || ''}</h2>
                    ${formatDate(item.create_at)}  //日期
                    <a href="/index/Article/show/cat_id/${item.cat_id}/id/${item.id}">MORE</a> //链接
                    <a href="/site-List/show-${item.cat_id}-${item.id}.html">MORE</a> //链接
                    <div class="Min_Moun">${item.fenlei ? item.fenlei.split('\n').map(line => `<p>${line}</p>`).join('') : ''}</div> //多行文本解析成p
                </li>
            `).join('');
        }
    }

    function loadData() {
        axios.post('/index/zhenshangyin/getCatArticleZhen', {
            cat_id: '17',
            num: 9999,
            page: 1
        })
            .then(response => {
                console.log(response.data); // Print returned data
                const { items } = response.data;
                if (response.data) {
                    renderItems(items);
                } else {
                    console.error("后端数据格式错误或无数据返回");
                }
            })
            .catch(error => {
                console.error("请求失败", error);
            });
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadData();
    });
</script>
```

# 常见问题

1. ☂编码文字，仔细检查字段值正不正确
2. ☂搜索问题

```php
$tableName = strtolower($tableName);
$where = ['status' => 1];

 if (!empty($title)) {
    $where['title'] = $title; // 精确匹配搜索分类
}

//要想改为模糊搜需要改一下两处，两处到要改，否则会报utf-8得错误
$tableName = strtolower($tableName);
$where = [['status', '=', 1]]; // 使用数组格式

if (!empty($title)) {
    $where[] = ['title', 'like', '%' . $title . '%'];
}

//搜索全部字段
public function getCatArticleQie($catId = 0, $num = 0, $page = 1 ,$search = '')  //$search = ''这里别忘了
 
if (!empty($search)) {
    $where[] = function ($query) use ($search) {
        $query->where('title', 'like', '%' . $search . '%')
              ->whereOr('diqu', 'like', '%' . $search . '%')
              ->whereOr('paiming', 'like', '%' . $search . '%')
    };
}
```

> 价格区间问题
>
> 单行文本字段类型默认为“varchar”，在进行价格筛选得时候是字符串之间得筛选，需要改为数字类型，比如int

> 判断指定页面显示
>
> if (document.getElementById('book') && window.location.pathname === '/bookshelf') {}

# 会员相关

## ♬判断是否登录

```php
♬{if empty($userInfo.id)}
<a href="/login" id="openlogin"> 登陆/注册</a>
{else}
<a href="javascript:;" id="logOut">退出</a>
{/if}
```

## ♬基本用法

```php
<form onsubmit="return false;" id="modifyMemberProfileForm">
    //单行文本
    <input type="text" disabled name="nickname" id="nickname" value="{$userInfo.nickname|default=''}">   // nickname字段名
    //头像
    <img id="img " src="{$userInfo.headimg|default='images/rw_03.png'}" id="avatar" class="avatar" alt="">   // headimg字段名
    <input type="file" id="file" accept="image/*" class="file">重新上传、
    //性别
    <input type="radio" name="base_sex" value="1" {if $userInfo.base_sex == 1 || empty($member.base_sex)}checked{/if}>&nbsp;男
    <input type="radio" name="base_sex" value="2" {if $userInfo.base_sex == 2}checked{/if}>&nbsp;女
    //性别判断
    {if $userInfo.base_sex ==1}男{else}女{/if}
    //提交按钮
    <input type="hidden" name="id" value="{$userInfo.id}">
    <input type="submit" name="" class="ban" id="submitMemberProfile" value="保存">
</form>
```

## ♬注册

### ♫注册接口

```php
public function register()
{
    // 获取前端提交的数据
    $data = Request::post();
    // 检查是否已存在相同用户名或邮箱
    $userExist = Db::name('data_user')
        ->where(function ($query) use ($data) {
            $query->where('email', $data['email']);
        })
        ->find();
    if ($userExist) {
        return json(['status' => 'error', 'message' => '邮箱已存在']);
    }
    $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    unset($data['c_password']);
    try {
        Db::name('data_user')->insert($data);
        return json(['status' => 'success', 'message' => '注册成功']);
    } catch (\Exception $e) {
        return json([
            'status' => 'error',
            'message' => '注册失败，请稍后再试',
            'error_details' => $e->getMessage()
        ]);
    }
}
```

### ♫注册HTML

```php
<form name="formLogin" id="regForm" method="post" onsubmit="return false;">
    <input type="text" name="email" id="email" placeholder="邮箱">
    <input type="password" name="password" id="password" placeholder="密码">
    <input type="password" name="c_password" id="c_password" placeholder="确认密码">
    <input type="submit" id="submitToReg" value="注册" class="Submit">
</form>
```

### ♫注册JS

```php
if (document.getElementById('submitToReg')) {
    document.getElementById('submitToReg').addEventListener('click', function () {
        var formData = new FormData(document.getElementById('regForm'));
        var email = formData.get('email');
        var password = formData.get('password');
        var cPassword = formData.get('c_password');

        if (!email) {
            new ZhenshangyinMessage({
                message: '邮箱不能为空',
                type: 'error',
                duration: 2000
            });
            return;
        }
        if (!password) {
            new ZhenshangyinMessage({
                message: '密码不能为空',
                type: 'error',
                duration: 2000
            });
            return;
        }
        if (password.length < 6) {
            new ZhenshangyinMessage({
                message: '密码至少6个字符',
                type: 'error',
                duration: 2000
            });
            return;
        }

        if (!cPassword) {
            new ZhenshangyinMessage({
                message: '确认密码不能为空',
                type: 'error',
                duration: 2000
            });
            return;
        }
        if (password !== cPassword) {
            new ZhenshangyinMessage({
                message: '密码与确认密码不一致',
                type: 'error',
                duration: 2000
            });
            return;
        }

        fetch('/admin/zhenshangyin/register', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    new ZhenshangyinMessage({
                        message: data.message,
                        type: 'success',
                        duration: 2000
                    });
                    setTimeout(() => window.location = '/Login', 2000);
                } else {
                    new ZhenshangyinMessage({
                        message: data.message,
                        type: 'error',
                        duration: 2000
                    });
                }
            })
            .catch(error => {
                new ZhenshangyinMessage({
                    message: '请求失败，请稍后重试',
                    type: 'error',
                    duration: 2000
                });
            });
    });
}
```

## ♬注册带邮箱验证

### ♫注册接口，注意数据库要添加一个字段verification_code

```php
use think\facade\Request;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception; //顶部增加
public function sendVerificationCode($email)
{
    $verificationCode = rand(100000, 999999);
    session('verificationCode', strval($verificationCode));
    session('verificationCodeTime', time());
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();                                            // 使用SMTP
        $mail->Host = 'smtp.163.com';                                 // 163的SMTP服务器地址
        $mail->SMTPAuth = true;                                       // 启用SMTP身份验证
        $mail->Username = '19969899098@163.com';                     // 发件人邮箱（你的163邮箱）
        $mail->Password = 'YDdCbMWSiw8fxchC';                         // 发件人邮箱授权码
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;              // 使用SSL加密
        $mail->Port = 465;                                           // SMTP端口号（465为SSL）
        // 收件人信息
        $mail->setFrom('19969899098@163.com', 'Your Name');           // 发件人信息
        $mail->addAddress($email);                                    // 收件人邮箱
        // 邮件内容
        $mail->isHTML(true);
        $mail->Subject = '您的验证码';                                // 邮件主题
        $mail->Body    = '您的验证码是: <b>' . $verificationCode . '</b>'; // 邮件内容（验证码）
        // 发送邮件
        if ($mail->send()) {
            return json(['status' => 'success', 'message' => '验证码已成功发送']);
        } else {
            return json(['status' => 'error', 'message' => '发送失败，请稍后重试']);
        }
    } catch (Exception $e) {
        // 发生错误时，输出错误信息
        return json(['status' => 'error', 'message' => '邮件发送失败: ' . $mail->ErrorInfo]);
    }
}

public function register()
{
    $data = Request::post();
    // 检查验证码
    if (strval(session('verificationCode')) !== strval($data['verification_code'])) {
        return json(['status' => 'error', 'message' => '验证码错误']);
    }
    // 检查验证码是否过期
    $codeTime = session('verificationCodeTime');
    if (time() - $codeTime > 300) {  // 300秒 = 5分钟
        return json(['status' => 'error', 'message' => '验证码已过期']);
    }
    // 验证邮箱是否已注册
    $userExist = Db::name('data_user')
        ->where('email', $data['email'])
        ->find();
    if ($userExist) {
        return json(['status' => 'error', 'message' => '电子邮件已存在']);
    }
    // 密码加密
    $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    unset($data['c_password']);  // 删除确认密码字段，防止插入数据库
    // 数据库插入
    try {
        Db::name('data_user')->insert($data);
        return json(['status' => 'success', 'message' => '注册成功']);
    } catch (\Exception $e) {

        return json([
            'status' => 'error',
            'message' => '注册失败，请稍后重试',
            'error_details' => $e->getMessage()
        ]);
    }
}
```

### ♫注册HTML

```php
<form name="formLogin" id="regForm" method="post" onsubmit="return false;">
    <input type="text" name="email" id="email" placeholder="邮箱">
    <input type="text" name="verification_code" id="verification_code" placeholder="请输入验证码">
    <button type="button" id="getVerificationCode">发送验证码</button>
    <input type="password" name="password" id="password" placeholder="密码">
    <input type="password" name="c_password" id="c_password" placeholder="确认密码">
    <input type="submit" id="submitToReg" value="注册" class="Submit">
</form>
```

### ♫注册JS

```php
function showHint(message, type = 'warning') {
    new ZhenshangyinMessage({

        message: message,
        type: type,
        duration: 2000
    });
}

function validateForm(formData) {
    const username = formData.get('username');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const cPassword = formData.get('c_password');
    const verificationCode = formData.get('verification_code');

    if (!username) {
        showHint('用户名不能为空');
        return false;
    }
    if (!email) {
        showHint('邮箱不能为空');
        return false;
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
        showHint('请输入有效的邮箱地址');
        return false;
    }

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        showHint('请输入有效的手机号码');
        return false;
    }
    if (!password) {
        showHint('密码不能为空');
        return false;
    }
    if (password.length < 6) {
        showHint('密码至少6个字符');
        return false;
    }
    if (!cPassword) {
        showHint('确认密码不能为空');
        return false;
    }
    if (password !== cPassword) {
        showHint('密码与确认密码不一致');
        return false;
    }
    if (!verificationCode) {
        showHint('请输入验证码');
        return false;
    }

    return true;
}

if (document.getElementById('submitToReg')) {
    document.getElementById('submitToReg').addEventListener('click', function () {
        var formData = new FormData(document.getElementById('regForm'));

        if (!validateForm(formData)) return;  // 如果验证失败，停止执行

        fetch('/admin/zhenshangyin/register', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showHint(data.message, 'success');
                    setTimeout(() => window.location = '/Login', 2000);
                } else {
                    showHint(data.message, 'error');
                }
            })
            .catch(error => showHint('请求失败，请稍后重试', 'error'));
    });
}

if (document.getElementById('getVerificationCode')) {
    document.getElementById('getVerificationCode').addEventListener('click', function () {
        var email = document.getElementById('email').value;

        if (!email) {
            showHint('邮箱不能为空!');
            return;
        }

        if (!/^[a-zA-Z0-9_.+-]+@[a-zAZ0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
            showHint('请输入有效的电子邮件地址');
            return;
        }

        fetch('/admin/zhenshangyin/sendVerificationCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showHint('验证码已发送至您的邮箱', 'success');

                   var btn = document.getElementById('getVerificationCode');
                    var countdown = 60;
                    btn.disabled = true;
                    btn.textContent = `${countdown}秒后重新获取`;

                    var intervalId = setInterval(() => {
                        countdown--;
                        if (countdown <= 0) {
                            clearInterval(intervalId);
                            btn.disabled = false;
                            btn.textContent = '获取验证码';
                        } else {
                            btn.textContent = `${countdown}秒后重新获取`;
                        }
                    }, 1000);
                } else {
                    showHint(data.message, 'error');
                }
            })
            .catch(error => showHint('Failed to send verification code, please try again later', 'error'));
    });
}+
```

## ♬登录

### ♫登录接口

```php
public function login()
{
    // 获取前端传递的表单数据
    $email = input('post.email');
    $password = input('post.password');
    // 基础校验
    if (empty($email) || empty($password)) {
        return json(['code' => 0, 'info' => '邮箱和密码不能为空！']);
    }
    // 查找用户
    $user = Db::name('data_user')->where('email', $email)->find();
    if (!$user) {
        return json(['code' => 0, 'info' => '账号不存在！']);
    }
    if (empty($user['status'])) {
        $this->app->session->set("LoginInputSessionError", true);
        return json(['code' => 0, 'info' => '帐号待审核，联系管理员!']);
    }
    // 如果是 MD5 格式密码，则转换为 bcrypt 加密进行验证
    if (strlen($user['password']) == 32) {  // 判断密码是否是 MD5 格式
        if (md5($password) === $user['password']) {
            // 如果 MD5 验证成功，转换成 bcrypt 加密并更新
            $newPassword = password_hash($password, PASSWORD_BCRYPT);
            Db::name('data_user')->where('email', $email)->update(['password' => $newPassword]);
            return json(['code' => 1, 'info' => '登录成功！']);
        }
    }
    // 验证 bcrypt 密码
    if (!password_verify($password, $user['password'])) {
        return json(['code' => 0, 'info' => '密码错误！']);
    }
    // 登录成功，设置 session
    $this->app->session->set('uid', $user['id']);
    // 返回成功响应
    return json(['code' => 1, 'info' => '登录成功！']);
}
```

### ♫登录HTML

```php
<form onsubmit="return false;" id="logForm">
    <input type="text" name="email" id="login_username" placeholder="请输入账号">
    <input type="password" name="password" id="login_password" placeholder="请输入密码">
    <input type="submit" id="submitIn" value="LOGIN" class="Submit">
</form>
```

### ♫登录JS

```php
if (document.getElementById('submitIn')) {
    document.getElementById('submitIn').addEventListener('click', function () {
        const username = document.getElementById("login_username").value;
        const password = document.getElementById("login_password").value;

        if (!username) {
            new ZhenshangyinMessage({
                message: '请输入邮箱!',
                type: 'error',
                duration: 2000,
            });
            return false;
        }
        if (!password) {
            new ZhenshangyinMessage({
                message: '请输入密码!',
                type: 'error',
                duration: 2000,
            });
            return false;
        }

        const formData = new FormData(document.getElementById("logForm"));

        axios.post("/admin/zhenshangyin/login", formData)
            .then(function (response) {
                const data = response.data;
                if (data.code > 0) {
                    new ZhenshangyinMessage({
                        message: '登陆成功，等待跳转!',
                        type: 'success',
                        duration: 2000,
                    });
                    setTimeout(() => window.location = '/', 2000);
                } else {
                    new ZhenshangyinMessage({
                        message: data.info,
                        type: 'error',
                        duration: 2000,
                    });
                }
            })
            .catch(function () {
                new ZhenshangyinMessage({
                    message: '登陆失败，请稍后再试!',
                    type: 'error',
                    duration: 2000,
                });
            });
    });
}
```

## ♬邮箱验证码登录

### ♫登录接口

```php
public function sendVerificationCode($email)
{
    $verificationCode = rand(100000, 999999);
    session('verificationCode', strval($verificationCode));
    session('verificationCodeTime', time());
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();                                              // 使用SMTP
        $mail->Host = 'smtp.163.com';                                 // 163的SMTP服务器地址
        $mail->SMTPAuth = true;                                       // 启用SMTP身份验证
        $mail->Username = '19969899098@163.com';                      // 发件人邮箱（你的163邮箱）
        $mail->Password = 'YDdCbMWSiw8fxchC';                         // 发件人邮箱授权码
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;              // 使用SSL加密
        $mail->Port = 465;                                            // SMTP端口号（465为SSL）
        // 收件人信息
        $mail->setFrom('19969899098@163.com', 'Your Name');           // 发件人信息
        $mail->addAddress($email);                                    // 收件人邮箱
        // 邮件内容
        $mail->isHTML(true);
        $mail->Subject = '您的验证码';                                // 邮件主题
        $mail->Body    = '您的验证码是: <b>' . $verificationCode . '</b>'; // 邮件内容（验证码）
        // 发送邮件
        if ($mail->send()) {
            return json(['status' => 'success', 'message' => '验证码已成功发送']);
        } else {
            return json(['status' => 'error', 'message' => '发送失败，请稍后重试']);
        }
    } catch (Exception $e) {
        // 发生错误时，输出错误信息
        return json(['status' => 'error', 'message' => '邮件发送失败: ' . $mail->ErrorInfo]);
    }
}


public function loginByCode()
{
    $email = input('post.email');
    $code = input('post.verification_code');

    // 基础校验
    if (empty($email) || empty($code)) {
        return json(['code' => 0, 'info' => '邮箱和验证码不能为空！']);
    }

    // 验证码校验
    if (strval(session('verificationCode')) !== strval($code)) {
        return json(['code' => 0, 'info' => '验证码错误']);
    }

    // 检查验证码是否过期
    $codeTime = session('verificationCodeTime');
    if (time() - $codeTime > 1800) {  // 1800秒 = 30分钟
        return json(['code' => 0, 'info' => '验证码已过期']);
    }

    // 查找用户
    $user = Db::name('data_user')->where('email', $email)->find();
    if (!$user) {
        return json(['code' => 0, 'info' => '账号不存在！']);
    }

    if (empty($user['status'])) {
        return json(['code' => 0, 'info' => '帐号待审核，联系管理员!']);
    }

    // 登录成功，设置 session
    $this->app->session->set('uid', $user['id']);

    // 清除验证码session
    session('verificationCode', null);
    session('verificationCodeTime', null);

    return json(['code' => 1, 'info' => '登录成功！']);
}
```

### ♫登录HTML

```php
<form name="formLogin" id="reglonForm" method="post" onsubmit="return false;">
    <input type="text" name="email" id="email" placeholder="请输入邮箱">
    <div class="Yznzheng">
        <input type="text" autocomplete="off" name="verification_code" id="verification_code"
            placeholder="请输入邮箱验证码">
        <button type="button" id="getVerificationCode">获取邮箱验证码</button>
    </div>
    <input type="submit" id="submitTolonReg" value="注册" class="Submit">
</form>
```

### ♫登录JS

```php
if (document.getElementById('submitTolonReg')) {
    document.getElementById('submitTolonReg').addEventListener('click', function () {
        const email = document.getElementById('email').value;
        const verificationCode = document.getElementById('verification_code').value;

        if (!email) {
            showHint('请输入邮箱!');
            return false;
        }
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
            showHint('请输入有效的邮箱地址');
            return false;
        }
        if (!verificationCode) {
            showHint('请输入验证码!');
            return false;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('verification_code', verificationCode);

        fetch('/admin/zhenshangyin/loginByCode', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 1) {
                showHint('登录成功，等待跳转!', 'success');
                setTimeout(() => window.location = '/', 2000);
            } else {
                showHint(data.info, 'error');
            }
        })
        .catch(error => {
            showHint('登录失败，请稍后再试!', 'error');
        });
    });
}

if (document.getElementById('getVerificationCode')) {
    document.getElementById('getVerificationCode').addEventListener('click', function () {
        var email = document.getElementById('email').value;

        if (!email) {
            showHint('邮箱不能为空!');
            return;
        }

        if (!/^[a-zA-Z0-9_.+-]+@[a-zAZ0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
            showHint('请输入有效的电子邮件地址');
            return;
        }

        fetch('/admin/zhenshangyin/sendVerificationCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showHint('验证码已发送至您的邮箱', 'success');

                   var btn = document.getElementById('getVerificationCode');
                    var countdown = 60;
                    btn.disabled = true;
                    btn.textContent = `${countdown}秒后重新获取`;

                    var intervalId = setInterval(() => {
                        countdown--;
                        if (countdown <= 0) {
                            clearInterval(intervalId);
                            btn.disabled = false;
                            btn.textContent = '获取验证码';
                        } else {
                            btn.textContent = `${countdown}秒后重新获取`;
                        }
                    }, 1000);
                } else {
                    showHint(data.message, 'error');
                }
            })
            .catch(error => showHint('Failed to send verification code, please try again later', 'error'));
    });
}
```

## ♬邮箱找回密码

### ♫邮箱找回密码接口

```php
public function sendPasswordResetCode($email)
{
    $verificationCode = rand(100000, 999999);
    session('verificationCode', strval($verificationCode));
    session('verificationCodeTime', time());
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.163.com';
        $mail->SMTPAuth = true;
        $mail->Username = '19969899098@163.com';
        $mail->Password = 'YDdCbMWSiw8fxchC';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        $mail->setFrom('19969899098@163.com', 'Your Name');
        $mail->addAddress($email);
        $mail->isHTML(true);
        $mail->Subject = '您的验证码';
        $mail->Body    = '您的验证码是: <b>' . $verificationCode . '</b>';
        if ($mail->send()) {
            return json(['status' => 'success', 'message' => '验证码已成功发送']);
        } else {
            return json(['status' => 'error', 'message' => '发送失败，请稍后重试']);
        }
    } catch (Exception $e) {
        return json(['status' => 'error', 'message' => '邮件发送失败: ' . $mail->ErrorInfo]);
    }
}

public function resetPassword()
{
    $data = Request::post();
    // 验证验证码是否正确
    if (strval(session('verificationCode')) !== strval($data['verification_code'])) {
        return json(['status' => 'error', 'message' => '验证码错误']);
    }
    // 验证验证码是否过期
    $codeTime = session('verificationCodeTime');
    if (time() - $codeTime > 300) {
        return json(['status' => 'error', 'message' => '验证码已过期']);
    }
    // 检查邮箱是否存在
    $user = Db::name('data_user')
        ->where('email', $data['email'])
        ->find();
    if (!$user) {
        return json(['status' => 'error', 'message' => '该邮箱未注册']);
    }
    // 检查两次密码是否一致
    if ($data['password'] !== $data['c_password']) {
        return json(['status' => 'error', 'message' => '密码不一致']);
    }
    // 密码加密
    $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    // 更新用户密码
    try {
        Db::name('data_user')
            ->where('email', $data['email'])
            ->update(['password' => $data['password']]);
        return json(['status' => 'success', 'message' => '密码已重置']);
    } catch (\Exception $e) {
        return json(['status' => 'error', 'message' => '重置密码失败，请稍后重试']);
    }
}
```

### ♫邮箱找回密码HTML

```php
<form name="formResetPassword" id="resetPasswordForm" method="post" onsubmit="return false;">
    <input type="text" name="email" id="email" placeholder="Email">
    <div class="YOuXian">
        <input type="text" name="verification_code" id="verification_code" placeholder="Verification Code">
        <button type="button" id="getResetVerificationCode">Send code</button>
    </div>
    <input type="password" name="password" id="password" placeholder="New Password">
    <input type="password" name="c_password" id="c_password" placeholder="Confirm Password">
    <input type="submit" id="submitToResetPassword" value="Submit" class="Submit">
</form>
```

### ♫邮箱找回密码JS

```php
if (document.getElementById('getResetVerificationCode')) {
    document.getElementById('getResetVerificationCode').addEventListener('click', function () {
        var email = document.getElementById('email').value;
        if (email === '') {
            new ZhenshangyinMessage({
                message: 'Please enter your email address!',
                type: 'warning',
                duration: 2000,
            });
            return;
        }

        // 发送验证码请求
        axios.post('/admin/zhenshangyin/sendPasswordResetCode', { email: email })
            .then(function (response) {
                new ZhenshangyinMessage({
                    message: response.data.message,
                    type: 'success',
                    duration: 2000,
                });
                var btn = document.getElementById('getResetVerificationCode');
                var countdown = 60;
                btn.disabled = true;
                btn.textContent = `${countdown}秒后重新获取`;

                var intervalId = setInterval(() => {
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(intervalId);
                        btn.disabled = false;
                        btn.textContent = '获取验证码';
                    } else {
                        btn.textContent = `${countdown}秒后重新获取`;
                    }
                }, 1000);
            })
            .catch(function (error) {
                new ZhenshangyinMessage({
                    message: 'Failed to send verification code.',
                    type: 'error',
                    duration: 2000,
                });
            });
    });
}
if (document.getElementById('submitToResetPassword')) {
    document.getElementById('submitToResetPassword').addEventListener('click', function () {
        var email = document.getElementById('email').value;
        var verificationCode = document.getElementById('verification_code').value;
        var password = document.getElementById('password').value;
        var cPassword = document.getElementById('c_password').value;

        if (password !== cPassword) {
            new ZhenshangyinMessage({
                message: 'Passwords do not match!',
                type: 'warning',
                duration: 2000,
            });
            return;
        }

        axios.post('/admin/zhenshangyin/resetPassword', {
            email: email,
            verification_code: verificationCode,
            password: password,
            c_password: cPassword
        })
            .then(function (response) {
                new ZhenshangyinMessage({
                    message: response.data.message,
                    type: 'success',
                    duration: 2000,
                });
            })
            .catch(function (error) {
                new ZhenshangyinMessage({
                    message: '重置密码失败！',
                    type: 'error',
                    duration: 2000,
                });
            });
    });
}
```

## ♬修改邮箱

### ♫修改邮箱接口

```php
public function sendPasswordResetCode($email)
{
    $verificationCode = rand(100000, 999999);
    // 将验证码和时间保存在 session 中
    session('verificationCode', strval($verificationCode));
    session('verificationCodeTime', time());
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.163.com';
        $mail->SMTPAuth = true;
        $mail->Username = '13088920921@163.com';
        $mail->Password = 'YDdCbMWSiw8fxchC';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        $mail->setFrom('19969899098@163.com', 'Your Name');
        $mail->addAddress($email);
        $mail->isHTML(true);
        $mail->Subject = '您的验证码';
        $mail->Body    = '您的验证码是: <b>' . $verificationCode . '</b>';
        if ($mail->send()) {
            return json(['status' => 'success', 'message' => '验证码已成功发送']);
        } else {
            return json(['status' => 'error', 'message' => '发送失败，请稍后重试']);
        }
    } catch (Exception $e) {
        return json(['status' => 'error', 'message' => '邮件发送失败: ' . $mail->ErrorInfo]);
    }
}

public function changeEmail()
{
    $data = Request::post();
    $userID = $this->app->session->get('uid');
    if (empty($userID)) {
        return json(['status' => 'error', 'message' => '请先登录']);
    }
    $user = Db::name('data_user')->where('id', $userID)->find();
    if (!$user) {
        return json(['status' => 'error', 'message' => '用户不存在']);
    }
    if (strval(session('verificationCode')) !== strval($data['verification_code'])) {
        return json(['status' => 'error', 'message' => '验证码错误']);
    }
    $codeTime = session('verificationCodeTime');
    if (time() - $codeTime > 300) {
        return json(['status' => 'error', 'message' => '验证码已过期']);
    }
    if (strlen($user['password']) == 32) {
        if (md5($data['current_password']) !== $user['password']) {
            return json(['status' => 'error', 'message' => '当前密码错误']);
        }
        $newPassword = password_hash($data['current_password'], PASSWORD_BCRYPT);
        Db::name('data_user')->where('id', $userID)->update(['password' => $newPassword]);
    } else {
        if (!password_verify($data['current_password'], $user['password'])) {
            return json(['status' => 'error', 'message' => '当前密码错误']);
        }
    }
    $userExist = Db::name('data_user')->where('email', $data['new_email'])->find();
    if ($userExist) {
        return json(['status' => 'error', 'message' => '新邮箱已存在']);
    }
    try {
        Db::name('data_user')
            ->where('id', $userID)
            ->update(['email' => $data['new_email']]);
        return json(['status' => 'success', 'message' => '邮箱更新成功']);
    } catch (\Exception $e) {
        return json(['status' => 'error', 'message' => '邮箱更新失败，请稍后重试']);
    }
}
```

### ♫修改邮箱HTML

```php
<form name="formChangeEmail" method="post" onsubmit="return false;">
    <div class="Dengji_list">
        <p>新电邮<span>*</span></p>
        <input type="text" name="new_email" id="newEmail" placeholder="请填写新的电邮地址">
    </div>
    <div class="Dengji_list">
        <p>当前密码<span>*</span></p>
        <input type="password" name="passworda" id="current_password" placeholder="请输入当前密码以确认">
    </div>
    <div class="Dengji_list">
        <p>验证码<span>*</span></p>
        <div class="Dengji_yan">
            <input type="text" name="verification_code" id="verification_aacodea" placeholder="请输入验证码">
            <button type="button" id="getVerificationCodeaac">发送验证码</button>
        </div>
    </div>
    <input type="submit" id="submitEmailChange" value="保存">
</form>
```

### ♫修改邮箱JS

```php
if (document.getElementById('getVerificationCodeaac')) {
    document.getElementById('getVerificationCodeaac').addEventListener('click', function () {
        var newEmail = document.getElementById('newEmail').value;
        if (newEmail === '') {
            new ZhenshangyinMessage({
                message: '请填写邮箱', 
                type: 'warning', 
                duration: 2000 
            });
            return;
        }

        axios.post('/admin/zhenshangyin/sendVerificationCode', { email: newEmail })
            .then(function (response) {
                new ZhenshangyinMessage({ 
                    message: response.data.message, 
                    type: 'success', 
                    duration: 2000 
                });
                var btn = document.getElementById('getVerificationCodeaac');
                var countdown = 60;
                btn.disabled = true;
                btn.textContent = `${countdown}秒后重新获取`;

                var intervalId = setInterval(() => {
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(intervalId);
                        btn.disabled = false;
                        btn.textContent = '获取验证码';
                    } else {
                        btn.textContent = `${countdown}秒后重新获取`;
                    }
                }, 1000);
            })
            .catch(function (error) {
                new ZhenshangyinMessage( message: '失败', type: 'error', duration: 2000 });
            });
    });
}

if (document.getElementById('submitEmailChange')) {
    document.getElementById('submitEmailChange').addEventListener('click', function () {
        var newEmail = document.getElementById('newEmail').value;
        var verificationCode = document.getElementById('verification_aacodea').value;
        var currentpassword = document.getElementById('current_password').value;
        axios.post('/admin/zhenshangyin/changeEmail', {
            new_email: newEmail,
            verification_code: verificationCode,
            current_password: currentpassword
        })
            .then(function (response) {
                var notificationType = response.data.status === 'success' ? 'success' : 'warning';
                new ZhenshangyinMessage({message: response.data.message, type: notificationType, duration: 2000 });
            })
            .catch(function (error) {
                new ZhenshangyinMessage({message: '密码修改失败', type: 'error', duration: 2000 });
            });
    });
}
```

## ♬修改密码

### ♫修改密码接口

```php
public function changePassword()
{
    // 获取前端传递的数据
    $userId = $this->app->session->get('uid');
    $oldPassword = input('post.old_password');
    $newPassword = input('post.new_password');
    $confirmPassword = input('post.confirm_password');

    // 校验用户是否登录
    if (empty($userId)) {
        return json(['code' => 0, 'info' => '请先登录！']);
    }

    // 校验输入
    if (empty($oldPassword) || empty($newPassword) || empty($confirmPassword)) {
        return json(['code' => 0, 'info' => '所有字段均为必填项！']);
    }
    if ($newPassword !== $confirmPassword) {
        return json(['code' => 0, 'info' => '新密码与确认密码不一致！']);
    }

    // 获取用户信息
    $user = Db::name('data_user')->where('id', $userId)->find();
    if (!$user) {
        return json(['code' => 0, 'info' => '用户不存在！']);
    }

    // 验证旧密码
    if (strlen($user['password']) == 32) { // 如果是 MD5 加密
        if (md5($oldPassword) !== $user['password']) {
            return json(['code' => 0, 'info' => '旧密码错误！']);
        }
    } elseif (!password_verify($oldPassword, $user['password'])) { // 如果是 bcrypt 加密
        return json(['code' => 0, 'info' => '旧密码错误！']);
    }

    // 更新新密码（使用 bcrypt 加密）
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    $updateResult = Db::name('data_user')->where('id', $userId)->update(['password' => $hashedPassword]);

    if ($updateResult) {
        return json(['code' => 1, 'info' => '密码修改成功！']);
    } else {
        return json(['code' => 0, 'info' => '密码修改失败，请重试！']);
    }
}
```

### ♫修改密码HTML

```php
<form id="modifyPasswordForm" method="post" autocomplete="off">
    <input type="password" name="old_password" id="old_password" placeholder="请输入原密码">
    <input type="password" name="password" id="password" placeholder="请输入新密码">
    <input type="password" name="c_password" id="c_password" placeholder="请输入确认新密码">
    <input type="hidden" name="id" value="{$userInfo.id}">
    <input class="ban" type="submit" value="保存">
</form>
```

### ♫修改密码JS

```php
<script type="text/javascript">
    document.getElementById("modifyPasswordForm").addEventListener("submit", function (e) {
        e.preventDefault(); // 阻止默认表单提交行为

        // 获取表单数据
        var old_password = document.getElementById("old_password").value.trim();
        var password = document.getElementById("password").value.trim();
        var c_password = document.getElementById("c_password").value.trim();

        // 验证输入
        if (!old_password) {
            new ZhenshangyinMessage({
                message: '请输入旧密码！',
                type: 'warning',
                duration: 2000,
            });
            return;
        }
        if (!password) {
            new ZhenshangyinMessage({
                message: '请输入新密码！',
                type: 'warning',
                duration: 2000,
            });
            return;
        }
        if (password !== c_password) {
            new ZhenshangyinMessage({
                message: '密码与确认密码不一致！',
                type: 'warning',
                duration: 2000,
            });
            return;
        }

        // 创建 FormData 对象
        var formData = new FormData();
        formData.append("old_password", old_password);
        formData.append("new_password", password);
        formData.append("confirm_password", c_password);

        // 发送请求
        axios.post('/admin/zhenshangyin/changePassword', formData)
            .then(function (response) {
                var data = response.data;
                if (data.code > 0) {
                    new ZhenshangyinMessage({
                        message: data.info,
                        type: 'success',
                        duration: 2000,
                    });
                    setTimeout(function () {
                        window.location.reload(); // 成功后刷新页面
                    }, 1000);
                } else {
                    new ZhenshangyinMessage({
                        message: data.info,
                        type: 'warning',
                        duration: 2000,
                    });
                }
            })
            .catch(function (error) {
                new ZhenshangyinMessage({
                    message: '修改失败，请稍后再试！',
                    type: 'warning',
                    duration: 2000,
                });
            });
    });
</script>
```

## ♬修改个人资料

### ♫修改个人资料接口

```php
public function modifyProfile()
{
    $data = Request::post();
    $userId = $data['id'];
    $userExist = Db::name('data_user')->where('id', $userId)->find();
    if (!$userExist) {
        return json(['status' => 'error', 'message' => '用户不存在']);
    }
    unset($data['id']);
    try {
        Db::name('data_user')
            ->where('id', $userId)
            ->update($data);  
        return json(['status' => 'success', 'message' => '个人资料更新成功']);
    } catch (\Exception $e) {
        return json([
            'status' => 'error',
            'message' => '更新失败，请稍后重试',
            'error_details' => $e->getMessage()
        ]);
    }
}
```

### ♫修改个人资料HTML

```php
<form onsubmit="return false;" id="modifyMemberProfileForm">
    <input type="text" name="email" value="{$userInfo.email|default=''}">
    <div class="upboxlae"> //头像
        <input type="hidden" name="headimg" value="{$userInfo.headimg|default=''}">
        <input type="file" id="file">
        <img id="img" src="{$userInfo.headimg|default=''}" alt="">
    </div>
    <input type="hidden" name="id" value="{$userInfo.id}">
    <input type="submit" name="" id="submitMemberProfile" value="保存">
</form>
```

### ♫修改个人资料JS

```php
if (document.getElementById('submitMemberProfile')) {
    document.getElementById('submitMemberProfile').addEventListener('click', function () {
        var formData = new FormData(document.getElementById('modifyMemberProfileForm'));

        axios.post('/admin/zhenshangyin/modifyProfile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function (response) {
                if (response.data.status === 'success') { 
                    new ZhenshangyinMessage({
                        message: response.data.message,
                        type: 'success',
                        duration: 2000
                    });
                    setTimeout(function () {
                        window.location.href = "/member";
                    }, 2000);
                } else {
                    new ZhenshangyinMessage({
                        message: response.data.message || '操作失败',
                        type: 'error',
                        duration: 2000
                    });
                }
            })
            .catch(function (error) {
                console.error('There was an error!', error);
            });
    });
}
```

## ♬修改头像直接上传

### ♫修改头像接口

```php
public function uploadImage() {
    $userID = $this->app->session->get('uid');
    $info = DB::name('DataUser')->field('headimg')->where(['id' => $userID])->find();
    $oldImgPath = parse_url($info['headimg'], PHP_URL_PATH);
    $oldImgFullPath = $_SERVER["DOCUMENT_ROOT"] . $oldImgPath;
    $photo = input('post.photo');
    if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $photo, $result)) {
        $type = $result[2];
        $imageFileName = date('His') . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT) . "." . $type;
        $imageDir = 'public/upload/headimg/' . date('Ymd');
        $imageFilePath = $imageDir . '/' . $imageFileName;
        if (!is_dir($imageDir)) {
            if (!mkdir($imageDir, 0777, true)) {
                throw new \RuntimeException(sprintf('Directory "%s" was not created', $imageDir));
            }
        }
        $imageData = base64_decode(str_replace($result[1], '', $photo));
        if (file_put_contents($imageFilePath, $imageData)) {
            DB::name('DataUser')->where('id', $userID)->update(['headimg' => '/' . $imageFilePath]);
            if ($oldImgPath) {
                unlink($oldImgFullPath);
            }
            $this->success("头像修改成功！");
        } else {
            $this->error("头像修改失败！");
        }
    } else {
        $this->error("base64图片格式有误！");
    }
}
```

### ♫修改头像HTML

```php
<img class="avatar" src="{$userInfo.headimg|default=''}">
<input type="file" accept="image/*" id="files">
```

### ♫修改头像JS

```php
if (document.getElementById('files')) {
    document.getElementById('files').addEventListener('change', function () {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.querySelector(".avatar").setAttribute("src", reader.result);//显示头像容器
            var b64 = reader.result;
            axios.post('/admin/zhenshangyin/uploadImage', {
                photo: b64
            })
            .then(function (response) {
                var data = response.data;
                if (data.code > 0) {
                    new ZhenshangyinMessage({ message: data.info, type: 'success', duration: 2000 });
                } else {
                    new ZhenshangyinMessage({ message: data.info, type: 'error', duration: 2000 });
                }
            })
            .catch(function (error) {
                console.error(error);
            });
        }
        reader.readAsDataURL(this.files[0]);
    });
}
```

## ♬微信登录

1. ☂创建文件
2. ☂在config下创建wechat.php，前端没有直接问ai把

```php
<?php
return [
    'appid'  => 'wx97f9b57e1c7752d7',
    'secret' => 'c2fa408c77d0d2e656ec5ae459eb2b2e',
]; 
```

### ♫微信登录接口

```php
 public function getWxLoginQrcode()
    {
        try {
            $appid = config('wechat.appid');
            $redirect_uri = urlencode('https://58zv32ma9990.vicp.fun/admin/zhenshangyin/wxLoginCallback'); //对应得域名
            $state = md5(uniqid(mt_rand(), true));
            session('wx_state', $state);
            $qrcode_url = "https://open.weixin.qq.com/connect/qrconnect?"
                . "appid=" . $appid
                . "&redirect_uri=" . $redirect_uri
                . "&response_type=code"
                . "&scope=snsapi_login"
                . "&state=" . $state
                . "#wechat_redirect";
            \think\facade\Log::info('WX Login URL: ' . $qrcode_url);
            return json(['code' => 1, 'qrcode_url' => $qrcode_url]);
        } catch (\Exception $e) {
            \think\facade\Log::error('WX Login Error: ' . $e->getMessage());
            return json(['code' => 0, 'msg' => '获取二维码失败：' . $e->getMessage()]);
        }
    }

    public function wxLoginCallback()
    {
        try {
            $code = input('code');
            $state = input('state');
            if (empty($code)) {
                throw new \Exception('未获取到授权码');
            }
            if ($state !== session('wx_state')) {
                throw new \Exception('state校验失败');
            }
            $appid = config('wechat.appid');
            $secret = config('wechat.secret');
            $token_url = "https://api.weixin.qq.com/sns/oauth2/access_token?"
                . "appid=" . $appid
                . "&secret=" . $secret
                . "&code=" . $code
                . "&grant_type=authorization_code";
            $response = json_decode(file_get_contents($token_url), true);
            
            if (isset($response['errcode'])) {
                throw new \Exception($response['errmsg']);
            }
            $access_token = $response['access_token'];
            $openid = $response['openid'];
            $unionid = $response['unionid'] ?? ''; 
            $user_info_url = "https://api.weixin.qq.com/sns/userinfo?"
                . "access_token=" . $access_token
                . "&openid=" . $openid;
            $user_info = json_decode(file_get_contents($user_info_url), true);
            if (isset($user_info['errcode'])) {
                throw new \Exception($user_info['errmsg']);
            }
            $user = Db::name('data_user')->where('openid', $openid)->find();
            if (!$user) {
                $nickname = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $user_info['nickname']);
                $nickname = mb_substr(mb_convert_encoding($nickname, 'UTF-8', 'UTF-8'), 0, 50);
                if (empty(trim($nickname))) {
                    $nickname = '微信用户_' . substr($openid, -6);
                }
                $user_data = [
                    'openid' => $openid,  // 注意数据库字段别落下
                    'unionid' => $unionid,
                    'nickname' => $nickname,
                    'headimg' => $user_info['headimgurl'],
                    'status' => 1,
                    'create_at' => date('Y-m-d H:i:s')
                ];
                $user_id = Db::name('data_user')->insertGetId($user_data);
                $user = Db::name('data_user')->where('id', $user_id)->find();
            }
            session('uid', $user['id']);
            return redirect('/');
        } catch (\Exception $e) {
            $this->error('微信登录失败：' . $e->getMessage());
        }
    }
```

### ♫微信登录HTML

```php
<button class="wx_login">登录</button>
<div id="qrcode_container"></div>
<script>
    function showWxLogin() {
        getWxQrCode();
    }
    function getWxQrCode() {
        fetch('/admin/zhenshangyin/getWxLoginQrcode')
            .then(response => response.json())
            .then(data => {
                if (data.code === 1) {
                    const container = document.getElementById('qrcode_container');
                    container.innerHTML = `<iframe src="${data.qrcode_url}" width="300" height="400" frameborder="0"></iframe>`;
                } else {
                    alert('获取二维码失败，请重试');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('获取二维码失败，请重试');
            });
    }
    document.addEventListener('DOMContentLoaded', function () {
        const loginButtons = document.querySelectorAll('.wx_login');
        loginButtons.forEach(button => {
            button.addEventListener('click', showWxLogin);
        });
    });
</script>
```

## ♬退出

### ♫退出接口

```php
public function logout()
{
    $this->app->session->delete('uid');
    $this->app->session->delete('userInfo');
    $this->success('退出成功');
}
```

### ♫退出JS

```php
if (document.getElementById('logOut')) {
    document.getElementById('logOut').addEventListener('click', function () {
        axios.post("/admin/zhenshangyin/logout", {})
            .then(function (response) {
                const data = response.data;
                if (data.code > 0) {
                    new ZhenshangyinMessage({
                        message: '退出成功!',
                        type: 'success',
                        duration: 2000,
                    });
                    setTimeout(() => window.location = '/', 2000);
                }
            })
            .catch(function () {
                new ZhenshangyinMessage({
                    message: '登出失败，请稍后再试！',
                    type: 'warning',
                    duration: 2000,
                });
            });
    });
}
```

# 搜索

## ♬搜索接口，注意路由

```php
public function search()
{
    if (!request()->isPost()) {
        return json(['code' => 0, 'msg' => 'Invalid request method']);
    }

    $keyword = input('keyword');
    $page = input('page', 1);
    $limit = input('limit', 10);  // 从请求中获取 limit 参数

    // 搜索产品表
    $products = Db::name('data_article_show_chanpin')
        ->where('status', 1)
        ->where('title|content', 'like', "%{$keyword}%")
        ->field('id, cat_id, title, zhaiyao as zhaiyao, logol, create_at, content')
        ->select()
        ->toArray();

    // 搜索新闻表  
    $news = Db::name('data_article_show_xinwen')
        ->where('status', 1)
        ->where('title|content', 'like', "%{$keyword}%")
        ->field('id, cat_id, title, zhaiyao as zhaiyao, logol, create_at, content')
        ->select()
        ->toArray();

    // 处理URL和数据
    foreach ($products as &$item) {
        $item['type'] = 'product';
        $item['url'] = "/site-List/show-" . $item['cat_id'] . "-" . $item['id'] . ".html";
    }
    
    foreach ($news as &$item) {
        $item['type'] = 'news'; 
        $item['url'] = "/site-List/show-" . $item['cat_id'] . "-" . $item['id'] . ".html";
    }

    $results = array_merge($products, $news);
    
    // 按创建时间排序
    usort($results, function($a, $b) {
        return strtotime($b['create_at']) - strtotime($a['create_at']);
    });

    // 分页处理
    $total = count($results);
    $offset = ($page - 1) * $limit;
    $results = array_slice($results, $offset, $limit);

    return json([
        'code' => !empty($results) ? 1 : 0,
        'msg' => !empty($results) ? 'success' : 'No results found',
        'data' => $results,
        'total' => $total
    ]);
}
```

## ♬搜索HTML

```php
<div class="search_form">
    <input type="text" name="keyword" id="searchKeyword" placeholder="Please enter keywords..." class="suosouaa_s">
    <button type="button" id="searchBtn" class="suosouaa_t">search</button>
</div>
```

## ♬搜索结果页

```php
<ul id="searchResults" data-page="5">
</ul>
<div class="pagination">
    <button id="prev-page" disabled></button>
    <div id="page-buttons"></div>
    <button id="next-page" disabled></button>
</div>
```

## ♬搜索JS

```php
$('#searchBtn').click(function () {
    performSearch();
});
$('#searchKeyword').keypress(function (e) {
    if (e.which == 13) {
        performSearch();
    }
});
function performSearch() {
    var keyword = $('#searchKeyword').val().trim();
    if (keyword) {
        window.location.href = '/search?keyword=' + encodeURIComponent(keyword);
    }
}

if (document.getElementById('searchResults')) {
    document.addEventListener('DOMContentLoaded', function () {
        const searchResults = document.getElementById('searchResults');
        const pageButtons = document.getElementById('page-buttons');
        let currentPage = 1;
        let totalPages = 1;
        let pageSize = parseInt(searchResults.dataset.page) || 10;
        let totalItems = 0;
        function updatePaginationControls() {
            document.getElementById('prev-page').disabled = currentPage <= 1;
            document.getElementById('next-page').disabled = currentPage >= totalPages;
        }
        function generatePageButtons() {
            pageButtons.innerHTML = '';
            const addRange = (start, end) => {
                for (let i = start; i <= end; i++) {
                    const button = document.createElement('button');
                    button.textContent = i;
                    button.disabled = i === currentPage;
                    button.addEventListener('click', () => goToPage(i));
                    pageButtons.appendChild(button);
                }
            };
            if (totalPages <= 7) {
                addRange(1, totalPages);
            } else {
                if (currentPage <= 5) {
                    addRange(1, 5);
                    pageButtons.appendChild(document.createTextNode('...'));
                    addRange(totalPages, totalPages);
                } else if (currentPage > 5 && currentPage < totalPages - 4) {
                    addRange(1, 2);
                    pageButtons.appendChild(document.createTextNode('...'));
                    addRange(currentPage - 1, currentPage + 1);
                    pageButtons.appendChild(document.createTextNode('...'));
                    addRange(totalPages - 1, totalPages);
                } else {
                    addRange(1, 1);
                    pageButtons.appendChild(document.createTextNode('...'));
                    addRange(totalPages - 4, totalPages);
                }
            }
        }
        function loadSearchResults(page) {
            const urlParams = new URLSearchParams(window.location.search);
            const keyword = urlParams.get('keyword');
            const formData = new FormData();
            formData.append('keyword', keyword);
            formData.append('page', page);
            formData.append('limit', pageSize);
            axios.post('/admin/zhenshangyin/search', formData)
                .then(function (response) {
                    console.log('Search response:', response.data);
                    const paginationContainer = document.querySelector('.pagination');
                    if (response.data.code === 0) {
                        searchResults.innerHTML = '<div class="no-results">No results found.</div>';
                        if (paginationContainer) {
                            paginationContainer.remove();
                        }
                        return;
                    }
                    if (response.data.code === 1) {
                        const { data: results, total } = response.data;
                        let html = '';
                        if (!results || results.length === 0) {
                            searchResults.innerHTML = '<div class="no-results">No results found.</div>';
                            if (paginationContainer) {
                                paginationContainer.remove();
                            }
                            return;
                        }
                        results.forEach(function (item) {
                            html += `
                            <li>
                                <a href="${item.url}">
                                    <div class="Xinwen_left A" style="width: 65%">
                                        <h2>${item.title}</h2>
                                        <span>发布时间：${formatDate(item.create_at)}</span>
                                        <p>${item.zhaiyao || ''}</p>
                                    </div>
                                    ${item.logol ? `<img class="S" src="${item.logol}" alt="" style="width: 30%;">` : ''}
                                </a>
                            </li>
                        `;
                        });
                        totalItems = total;
                        totalPages = Math.ceil(totalItems / pageSize);
                        searchResults.innerHTML = html;
                        updatePaginationControls();
                        generatePageButtons();
                    }
                })
                .catch(function (error) {
                    console.error('Axios error:', error);
                    searchResults.innerHTML = '<div class="no-results">An error occurred while searching.</div>';
                    const paginationContainer = document.querySelector('.pagination');
                    if (paginationContainer) {
                        paginationContainer.remove();
                    }
                });
        }
        function goToPage(page) {
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                loadSearchResults(page);
            }
        }
        // 日期格式化
        function formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('zh-CN');
        }
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) goToPage(currentPage - 1);
        });
        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < totalPages) goToPage(currentPage + 1);
        });
        loadSearchResults(currentPage);
    });
}
```

# 收藏

## ♬数据库插入语句，【创建数据表favorites】

```sql
CREATE TABLE `favorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,  -- 自增主键
    `user_id` INT NOT NULL,               -- 用户ID
    `article_id` INT NOT NULL,            -- 文章ID
    UNIQUE (`user_id`, `article_id`)      -- 用户不能重复收藏同一篇文章
);
```

## ♬收藏接口

```php
//初始化列表，需要分页等其他功能另加
public function getCatArticleZhenaa($catId = 0, $num = 9999, $page = 1, $title = '') 
{
    // Get content template ID and table name
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // If category ID is 0, use default model table
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // If table name doesn't exist, return false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => []]);
    }

    $tableName = strtolower($tableName);
    $where = ['status' => 1];

    // Category ID condition
    if (!empty($catId)) {
        $where['cat_id'] = $catId;
    }

    // Fetch all data without pagination
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->order("id desc")
        ->select()
        ->toArray();

    // Add link items
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    return json([
        'total' => count($list), // Return total count of items
        'items' => $list ?? []  // Ensure it returns an empty array even if there's no data
    ]);
}

// 收藏文章
public function addFavorite($articleId) {
    // 获取当前登录用户的ID
    $userID = $this->app->session->get('uid');
    if (empty($userID)) {
        return json(['message' => '请登录后收藏'], 400); // 用户未登录
    }

    // 判断用户是否已收藏该文章
    $existing = $this->app->db->name('user_favorites')
        ->where(['user_id' => $userID, 'article_id' => $articleId])
        ->find();

    if ($existing) {
        return json(['message' => '您已经收藏过此文章'], 400); // 如果已收藏，返回提示
    }

    // 向收藏表插入记录
    $this->app->db->name('user_favorites')->insert([
        'user_id' => $userID,
        'article_id' => $articleId
    ]);

    return json(['message' => '收藏成功']);
}


public function collectArticle() {
    $articleId = input('article_id'); // 获取文章ID
    if (empty($articleId)) {
        return json(['message' => '无效的文章ID'], 400);
    }

    return $this->addFavorite($articleId);
}


//收藏记录
public function getUserFavorites() {
    // 获取当前登录用户的ID
    $userID = $this->app->session->get('uid');
    if (empty($userID)) {
        return json(['message' => '请登录后查看收藏'], 400); // 用户未登录
    }
    
    // 获取用户收藏的文章ID列表
    $favorites = $this->app->db->name('user_favorites')
        ->where('user_id', $userID)
        ->select()
        ->toArray();
    
    // 如果没有收藏
    if (empty($favorites)) {
        return json(['message' => '没有收藏的文章'], 200);
    }
    
    // 获取文章的详细信息
    $articleIds = array_column($favorites, 'article_id');
    $articles = $this->app->db->name('data_article_show_moren')  // 假设您的文章表是 data_article_show
        ->whereIn('id', $articleIds)
        ->select()
        ->toArray();

    return json(['message' => '获取成功', 'items' => $articles]);
}


//删除收藏
public function removeFavorite($articleId) {
    // 获取当前登录用户的ID
    $userID = $this->app->session->get('uid');
    if (empty($userID)) {
        return json(['message' => '请登录后操作'], 400); // 用户未登录
    }

    // 判断用户是否已收藏该文章
    $existing = $this->app->db->name('user_favorites')
        ->where(['user_id' => $userID, 'article_id' => $articleId])
        ->find();

    if (!$existing) {
        return json(['message' => '您还没有收藏此文章'], 400); // 如果未收藏，返回提示
    }

    // 从收藏表中删除记录
    $this->app->db->name('user_favorites')
        ->where(['user_id' => $userID, 'article_id' => $articleId])
        ->delete();

    return json(['message' => '取消收藏成功']);
}

// 取消收藏接口
public function uncollectArticle() {
    $articleId = input('article_id'); // 获取文章ID
    if (empty($articleId)) {
        return json(['message' => '无效的文章ID'], 400);
    }

    return $this->removeFavorite($articleId);
}
```

## ♬前端列表

```php
<div id="container"></div>

<script>
    const dataContainer = document.getElementById('container');
    let favoriteArticles = [];

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => {
                const isFavorite = favoriteArticles.includes(item.id);
                return `
                    <div class="Min">
                        <img src="${item.logo}" />
                        <h2>${item.title}</h2>
                        <button onclick="${isFavorite ? `removeFavorite(${item.id})` : `addFavorite(${item.id})`}">
                            ${isFavorite ? '取消收藏' : '收藏'}
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleZhenaa', {
            cat_id: '3',
            num: 9999,
            page: 1
        })
            .then(response => {
                const { items } = response.data;
                if (response.data) {
                    renderItems(items);
                } else {
                    console.error("后端数据格式错误或无数据返回");
                }
            })
            .catch(error => {
                console.error("请求失败", error);
            });
    }

    // 获取用户已收藏的文章
    function getUserFavorites() {
        axios.post('/admin/zhenshangyin/getUserFavorites')
            .then(response => {
                const { items } = response.data;
                if (Array.isArray(items)) {
                    favoriteArticles = items.map(item => item.id);
                } else {
                    favoriteArticles = [];
                }
                loadData();
            })
            .catch(error => {
                console.error("获取收藏失败", error);
                favoriteArticles = [];
                loadData();
            });
    }

    function addFavorite(articleId) {
        axios.post('/admin/zhenshangyin/collectArticle', {
            article_id: articleId
        })
            .then(response => {
                new ZhenshangyinMessage({
                    message: response.data.message,
                    type: 'success',
                    duration: 2000,
                });
                favoriteArticles.push(articleId); 
                loadData();
            })
            .catch(error => {
                new ZhenshangyinMessage({
                    message: error.response.data.message,
                    type: 'error',
                    duration: 2000,
                });
            });
    }

    function removeFavorite(articleId) {
        axios.post('/admin/zhenshangyin/uncollectArticle', {
            article_id: articleId
        })
            .then(response => {
                new ZhenshangyinMessage({
                    message: response.data.message,
                    type: 'success',
                    duration: 2000,
                });
                favoriteArticles = favoriteArticles.filter(id => id !== articleId);
                loadData();
            })
            .catch(error => {
                new ZhenshangyinMessage({
                    message: error.response.data.message,
                    type: 'error',
                    duration: 2000,
                });
            });
    }

    document.addEventListener('DOMContentLoaded', () => {
        getUserFavorites(); // 获取用户收藏列表
    });
</script>
```

## ♬我的收藏

```php
<div id="container"></div>

<script>
    const favoritesContainer = document.getElementById('container');
    let favoriteArticles = []; 

    function renderFavorites(favorites) {
        if (!favorites || favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>没有收藏的文章</p>';
        } else {
            favoritesContainer.innerHTML = favorites.map(item => {
                const isFavorite = favoriteArticles.includes(item.id);
                return `
                    <div class="Min">
                        <img src="${item.logo}" alt="${item.title}" />
                        <h2>${item.title}</h2>
                        <button onclick="${isFavorite ? `removeFavorite(${item.id})` : `addFavorite(${item.id})`}">
                            ${isFavorite ? '取消收藏' : '收藏'}
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    function loadFavorites() {
        axios.post('/admin/zhenshangyin/getUserFavorites')
        .then(response => {
            const { items } = response.data;
            favoriteArticles = items.map(item => item.id);
            renderFavorites(items);
        })
        .catch(error => {
            favoritesContainer.innerHTML = '<p>没有收藏的文章</p>';
            console.error(error);
        });
    }

    function addFavorite(articleId) {
        axios.post('/admin/zhenshangyin/collectArticle', { article_id: articleId })
        .then(response => {
            new ZhenshangyinMessage({
                message: response.data.message,
                type: 'success',
                duration: 2000,
            });
            favoriteArticles.push(articleId);
            loadFavorites();
        })
        .catch(error => {
            new ZhenshangyinMessage({
                message: error.response.data.message,
                type: 'error',
                duration: 2000,
            });
        });
    }

    function removeFavorite(articleId) {
        axios.post('/admin/zhenshangyin/uncollectArticle', { article_id: articleId })
        .then(response => {
            console.log(response.data.message);
            new ZhenshangyinMessage({
                message: response.data.message,
                type: 'success',
                duration: 2000,
            });
            favoriteArticles = favoriteArticles.filter(id => id !== articleId);
            loadFavorites();
        })
        .catch(error => {
            new ZhenshangyinMessage({
                message: error.response.data.message,
                type: 'error',
                duration: 2000,
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadFavorites();
    });
</script>
```

# 评论

## ♬数据库插入语句，【创建数据表comments】

```sql
-- 创建评论表 comments
CREATE TABLE `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,  -- 自增主键，评论ID
  `article_id` INT NOT NULL,            -- 关联文章的ID，外键约束为 data_article_show_moren 表的 id 字段
  `user_id` INT NULL,                   -- 用户ID，允许为空，表示评论者的用户ID
  `content` TEXT NOT NULL,              -- 评论内容
  `username` TEXT NOT NULL,             -- 用户名，用于记录评论者的账号名
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间，默认当前时间戳
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新时间，在记录更新时自动更新为当前时间戳
  FOREIGN KEY (`article_id`) REFERENCES `data_article_show_moren`(`id`) ON DELETE CASCADE  -- 外键，引用 data_article_show_moren 表的 id 字段，删除文章时删除相关评论
);
```

## ♬评论接口，后端

```php
// 获取评论列表
public function getComments() {
    $articleId = input('article_id');
    if (empty($articleId)) {
        return json(['message' => '无效的文章ID'], 400);
    }
    
    $userID = $this->app->session->get('uid');
    
    $comments = $this->app->db->name('comments')
        ->where('article_id', $articleId)
        ->select()
        ->toArray();

    return json([
        'items' => $comments,
        'is_user_logged_in' => !empty($userID),
        'user_id' => $userID
    ]);
}

// 提交评论
public function addComment() {
    $articleId = input('article_id');
    $content = input('content');
    $userID = $this->app->session->get('uid');
    
    if (empty($userID)) {
        return json(['message' => '请登录后评论'], 400);
    }
    
    if (empty($content)) {
        return json(['message' => '评论内容不能为空'], 400);
    }

    // 获取用户账号（用户名）可自由添加，评论数据库也要增加字段
    $username = $this->app->session->get('userInfo')['username'];

    $this->app->db->name('comments')->insert([
        'article_id' => $articleId,
        'content' => $content,
        'user_id' => $userID,
        'username' => $username,  // 插入用户名
        'created_at' => date('Y-m-d H:i:s'),
    ]);
    
    return json(['message' => '评论提交成功']);
}


// 删除评论
public function deleteComment() {
    $commentId = input('comment_id');
    $userID = $this->app->session->get('uid');
    
    if (empty($userID)) {
        return json(['message' => '请登录后删除评论'], 400);
    }
    
    $comment = $this->app->db->name('comments')
        ->where('id', $commentId)
        ->find();
    
    if (!$comment) {
        return json(['message' => '评论不存在'], 400);
    }
    
    if ($comment['user_id'] !== $userID) {
        return json(['message' => '您只能删除自己的评论'], 400);
    }

    $this->app->db->name('comments')->where('id', $commentId)->delete();

    return json(['message' => '删除成功']);
}
```

## ♬添加user_comments_modal.html模板

```php
<div class="layui-timeline" style="padding: 20px">
    {volist name="comments" id="comment"}
    <div class="layui-timeline-item">
        <i class="layui-icon layui-timeline-axis">&#xe63f;</i>
        <div class="layui-timeline-content layui-text">
            <h4 class="layui-timeline-title">评论时间：{$comment.created_at}</h4>
            <p><strong>内容：</strong> {$comment.content}</p>
            <div class="layui-btn-group">
                <button class="layui-btn layui-btn-danger layui-btn-sm delete-comment-btn" data-value="{$comment.id}"
                    data-confirm="确定要删除这条评论吗？">删除评论</button>
            </div>
        </div>
    </div>
    {/volist}
</div>

<script>
    layui.use(['jquery', 'layer'], function () {
        var $ = layui.jquery;
        var layer = layui.layer;

        $('.delete-comment-btn').on('click', function () {
            var commentId = $(this).data('value');
            console.log("评论ID:", commentId);
            var url = "/admin/Zhenshangyin/remove_comment";

            layer.confirm('确定要删除这条评论吗？', function (index) {
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: { comment_id: commentId },
                    success: function (response) {
                        console.log(response); 
                        if (response.message === '评论删除成功') {
                            layer.msg('评论删除成功');
                            $('button[data-value="' + commentId + '"]').closest('.layui-timeline-item').remove();
                        } else {
                            layer.msg(response.message || '删除失败');
                        }
                    },
                    error: function () {
                        layer.msg('请求失败，请稍后重试');
                    }
                });

                layer.close(index);
            });
        });
    });
</script>
```

## ♬后台添加查看按钮

```php
<a data-title="查看评论" class="layui-btn layui-btn-sm layui-btn-primary" data-modal='/admin/zhenshangyin/get_user_comments?article_id={$vo.id}'>查看评论</a> // 内容模板
<a data-title="查看评论" class="layui-btn layui-btn-sm layui-btn-primary" data-modal='/admin/zhenshangyin/get_user_comments?user_id={$vo.id}'>查看评论</a> // 会员模板
```

## ♬评论接口，前端

```php
/**
 * 获取用户的评论列表//后台
 * @auth true
 * @param int $user_id 用户ID
 * @param int $article_id 文章ID
 * @return mixed
 */
public function get_user_comments()
{
    $userId = input('user_id');
    $articleId = input('article_id');

    // 判断输入参数是否合法
    if (empty($userId) && empty($articleId)) {
        return json(['message' => '无效的用户ID或文章ID'], 400);
    }

    // 构建查询条件
    $query = $this->app->db->name('comments');
    
    if (!empty($userId)) {
        $query->where('user_id', $userId);
    }
    
    if (!empty($articleId)) {
        $query->where('article_id', $articleId);
    }

    // 获取评论数据
    $comments = $query
        ->order('created_at', 'desc')
        ->select()
        ->toArray();

    // 渲染模板并传递评论数据
    $this->assign('comments', $comments);
    return $this->fetch('/page/user_comments_modal');  // 指定模板的相对路径
}

public function remove_comment()
{
    $commentId = input('comment_id');  // 获取要删除的评论ID
    
    if (empty($commentId)) {
        return json(['message' => '无效的评论ID'], 400);  // 如果没有传入有效的评论ID，返回错误信息
    }

    // 删除评论
    $result = Db::name('comments')->where('id', $commentId)->delete();

    if ($result) {
        return json(['code' => 200, 'message' => '评论删除成功'], 200);
    } else {
        return json(['message' => '评论删除失败'], 500);
    }
}
```

## HTML

```php
<div class="comments-section">
    <div id="comments-container"></div>
    <div id="add-comment">
        <textarea id="comment-input" placeholder="请输入评论内容" rows="4"></textarea><br>
        <button id="submit-comment">提交评论</button>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const articleId = {$article.id};
        const commentInput = document.getElementById('comment-input');
        const commentsContainer = document.getElementById('comments-container');
        const submitButton = document.getElementById('submit-comment');
        const addCommentSection = document.getElementById('add-comment');

        let isLoggedIn = false;
        function loadComments() {
            axios.post('/admin/zhenshangyin/getComments', { article_id: articleId })
                .then(response => {
                    const { items, is_user_logged_in, user_id } = response.data;
                    
                    isLoggedIn = is_user_logged_in;

                    addCommentSection.style.display = 'block';

                    renderComments(items, user_id);
                })
                .catch(error => {
                    console.error("请求失败", error);
                });
        }

        function renderComments(comments, loggedInUserId) {
            if (!comments || comments.length === 0) {
                commentsContainer.innerHTML = '<p>暂无评论</p>';
            } else {
                commentsContainer.innerHTML = comments.map(comment => `
                <div class="comment" data-comment-id="${comment.id}">
                    <p>${comment.username}</p>
                    <p>${comment.content}</p>
                    <small>发表于 ${comment.created_at}</small>
                    ${comment.user_id && loggedInUserId === comment.user_id ?
                        `<button onclick="deleteComment(${comment.id})">删除</button>` : ''}
                </div>
            `).join('');
            }
        }

        // 提交评论
        function submitComment() {
            if (!isLoggedIn) {
                new ZhenshangyinMessage({
                    message: '请登录后评论！',
                    type: 'warning',
                    duration: 2000
                });
                return;
            }

            const content = commentInput.value.trim();

            if (!content) {
                new ZhenshangyinMessage({
                    message: '评论内容不能为空！',
                    type: 'warning',
                    duration: 2000
                });
                return;
            }

            axios.post('/admin/zhenshangyin/addComment', {
                article_id: articleId,
                content: content
            })
                .then(response => {
                    new ZhenshangyinMessage({
                        message: response.data.message,
                        type: 'success',
                        duration: 2000
                    });

                    commentInput.value = '';
                    
                    loadComments();
                })
                .catch(error => {
                    new ZhenshangyinMessage({
                        message: error.response.data.message,
                        type: 'error',
                        duration: 2000
                    });
                });
        }

        window.deleteComment = function (commentId) {
            axios.post('/admin/zhenshangyin/deleteComment', { comment_id: commentId })
                .then(response => {
                    new ZhenshangyinMessage({
                        message: response.data.message,
                        type: 'success',
                        duration: 2000
                    });

                    loadComments();
                })
                .catch(error => {
                    new ZhenshangyinMessage({
                        message: error.response.data.message,
                        type: 'error',
                        duration: 2000
                    });
                });
        }

        submitButton.addEventListener('click', submitComment);

        loadComments();
    });
</script>
```

# 下拉加载更多

## ♬下拉加载更多接口

```php
public function getCatArticle($catId = 0, $num = 0, $is_best = 0, $offset = 0)
{
    // 获得栏目对应的数据表和链接名称
    $categoryData = $this->app->db->name('DataArticleCate')
        ->where(["id" => $catId])
        ->field('content_template_id, link_name')
        ->find();

    $linkName = $categoryData['link_name'] ?? 'List';  // 设置默认链接名称
    $tableName = $this->app->db->name('DataTemplate')
        ->where(["id" => $categoryData['content_template_id']])
        ->value("table_name") ?: 'data_article_show_default';  // 设置默认数据表名

    if (!$tableName) {
        return false;
    }

    $tableName = strtolower($tableName); // 表名转小写
    $where = ['status' => 1];  // 初始化查询条件
    if ($catId) $where['cat_id'] = $catId;  // 栏目 ID 条件
    if ($is_best) $where['is_best'] = $is_best;  // 推荐标识条件

    // 分页查询
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("is_best desc, sort desc, id desc")
        ->select()
        ->toArray();

    // 处理列表增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-" . $linkName . "/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
        foreach ($value as $k => $v) {
            if (strpos($v, "|") !== false) {
                $list[$key][$k] = explode("|", $v);  // 将 '|' 符号分割为数组
            }
        }
    }

    return $list;
}
```

## ♬前端HTML

```php
<button class="Request">请求更多数据</button>
<div class="Data"></div> 

<script>
    const dataContainer = document.querySelector('.Data');
    const requestButton = document.querySelector('.Request');
    let offset = 0;
    let noMoreData = false;
    let isLoading = false;

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function createItemHTML(item) {
        return `
            <div class="item">
                <h2>${item.title}</h2>
                日期：${formatDate(item.create_at)} 
                <a href="/index/Article/show/cat_id/${item.cat_id}/id/${item.id}">MORE</a>
            </div>
        `;
    }

    function loadData(num) {
        if (noMoreData || isLoading) return;
        isLoading = true;

        axios.post('/admin/zhenshangyin/getCatArticle', {
            cat_id: '1',
            num: num,
            offset: offset
        })
        .then(response => {
            const data = response.data;
            if (data.length === 0) {
                noMoreData = true;
                console.log("没有更多数据了");
                return;
            }

            const html = data.map(createItemHTML).join('');
            dataContainer.insertAdjacentHTML('beforeend', html);
            offset += data.length;
        })
        .catch(error => {
            console.error('加载数据时发生错误: ', error.message || error);
        })
        .finally(() => {
            isLoading = false;
        });
    }

    loadData(5);  // 初次加载 5 条数据

    requestButton.addEventListener('click', function () {
        loadData(3);  // 点击后每次加载 3 条数据
    });
</script>
```

# 下载量+1

## ♬接口

```php
public function download_file() {
    $aid = $this->request->param('id');
    Db::name("data_article_show_moren")->where('id', $aid)->inc('xiazailiang', 1)->update();
}
```

## ♬HTML

```php
<a href="{$atc.wenjian}" class="downurl" download="{$atc.title}" data-id="{$atc.id}" data-down="{$atc.xiazailiang}"></a>     /** {$atc.xiazailiang}下载量字段 **/
```

## ♬JS

```php
<script>
   document.addEventListener('click', function (event) {
        if (event.target.classList.contains('downurl')) {
            var is_down = parseInt(event.target.getAttribute("data-down"));
            var id = event.target.getAttribute("data-id");

            axios.post('/index/zhenshangyin/download_file', {
                id: id
            })
                .then(function (response) {
                    var data = response.data;
                    if (data.code > 0) {
                        new ZhenshangyinMessage({
                            message: data.info,
                            type: 'success',
                            duration: 2000
                        }, function () {
                            window.open(data.data);
                        });
                    } else {
                        new ZhenshangyinMessage({
                            message: data.info,
                            type: 'error',
                            duration: 2000 
                        });
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    new ZhenshangyinMessage({
                        message: '请求失败',
                        type: 'error',
                        duration: 2000
                    });
                });
        }
    });
</script>
```

# 随机换一换

## ♬接口

1. Custom.php 替换 》获得指定栏目图文列表信息⋙可以不替换，直接加，getCatArticle接口名换一个

```php
/**
 * 获得指定栏目图文列表信息
 * @param string $catId 栏目ID
 * @param string $num 查询条数
 */
public function getCatArticle($catId = 0, $num = 4)
{
    // 获取内容模板表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $linkName = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("link_name");

    // 如果 link_name 为空，则设置默认值
    if (empty($linkName)) {
        $linkName = "List";
    }

    // 获取表名
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为空，使用默认表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名为空，返回false
    if (empty($tableName)) {
        return false;
    } else {
        $tableName = strtolower($tableName);  // 转小写
    }

    // 查询条件
    $where = ['status' => 1];
    if (!empty($catId)) {
        $where['cat_id'] = $catId;
    }

    // 查询随机的指定数量的记录
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($num)  // 查询指定条数
        ->orderRaw('RAND()')  // 随机排序
        ->select()
        ->toArray();

    // 处理列表增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-" . $linkName . "/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
        foreach ($value as $k => $v) {
            if (!empty($v) && strpos($v, "|") !== false) {
                // 处理字段内是否有“|”符号，如果有则拆分成数组
                $list[$key][$k] = explode("|", $v);
            }
        }
    }

    // 返回数据
    return [
        'items' => $list
    ];
}
```

## ♬HTML

```php
<div id="data-container"></div>
<button id="switch-items">换一换</button>

<script>
    const dataContainer = document.getElementById('data-container');
    const switchButton = document.getElementById('switch-items');

    function renderItems(items) {
        dataContainer.innerHTML = items.length === 0 ? '<p>没有更多数据</p>' :
            items.map(item => `
                <div class="Min">
                    <h2>${item.title || ''}</h2>
                </div>
            `).join('');
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticle', {
            cat_id: '1',
            num: 4  // 每次显示4条
        })
        .then(response => {
            const { items } = response.data;
            renderItems(items);  // 显示随机4条数据
        })
        .catch(error => console.error("请求失败", error));
    }

    // 点击按钮时重新加载数据
    switchButton.addEventListener('click', () => {
        loadData();  // 切换随机数据
    });

    // 初始页面加载时显示4条数据
    document.addEventListener('DOMContentLoaded', () => {
        loadData();  // 初次加载数据
    });
</script>
```

# 点击显示详细信息

## ♬接口

```php
public function getArticleDetail($id = 0)
{
    try {
        if (empty($id)) {
            return json(['status' => 'error', 'message' => 'Invalid article ID']);
        }

        // 查询文章的 cat_id
        $articleInfo = $this->app->db->name('data_article_show_moren')
            ->where(['id' => $id])
            ->field('cat_id')
            ->find();

        if (!$articleInfo || empty($articleInfo['cat_id'])) {
            return json(['status' => 'error', 'message' => 'Category not found for this article']);
        }

        $catId = $articleInfo['cat_id'];

        // 获取内容模板的 ID
        $contentTemplateId = $this->app->db->name('DataArticleCate')
            ->where(['id' => $catId])
            ->value('content_template_id');

        if (empty($contentTemplateId)) {
            return json(['status' => 'error', 'message' => 'Template not found for this category']);
        }

        // 获取数据表名
        $tableName = $this->app->db->name('DataTemplate')
            ->where(['id' => $contentTemplateId])
            ->value('table_name');

        if (empty($tableName)) {
            return json(['status' => 'error', 'message' => 'Table name not found for this template']);
        }

        $tableName = strtolower($tableName);

        // 根据动态获取的表名查询文章详细信息
        $article = $this->app->db->name($tableName)
            ->where(['id' => $id, 'status' => 1])
            ->find();

        if (!$article) {
            return json(['status' => 'error', 'message' => 'Article not found']);
        }

        foreach ($article as $key => $value) {
            if (!empty($value) && strpos($value, "|") !== false) {
                $article[$key] = explode("|", $value);
            }
        }

        // 获取链接名称
        $linkName = $this->app->db->name('DataArticleCate')
            ->where(['id' => $catId])
            ->value('link_name');
        if (empty($linkName)) {
            $linkName = "List";
        }

        // 生成文章链接
        $article['url'] = "site-" . $linkName . "/show-" . $catId . "-" . $id . ".html";

        return json(['status' => 'success', 'data' => $article]);
    } catch (\Exception $e) {
        return json(['status' => 'error', 'message' => 'An unexpected error occurred', 'details' => $e->getMessage()]);
    }
}
```

## ♬HTML

```php
<div class="LieBiao">
    <div id="container">
        {foreach name="function->getCatArticle('3')" key='n' item="art"}
        <div class="Min" data-id="{$art.id}">
            <img src="{$art.logo}" alt="Article Image" />
            <h2>{$art.title}</h2>
        </div>
        {/foreach}
    </div>
</div>
<script>
    document.addEventListener('click', function (event) {
        var minElement = event.target.closest('.Min');
        if (minElement) {
            var articleId = minElement.getAttribute('data-id');
            console.log("Article ID:", articleId);

            axios.post('/admin/zhenshangyin/getArticleDetail', { id: articleId })
                .then(function (response) {
                    console.log("Received response:", response.data);
                    if (response.data.status === 'success' && response.data.data) {
                        var article = response.data.data;

                        // 查找是否已经存在 TanChu div
                        var tanChuDiv = document.querySelector('.TanChu');
                        if (!tanChuDiv) {
                            // 如果不存在，则创建新的 TanChu div
                            tanChuDiv = document.createElement('div');
                            tanChuDiv.className = 'TanChu'; // 设置类名
                            document.body.appendChild(tanChuDiv); // 将新 div 添加到页面底部
                        }

                        // 更新 TanChu div 的内容
                        tanChuDiv.innerHTML = `
                            <div class="TanChu_Max">
                                <h2>${article.title}</h2>
                                <img src="${article.logo}" alt="${article.title}"/>
                            </div>
                            <div class="GuanBi">
                                <svg t="1729150450032" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5127">
                                    <path
                                    d="M604.16 512l110.08-110.08a64 64 0 0 0-90.24-90.88L512 421.76 403.2 311.04a64 64 0 0 0-90.24 90.88L423.04 512 312.96 622.08a64 64 0 1 0 90.24 90.88L512 602.24l110.08 110.08a64 64 0 0 0 90.24-90.24z"
                                    p-id="5128" fill="#ffffff"></path>
                                </svg>
                            </div>
                        `;
                        tanChuDiv.querySelector('.GuanBi').addEventListener('click', function () {
                            tanChuDiv.remove();
                        });
                    } else {
                        console.error("Unexpected response format or missing data.");
                    }
                })
                .catch(function (error) {
                    console.error("AJAX request failed. Error:", error);
                });
        }
    });

</script>
```

# 简单分页

## ♬接口

```php
public function getCatArticlePageJi($catId = 0, $num = 0, $page = 1)
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => []]);
    }

    $tableName = strtolower($tableName);
    $where = ['status' => 1];

    // 栏目ID条件
    if (!empty($catId)) {
        $where['cat_id'] = $catId;
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("id desc")
        ->select()
        ->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 返回数据结构
    return json([
        'total' => $total,
        'items' => $list ?? []  // 确保即使无数据也返回空数组
    ]);
}
```

## ♬HTML

```php
<div id="container" data-id="{$catId}" data-page="5"></div>
<div id="pagination-controls">
    <button id="prev-page" disabled>上一页</button>
    <div id="page-buttons"></div>
    <button id="next-page" disabled>下一页</button>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const pageButtons = document.getElementById('page-buttons');
    const page = document.getElementById('container').getAttribute('data-page');
    let currentPage = 1, totalPages = 1, pageSize = 2, totalItems = 0;

    function updatePaginationControls() {
        document.getElementById('prev-page').disabled = currentPage <= 1;
        document.getElementById('next-page').disabled = currentPage >= totalPages;
    }

    function generatePageButtons() {
        pageButtons.innerHTML = '';
        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }
    }

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
            <div class="Min">
                <img src="${item.logo}" />
                <h2>${item.title}</h2>
            </div>
        `).join('');
        }
    }

    function loadData() {
        const catId = document.getElementById('container').getAttribute('data-id');
        console.log('当前页:', currentPage, '每页条数:', pageSize);
        axios.post('/admin/zhenshangyin/getCatArticlePageJi', {
            cat_id: '3',
            num: pageSize,
            page: currentPage
        })
            .then(response => {
                console.log(response.data); // 打印返回数据
                const { items, total } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    updatePaginationControls();
                    generatePageButtons();
                } else {
                    console.error("后端数据格式错误或无数据返回");
                }
            })
            .catch(error => {
                console.error("请求失败", error);
            });
    }

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            loadData();
        }
    }

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    });

    document.addEventListener('DOMContentLoaded', () => {
        loadData();
    });
</script>
```

# 复杂分页

## ♬接口

```php
/**
 * 获得指定栏目图文列表信息
 * @param string $catId 栏目ID
 * @param string $num 查询条数
 * @param string $page 当前页码
 * @param string $is_best 是否推荐
 */
public function getCatArticle($catId = 0, $num = 0, $page = 1, $is_best = 0)
{
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $linkName = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("link_name");    // 获得列表页的静态链接名称
    if (empty($linkName)) {
        $linkName = "List";
    }
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");        // 内容模板获取数据表名

    // 自定义修改，如果给栏目ID为0，直接查默认模型表
    if (!empty($catId)) {
        $where['cat_id'] = $catId;
    } else {
        $tableName = "data_article_show_default";
    }

    if (empty($tableName)) {
        return false;
    } else {
        $tableName = strtolower($tableName);    // 转小写
    }

    if ($is_best == 1) {
        $where['is_best'] = $is_best;
    }
    $where['status'] = 1;

    // 计算分页参数
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页的数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)  // 使用偏移量和条数获取数据
        ->order("is_best desc, sort desc, id desc")
        ->select()
        ->toArray();

    // 处理列表增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-" . $linkName . "/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
        foreach ($value as $k => $v) {
            if (!empty($v) && strpos($v, "|") !== false) {
                // 处理字段内是否有“|”符号，如果有则拆分成数组
                $list[$key][$k] = explode("|", $v);
            }
        }
    }

    // 返回数据和总条数
    return [
        'total' => $total,
        'items' => $list
    ];
}
```

## ♬HTML

```php
<div id="data-container"></div>
<div id="pagination-controls">
    <label for="page-size">每页显示：</label>
    <select id="page-size">
        <option value="3">3 条</option>
        <option value="5">5 条</option>
        <option value="10">10 条</option>
        <option value="20">20 条</option>
    </select>
    <button id="first-page" disabled>首页</button>
    <button id="prev-page" disabled>上一页</button>
    <div id="page-buttons"></div>
    <button id="next-page" disabled>下一页</button>
    <button id="last-page" disabled>尾页</button>
    <input type="number" id="page-input" min="1" placeholder="页码" />
    <button id="go-to-page">跳转</button>
    <p id="page-info"></p>
</div>

<script>
    const dataContainer = document.getElementById('data-container');
    const pageButtons = document.getElementById('page-buttons');
    const pageInfo = document.getElementById('page-info');
    const pageSizeSelector = document.getElementById('page-size');
    const pageInput = document.getElementById('page-input');

    // currentPage当前页码  totalPages总页数  pageSize默认每页显示的数量  totalItems总数据条数

    var currentPage = 1, totalPages = 1, pageSize = 1, totalItems = 0;

    function createButton(content, isDisabled, onClick) {
        const button = document.createElement('button');
        button.textContent = content;
        if (isDisabled) button.disabled = true;
        if (onClick) button.addEventListener('click', onClick);
        return button;
    }

    function updatePaginationControls() {
        const disablePrev = currentPage <= 1;
        const disableNext = currentPage >= totalPages;
        ['first-page', 'prev-page'].forEach(id => document.getElementById(id).disabled = disablePrev);
        ['next-page', 'last-page'].forEach(id => document.getElementById(id).disabled = disableNext);

        pageInfo.textContent = `当前页: ${currentPage} / 总页数: ${totalPages} (总条数: ${totalItems})`;
    }

    function generatePageButtons() {
        pageButtons.innerHTML = '';
        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                pageButtons.appendChild(createButton(i, i === currentPage, () => goToPage(i)));
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }
    }

    function renderItems(items) {
        dataContainer.innerHTML = items.length === 0 ? '<p>没有更多数据</p>' :
            items.map(item => `
                <div class="Min">
                    <h2>${item.title || ''}</h2>
                </div>
            `).join('');
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticle', { cat_id: '1', num: pageSize, page: currentPage })
            .then(response => {
                const { items, total } = response.data;
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                updatePaginationControls();
                generatePageButtons();
            })
            .catch(error => console.error("请求失败", error));
    }

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            loadData();
        }
    }

    function initEventListeners() {
        document.getElementById('pagination-controls').addEventListener('click', (event) => {
            const actionMap = {
                'first-page': () => goToPage(1),
                'prev-page': () => goToPage(currentPage - 1),
                'next-page': () => goToPage(currentPage + 1),
                'last-page': () => goToPage(totalPages),
            };
            if (actionMap[event.target.id]) actionMap[event.target.id]();
        });

        document.getElementById('go-to-page').addEventListener('click', () => {
            const page = parseInt(pageInput.value, 10);
            goToPage(page);
        });

        pageSizeSelector.addEventListener('change', () => {
            pageSize = parseInt(pageSizeSelector.value, 10);
            goToPage(1);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initEventListeners();
        loadData();
    });
</script>
```

# 分页，排序

## ♬接口

```php
public function getCatArticlePauxu($catId = 0, $num = 0, $page = 1, $sortOrder = 'asc') {
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => []]);
    }

    $tableName = strtolower($tableName);
    $where = ['status' => 1];

    // 栏目ID条件
    if (!empty($catId)) {
        $where['cat_id'] = $catId;
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)->where($where)->count();

    // 根据排序方式设置排序
    $orderBy = ($sortOrder === 'desc') ? 'ejine desc' : 'ejine asc';

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order($orderBy)
        ->select()
        ->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 返回数据结构
    return json([
        'total' => $total,
        'items' => $list ?? []  // 确保即使无数据也返回空数组
    ]);
}
```

## ♬HTML

```php
<div class="LieBiao">
    <div class="SuoSou">
        <button id="Sheng-button">价格升序</button>
        <button id="Jiang-button">价格降序</button>
    </div>
    <div id="container"></div>
    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const pageButtons = document.getElementById('page-buttons');

    let currentPage = 1, totalPages = 1, pageSize = 4, totalItems = 0;
    let sortOrder = 'asc'; // 默认升序

    function updatePaginationControls() {
        document.getElementById('prev-page').disabled = currentPage <= 1;
        document.getElementById('next-page').disabled = currentPage >= totalPages;
    }

    function generatePageButtons() {
        pageButtons.innerHTML = '';
        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }
    }

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.ejine}</h2>
                </div>
            `).join('');
        }
    }

    function loadData() {
        console.log('当前页:', currentPage, '每页条数:', pageSize, '排序:', sortOrder);
        axios.post('/admin/zhenshangyin/getCatArticlePauxu', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            sort_order: sortOrder // 发送排序方式
        })
        .then(response => {
            const { items, total } = response.data;
            totalItems = total;
            totalPages = Math.ceil(totalItems / pageSize);
            renderItems(items);
            updatePaginationControls();
            generatePageButtons();
        })
        .catch(error => {
            console.error("请求失败", error);
        });
    }

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            loadData();
        }
    }

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    });

    document.getElementById('Sheng-button').addEventListener('click', () => {
        sortOrder = 'asc';
        loadData();
    });

    document.getElementById('Jiang-button').addEventListener('click', () => {
        sortOrder = 'desc';
        loadData();
    });

    document.addEventListener('DOMContentLoaded', () => {
        loadData();
    });
</script>
```

# 分页，搜索

## ♬接口

```php
public function getCatArticlePageSuo($catId = 0, $num = 0, $page = 1, $title = '')
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]]; // 使用数组格式

    // 栏目ID条件
    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("id desc")
        ->select()
        ->toArray();

        
    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 返回数据结构
    return json([
        'total' => $total,
        'items' => $list ?? []  // 确保即使无数据也返回空数组
    ]);
}
```

## ♬HTML

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="搜索标题" />
        <button id="search-button">搜索</button>
    </div>
    <div id="container"></div>

    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>
<script>
    const dataContainer = document.getElementById('container');
    const pageButtons = document.getElementById('page-buttons');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');

    let currentPage = 1, totalPages = 1, pageSize = 2, totalItems = 0, searchTerm = '';

    function updatePaginationControls() {
        document.getElementById('prev-page').disabled = currentPage <= 1;
        document.getElementById('next-page').disabled = currentPage >= totalPages;

    }

    // 生成页码按钮
    function generatePageButtons() {
        pageButtons.innerHTML = '';
        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }
    }

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticlePageSuo', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm // 将搜索的 title 传递到后端接口
        })
            .then(response => {
                console.log(response.data); // 打印返回数据
                const { items, total } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    updatePaginationControls();
                    generatePageButtons();
                } else {
                    console.error("后端数据格式错误或无数据返回");
                }
            })
            .catch(error => {
                console.error("请求失败", error);
            });
    }

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            loadData();
        }
    }

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    });

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    document.addEventListener('DOMContentLoaded', () => {
        loadData();
    });
</script>
```

# 单个单选项[搜索+分页]

## ♬接口

```php
public function getCatArticleDanQie($catId = 0, $num = 0, $page = 1, $title = '', $leixing = '')
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]]; // 使用数组格式

    // 栏目ID条件
    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    // 标题筛选
    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    // leixing 筛选
    if (!empty($leixing)) {
        $where[] = ['leixing', '=', $leixing];
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("id desc")
        ->select()
        ->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 获取字段设置
    $fields = $this->app->db->name('DataTemplateField')->where(['template_id' => $contentTemplateId, 'is_sys' => 0, 'status' => 1])->select()->toArray();
    
    $typeData = [
        'leixing' => [],
    ];

    foreach ($fields as $field) {
        $filedSetting = explode("\r\n", $field['filed_setting']);
        foreach ($filedSetting as $setting) {
            $settingParts = explode('|', $setting);
            if (count($settingParts) === 2) {
                if ($field['field_name'] === 'leixing') {
                    $typeData['leixing'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                }
            }
        }
    }

    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => $typeData
    ]);
}
```

## ♬前端⋙无分页

```php
<div class="LieBiao"> 
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container" data-id="11" data-page="10"></div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1;
    let totalPages = 1;
    let pageSize = parseInt(dataContainer.dataset.page) || 10;
    let totalItems = 0;
    let searchTerm = '';
    let selectedLeixing = '';

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

    function renderTypeFilters(types) {
        // 清空容器
        typeFilterContainer.innerHTML = '';

        // 渲染 leixing 筛选
        if (types.leixing && types.leixing.length > 0) {
            const leixingContainer = document.createElement('div');
            leixingContainer.classList.add('leixing_filter');
            leixingContainer.innerHTML = '<h3>类型</h3>';
            types.leixing.unshift({ value: '', name: '全部' });
            leixingContainer.innerHTML += types.leixing.map(type =>
                `<div class="InChanPin_radio ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'selected' : ''}">
                    <input type="radio" name="leixing-filter" id="leixing-${type.value}" value="${type.value}" ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'checked' : ''}>
                    <label for="leixing-${type.value}">${type.name}</label>
                </div>`
            ).join('');
            typeFilterContainer.appendChild(leixingContainer);

            // 为 leixing 选项添加事件
            document.querySelectorAll('input[name="leixing-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedLeixing = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }
    }

    function loadData() {
        const catId = dataContainer.dataset.id;
        axios.post('/admin/zhenshangyin/getCatArticleDanQie', {
            cat_id: catId,
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            leixing: selectedLeixing, // 发送 leixing 筛选条件
        })
        .then(response => {
            const { items, total, types } = response.data;
            if (response.data) {
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

## ♬前端⋙有分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageButtonsContainer = document.getElementById('page-buttons');

    let currentPage = 1, totalPages = 1, pageSize = 1, totalItems = 0, searchTerm = '';
    let selectedLeixing = '';

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

    function renderTypeFilters(types) {
        // 清空容器
        typeFilterContainer.innerHTML = '';

        // 渲染 leixing 筛选
        if (types.leixing && types.leixing.length > 0) {
            const leixingContainer = document.createElement('div');
            leixingContainer.classList.add('leixing_filter');
            leixingContainer.innerHTML = '<h3>类型</h3>';
            types.leixing.unshift({ value: '', name: '全部' });
            leixingContainer.innerHTML += types.leixing.map(type =>
                `<div class="InChanPin_radio ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'selected' : ''}">
                    <input type="radio" name="leixing-filter" id="leixing-${type.value}" value="${type.value}" ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'checked' : ''}>
                    <label for="leixing-${type.value}">${type.name}</label>
                </div>`
            ).join('');
            typeFilterContainer.appendChild(leixingContainer);

            // 为 leixing 选项添加事件
            document.querySelectorAll('input[name="leixing-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedLeixing = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }
    }

    function generatePageButtons() {
        const pageButtons = document.getElementById('page-buttons');
        pageButtons.innerHTML = '';

        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function loadData() {
        axios.post('/index/zhenshangyin/getCatArticleDanQie', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            leixing: selectedLeixing, // 发送 leixing 筛选条件
        })
            .then(response => {
                const { items, total, types } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    renderTypeFilters(types);
                    generatePageButtons(); // 调用生成分页按钮的函数
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

# 单选项未选中不显示[搜索+分页]

1. 【leixing】为单选值

## ♬接口

```php
public function getCatArticleZhen($catId = 0, $num = 0, $page = 1, $title = '', $type = '')
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]]; // 使用数组格式

    // 栏目ID条件
    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    if (!empty($type)) {
        $where[] = ['leixing', '=', $type];
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("id desc")
        ->select()
        ->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        // 处理null值
        $list[$key]['logo'] = !empty($value['logo']) ? $value['logo'] : 'default.jpg'; // 替换null为默认图片
        $list[$key]['title'] = !empty($value['title']) ? $value['title'] : '未命名'; // 替换null为未命名

        // 生成链接
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 获取所有类型并过滤掉null
    $types = $this->app->db->name($tableName)
        ->where(['status' => 1])
        ->distinct(true)
        ->column('leixing');

    // 过滤掉null值
    $types = array_filter($types, function($type) {
        return !is_null($type); // 只返回非null的类型
    });

    // 返回数据结构
    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => array_values($types), // 重建索引
    ]);
}
```

## ♬前端⋙无分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1, totalPages = 1, pageSize = 2, totalItems = 0, searchTerm = '';
    let selectedType = '';

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item =>
                `<div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>`
            ).join('');
        }
    }

    function renderTypeFilters(types) {
        const allButton = `
            <div class="InChanPin_radio ${selectedType === '' ? 'selected' : ''}">
                <input type="radio" name="type-filter" id="type-all" value="" ${selectedType === '' ? 'checked' : ''}>
                <label for="type-all">全部</label>
            </div>
        `;

        const typeButtons = types.map(type =>
            `<div class="InChanPin_radio ${selectedType === type ? 'selected' : ''}">
                <input type="radio" name="type-filter" id="type-${type}" value="${type}" ${selectedType === type ? 'checked' : ''}>
                <label for="type-${type}">${type}</label>
            </div>`
        ).join('');

        typeFilterContainer.innerHTML = allButton + typeButtons;
        document.querySelectorAll('input[name="type-filter"]').forEach(radio => {
            radio.addEventListener('change', () => {
                selectedType = radio.value; 
                document.querySelectorAll('.InChanPin_radio').forEach(div => {
                    div.classList.remove('selected');
                });
                radio.parentElement.classList.add('selected');
                goToPage(1);
            });
        });
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleZhen', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            type: selectedType,
        })
            .then(response => {
                const { items, total, types, } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    renderTypeFilters(types);
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

## ♬前端⋙有分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageButtonsContainer = document.getElementById('page-buttons');

    let currentPage = 1, totalPages = 1, pageSize = 2, totalItems = 0, searchTerm = '';
    let selectedType = '';

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item =>
                `<div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>`
            ).join('');
        }
    }

    function renderTypeFilters(types) {
        const allButton = `
            <div class="InChanPin_radio ${selectedType === '' ? 'selected' : ''}">
                <input type="radio" name="type-filter" id="type-all" value="" ${selectedType === '' ? 'checked' : ''}>
                <label for="type-all">全部</label>
            </div>
        `;

        const typeButtons = types.map(type =>
            `<div class="InChanPin_radio ${selectedType === type ? 'selected' : ''}">
                <input type="radio" name="type-filter" id="type-${type}" value="${type}" ${selectedType === type ? 'checked' : ''}>
                <label for="type-${type}">${type}</label>
            </div>`
        ).join('');

        typeFilterContainer.innerHTML = allButton + typeButtons;
        document.querySelectorAll('input[name="type-filter"]').forEach(radio => {
            radio.addEventListener('change', () => {
                selectedType = radio.value; 
                document.querySelectorAll('.InChanPin_radio').forEach(div => {
                    div.classList.remove('selected');
                });
                radio.parentElement.classList.add('selected');
                goToPage(1);
            });
        });
    }

    function generatePageButtons() {
        const pageButtons = document.getElementById('page-buttons');
        pageButtons.innerHTML = '';

        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function loadData() {
        axios.post('/index/zhenshangyin/getCatArticleZhen', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            type: selectedType,
        })
            .then(response => {
                const { items, total, types, } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    renderTypeFilters(types);
                    generatePageButtons(); // 调用生成分页按钮的函数
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    loadData();
</script>
```

# 多个单选项[搜索+分页]

1. 【leixing】和【yanse】  为字段名

## ♬接口

```php
public function getCatArticleQie($catId = 0, $num = 0, $page = 1, $title = '', $leixing = '', $yanse = '')
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]]; // 使用数组格式

    // 栏目ID条件
    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    // 标题筛选
    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    // leixing 筛选
    if (!empty($leixing)) {
        $where[] = ['leixing', '=', $leixing];
    }

    // yanse 筛选
    if (!empty($yanse)) {
        $where[] = ['yanse', '=', $yanse];
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("id desc")
        ->select()
        ->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 获取字段设置
    $fields = $this->app->db->name('DataTemplateField')->where(['template_id' => $contentTemplateId, 'is_sys' => 0, 'status' => 1])->select()->toArray();
    
    $typeData = [
        'leixing' => [],
        'yanse' => [],
    ];

    foreach ($fields as $field) {
        $filedSetting = explode("\r\n", $field['filed_setting']);
        foreach ($filedSetting as $setting) {
            $settingParts = explode('|', $setting);
            if (count($settingParts) === 2) {
                if ($field['field_name'] === 'leixing') {
                    $typeData['leixing'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                } elseif ($field['field_name'] === 'yanse') {
                    $typeData['yanse'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                }
            }
        }
    }

    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => $typeData
    ]);
}
```

## ♬前端⋙无分页

```php
<div class="LieBiao"> 
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1, totalPages = 1, pageSize = 50, totalItems = 0, searchTerm = '';
    let selectedLeixing = '';
    let selectedYanse = '';

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

    function renderTypeFilters(types) {
        // 清空容器
        typeFilterContainer.innerHTML = '';

        // 渲染 leixing 筛选
        if (types.leixing && types.leixing.length > 0) {
            const leixingContainer = document.createElement('div');
            leixingContainer.classList.add('leixing_filter');
            leixingContainer.innerHTML = '<h3>类型</h3>';
            types.leixing.unshift({ value: '', name: '全部' });
            leixingContainer.innerHTML += types.leixing.map(type =>
                `<div class="InChanPin_radio ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'selected' : ''}">
                    <input type="radio" name="leixing-filter" id="leixing-${type.value}" value="${type.value}" ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'checked' : ''}>
                    <label for="leixing-${type.value}">${type.name}</label>
                </div>`
            ).join('');
            typeFilterContainer.appendChild(leixingContainer);

            // 为 leixing 选项添加事件
            document.querySelectorAll('input[name="leixing-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedLeixing = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }

        // 渲染 yanse 筛选
        if (types.yanse && types.yanse.length > 0) {
            const yanseContainer = document.createElement('div');
            yanseContainer.innerHTML = '<h3>颜色</h3>';
            yanseContainer.classList.add('leixing_filter');
            types.yanse.unshift({ value: '', name: '全部' }); // 添加 '全部' 选项
            yanseContainer.innerHTML += types.yanse.map(type =>
                `<div class="InChanPin_radio ${selectedYanse === type.value || (type.value === '' && selectedYanse === '') ? 'selected' : ''}">
                    <input type="radio" name="yanse-filter" id="yanse-${type.value}" value="${type.value}" ${selectedYanse === type.value || (type.value === '' && selectedYanse === '') ? 'checked' : ''}>
                    <label for="yanse-${type.value}">${type.name}</label>
                </div>`
            ).join('');
            typeFilterContainer.appendChild(yanseContainer);

            // 为 yanse 选项添加事件
            document.querySelectorAll('input[name="yanse-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedYanse = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleQie', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            leixing: selectedLeixing, // 发送 leixing 筛选条件
            yanse: selectedYanse // 发送 yanse 筛选条件
        })
        .then(response => {
            const { items, total, types } = response.data;
            if (response.data) {
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

## ♬前端⋙有分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageButtonsContainer = document.getElementById('page-buttons');

    let currentPage = 1, totalPages = 1, pageSize = 1, totalItems = 0, searchTerm = '';
    let selectedLeixing = '';
    let selectedYanse = '';

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
            <div class="Min">
                <img src="${item.logo}" />
                <h2>${item.title}</h2>
            </div>
        `).join('');
        }
    }

    function renderTypeFilters(types) {
        // 清空容器
        typeFilterContainer.innerHTML = '';

        // 渲染 leixing 筛选
        if (types.leixing && types.leixing.length > 0) {
            const leixingContainer = document.createElement('div');
            leixingContainer.classList.add('leixing_filter');
            leixingContainer.innerHTML = '<h3>类型</h3>';
            types.leixing.unshift({ value: '', name: '全部' });
            leixingContainer.innerHTML += types.leixing.map(type =>
                `<div class="InChanPin_radio ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'selected' : ''}">
                <input type="radio" name="leixing-filter" id="leixing-${type.value}" value="${type.value}" ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'checked' : ''}>
                <label for="leixing-${type.value}">${type.name}</label>
            </div>`
            ).join('');
            typeFilterContainer.appendChild(leixingContainer);

            // 为 leixing 选项添加事件
            document.querySelectorAll('input[name="leixing-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedLeixing = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }

        // 渲染 yanse 筛选
        if (types.yanse && types.yanse.length > 0) {
            const yanseContainer = document.createElement('div');
            yanseContainer.innerHTML = '<h3>颜色</h3>';
            yanseContainer.classList.add('leixing_filter');
            types.yanse.unshift({ value: '', name: '全部' });
            yanseContainer.innerHTML += types.yanse.map(type =>
                `<div class="InChanPin_radio ${selectedYanse === type.value || (type.value === '' && selectedYanse === '') ? 'selected' : ''}">
                <input type="radio" name="yanse-filter" id="yanse-${type.value}" value="${type.value}" ${selectedYanse === type.value || (type.value === '' && selectedYanse === '') ? 'checked' : ''}>
                <label for="yanse-${type.value}">${type.name}</label>
            </div>`
            ).join('');
            typeFilterContainer.appendChild(yanseContainer);

            // 为 yanse 选项添加事件
            document.querySelectorAll('input[name="yanse-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedYanse = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }
    }

    function generatePageButtons() {
        const pageButtons = document.getElementById('page-buttons');
        pageButtons.innerHTML = '';

        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function loadData() {
        axios.post('/index/zhenshangyin/getCatArticleQie', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            leixing: selectedLeixing,
            yanse: selectedYanse
        })
            .then(response => {
                const { items, total, types } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    renderTypeFilters(types);
                    generatePageButtons(); // 渲染分页控件
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    // 处理上一页、下一页按钮事件
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    // 初始加载第一页数据
    loadData();
</script>
```

# 单个多选项[搜索+分页]

1. 【gengge】为多选字段值

## ♬接口

```php
public function getCatArticleDuoXuan($catId = 0, $num = 0, $page = 1, $title = '', $gengge = [])
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]]; // 使用数组格式

    // 栏目ID条件
    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    // 标题筛选
    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    // gengge 筛选
    if (!empty($gengge)) {
        foreach ($gengge as $genggeValue) {
            $where[] = ['gengge', 'like', '%' . $genggeValue . '%'];
        }
    }
    

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)->where($where)->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)->where($where)->limit($offset, $num)->order("id desc")->select()->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 获取字段设置
    $fields = $this->app->db->name('DataTemplateField')->where(['template_id' => $contentTemplateId, 'is_sys' => 0, 'status' => 1])->select()->toArray();
    
    $typeData = ['gengge' => []];

    foreach ($fields as $field) {
        $filedSetting = explode("\r\n", $field['filed_setting']);
        foreach ($filedSetting as $setting) {
            $settingParts = explode('|', $setting);
            if (count($settingParts) === 2 && $field['field_name'] === 'gengge') {
                $typeData['gengge'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
            }
        }
    }

    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => $typeData
    ]);
}
```

## ♬前端⋙无分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1, totalPages = 1, pageSize = 50, totalItems = 0, searchTerm = '';
    let selectedGengge = [];

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

   function renderTypeFilters(types) {
        typeFilterContainer.innerHTML = '';

        if (types.gengge && types.gengge.length > 0) {
            const genggeContainer = document.createElement('div');
            genggeContainer.classList.add('gengge_filter');
            genggeContainer.innerHTML = '<h3>类型</h3>';

            types.gengge.forEach(type => {
                genggeContainer.innerHTML += `
                <div class="InChanPin_checkbox">
                    <input type="checkbox" id="gengge-${type.value}" value="${type.value}" ${selectedGengge.includes(type.value) ? 'checked' : ''}>
                    <label for="gengge-${type.value}">${type.name}</label>
                </div>
            `;
            });

            typeFilterContainer.appendChild(genggeContainer);

            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedGengge.push(checkbox.value);
                        checkbox.parentNode.classList.add('selected'); // 添加选中样式
                    } else {
                        selectedGengge = selectedGengge.filter(value => value !== checkbox.value);
                        checkbox.parentNode.classList.remove('selected'); // 移除选中样式
                    }
                    goToPage(1);
                });

                // 如果选中，添加类
                if (checkbox.checked) {
                    checkbox.parentNode.classList.add('selected');
                }
            });
        }
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleDuoXuan', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            gengge: selectedGengge,
        })
            .then(response => {
                const { items, total, types } = response.data;
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

## ♬前端⋙有分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageButtonsContainer = document.getElementById('page-buttons');

    let currentPage = 1, totalPages = 1, pageSize = 1, totalItems = 0, searchTerm = '';
    let selectedGengge = [];

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

    function renderTypeFilters(types) {
        typeFilterContainer.innerHTML = '';

        if (types.gengge && types.gengge.length > 0) {
            const genggeContainer = document.createElement('div');
            genggeContainer.classList.add('leixing_filter');
            genggeContainer.innerHTML = '<h3>风格</h3>';

            types.gengge.forEach(type => {
                genggeContainer.innerHTML += `
                <div class="InChanPin_radio">
                    <input type="checkbox" id="gengge-${type.value}" value="${type.value}" ${selectedGengge.includes(type.value) ? 'checked' : ''}>
                    <label for="gengge-${type.value}">${type.name}</label>
                </div>
            `;
            });

            typeFilterContainer.appendChild(genggeContainer);

            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedGengge.push(checkbox.value);
                        checkbox.parentNode.classList.add('selected'); // 添加选中样式
                    } else {
                        selectedGengge = selectedGengge.filter(value => value !== checkbox.value);
                        checkbox.parentNode.classList.remove('selected'); // 移除选中样式
                    }
                    goToPage(1);
                });

                // 如果选中，添加类
                if (checkbox.checked) {
                    checkbox.parentNode.classList.add('selected');
                }
            });
        }
    }


    function generatePageButtons() {
        const pageButtons = document.getElementById('page-buttons');
        pageButtons.innerHTML = '';

        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }


    function loadData() {
        axios.post('/index/zhenshangyin/getCatArticleDuoXuan', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            gengge: selectedGengge,
        })
            .then(response => {
                const { items, total, types } = response.data;
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
                generatePageButtons(); // 调用生成分页按钮的函数
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    loadData();
</script>
```

# 多个多选项[搜索+分页]

1. 【gengge】和【zhuti】为多选字段值

## ♬接口

```php
public function getCatArticleDuoDuo($catId = 0, $num = 0, $page = 1, $title = '', $gengge = [], $zhuti = [])
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]]; // 使用数组格式

    // 栏目ID条件
    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    // 标题筛选
    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    // gengge 筛选
    if (!empty($gengge)) {
        foreach ($gengge as $genggeValue) {
            $where[] = ['gengge', 'like', '%' . $genggeValue . '%'];
        }
    }

    // zhuti 筛选
    if (!empty($zhuti)) {
        foreach ($zhuti as $zhutiValue) {
            $where[] = ['zhuti', 'like', '%' . $zhutiValue . '%'];
        }
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)->where($where)->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)->where($where)->limit($offset, $num)->order("id desc")->select()->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 获取字段设置
    $fields = $this->app->db->name('DataTemplateField')->where(['template_id' => $contentTemplateId, 'is_sys' => 0, 'status' => 1])->select()->toArray();
    
    $typeData = ['gengge' => [], 'zhuti' => []]; // 添加 zhuti

    foreach ($fields as $field) {
        $filedSetting = explode("\r\n", $field['filed_setting']);
        foreach ($filedSetting as $setting) {
            $settingParts = explode('|', $setting);
            if (count($settingParts) === 2) {
                if ($field['field_name'] === 'gengge') {
                    $typeData['gengge'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                } elseif ($field['field_name'] === 'zhuti') { // 处理 zhuti
                    $typeData['zhuti'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                }
            }
        }
    }

    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => $typeData
    ]);
}
```

## ♬前端⋙无分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1, totalPages = 1, pageSize = 1, totalItems = 0, searchTerm = '';
    let selectedGengge = [], selectedZhuti = []; // 添加选中的 zhuti 数组

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
            <div class="Min">
                <img src="${item.logo}" />
                <h2>${item.title}</h2>
            </div>
        `).join('');
        }
    }

    function renderTypeFilters(types) {
        typeFilterContainer.innerHTML = '';

        // 渲染 gengge 过滤器
        if (types.gengge && types.gengge.length > 0) {
            const genggeContainer = document.createElement('div');
            genggeContainer.classList.add('leixing_filter');
            genggeContainer.innerHTML = '<h3>风格</h3>';

            types.gengge.forEach(type => {
                genggeContainer.innerHTML += `
                    <div class="InChanPin_radio">
                        <input type="checkbox" id="gengge-${type.value}" value="${type.value}" ${selectedGengge.includes(type.value) ? 'checked' : ''}>
                        <label for="gengge-${type.value}">${type.name}</label>
                    </div>
                `;
            });

            typeFilterContainer.appendChild(genggeContainer);
        }

        // 渲染 zhuti 过滤器
        if (types.zhuti && types.zhuti.length > 0) {
            const zhutiContainer = document.createElement('div');
            zhutiContainer.classList.add('leixing_filter');
            zhutiContainer.innerHTML = '<h3>主题</h3>';

            types.zhuti.forEach(type => {
                zhutiContainer.innerHTML += `
                    <div class="InChanPin_radio">
                        <input type="checkbox" id="zhuti-${type.value}" value="${type.value}" ${selectedZhuti.includes(type.value) ? 'checked' : ''}>
                        <label for="zhuti-${type.value}">${type.name}</label>
                    </div>
                `;
            });

            typeFilterContainer.appendChild(zhutiContainer);
        }

        // 处理 checkbox 的 change 事件
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (checkbox.id.startsWith('gengge-')) {
                        selectedGengge.push(checkbox.value);
                    } else if (checkbox.id.startsWith('zhuti-')) {
                        selectedZhuti.push(checkbox.value); // 处理 zhuti 选中逻辑
                    }
                    checkbox.parentNode.classList.add('selected'); // 添加选中样式
                } else {
                    if (checkbox.id.startsWith('gengge-')) {
                        selectedGengge = selectedGengge.filter(value => value !== checkbox.value);
                    } else if (checkbox.id.startsWith('zhuti-')) {
                        selectedZhuti = selectedZhuti.filter(value => value !== checkbox.value); // 处理 zhuti 取消选中逻辑
                    }
                    checkbox.parentNode.classList.remove('selected'); // 移除选中样式
                }
                goToPage(1);
            });

            // 如果选中，添加类
            if (checkbox.checked) {
                checkbox.parentNode.classList.add('selected');
            }
        });
    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleDuoDuo', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            gengge: selectedGengge,
            zhuti: selectedZhuti, // 传递 zhuti
        })
            .then(response => {
                const { items, total, types } = response.data;
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
            })
            .catch(error => {
                console.error(error);
            });
    }

     

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

## ♬前端⋙有分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageButtonsContainer = document.getElementById('page-buttons');

    let currentPage = 1, totalPages = 1, pageSize = 1, totalItems = 0, searchTerm = '';
    let selectedGengge = [], selectedZhuti = []; // 添加选中的 zhuti 数组

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
            <div class="Min">
                <img src="${item.logo}" />
                <h2>${item.title}</h2>
            </div>
        `).join('');
        }
    }

    function renderTypeFilters(types) {
        typeFilterContainer.innerHTML = '';

        // 渲染 gengge 过滤器
        if (types.gengge && types.gengge.length > 0) {
            const genggeContainer = document.createElement('div');
            genggeContainer.classList.add('leixing_filter');
            genggeContainer.innerHTML = '<h3>风格</h3>';

            types.gengge.forEach(type => {
                genggeContainer.innerHTML += `
                    <div class="InChanPin_radio">
                        <input type="checkbox" id="gengge-${type.value}" value="${type.value}" ${selectedGengge.includes(type.value) ? 'checked' : ''}>
                        <label for="gengge-${type.value}">${type.name}</label>
                    </div>
                `;
            });

            typeFilterContainer.appendChild(genggeContainer);
        }

        // 渲染 zhuti 过滤器
        if (types.zhuti && types.zhuti.length > 0) {
            const zhutiContainer = document.createElement('div');
            zhutiContainer.classList.add('leixing_filter');
            zhutiContainer.innerHTML = '<h3>主题</h3>';

            types.zhuti.forEach(type => {
                zhutiContainer.innerHTML += `
                    <div class="InChanPin_radio">
                        <input type="checkbox" id="zhuti-${type.value}" value="${type.value}" ${selectedZhuti.includes(type.value) ? 'checked' : ''}>
                        <label for="zhuti-${type.value}">${type.name}</label>
                    </div>
                `;
            });

            typeFilterContainer.appendChild(zhutiContainer);
        }

        // 处理 checkbox 的 change 事件
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (checkbox.id.startsWith('gengge-')) {
                        selectedGengge.push(checkbox.value);
                    } else if (checkbox.id.startsWith('zhuti-')) {
                        selectedZhuti.push(checkbox.value); // 处理 zhuti 选中逻辑
                    }
                    checkbox.parentNode.classList.add('selected'); // 添加选中样式
                } else {
                    if (checkbox.id.startsWith('gengge-')) {
                        selectedGengge = selectedGengge.filter(value => value !== checkbox.value);
                    } else if (checkbox.id.startsWith('zhuti-')) {
                        selectedZhuti = selectedZhuti.filter(value => value !== checkbox.value); // 处理 zhuti 取消选中逻辑
                    }
                    checkbox.parentNode.classList.remove('selected'); // 移除选中样式
                }
                goToPage(1);
            });

            // 如果选中，添加类
            if (checkbox.checked) {
                checkbox.parentNode.classList.add('selected');
            }
        });
    }

    function generatePageButtons() {
        const pageButtons = document.getElementById('page-buttons');
        pageButtons.innerHTML = '';

        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function loadData() {
        axios.post('/index/zhenshangyin/getCatArticleDuoDuo', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            gengge: selectedGengge,
            zhuti: selectedZhuti, // 传递 zhuti
        })
            .then(response => {
                const { items, total, types } = response.data;
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
                generatePageButtons(); // 调用生成分页按钮的函数
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    loadData();
</script>
```

# 单选，多选混合[搜索+分页]

1. 【yanse】单选，【gengge】多选

## ♬接口

```php
public function getCatArticleDuoDan($catId = 0, $num = 0, $page = 1, $title = '', $gengge = [], $yanse = '')
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    // 如果栏目ID为0，使用默认模型表
    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    // 如果表名不存在，返回 false
    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]]; // 使用数组格式

    // 栏目ID条件
    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    // 标题筛选
    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    // gengge 筛选
    if (!empty($gengge)) {
        foreach ($gengge as $genggeValue) {
            $where[] = ['gengge', 'like', '%' . $genggeValue . '%'];
        }
    }

    // yanse 筛选
    if (!empty($yanse)) {
        $where[] = ['yanse', '=', $yanse]; // 单选条件
    }

    // 计算分页
    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)->where($where)->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)->where($where)->limit($offset, $num)->order("id desc")->select()->toArray();

    // 增加链接项
    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    // 获取字段设置
    $fields = $this->app->db->name('DataTemplateField')->where(['template_id' => $contentTemplateId, 'is_sys' => 0, 'status' => 1])->select()->toArray();
    
    $typeData = ['gengge' => [], 'yanse' => []]; // 添加 yanse

    foreach ($fields as $field) {
        $filedSetting = explode("\r\n", $field['filed_setting']);
        foreach ($filedSetting as $setting) {
            $settingParts = explode('|', $setting);
            if (count($settingParts) === 2) {
                if ($field['field_name'] === 'gengge') {
                    $typeData['gengge'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                } elseif ($field['field_name'] === 'yanse') { // 处理 yanse
                    $typeData['yanse'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                }
            }
        }
    }

    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => $typeData
    ]);
}
```

## ♬前端⋙无分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1, totalPages = 1, pageSize = 50, totalItems = 0, searchTerm = '';
    let selectedGengge = [], selectedYanse = null; // 添加选中的 yanse

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

    function renderTypeFilters(types) {
        typeFilterContainer.innerHTML = '';

        // 渲染 gengge 过滤器
        if (types.gengge && types.gengge.length > 0) {
            const genggeContainer = document.createElement('div');
            genggeContainer.classList.add('leixing_filter');
            genggeContainer.innerHTML = '<h3>风格</h3>';

            types.gengge.forEach(type => {
                genggeContainer.innerHTML += `
                    <div class="InChanPin_radio">
                        <input type="checkbox" id="gengge-${type.value}" value="${type.value}" ${selectedGengge.includes(type.value) ? 'checked' : ''}>
                        <label for="gengge-${type.value}">${type.name}</label>
                    </div>
                `;
            });

            typeFilterContainer.appendChild(genggeContainer);

            // 处理 checkbox 的 change 事件
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedGengge.push(checkbox.value);
                        checkbox.parentNode.classList.add('selected'); // 添加选中样式
                    } else {
                        selectedGengge = selectedGengge.filter(value => value !== checkbox.value);
                        checkbox.parentNode.classList.remove('selected'); // 移除选中样式
                    }
                    goToPage(1);
                });

                // 如果选中，添加类
                if (checkbox.checked) {
                    checkbox.parentNode.classList.add('selected');
                }
            });
        }

        // 渲染 yanse 单选器
        if (types.yanse && types.yanse.length > 0) {
            const yanseContainer = document.createElement('div');
            yanseContainer.classList.add('leixing_filter');
            yanseContainer.innerHTML = '<h3>颜色</h3>';
            types.yanse.unshift({ value: '', name: '全部' });
            types.yanse.forEach(type => {
                const isChecked = selectedYanse === type.value || (type.value === '' && selectedYanse === null);
                yanseContainer.innerHTML += `
                    <div class="InChanPin_radio ${isChecked ? 'selected' : ''}">
                        <input type="radio" name="yanse" id="yanse-${type.value}" value="${type.value}" ${isChecked ? 'checked' : ''}>
                        <label for="yanse-${type.value}">${type.name}</label>
                    </div>
                `;
            });
            
            typeFilterContainer.appendChild(yanseContainer);

            // 处理 radio 的 change 事件
            document.querySelectorAll('input[name="yanse"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedYanse = radio.value; // 记录选中的 yanse
                    goToPage(1);

                    // 更新选中样式
                    document.querySelectorAll('input[name="yanse"]').forEach(r => {
                        const parent = r.parentNode;
                        if (r.checked) {
                            parent.classList.add('selected'); // 添加选中样式
                        } else {
                            parent.classList.remove('selected'); // 移除选中样式
                        }
                    });
                });

                // 如果选中，添加类
                if (radio.checked) {
                    radio.parentNode.classList.add('selected');
                }
            });
        }


    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleDuoDan', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            gengge: selectedGengge,
            yanse: selectedYanse, // 传递 yanse
        })
            .then(response => {
                const { items, total, types } = response.data;
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

## ♬前端⋙有分页

```php
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>
    <div id="type-filter-container"></div>
    <div id="container"></div>
    <div id="pagination-controls">
        <button id="prev-page" disabled>上一页</button>
        <div id="page-buttons"></div>
        <button id="next-page" disabled>下一页</button>
    </div>
</div>

<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const typeFilterContainer = document.getElementById('type-filter-container');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageButtonsContainer = document.getElementById('page-buttons');

    let currentPage = 1, totalPages = 1, pageSize = 1, totalItems = 0, searchTerm = '';
    let selectedGengge = [], selectedYanse = null; // 添加选中的 yanse

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.title}</h2>
                </div>
            `).join('');
        }
    }

    function renderTypeFilters(types) {
        typeFilterContainer.innerHTML = '';

        // 渲染 gengge 过滤器
        if (types.gengge && types.gengge.length > 0) {
            const genggeContainer = document.createElement('div');
            genggeContainer.classList.add('leixing_filter');
            genggeContainer.innerHTML = '<h3>风格</h3>';

            types.gengge.forEach(type => {
                genggeContainer.innerHTML += `
                    <div class="InChanPin_radio">
                        <input type="checkbox" id="gengge-${type.value}" value="${type.value}" ${selectedGengge.includes(type.value) ? 'checked' : ''}>
                        <label for="gengge-${type.value}">${type.name}</label>
                    </div>
                `;
            });

            typeFilterContainer.appendChild(genggeContainer);

            // 处理 checkbox 的 change 事件
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedGengge.push(checkbox.value);
                        checkbox.parentNode.classList.add('selected'); // 添加选中样式
                    } else {
                        selectedGengge = selectedGengge.filter(value => value !== checkbox.value);
                        checkbox.parentNode.classList.remove('selected'); // 移除选中样式
                    }
                    goToPage(1);
                });

                // 如果选中，添加类
                if (checkbox.checked) {
                    checkbox.parentNode.classList.add('selected');
                }
            });
        }

        // 渲染 yanse 单选器
        if (types.yanse && types.yanse.length > 0) {
            const yanseContainer = document.createElement('div');
            yanseContainer.classList.add('leixing_filter');
            yanseContainer.innerHTML = '<h3>颜色</h3>';
            types.yanse.unshift({ value: '', name: '全部' });
            types.yanse.forEach(type => {
                const isChecked = selectedYanse === type.value || (type.value === '' && selectedYanse === null);
                yanseContainer.innerHTML += `
                    <div class="InChanPin_radio ${isChecked ? 'selected' : ''}">
                        <input type="radio" name="yanse" id="yanse-${type.value}" value="${type.value}" ${isChecked ? 'checked' : ''}>
                        <label for="yanse-${type.value}">${type.name}</label>
                    </div>
                `;
            });

            typeFilterContainer.appendChild(yanseContainer);

            // 处理 radio 的 change 事件
            document.querySelectorAll('input[name="yanse"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedYanse = radio.value; // 记录选中的 yanse
                    goToPage(1);

                    // 更新选中样式
                    document.querySelectorAll('input[name="yanse"]').forEach(r => {
                        const parent = r.parentNode;
                        if (r.checked) {
                            parent.classList.add('selected'); // 添加选中样式
                        } else {
                            parent.classList.remove('selected'); // 移除选中样式
                        }
                    });
                });

                // 如果选中，添加类
                if (radio.checked) {
                    radio.parentNode.classList.add('selected');
                }
            });
        }
    }

    function generatePageButtons() {
        const pageButtons = document.getElementById('page-buttons');
        pageButtons.innerHTML = '';

        const addRange = (start, end) => {
            for (let i = start; i <= end; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.disabled = i === currentPage;
                button.addEventListener('click', () => goToPage(i));
                pageButtons.appendChild(button);
            }
        };

        if (totalPages <= 7) {
            addRange(1, totalPages);
        } else {
            if (currentPage <= 5) {
                addRange(1, 5);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages, totalPages);
            } else if (currentPage > 5 && currentPage < totalPages - 4) {
                addRange(1, 2);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(currentPage - 1, currentPage + 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 1, totalPages);
            } else {
                addRange(1, 1);
                pageButtons.appendChild(document.createTextNode('...'));
                addRange(totalPages - 4, totalPages);
            }
        }

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function loadData() {
        axios.post('/index/zhenshangyin/getCatArticleDuoDan', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            gengge: selectedGengge,
            yanse: selectedYanse, // 传递 yanse
        })
            .then(response => {
                const { items, total, types } = response.data;
                totalItems = total;
                totalPages = Math.ceil(totalItems / pageSize);
                renderItems(items);
                renderTypeFilters(types);
                generatePageButtons(); // 渲染分页控件
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

# 搜索，价格区间，筛选，分页

1. 【leixing】为单选字段，【ejine】为区间筛选字段

## ♬接口

```
public function getCatArticleSouuo($catId = 0, $num = 0, $page = 1, $title = '', $type = '', $leixing = '', $minPrice = null, $maxPrice = null)
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]];

    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    if (!empty($leixing)) {
        $where[] = ['leixing', '=', $leixing];
    }


    if (!empty($minPrice)) {
        $where[] = ['ejine', '>=', $minPrice];
    }

    if (!empty($maxPrice)) {
        $where[] = ['ejine', '<=', $maxPrice];
    }

    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("id desc")
        ->select()
        ->toArray();

    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    $fields = $this->app->db->name('DataTemplateField')->where(['template_id' => $contentTemplateId, 'is_sys' => 0, 'status' => 1])->select()->toArray();

    $typeData = [
        'leixing' => [],
    ];

    foreach ($fields as $field) {
        $filedSetting = explode("\r\n", $field['filed_setting']);
        foreach ($filedSetting as $setting) {
            $settingParts = explode('|', $setting);
            if (count($settingParts) === 2) {
                if ($field['field_name'] === 'leixing') {
                    $typeData['leixing'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                }
            }
        }
    }

    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => $typeData
    ]);
}
```

## ♬HTML

```
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>

    <div class="SuoSou">
        <input type="number" id="min-price" placeholder="最低价格" />
        <input type="number" id="max-price" placeholder="最高价格" />
    </div>

    <div id="type-filter-container"></div>
    <div id="container"></div>
</div>
<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1, totalPages = 1, pageSize = 50, totalItems = 0, searchTerm = '';
    let  minPrice = '', maxPrice = '';
    let selectedLeixing = ''

    minPriceInput.addEventListener('input', () => {
        minPrice = minPriceInput.value;
        goToPage(1);
    });

    maxPriceInput.addEventListener('input', () => {
        maxPrice = maxPriceInput.value;
        goToPage(1);
    });

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => {
                const formattedDaiyu = item.daiyu
                    ? item.daiyu.split(/[\r\n]+/).map(line => `<p>${line}</p>`).join('')
                    : '';
                return `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.ejine}</h2>
                </div>
            `;
            }).join('');
        }
    }

    function renderTypeFilters(types) {
        // 清空容器
        typeFilterContainer.innerHTML = '';

        // 渲染 leixing 筛选
        if (types.leixing && types.leixing.length > 0) {
            const leixingContainer = document.createElement('div');
            leixingContainer.classList.add('leixing_filter');
            leixingContainer.innerHTML = '<h3>类型</h3>';
            types.leixing.unshift({ value: '', name: '全部' });
            leixingContainer.innerHTML += types.leixing.map(type =>
                `<div class="InChanPin_radio ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'selected' : ''}">
                    <input type="radio" name="leixing-filter" id="leixing-${type.value}" value="${type.value}" ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'checked' : ''}>
                    <label for="leixing-${type.value}">${type.name}</label>
                </div>`
            ).join('');
            typeFilterContainer.appendChild(leixingContainer);

            // 为 leixing 选项添加事件
            document.querySelectorAll('input[name="leixing-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedLeixing = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }

    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleSouuo', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            leixing: selectedLeixing, 
            minPrice: minPrice,
            maxPrice: maxPrice
        })
            .then(response => {
                console.log('Response data:', response.data); // 检查响应数据
                const { items, total, types } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    renderTypeFilters(types);
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

# 搜索，价格区间，单选，多选，分页

## ♬接口

```
public function getCatArticleSouuo($catId = 0, $num = 0, $page = 1, $title = '', $type = '', $leixing = '', $gengge = [] , $minPrice = null, $maxPrice = null)
{
    // 获取内容模板ID和表名
    $contentTemplateId = $this->app->db->name('DataArticleCate')->where(["id" => $catId])->value("content_template_id");
    $tableName = $this->app->db->name('DataTemplate')->where(["id" => $contentTemplateId])->value("table_name");

    if (empty($catId)) {
        $tableName = "data_article_show_default";
    }

    if (empty($tableName)) {
        return json(['total' => 0, 'items' => [], 'types' => []]);
    }

    $tableName = strtolower($tableName);
    $where = [['status', '=', 1]];

    if (!empty($catId)) {
        $where[] = ['cat_id', '=', $catId];
    }

    if (!empty($title)) {
        $where[] = ['title', 'like', '%' . $title . '%'];
    }

    if (!empty($leixing)) {
        $where[] = ['leixing', '=', $leixing];
    }

     // gengge 筛选
    if (!empty($gengge)) {
        foreach ($gengge as $genggeValue) {
            $where[] = ['gengge', 'like', '%' . $genggeValue . '%'];
        }
    }


    if (!empty($minPrice)) {
        $where[] = ['ejine', '>=', $minPrice];
    }

    if (!empty($maxPrice)) {
        $where[] = ['ejine', '<=', $maxPrice];
    }

    $offset = ($page - 1) * $num;

    // 获取总数据条数
    $total = $this->app->db->name($tableName)
        ->where($where)
        ->count();

    // 获取当前页数据
    $list = $this->app->db->name($tableName)
        ->where($where)
        ->limit($offset, $num)
        ->order("id desc")
        ->select()
        ->toArray();

    foreach ($list as $key => $value) {
        $list[$key]['url'] = "site-list/show-" . $value['cat_id'] . "-" . $value['id'] . ".html";
    }

    $fields = $this->app->db->name('DataTemplateField')->where(['template_id' => $contentTemplateId, 'is_sys' => 0, 'status' => 1])->select()->toArray();

    $typeData = [
        'leixing' => [],
        'gengge' => [],
    ];

    foreach ($fields as $field) {
        $filedSetting = explode("\r\n", $field['filed_setting']);
        foreach ($filedSetting as $setting) {
            $settingParts = explode('|', $setting);
            if (count($settingParts) === 2) {
                if ($field['field_name'] === 'leixing') {
                    $typeData['leixing'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                }elseif ($field['field_name'] === 'gengge') {
                    $typeData['gengge'][] = ['value' => $settingParts[0], 'name' => $settingParts[1]];
                }
            }
        }
        
    }

    return json([
        'total' => $total,
        'items' => $list ?? [],
        'types' => $typeData
    ]);
}
```

## ♬HTML

```
<div class="LieBiao">
    <div class="SuoSou">
        <input type="text" id="search-title" placeholder="请输入搜索关键词" />
        <button id="search-button">搜索</button>
    </div>

    <div class="SuoSou">
        <input type="number" id="min-price" placeholder="最低价格" />
        <input type="number" id="max-price" placeholder="最高价格" />
    </div>

    <div id="type-filter-container"></div>
    <div id="container"></div>
</div>
<script>
    const dataContainer = document.getElementById('container');
    const searchButton = document.getElementById('search-button');
    const searchTitle = document.getElementById('search-title');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const typeFilterContainer = document.getElementById('type-filter-container');

    let currentPage = 1, totalPages = 1, pageSize = 50, totalItems = 0, searchTerm = '';
    let minPrice = '', maxPrice = '';
    let selectedLeixing = ''
    let selectedGengge = [];

    minPriceInput.addEventListener('input', () => {
        minPrice = minPriceInput.value;
        goToPage(1);
    });

    maxPriceInput.addEventListener('input', () => {
        maxPrice = maxPriceInput.value;
        goToPage(1);
    });

    function renderItems(items) {
        if (!items || items.length === 0) {
            dataContainer.innerHTML = '<p>没有更多数据</p>';
        } else {
            dataContainer.innerHTML = items.map(item => {
                const formattedDaiyu = item.daiyu
                    ? item.daiyu.split(/[\r\n]+/).map(line => `<p>${line}</p>`).join('')
                    : '';
                return `
                <div class="Min">
                    <img src="${item.logo}" />
                    <h2>${item.ejine}</h2>
                </div>
            `;
            }).join('');
        }
    }

    function renderTypeFilters(types) {
        // 清空容器
        typeFilterContainer.innerHTML = '';

        // 渲染 leixing 筛选
        if (types.leixing && types.leixing.length > 0) {
            const leixingContainer = document.createElement('div');
            leixingContainer.classList.add('leixing_filter');
            leixingContainer.innerHTML = '<h3>类型</h3>';
            types.leixing.unshift({ value: '', name: '全部' });
            leixingContainer.innerHTML += types.leixing.map(type =>
                `<div class="InChanPin_radio ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'selected' : ''}">
                    <input type="radio" name="leixing-filter" id="leixing-${type.value}" value="${type.value}" ${selectedLeixing === type.value || (type.value === '' && selectedLeixing === '') ? 'checked' : ''}>
                    <label for="leixing-${type.value}">${type.name}</label>
                </div>`
            ).join('');
            typeFilterContainer.appendChild(leixingContainer);

            // 为 leixing 选项添加事件
            document.querySelectorAll('input[name="leixing-filter"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedLeixing = radio.value === '' ? '' : radio.value;
                    goToPage(1);
                });
            });
        }

        if (types.gengge && types.gengge.length > 0) {
            const genggeContainer = document.createElement('div');
            genggeContainer.classList.add('leixing_filter');
            genggeContainer.innerHTML = '<h3>风格</h3>';

            types.gengge.forEach(type => {
                genggeContainer.innerHTML += `
                <div class="InChanPin_radio">
                    <input type="checkbox" id="gengge-${type.value}" value="${type.value}" ${selectedGengge.includes(type.value) ? 'checked' : ''}>
                    <label for="gengge-${type.value}">${type.name}</label>
                </div>
            `;
            });

            typeFilterContainer.appendChild(genggeContainer);

            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        selectedGengge.push(checkbox.value);
                        checkbox.parentNode.classList.add('selected'); // 添加选中样式
                    } else {
                        selectedGengge = selectedGengge.filter(value => value !== checkbox.value);
                        checkbox.parentNode.classList.remove('selected'); // 移除选中样式
                    }
                    goToPage(1);
                });

                // 如果选中，添加类
                if (checkbox.checked) {
                    checkbox.parentNode.classList.add('selected');
                }
            });
        }

    }

    function loadData() {
        axios.post('/admin/zhenshangyin/getCatArticleSouuo', {
            cat_id: '3',
            num: pageSize,
            page: currentPage,
            title: searchTerm,
            leixing: selectedLeixing,
            gengge: selectedGengge,
            minPrice: minPrice,
            maxPrice: maxPrice
        })
            .then(response => {
                console.log('Response data:', response.data); // 检查响应数据
                const { items, total, types } = response.data;
                if (response.data) {
                    totalItems = total;
                    totalPages = Math.ceil(totalItems / pageSize);
                    renderItems(items);
                    renderTypeFilters(types);
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    function goToPage(page) {
        currentPage = page;
        loadData();
    }

    searchButton.addEventListener('click', () => {
        searchTerm = searchTitle.value;
        goToPage(1);
    });

    loadData();
</script>
```

