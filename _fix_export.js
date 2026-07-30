const fs = require('fs');
let content = fs.readFileSync('D:/three-meals-app/js/components/exportShare.js', 'utf8');

// Add personality section right before the export closing div
const callMarker = `\${hasDiet ? \`<button class="btn btn-soft btn-sm flex-1" onclick="ExportShare._printPDF()">`;
const personalityCall = `\${this._personalitySection()}\n\n\t      <div style="display:flex;gap:6px;margin-top:8px">\n\t        \${hasDiet ? \`<button class="btn btn-soft btn-sm flex-1" onclick="ExportShare._printPDF()">`;

// Find the best insertion point - after the exercise section and before buttons
const searchStr = "暂无运动计划，去运动页生成";
const idx = content.indexOf(searchStr);
if (idx >= 0) {
  const insertPos = content.indexOf("return html", idx);
  // Actually, let's just add the methods at the end of the file and insert the call
  // Find the closing of show() method - look for the end of template
  const closeShow = content.indexOf("`;\n  },\n\n  _genText()");
  if (closeShow >= 0) {
    // Insert personalitySection call before close of template
    const templateEnd = content.lastIndexOf("`", closeShow);
    // Find the buttons div and add the personality section before it
    const btnDiv = content.lastIndexOf('<div style="display:flex;gap:6px;margin-top:8px">', closeShow);
    if (btnDiv > templateEnd) {
      const personalitySectionHtml = "\\n\\n      ${this._personalitySection()}\\n\\n      ";
      content = content.slice(0, btnDiv) + personalitySectionHtml + content.slice(btnDiv);
      console.log('Inserted personality section call');
    } else {
      console.log('btnDiv not found as expected');
    }
  }
}

// Append the personality methods before the last line
const lastLine = content.lastIndexOf('\n};');
if (lastLine > 0) {
  const methodsToAdd = `
  _personalitySection() {
    const p = Store.getProfile();
    const psy = p && p.psyAssessments ? p.psyAssessments : {};
    const mbtiKey = Object.keys(psy).find(function(k) { return k.indexOf('mbti') >= 0; });
    if (!mbtiKey || !psy[mbtiKey] || !psy[mbtiKey].dims) return '';
    var rec = psy[mbtiKey];
    var dims = rec.dims || [];
    var dimLabels = ['外向性','开放性','理性/宜人性','尽责性','稳定性'];
    return \`
      <div class="note-card" style="margin-bottom:14px">
        <div style="font-weight:600;font-size:14px;margin-bottom:8px">人格报告</div>
        \${rec.level ? '<div style="font-size:12px;color:var(--text-soft);margin-bottom:6px">' + rec.level + '</div>' : ''}
        <div style="margin-top:8px">
          <textarea id="export-personality" style="width:100%;height:200px;font-size:13px;border:1px solid var(--line);border-radius:6px;padding:10px;font-family:monospace" readonly>\${this._genPersonalityText(psy[mbtiKey])}</textarea>
        </div>
        <button class="btn btn-primary btn-sm btn-block" onclick="ExportShare._copyPersonality()">复制人格报告</button>
      </div>\`;
  },

  _genPersonalityText(rec) {
    if (!rec) return '';
    var lines = ['全日健康 · 人格测评报告', ''];
    if (rec.level) lines.push('类型：' + rec.level);
    lines.push('日期：' + (rec.date || ''));
    lines.push('');
    if (rec.dims) {
      var dimLabels = ['外向性 (E/I)','开放性 (S/N)','理性/宜人性 (T/F)','尽责性 (J/P)','稳定性 (A/T)'];
      rec.dims.forEach(function(d, i) {
        lines.push(dimLabels[i] + '：' + d.score + '/' + d.max + ' (' + (d.max > 0 ? Math.round(d.score/d.max*100) : 0) + '%)');
      });
    }
    lines.push('');
    lines.push('基于大五人格 · IPIP-NEO-120');
    lines.push('由 全日健康 生成');
    return lines.join('\\n');
  },

  _copyPersonality() {
    var ta = document.getElementById('export-personality');
    if (!ta) return;
    ta.select();
    document.execCommand('copy');
    Helpers.toast('已复制');
  },
`;
  content = content.slice(0, lastLine) + methodsToAdd + content.slice(lastLine);
  console.log('Added personality methods');
}

fs.writeFileSync('D:/three-meals-app/js/components/exportShare.js', content, 'utf8');
console.log('Done!');
