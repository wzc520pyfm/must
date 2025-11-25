# NPM 发布指南

本文档介绍如何将 `must` 项目发布到 NPM。

## 准备工作

### 1. 安装依赖

```bash
npm install
```

### 2. 构建项目

```bash
npm run build
```

这将编译 TypeScript 代码到 `dist` 目录。

### 3. 测试构建产物

在本地测试构建后的包：

```bash
# 在项目目录中
npm link

# 在其他测试项目中
npm link must

# 测试命令
must --help
```

## 发布到 NPM

### 首次发布

1. **登录 NPM**

```bash
npm login
```

输入你的 NPM 用户名、密码和邮箱。

2. **检查包名是否可用**

```bash
npm view must
```

如果返回 404，说明包名可用。否则需要修改 `package.json` 中的 `name` 字段。

3. **发布包**

```bash
npm publish
```

如果包名被占用，可以使用作用域包名：

```bash
# 修改 package.json 中的 name 为 @your-username/must
npm publish --access public
```

### 更新版本

发布新版本前，需要更新版本号：

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次版本 (1.0.0 -> 1.1.0)
npm version minor

# 主版本 (1.0.0 -> 2.0.0)
npm version major
```

然后发布：

```bash
npm publish
```

## 发布清单

发布前请确认：

- [ ] 所有代码已提交到 Git
- [ ] 通过了所有测试
- [ ] 更新了 CHANGELOG.md
- [ ] 更新了 README.md
- [ ] 版本号已正确更新
- [ ] 构建成功且无错误
- [ ] 在本地测试过构建产物

## 包含的文件

根据 `.npmignore` 和 `package.json` 的 `files` 字段，发布时会包含：

- `dist/` - 编译后的 JavaScript 文件
- `README.md` - 项目文档
- `LICENSE` - 许可证文件
- `package.json` - 包配置文件

## 发布后

1. **验证发布**

```bash
npm view must
```

2. **测试安装**

```bash
# 在新目录中
npm install -g must
must --version
```

3. **创建 Git 标签**

```bash
git tag v1.0.0
git push --tags
```

## 故障排除

### 发布失败

如果发布失败，检查：

1. 是否已登录 NPM
2. 包名是否已被占用
3. 版本号是否已存在
4. 网络连接是否正常

### 包名被占用

有两个解决方案：

1. 使用作用域包名：`@your-username/must`
2. 选择其他包名，如：`must-i18n`, `must-translate` 等

### 权限问题

如果遇到权限错误：

```bash
# 使用作用域包名并设置公开访问
npm publish --access public
```

## 维护

### 撤销发布

**注意**：只能撤销发布 72 小时内的版本。

```bash
npm unpublish must@1.0.0
```

### 废弃版本

如果不想撤销，可以标记为废弃：

```bash
npm deprecate must@1.0.0 "This version has been deprecated"
```

## 持续集成

建议使用 GitHub Actions 自动发布：

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 资源链接

- [NPM 文档](https://docs.npmjs.com/)
- [发布 NPM 包](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [语义化版本](https://semver.org/lang/zh-CN/)
