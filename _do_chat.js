const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Step 1: Add _aiContext
c = c.replace(
  'var displayText = text.replace(/【(.*?)】/g',
  'PsyAssessment._aiContext = { result: text };\n        var displayText = text.replace(/【(.*?)】/g'
);

// Step 2: Add chatHtml to c.innerHTML
c = c.replace(
  "'<div style=\"font-size:13px;line-height:1.8\">' + displayText + '</div>';",
  "'<div style=\"font-size:13px;line-height:1.8\">' + displayText + '</div>' +\n          '<div style=\"margin-top:8px;border-top:1px solid var(--line-light);padding-top:6px\"><div id=\"ai-chat-msgs\" style=\"font-size:12px;line-height:1.6;margin-bottom:4px;max-height:160px;overflow-y:auto\"></div><div style=\"display:flex;gap:4px\"><input id=\"ai-chat-input\" class=\"form-input\" placeholder=\"追问...\" style=\"flex:1;font-size:12px;padding:6px 8px\"><button class=\"btn btn-soft btn-sm\" onclick=\"PsyAssessment._genAIChat()\">发送</button></div></div>';"
);

// Step 3: Add _genAIChat method
var m = [];
m.push("");
m.push("  _genAIChat() {");
m.push("    var inp = document.getElementById('ai-chat-input');");
m.push("    var msgs = document.getElementById('ai-chat-msgs');");
m.push("    if (!inp || !msgs || !inp.value.trim()) return;");
m.push("    var q = inp.value.trim(); inp.value = '';");
m.push("    msgs.innerHTML += '<div style=\"text-align:right;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--brand-bg);border-radius:10px 10px 2px 10px;font-size:12px\">' + q + '</span></div><div id=\"ai-chat-loading\" style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--text-hint)\">...</span></div>';");
m.push("    msgs.scrollTop = msgs.scrollHeight;");
m.push("    var ctx = PsyAssessment._aiContext || {};");
m.push("    var base = ctx.result ? JSON.stringify(ctx.result) : '';");
m.push("    Helpers.callLLM('你是心理学专家。根据已有分析回答用户问题。', '用户问题:' + q, Store.getApiKey()).then(function(r) {");
m.push("      var text = ''; if (typeof r === 'object' && r.text) text = r.text; else if (typeof r === 'object' && r.content) text = r.content; else if (typeof r === 'string') text = r; else text = JSON.stringify(r);");
m.push("      var ld = document.getElementById('ai-chat-loading'); if (ld) ld.outerHTML = '<div style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px\">' + text.substring(0,300) + '</span></div>';");
m.push("      var m2 = document.getElementById('ai-chat-msgs'); if (m2) m2.scrollTop = m2.scrollHeight;");
m.push("    }).catch(function() { var ld = document.getElementById('ai-chat-loading'); if (ld) ld.outerHTML = '<div style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--red)\">失败</span></div>'; });");
m.push("  },");
c = c.replace("};", m.join("\n") + "\n};");

fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Done');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});
