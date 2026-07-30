const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

const start = c.indexOf('  _importData(event)');
const end = c.indexOf('  },', c.indexOf('reader.readAsText(file);'));

const newFunc = [
  '  _importData(event) {',
  '    var file = event.target && event.target.files && event.target.files[0];',
  '    if (!file) return;',
  '    var reader = new FileReader();',
  '    reader.onload = function(e) {',
  '      try {',
  '        var data = JSON.parse(e.target.result);',
  '        if (!data || data.type !== \'psy_assessments_export\') { Helpers.toast(\'文件格式错误\'); return; }',
  '        var p = Store.getProfile();',
  '        if (!p) { Helpers.toast(\'请先设置档案\'); return; }',
  '        if (!p.psyAssessments) p.psyAssessments = {};',
  '        var cnt = 0;',
  '        for (var key in data.assessments) {',
  '          var val = data.assessments[key];',
  '          if (typeof val === \'object\' && !Array.isArray(val)) { p.psyAssessments[key] = val; cnt++; }',
  '          if (key.endsWith(\'_history\') && Array.isArray(val) && val.length) {',
  '            var mk = key.replace(\'_history\', \'\');',
  '            if (!p.psyAssessments[mk]) { p.psyAssessments[mk] = val[val.length - 1]; cnt++; }',
  '          }',
  '        }',
  '        Store.setProfile(p);',
  '        Helpers.toast(\'已导入 \' + cnt + \' 条\');',
  '        PsyAssessment.show();',
  '      } catch(e) { Helpers.toast(\'导入失败: \' + e.message); }',
  '    }.bind(this);',
  '    reader.readAsText(file);',
  '  },'
].join('\n');

c = c.substring(0, start) + newFunc + c.substring(end + 3);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Replaced import function');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});
