<div align=center>
<img  src="docs/logo.png" width="200px"/>
</div>

<h1 align="center">
 Qwerty Learner VSCode
</h1>

<p align="center">
  为键盘工作者设计的单词记忆与英语肌肉记忆锻炼软件  VSCode 摸🐟版
</p>
<p align="center">
  <a href="https://github.com/Kaiyiwing/qwerty-learner-vscode/blob/master/LICENSE"><img src="https://img.shields.io/github/license/KaiyiWing/qwerty-learner-vscode" alt="License"></a>
  <a><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"/></a>
  <a><img src="https://img.shields.io/badge/Powered%20by-VSCode-blue"/></a>
</p>

<div align=center>
<img  src="docs/Screenshot.png"/>
</div>

## 💡 演示

<div align=center>
<img  src="docs/typing.gif"/>
</div>

## 📸 安装

[VSCode Plugin Market](https://marketplace.visualstudio.com/items?itemName=Kaiyi.qwerty-learner)

<br/>

本项目为 [Qwerty Learner](https://github.com/Kaiyiwing/qwerty-learner) 的 VSCode 插件版本，访问原始项目获得更好的体验。

## ✨ 实现原理

因为 VSC 没有提供对 Keypress 的回调，所以实现上使用了较为取巧的方式，监听用户当前输入文档的改变，然后删除用户输入。 用户可以在任意代码、文档页面开启软件进行英语打字练习，插件会自动删除用户输入的文字，不会对文档内容造成影响。

目前存在的 Bug，在用户输入速度较快(特别是同时按下多个键)时，可能会导致删除不完全，用户自行删除输入即可。

## 🎛 使用说明

### 一键启动

**Mac** `Control + Shift + Q`

**Win** `Shift + Alt + Q`

可以在任意文档中使用快捷键启动，启动后插件将屏蔽用户对文档的输入，只需关注状态栏上的单词即可。

**⚠️ 切记需关闭中文输入法**，目前插件在开启中文输入法会有 Bug，待修复

### 章节、词典选择

打开 VSCode 命令面板，通过 "Qwerty" 前缀过滤，即可发现插件内置的命令。

<div align=center>
<img  src="docs/command.png"/>
</div>

- Change Chapter 可以切换章节
- Change Dictionary 可以切换字典
- Start/Pause 可以开关插件，功能等价于一键启动快捷键
- Toggle Word Visibility 切换是否展示单词（默写模式）
- Toggle Read Only Mode 开关只读模式
- Toggle Chapter Cycle Mode 章节循环模式
- Clear Wrong Book 清空错题本
- Remove Current Word from Wrong Book 从错题本移除当前单词（仅在错题本模式下可用）

命令面板快捷键  
Mac: `cmd + shift + p`  
Win: `ctrl + shift + p`

### 🔥 错题本功能

插件具有智能错题本功能，可以帮助你专项练习容易出错的单词：

- **自动收集错误**：当你输入错误时，单词会自动添加到错题本
- **专项练习**：选择"我的错题本"词典，专门练习错误单词
- **智能管理**：
  - 在错题本模式下掌握单词后，会显示鼓励信息
  - **自动移除已掌握单词**：在错题本模式下，当单词达到设定的练习次数后，会自动从错题本移除
  - 可以手动从错题本移除已掌握的单词
  - 支持一键清空错题本
- **持久化存储**：错题本数据会自动保存，重启VSCode后依然保留

使用方法：
1. 在任意词典中练习，输错的单词会自动加入错题本
2. 通过命令面板选择"我的错题本"词典进行专项练习
3. 在错题本模式下，掌握的单词会自动移除，无需手动操作
4. 使用"Clear Wrong Book"命令可以清空错题本
5. 在错题本模式下，使用"Remove Current Word from Wrong Book"可以手动移除当前单词

### 📚 自定义章节功能

插件支持为词典配置自定义章节，可以根据特定单词来切割章节，而不是固定的单词数量：

#### 功能特性：
- **灵活章节长度**：每章可以包含不同数量的单词
- **语义化分组**：可以按主题、难度等进行分组
- **编译时验证**：自动检查配置的首个单词是否存在于词典中

#### 配置方法：
在词典定义中添加 `chapterStartWords` 字段：

```typescript
{
  id: 'custom-dict',
  name: '自定义词典',
  // ... 其他配置
  chapterStartWords: ['abandon', 'campus', 'debate', 'factor', 'gallon']
}
```

#### 工作原理：
- 第1章：从 'abandon' 开始，到 'campus' 之前的所有单词
- 第2章：从 'campus' 开始，到 'debate' 之前的所有单词
- 第3章：从 'debate' 开始，到 'factor' 之前的所有单词
- ...
- 最后一章：从最后一个指定单词开始，到词典末尾

#### 验证工具：
运行以下命令验证配置：
```bash
yarn run validate-dictionaries
```

#### 注意事项：
- 确保 `chapterStartWords` 中的单词确实存在于词典文件中
- 状态栏会显示 `chp.X(自定义)` 来标识使用了自定义章节
- 如果不配置 `chapterStartWords`，将使用默认的固定长度切割方式

### 快捷配置

这里列出了用于启用/禁用章节循环模式的快捷键配置。章节循环模式默认情况下是禁用的。

- **Mac**: 使用键盘快捷键 `Control + Shift + C` 可以启用/禁用章节循环模式。
- **Win**: 使用键盘快捷键 `Shift + Alt + C` 可以启用/禁用章节循环模式。

### 进阶配置

可以在设置面板查找关键字 "Qwerty" 修改设置

```json
"qwerty-learner.highlightWrongColor": {
  "type": "string",
  "default": "#EE3D11",
  "description": "输入错误时单词的颜色"
},
"qwerty-learner.highlightWrongDelay": {
  "type": "number",
  "default": 400,
  "description": "输入错误时清空输入的延迟时间"
},
"qwerty-learner.keySound": {
  "type": "boolean",
  "default": true,
  "description": "是否开启键盘音"
},
"qwerty-learner.phonetic": {
  "type": "string",
  "enum": [
    "us",
    "uk",
    "close"
  ],
  "default": "close",
  "description": "是否开启音标"
},
"qwerty-learner.chapterLength": {
  "type": "integer",
  "default": 20,
  "minimum": 1,
  "maximum": 100,
  "description": "每个章节包含的单词数量"
},
"qwerty-learner.wordExerciseTime": {
  "type": "integer",
  "default": 1,
  "minimum": 1,
  "maximum": 100,
  "description": "每个单词的练习次数"
},
"qwerty-learner.readOnlyInterval": {
  "type": "number",
  "default": 5000,
  "description": "只读模式中单词切换间隔时间(ms)"
},
"qwerty-learner.voiceType": {
  "type": "string",
  "enum": [
    "us",
    "uk",
    "close"
  ],
  "default": "us",
  "description": "是否开启发音"
},
"qwerty-learner.placeholder": {
  "type": "string",
  "enum": [
    "_",
    "*",
    "-",
    ""
  ],
  "default": "-",
  "description": "未输入时的占位符，空表示无占位符（仅当wordVisibility === true时生效）"
},
"qwerty-learner.random": {
  "type": "boolean",
  "default": false,
  "description": "是否章节内单词顺序随机"
},
"qwerty-learner.chapterCycle": {
  "type": "boolean",
  "default": false,
  "description": "是否章节循环"
}
```

## 📕 词库列表

- **我的错题本** - 收集输入错误的单词，专项练习
- CET-4
- CET-6
- GMAT
- GRE
- IELTS
- 考研
- 专四
- 专八
- 高考 3500 词
- SAT
- TOEFL
- 商务英语
- BEC
- Coder Dict
- JS: Array
- JS: Date
- JS: Global
- JS: Map & Set
- JS: Math
- JS: Number
- JS: Object
- JS: Promise
- JS: String
- Python: Built-in
- Python: array
- Python: date
- Python: file
- Python: class
- Python: set
- Python: math
- Python: string
- Python: system
- Java: ArrayList
- Java: Character
- Java: Hashmap
- Java: LinkedList
- Java: String
- Java: StringBuffer
- Linux
- C#: List API
- 新概念英语-1
- 新概念英语-2
- 新概念英语-3
- 新概念英语-4
- SAT en-en
- Essential Words
- Essential Words
- suffix word
- word roots1
- ...

## 🌟 Stargazers over time

[![Stargazers over time](https://starchart.cc/Kaiyiwing/qwerty-learner-vscode)](https://starchart.cc/Kaiyiwing/qwerty-learner-vscode)
