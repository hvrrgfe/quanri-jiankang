const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Find the AI analysis display section and add chat UI
// Search for the unique text around line 315-322
var search = 'var c = document.getElementById(\'ai-psy-analysis\');\n      if (c) {\n        // 简单转换';
var idx = c.indexOf(search);
if (idx < 0) { console.log('Pattern not found'); process.exit(1); }

// Find the end of the display section
var endMarker = '// 保存AI分析到档案';
var end = c.indexOf(endMarker, idx);
if (end < 0) { console.log('End marker not found'); process.exit(1); }

var newSection = [
  "var c = document.getElementById('ai-psy-analysis');",
  "      if (c) {",
  "        PsyAssessment._aiContext = { result: text };",
  "        var chatHtml = '<div style=\"margin-top:8px;border-top:1px solid var(--line-light);padding-top:6px\"><div id=\"ai-chat-msgs\" style=\"font-size:12px;line-height:1.6;margin-bottom:4px;max-height:160px;overflow-y:auto\"></div><div style=\"display:flex;gap:4px\"><input id=\"ai-chat-input\" class=\"form-input\" placeholder=\"\\u8ffd\\u95ee...\" style=\"flex:1;font-size:12px;padding:6px 8px\"><button class=\"btn btn-soft btn-sm\" onclick=\"PsyAssessment._genAIChat()\">\\u53d1\\u9001</button></div></div>';",
  "        var displayText = text.replace(/\\u3010(.*?)\\u3011/g, '<strong>$1</strong>');",
  "        displayText = displayText.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');",
  "        displayText = displayText.replace(/\\n/g, '<br>');",
  "        c.innerHTML = '<div style=\"font-size:14px;font-weight:600;margin-bottom:6px\">AI \\u667a\\u80fd\\u5206\\u6790</div>' +",
  "          '<div style=\"font-size:13px;line-height:1.8\">' + displayText + '</div>' + chatHtml;",
  "        // \\u4fdd\\u5b58AI\\u5206\\u6790\\u5230\\u6863\\u6848",
].join('\n');

c = c.substring(0, idx) + newSection + c.substring(end);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Chat UI added');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});
