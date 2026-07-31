# 知程 PlanWise

> 循证驱动的科学规划工具 —— 把前沿研究变成产品功能。

纯前端、零服务器、数据存本地(localStorage)的规划 Web App,手机端优先,可安装 PWA,离线可用。

## 快速启动

```bash
# 任选其一
python3 -m http.server 3112     # 纯静态
node server.js --port 3112      # 若有 server.js 代理需求
```

打开 `http://localhost:3112`;手机同一 Wi-Fi 访问 `http://电脑IP:3112`;公网可用 GitHub Pages / cpolar / ngrok / cloudflared 穿透(参考同目录部署说明或全日健康项目《部署指南.md》)。

## 功能与科学依据一一对应

| 功能 | 前沿研究 |
|------|---------|
| WOOP 目标四步法(愿望→结果→障碍→计划) | Oettingen 心理对照;MCII 荟萃分析(g=0.336,Wang et al., Frontiers in Psychology) |
| if-then 实施意图(每任务自动生成触发规则) | Gollwitzer 2024, European Review of Social Psychology, 642 项测试元分析 |
| 参照类别时间校准(预估自动 ×1.5~2 缓冲) | Kahneman & Tversky 规划谬误;Flyvbjerg 参照类别预测(2008;《How Big Things Get Done》2023) |
| 具体+有难度目标 + 每周反馈复盘 | Locke & Latham 目标设置理论(2002, American Psychologist) |
| 番茄钟专注 + 方向性统计 | Aeon et al. 时间管理荟萃分析(2021, PLOS ONE) |
| "计划前回顾同类经验"的产品化(个人历史均值提示) | Jensen, Hennequin & Mattar 2024, Nature Neuroscience(前额叶模拟+海马认知地图) |

## 页面

- **今天**:目标倒计时、WOOP 目标卡片、今日任务、专注入口
- **目标**:WOOP 四步引导 + 目标管理
- **计划**:任务添加(含 if-then 触发器 + 时间校准提示)、任务列表
- **专注**:番茄钟(25/45/60 分钟)+ 今日统计
- **数据**:完成率、预估 vs 实际偏差(规划谬误警报)、7 日专注趋势、科学依据
- **更多**:设置目标日期、JSON 导入导出、全部研究引用

## 技术

原生 HTML/CSS/JS,零依赖;localStorage 存储;Service Worker 离线缓存;Feather Icons(开源 SVG 图标)。MIT 协议。
