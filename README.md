# 围棋乐园

面向 6 岁儿童的围棋启蒙应用，包含交互式棋盘、可调难度的 AI 对手、题库闯关与奖励小游戏等。无需后端，打开浏览器即可开始练习。

## 功能特点

- 交互式棋盘：点击落子、动画反馈
- AI 对手：5 档难度，从启蒙到进阶
- 题库闯关：分级题库与关卡提示
- 奖励机制：星星收集与小游戏
- 语音提示：中文语音引导
- 复盘点目：局势与得分展示
- 无障碍支持：键盘操作与 ARIA 标签
- 进度保存：本地持久化进度与偏好

## 游戏模式

1. 启蒙课：吃子与连子基础
2. 题库闯关：死活题挑战
3. 对战练习：与 AI 小狐狸对弈
4. 故事关卡：剧情式闯关（规划中）
5. 奖励乐园：星星小游戏

## 难度等级

- 启蒙 1-2：入门友好
- 小棋童 1-2：中级练习
- 小棋士 1：高阶挑战

## 技术栈与版本

- HTML5
- CSS3
- JavaScript（ES2015+）
- Web Audio API（音效）
- Web Speech API（SpeechSynthesis，语音提示）
- Web Storage API（LocalStorage，进度与偏好）
- Clipboard API（分享链接/口令复制）

## 项目结构

```
weiqi/
├── index.html      # 应用入口
├── app.js          # 核心逻辑
├── styles.css      # 样式与视觉系统
├── puzzles.json    # 题库数据
├── README.md       # 说明文档
```

## 快速开始

1. 直接打开 `index.html`
2. 或部署到任意静态托管平台（如 Vercel/Netlify）

## 题库格式

题库支持 JSON 导入，结构如下：

```json
{
  "levels": [
    {
      "id": "basic",
      "name": "启蒙",
      "puzzles": [
        {
          "title": "数气：吃掉一颗白子",
          "stones": [
            {"row": 3, "col": 3, "color": "black"},
            {"row": 3, "col": 4, "color": "white"}
          ],
          "answer": {"row": 4, "col": 4}
        }
      ]
    }
  ]
}
```

## 浏览器兼容

- Chrome / Edge：完整支持（含语音）
- Safari：完整支持（含语音）
- Firefox：基本支持（语音表现可能略有差异）
- 移动端：响应式布局适配

## 键盘快捷键

- `Escape`：关闭弹窗
- `Tab`：在可交互元素间切换
- `Enter/Space`：激活按钮与棋盘落点

## 致谢

为歪歪定制的围棋启蒙作品。
