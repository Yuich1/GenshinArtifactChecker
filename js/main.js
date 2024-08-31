/**
 * @author Yuichi<https://twitter.com/2qrbgxpsaWEziml?s=20>
 * @version 1.3.3
 */

const STATUSES = {
  ATK: [0, 14, 16, 18, 19],
  DEF: [0, 16, 19, 21, 23],
  ATK_RATE: [0, 4.1, 4.7, 5.3, 5.8],
  DEF_RATE: [0, 5.1, 5.8, 6.6, 7.3],
  HP: [0, 209, 239, 269, 299],
  HP_RATE: [0, 4.1, 4.7, 5.3, 5.8],
  EL_MASTERY: [0, 16, 19, 21, 23],
  EN_RECHARGE: [0, 4.5, 5.2, 5.8, 6.5],
  CRIT_RATE: [0, 2.7, 3.1, 3.5, 3.9],
  CRIT_DMG: [0, 5.4, 6.2, 7.0, 7.8]
};

let selectedStatus = "ATK";

$(function () {
  $(".status-val").on("change", function () {
    const p = $(this).parent();
    const type = selectedStatus;
    const val = parseFloat(p.children(".status-val").val());
    const status = STATUSES[type]
    const ans = dpTable(val, status);
    let low = 0, mid = 0, high = 0, max = 0;
    ans.forEach(e => {
      switch (e) {
        case status[1]:
          low++;
          break;
        case status[2]:
          mid++;
          break;
        case status[3]:
          high++;
          break;
        case status[4]:
          max++;
          break;
      }
    });
    p.children(".progress-right").text(status[4] * ans.length);
    const bar = p.children(".progress");

    const lowRate = status[1] * low / (status[4] * ans.length) * 100;
    bar.children(".progress-bar-low").attr("style", `width: ${lowRate}%`);
    bar.children(".progress-bar-low").text(`低(${status[1]}%):${low}回`);
    const midRate = status[2] * mid / (status[4] * ans.length) * 100;
    bar.children(".progress-bar-mid").attr("style", `width: ${midRate}%`);
    bar.children(".progress-bar-mid").text(`中(${status[2]}%):${mid}回`);
    const highRate = status[3] * high / (status[4] * ans.length) * 100;
    bar.children(".progress-bar-high").attr("style", `width: ${highRate}%`);
    bar.children(".progress-bar-high").text(`高(${status[3]}%):${high}回`);
    const maxRate = status[4] * max / (status[4] * ans.length) * 100;
    bar.children(".progress-bar-max").attr("style", `width: ${maxRate}%`);
    bar.children(".progress-bar-max").text(`最高(${status[4]}%):${max}回`);
  });

  $(".status-val").on("input", function () {
    const p = $(this).parent();
    const val = parseFloat(p.children(".status-val").val());
    const ans = getStatusCondidate(val);
    $(".status-selector").remove();
    if (ans.length > 0) {
      for (let i = 0; i < ans.length; i++) {
        const element = ans[i];
        let text = "";
        switch (element) {
          case "ATK":
            text = "攻撃力";
            break;
          case "ATK_RATE":
            text = "攻撃力%";
            break;
          case "DEF":
            text = "防御力";
            break;
          case "DEF_RATE":
            text = "防御力%";
            break;
          case "HP":
            text = "HP";
            break;
          case "HP_RATE":
            text = "HP%";
            break;
          case "EL_MASTERY":
            text = "元素熟知";
            break;
          case "EN_RECHARGE":
            text = "元チャ";
            break;
          case "CRIT_RATE":
            text = "会心率";
            break;
          case "CRIT_DMG":
            text = "会心ダメ";
            break;
        };
        const html = `<button type="button" class="status-selector" value=${element}>${text}</button>`;
        $(this).after(html);
        $(".status-selector").on("click", function () {
          const p = $(this).parent();
          const type = $(this).attr("value");
          const typeName = $(this).text();
          selectedStatus = type;
          p.children(".status-val").change();
          p.children(".type").text(typeName);
          //$(".status-selector").remove();
        });
      }
    }
  });




});

