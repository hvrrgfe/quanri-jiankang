const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Find _startFromHistory and the code before _showHistoricalResult
const start = c.indexOf('  _startFromHistory(key) {');
const end = c.indexOf('  _showHistoricalResult(record) {');

if (start < 0 || end < 0) { console.log('ERROR: markers not found'); process.exit(1); }

// Build replacement
const replacement = `  _startFromHistory(key) {
    for (var ck in AssessmentsDB) {
      if (AssessmentsDB[ck] && AssessmentsDB[ck][key]) {
        var p = Store.getProfile();
        var record = p && p.psyAssessments && p.psyAssessments[key];
        if (record) {
          this._currentCat = ck;
          this._currentKey = key;
          if (key.indexOf('mbti') >= 0) { this._answers = record.rawAnswers || {}; this._showResult(); return; }
          this._answers = record.rawAnswers || {};
          this._showHistoricalResult(record); return;
        }
      }
    }
    Helpers.toast('\\u627e\\u4e0d\\u5230\\u8be5\\u91cf\\u8868');
  },\n\n`;

c = c.substring(0, start) + replacement + c.substring(end);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Replaced _startFromHistory');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});
