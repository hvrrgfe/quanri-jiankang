const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// SAve AI context before the c.innerHTML line
c = c.replace(
  "c.innerHTML = '<div style=\"font-size:14px;font-weight:600;margin-bottom:6px\">AI \\u667a\\u80fd\\u5206\\u6790</div>' +",
  "PsyAssessment._aiContext = { result: text };\n        // Append chat UI after analysis\n        var chatDiv = document.createElement('div');\n        chatDiv.innerHTML = '<div style=\"margin-top:8px;border-top:1px solid var(--line-light);padding-top:6px\"><div id=\"ai-chat-msgs\" style=\"font-size:12px;line-height:1.6;margin-bottom:4px;max-height:160px;overflow-y:auto\"></div><div style=\"display:flex;gap:4px\"><input id=\"ai-chat-input\" class=\"form-input\" placeholder=\"\\u8ffd\\u95ee...\" style=\"flex:1;font-size:12px;padding:6px 8px\"><button class=\"btn btn-soft btn-sm\" onclick=\"PsyAssessment._genAIChat()\">\\u53d1\\u9001</button></div></div>';\n        try { document.getElementById('ai-psy-analysis').appendChild(chatDiv); } catch(e) {}\n        c.innerHTML = '<div style=\"font-size:14px;font-weight:600;margin-bottom:6px\">AI \\u667a\\u80fd\\u5206\\u6790</div>' +"
);

// Add _genAIChat method before closing
c = c.replace("};", "\n" +
"  _genAIChat() {\n" +
"    var inp = document.getElementById('ai-chat-input');\n" +
"    var msgs = document.getElementById('ai-chat-msgs');\n" +
"    if (!inp || !msgs || !inp.value.trim()) return;\n" +
"    var q = inp.value.trim(); inp.value = '';\n" +
"    msgs.innerHTML += '<div style=\"text-align:right;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--brand-bg);border-radius:10px 10px 2px 10px;font-size:12px\">' + q + '</span></div><div id=\"ai-chat-loading\" style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--text-hint)\">...</span></div>';\n" +
"    msgs.scrollTop = msgs.scrollHeight;\n" +
"    var ctx = PsyAssessment._aiContext || {};\n" +
"    var base = ctx.result ? '\\u57fa\\u4e8e\\u4ee5\\u4e0b\\u5206\\u6790\\u56de\\u7b54\\uff1a' + ctx.result : '';\n" +
"    Helpers.callLLM('\\u4f60\\u662f\\u5fc3\\u7406\\u5b66\\u4e13\\u5bb6\\u3002\\u6839\\u636e\\u5df2\\u6709\\u5206\\u6790\\u56de\\u7b54\\u7528\\u6237\\u95ee\\u9898\\u3002', '\\u7528\\u6237\\u95ee\\u9898:' + q, Store.getApiKey()).then(function(r) {\n" +
"      var text = '';\n" +
"      if (typeof r === 'object' && r.text) text = r.text;\n" +
"      else if (typeof r === 'object' && r.content) text = r.content;\n" +
"      else if (typeof r === 'string') text = r;\n" +
"      else text = JSON.stringify(r);\n" +
"      var ld = document.getElementById('ai-chat-loading');\n" +
"      if (ld) ld.outerHTML = '<div style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px\">' + text.substring(0, 300) + '</span></div>';\n" +
"      var m = document.getElementById('ai-chat-msgs');\n" +
"      if (m) m.scrollTop = m.scrollHeight;\n" +
"    }).catch(function() {\n" +
"      var ld = document.getElementById('ai-chat-loading');\n" +
"      if (ld) ld.outerHTML = '<div style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--red)\">\\u5931\\u8d25</span></div>';\n" +
"    });\n" +
"  },\n" +
"};\n");

fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Done');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});
