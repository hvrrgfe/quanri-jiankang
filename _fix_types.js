// Fix personalityTypes.js syntax errors
const fs = require('fs');
let content = fs.readFileSync('D:/three-meals-app/js/data/personalityTypes.js', 'utf8');

// Replace wrong array-wrapped string params with proper strings
// Pattern: relationships should be string, growth should be string, workplace should be string
// But they're wrapped as ['string'] instead of 'string'

// ISTP fix
content = content.replace(
  "  ['你的独立是魅力也是挑战。你需要一个给你空间、不黏腻的伴侣。你可能不说甜言蜜语，但你的行动会说明一切——记得偶尔用言语表达。',\n  ['把「试一试」的态度用在人际关系上——它们也需要你的动手能力','为未来做个计划，哪怕只是一个大致方向'],\n  ['需要动手和解决实际问题的技术型岗位。外科、工程、消防、特种作业等需要冷静判断力的职业。不适合等级森严的官僚环境。']);",
  "  '你的独立是魅力也是挑战。你需要一个给你空间、不黏腻的伴侣。你可能不说甜言蜜语，但你的行动会说明一切——记得偶尔用言语表达。',\n  '把「试一试」的态度用在人际关系上——它们也需要你的动手能力。为未来做个计划，哪怕只是一个大致方向。',\n  '需要动手和解决实际问题的技术型岗位。外科、工程、消防、特种作业等需要冷静判断力的职业。不适合等级森严的官僚环境。');"
);

// ESTP fix
content = content.replace(
  "  ['你需要一个能理解你的冒险精神、给你空间也给你锚点的伴侣。你追求刺激，但要学会在关系中创造新鲜感而非逃避承诺。',\n  ['记录你的决策和结果——从经验中学习而非重复犯错','练习长期思考——短期的胜利不等于长期的赢'],\n  ['在快速变化、有竞争、有即时回报的领域中表现最佳。创业、销售、金融交易、谈判类岗位。不适合稳定缓慢的官僚环境。']);",
  "  '你需要一个能理解你的冒险精神、给你空间也给你锚点的伴侣。你追求刺激，但要学会在关系中创造新鲜感而非逃避承诺。',\n  '记录你的决策和结果——从经验中学习而非重复犯错。练习长期思考——短期的胜利不等于长期的赢。',\n  '在快速变化、有竞争、有即时回报的领域中表现最佳。创业、销售、金融交易、谈判类岗位。不适合稳定缓慢的官僚环境。');"
);

fs.writeFileSync('D:/three-meals-app/js/data/personalityTypes.js', content, 'utf8');
console.log('Fixed personalityTypes.js');
