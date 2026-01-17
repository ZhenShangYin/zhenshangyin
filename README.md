# zhenshangyin

这是一个 Vue 项目的打包文件。

## 上传到 GitHub 的步骤

### 前提条件
确保已安装 Git：https://git-scm.com/download/win

### 上传步骤

1. **初始化 Git 仓库**
   ```bash
   git init
   ```

2. **添加所有文件**
   ```bash
   git add .
   ```

3. **配置 Git 用户信息（首次使用需要）**
   ```bash
   git config --global user.email "你的GitHub邮箱"
   git config --global user.name "你的用户名"
   ```

4. **提交文件**
   ```bash
   git commit -m "first commit"
   ```

5. **重命名分支为 main**
   ```bash
   git branch -M main
   ```

6. **添加远程仓库**
   ```bash
   git remote add origin https://github.com/ZhenShangYin/zhenshangyin.git
   ```

7. **推送到 GitHub**
   ```bash
   git push -u origin main
   ```

## 注意事项

- 首次推送需要输入 GitHub 用户名和密码（建议使用 Personal Access Token）
- 如果远程仓库已存在内容，可能需要先拉取：`git pull origin main --allow-unrelated-histories`