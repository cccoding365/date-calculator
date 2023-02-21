// 返回今天的date对象
export const getTODAYdate = () => {
  return { year: new Date().getFullYear(), month: new Date().getMonth() + 1, days: new Date().getDate() }
}

/**
 * 根据日期对象显示成可读中文
 * 
 * @param   {Date?}  日期Date对象 可选 不填则默认为今天
 * 
 * @returns {text}   日期显示内容
 */
export const getTextDate = (_Date) => {
  const date = _Date || new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1 + "").padStart(2, "0");
  const days = (date.getDate() + "").padStart(2, "0");
  const day = date.getDay();
  return `${year}年${month}月${days}日星期${DAY[day]}`;
};

// 星期数字与中文对应
const DAY = { 0: "日", 1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六" };

/**
 * 获取年份数组
 * 
 * @returns {array}   年份数组
 */
export const getYearArray = () => {
  let yearArray = [];
  for (let i = 1901; i <= 2100; ++i) yearArray.push(i);
  return yearArray;
};

/**
 * 获取月份数组
 * 
 * @returns {array}   月份数组
 */
export const getMonthArray = () => {
  let monthArray = [];
  for (let i = 1; i <= 12; ++i) monthArray.push(i);
  return monthArray;
};

/**
 * 根据年月获取各月份号数数组
 * 
 * @param   {number}  年份
 * @param   {number}  月份
 * 
 * @returns {array}   当月号数数组
 */
export const getDaysArray = (year, month) => {
  let days = 31,
    daysArray = [];
  [4, 6, 9, 11].includes(month) && (days = 30)
  month == 2 && (days = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0 ? 29 : 28);
  for (let i = 1; i <= days; ++i) daysArray.push(i);
  return daysArray;
};

/**
 * 传入两个日期对象 计算天数差
 * 
 * @param   {date}  日期{year,month,days}
 * @param   {date}  日期{year,month,days}
 * 
 * @returns {number}   天数差
 */
export const getDayGap = (date1, date2) => {
  const day1 = getDateObj(date1);
  const day2 = getDateObj(date2);
  return (day1 - day2) / 1000 / 60 / 60 / 24;
};

/**
 * 将{year,month,days}型的日期对象转成Date日期对象
 * 
 * @param   {date}  日期{year,month,days}
 * 
 * @returns {Date}   Date对象
 */
const getDateObj = (date) => {
  const { year, month, days } = date;
  const _month = (month + "").padStart(2, "0");
  const _days = (days + "").padStart(2, "0");
  const _date = `${year}-${_month}-${_days}`;
  return new Date(_date);
};
