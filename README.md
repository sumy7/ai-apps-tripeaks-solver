# TriPeaks 求解器

一个基于 React + TypeScript + TailwindCSS 构建的 PC 端 TriPeaks 纸牌游戏求解器。

![TriPeaks Solver](https://github.com/user-attachments/assets/b546f7a0-2675-41e3-857c-7a3154e1316f)

## 功能特性

### 核心功能

- **右键标注卡牌** - 右键点击任意卡牌，可以标注其花色和点数
- **新游戏** - 重置整个游戏棋盘，清除所有标注
- **求解** - 根据当前标注自动求解游戏，遇到未标注的卡牌时停止
- **重置** - 将所有卡牌放回初始位置，但保留标注信息
- **导入/导出** - 将游戏状态保存为 JSON 文件，或从文件导入

### 求解算法

- 使用贪心算法尝试从金字塔中移除卡牌
- 当金字塔无法移除时自动从库存翻牌
- 遇到未标注的卡牌（金字塔或库存）时停止
- 记录求解过程中的所有步骤

### 步骤历史与导航

- 完整的求解步骤历史记录
- 点击任意步骤可跳转到该步骤的棋盘状态
- 当前步骤高亮显示

### 现代化 UI

- 使用 React + TypeScript + TailwindCSS 构建
- 响应式金字塔布局，正确显示卡牌遮挡关系
- 花色颜色编码（红色表示红桃/方块，黑色表示梅花/黑桃）
- 未标注卡牌显示为问号
- 被遮挡的卡牌显示为深色

## 技术栈

- React 18.2
- TypeScript 5.2
- TailwindCSS 3.3
- Vite 5.0 (构建工具)
- ESLint (代码质量)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

然后在浏览器中打开 http://localhost:5173/

### 构建生产版本

```bash
npm run build
```

构建结果将输出到 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 使用说明

1. **标注卡牌**：右键点击卡牌，从弹出菜单中选择对应的花色和点数
2. **求解游戏**：标注足够的卡牌后，点击"求解"按钮开始自动求解
3. **查看历史**：在求解步骤历史中点击任意步骤，可以查看该步骤的棋盘状态
4. **重置棋盘**：点击"重置"按钮将所有卡牌放回初始位置，但保留标注信息
5. **导出/导入**：点击"导出"保存当前游戏状态，点击"导入"加载之前保存的状态

## TriPeaks 规则

TriPeaks（三峰纸牌）是一种单人纸牌游戏：

- 28张卡牌排成三个金字塔形状
- 24张卡牌作为库存
- 目标是移除金字塔中的所有卡牌
- 卡牌可以移除的条件：
  - 未被其他卡牌遮挡
  - 点数与弃牌堆顶部卡牌相差1（A和K相邻）

## 截图

### 右键标注菜单
![Context Menu](https://github.com/user-attachments/assets/ac9b0ad9-3ea6-4522-bc87-47a2d407f4dc)

### 导入游戏状态
![After Import](https://github.com/user-attachments/assets/de37c776-f791-4111-a04c-b4d474a9c83f)

### 求解后的步骤历史
![After Solve](https://github.com/user-attachments/assets/7d4c7567-905f-45cf-a3ca-6392fa75265b)

## License

MIT