const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Find the c.innerHTML line and add _aiContext + chatHtml
var marker = 'c.innerHTML = \'<div style="font-size:14px;font-weight:600;margin-bottom:6px">AI \\u667a\\u80fd\\u5206\\u6790</div>\' +';
var idx = c.indexOf(marker);
if (idx < 0) { console.log('marker not found'); process.exit(1); }

var lineEnd = c.indexOf('\n', idx);
var fullLine = c.substring(idx, lineEnd);

var line2 = c.indexOf('+', idx + 100);
var line2End = c.indexOf('\n', line2);
var fullLine2 = c.substring(line2, line2End).trim();

var line3 = c.indexOf(';', line2);
var fullLine3 = c.substring(c.lastIndexOf('\n', line3-1) + 1, line3 + 1);

// Build replacement
var replacement = [
  "PsyAssessment._aiContext = { result: text };",
  "var chatHtml = '<div style=\"margin-top:8px;border-top:1px solid var(--line-light);padding-top:6px\"><div id=\"ai-chat-msgs\" style=\"font-size:12px;line-height:1.6;margin-bottom:4px;max-height:160px;overflow-y:auto\"></div><div style=\"display:flex;gap:4px\"><input id=\"ai-chat-input\" class=\"form-input\" placeholder=\"\\u8ffd\\u95ee...\" style=\"flex:1;font-size:12px;padding:6px 8px\"><button class=\"btn btn-soft btn-sm\" onclick=\"PsyAssessment._genAIChat()\">\\u53d1\\u9001</button></div></div>';",
  "var displayText = text.replace(/\\u3010(.*?)\\u3011/g, '<strong>$1</strong>');",
  "displayText = displayText.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');",
  "displayText = displayText.replace(/\\n/g, '<br>');",
  "c.innerHTML = '<div style=\"font-size:14px;font-weight:600;margin-bottom:6px\">AI \\u667a\\u80fd\\u5206\\u6790</div>' +",
  "  '<div style=\"font-size:13px;line-height:1.8\">' + displayText + '</div>' + chatHtml;"
].join('\n');

// Find the exact range to replace
var rangeStart = c.lastIndexOf('// \\u7b80\\u5355\\u8f6c\\u6362', idx);
if (rangeStart < 0) rangeStart = idx;
var rangeEnd = c.indexOf(';', c.indexOf('displayText', idx + 100) + 20) + 1;

c = c.substring(0, rangeStart) + replacement + c.substring(rangeEnd);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Chat UI added to AI analysis');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});