function round(number, precision) {
  let shift = function (number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision;
    }
    let numArray = ("" + number).split("e");
    return +(numArray[0] + "e" + (numArray[1] ? +numArray[1] + precision : precision));
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
}

function dpTable(val, table) {
  let isx10 = false;
  let isCheckRounding = false;
  let checkCount = 0;
  if(!Number.isInteger(table[1])){
    isCheckRounding = true;
  }
  if (!Number.isInteger(val) || !Number.isInteger(table[1])) {
    isx10 = true;
    table = table.map(val => val * 10);
    val = val * 10;
  }
  let dp = generate2DArray(table.length, val + 1);
  let dpPath = generate2DArray(table.length, val + 1);

  dp[0][0] = 0;


  t = () => {
    for (let i = 1; i < table.length; i++) {
      for (let j = 0; j < val + 1; j++) {
        if (j - table[i] >= 0) {
          if ((dp[i][j - table[i]] + 1) < (dp[i - 1][j])) {
            dp[i][j] = dp[i][j - table[i]] + 1;
            dpPath[i][j] = [i, j - table[i]];
          } else {
            dp[i][j] = dp[i - 1][j];
            dpPath[i][j] = [i - 1, j];
          }
          //dp[i][j] = Math.min(dp[i][j - table[i]] + 1, dp[i - 1][j]);
        } else {
          dp[i][j] = dp[i - 1][j];
          dpPath[i][j] = [i - 1, j];
        }
        //console.log(`${i}, ${j}, dp=${dp[i][j]}`);
      }
    }
  }
  t();

  let ans = getPathElement(dpPath, table);

  if (checkCount == 0 && isCheckRounding && dp[dp.length - 1][dp[0].length - 1] == 999) {
    checkCount = 1;
    val = val + 1;
    dp = generate2DArray(table.length, val + 1);
    dpPath = generate2DArray(table.length, val + 1);
    dp[0][0] = 0;
    t();
    ans = getPathElement(dpPath, table);
  } if (checkCount == 1 && isCheckRounding && dp[dp.length - 1][dp[0].length - 1] == 999) {
    checkCount = 2;
    val = val - 2;
    dp = generate2DArray(table.length, val + 1);
    dpPath = generate2DArray(table.length, val + 1);
    dp[0][0] = 0;
    t();
    ans = getPathElement(dpPath, table);
  }
  if (isx10) {
    ans = ans.map(val => val / 10);
  }
  //console.log(ans);
  return ans;
}

generate2DArray = (m, n) => {
  let arr = new Array(m);
  for (var i = 0; i < m; i++) {
    arr[i] = new Array(n).fill(999);
  }
  return arr;
};

getPathElement = (dpPath, table) => {
  let m = dpPath.length - 1;
  let n = dpPath[0].length - 1;

  let count = 1000;
  let element = new Array();

  let low = 0;
  let mid = 0;
  let high = 0;
  let max = 0;

  if (dpPath[m][n] == 999) {
    return element;
  }
  while (n > 0) {
    let current_m = m;
    let current_n = n;
    m = dpPath[m][n][0];
    n = dpPath[m][n][1];
    if (m - current_m == -1 && n == current_n) {

    } else {
      element.push(table[m]);
      m == 1 ? low++ : 0;
      m == 2 ? mid++ : 0;
      m == 3 ? high++ : 0;
      m == 4 ? max++ : 0;
    }
    if (--count < 0) {
      break;
    }
  }
  if (low + mid + high + max > 0) {
    //console.log(`低：${low}回, 中：${mid}回, 高：${high}回, 最高：${max}回`);
  };
  return element;
}

getStatusCondidate = (val) => {
  let ans = [];
  for (let key in STATUSES) {
    const dp = dpTable(val, STATUSES[key]);
    if (dp[0] > 0 && dp.length < 7) {
      ans.unshift(key);
    }
  }
  return ans;
}