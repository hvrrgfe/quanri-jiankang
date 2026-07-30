const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// 1. Save/restore progress in _start and _renderQ
const startMarker = '  _start(cat, key) {';
if (c.indexOf(startMarker) >= 0) {
  const old = `  _start(cat, key) {
    this._currentCat = cat;
    this._currentKey = key;
    this._currentQ = 0;
    this._answers = {};
    this._renderIntro();`;
  const repl = `  _start(cat, key) {
    this._currentCat = cat;
    this._currentKey = key;
    // Check for saved progress
    var savedProgress = Store.get('psy_progress', {});
    if (savedProgress.key === cat + '_' + key && savedProgress.answers && savedProgress.currentQ > 0) {
      if (confirm('\\u4e0a\\u6b21\\u6d4b\\u8bd5\\u8fdb\\u5ea6\\u672a\\u5b8c\\u6210\\uff0c\\u662f\\u5426\\u7ee7\\u7eed\\uff1f')) {
        this._currentQ = savedProgress.currentQ;
        this._answers = savedProgress.answers;
        this._testStart = Date.now() - (savedProgress.elapsed || 0);
        this._renderQ('next');
        return;
      }
      Store.remove('psy_progress');
    }
    this._currentQ = 0;
    this._answers = {};
    this._renderIntro();`;
  c = c.replace(old, repl);
  console.log('1. Save/restore progress: replaced _start');
}

// 2. Save progress after each answer - modify _pick method
const pickMarker = '  _pick(optionIdx) {';
if (c.indexOf(pickMarker) >= 0) {
  const oldPick = `  _pick(optionIdx) {
    this._answers[this._currentQ] = optionIdx;
    this._renderQ('next');`;
  const newPick = `  _pick(optionIdx) {
    this._answers[this._currentQ] = optionIdx;
    // Save progress
    try {
      Store.set('psy_progress', {
        key: this._currentCat + '_' + this._currentKey,
        answers: this._answers,
        currentQ: this._currentQ + 1,
        elapsed: Date.now() - (this._testStart || Date.now()),
      });
    } catch(e) {}
    this._renderQ('next');`;
  c = c.replace(oldPick, newPick);
  console.log('2. Save after answer: replaced _pick');
}

// 3. Clear progress on result
const resultMarker = 'p.psyAssessments[this._currentKey] = {';
if (c.indexOf(resultMarker) >= 0) {
  const oldResult = `p.psyAssessments[this._currentKey] = {`;
  const newResult = `Store.remove('psy_progress');
      p.psyAssessments[this._currentKey] = {`;
  c = c.replace(oldResult, newResult);
  console.log('3. Clear progress on result');
}

// 4. Add lie scale to validity section
const lieMarker = "consistencyPairs.forEach(function(pair) {";
if (c.indexOf(lieMarker) >= 0) {
  const addLie = `// Social desirability / Lie indicators
        var lieScore = 0;
        var lieItems = [54,55,56,57,58,59]; // Morality facet - claiming extreme honesty
        lieItems.forEach(function(li) {
          var la = this._answers[li];
          if (la !== undefined) {
            // Reverse items (55-59) answered as 1='very inaccurate' means admitting dishonesty
            var isRev = li >= 55;
            var lv = isRev ? (la === 0 ? 1 : la === 4 ? 0 : la === 1 ? 0.5 : 0) : (la === 4 ? 1 : la === 0 ? 0 : la === 3 ? 0.5 : 0);
            lieScore += lv;
          }
        }.bind(this));
        var lieFlag = lieScore >= 4 ? 1 : 0;
        if (lieFlag) consistencyIssues++;

        // Fatigue detection - tail speed vs head speed
        var fatigueFlag = 0;
        if (this._answerTimes && this._answerTimes.length >= 80) {
          var headTimes = this._answerTimes.slice(0, 30).reduce(function(s,v) { return s+v; }, 0) / 30;
          var tailTimes = this._answerTimes.slice(-30).reduce(function(s,v) { return s+v; }, 0) / 30;
          // If answering more than 2x faster in the tail section
          if (tailTimes > 0 && headTimes / tailTimes > 2.0) { fatigueFlag = 1; consistencyIssues++; }
        }

        `;
  c = c.replace(lieMarker, addLie + lieMarker);
  console.log('4. Added lie + fatigue detection');
}

// 5. Record answer time in BDI and normal paths
// Find where answers are recorded
const timeMarker = "this._answers[this._currentQ] = optionIdx";
if (c.indexOf(timeMarker) >= 0) {
  const addTime = "this._answers[this._currentQ] = optionIdx;\n    if (!this._answerTimes) this._answerTimes = [];\n    this._answerTimes.push(Date.now() - (this._lastQTime || Date.now()));\n    this._lastQTime = Date.now();";
  c = c.replace(timeMarker, addTime);
  console.log('5. Record answer timing');
}

// 6. Add _prev() method if not present
if (c.indexOf('_prev()') < 0) {
  const prevMethod = `\n\n  _prev() {
    this._renderQ('prev');
  },\n\n  _next() {`;
  c = c.replace('\n  _next() {', prevMethod);
  console.log('6. Added _prev method');
}

// 7. Update validity detail text
const detailMarker = "validityDetail.push(consistencyIssues + '组作答不一致')";
if (c.indexOf(detailMarker) >= 0) {
  c = c.replace(detailMarker,
    "validityDetail.push(consistencyIssues + '组异常')");
  console.log('7. Updated validity text');
}

// 8. Add fatigue/lie text to validity
const detailEndMarker = "if (tooFastFlag) validityDetail.push('答题过快（' + elapsed + '分钟）')";
if (c.indexOf(detailEndMarker) >= 0) {
  c = c.replace(detailEndMarker,
    "if (tooFastFlag) validityDetail.push('答题过快（' + elapsed + '分钟）')\n        if (lieFlag) validityDetail.push('可能存在社会赞许偏差');\n        if (fatigueFlag) validityDetail.push('尾段答题过快·可能疲劳');");
  console.log('8. Added lie/fatigue text');
}

fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('All modifications written');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});
