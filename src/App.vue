<template>
  <header>日期计算器</header>
  <div class="title">今天是{{ getTextDate() }}</div>
  <main>
    <!-- 计算模式一 -->
    <div class="calcBox">
      <h3>模式1:根据日期推算天数差</h3>
      <div class="dateSelect">
        <select v-model="date1.year" @change="initDays(1)">
          <option v-for="i in year" :value="i">{{ i }}年</option>
        </select>
        <select v-model="date1.month" @change="initDays(1)">
          <option v-for="i in month" :value="i">{{(i + '').padStart(2, 0) }}月</option>
        </select>
        <select v-model="date1.days">
          <option v-for="i in daysArray1" :value="i">{{(i + '').padStart(2, 0) }}日</option>
        </select>
        <label v-if="!isSameDay(date1, TODAY)" @click="jump2Today(1)">📌</label>
      </div>
      <div class="dateSelect">
        <select v-model="date2.year" @change="initDays(2)">
          <option v-for="i in year" :value="i">{{ i }}年</option>
        </select>
        <select v-model="date2.month" @change="initDays(2)">
          <option v-for="i in month" :value="i">{{(i + '').padStart(2, 0) }}月</option>
        </select>
        <select v-model="date2.days">
          <option v-for="i in daysArray2" :value="i">{{(i + '').padStart(2, 0) }}日</option>
        </select>
        <label v-if="!isSameDay(date2, TODAY)" @click="jump2Today(2)">📌</label>
      </div>
      <div class="resultBox">{{ result1 }}</div>
    </div>
    <!-- 计算模式二 -->
    <div class="calcBox">
      <h3>模式2:根据天数差推算日期</h3>
      <div class="dateSelect">
        <select v-model="date3.year" @change="initDays(3)">
          <option v-for="i in year" :value="i">{{ i }}年</option>
        </select>
        <select v-model="date3.month" @change="initDays(3)">
          <option v-for="i in month" :value="i">{{(i + '').padStart(2, 0) }}月</option>
        </select>
        <select v-model="date3.days">
          <option v-for="i in daysArray3" :value="i">{{(i + '').padStart(2, 0) }}日</option>
        </select>
        <label v-if="!isSameDay(date3, TODAY)" @click="jump2Today(3)">📌</label>
      </div>
      <input v-model="daysGap" type="number" />&nbsp;天
      <div class="tipsBox">提示：输入负数则向前推算</div>
      <div class="resultBox">{{ result2 }}</div>
    </div>
  </main>
  <footer>© {{ new Date().getFullYear() }} <a href="http://www.hecongcong.com/">www.hecongcong.com</a> </footer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getTextDate, getTODAYdate, getYearArray, getDaysArray, getDayGap } from '@/utils'

const TODAY = ref(getTODAYdate())
let date1 = ref(getTODAYdate())
let date2 = ref(getTODAYdate())
let date3 = ref(getTODAYdate())

let year = ref(getYearArray())
let month = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
let daysArray1 = ref(getDaysArray())
let daysArray2 = ref(getDaysArray())
let daysArray3 = ref(getDaysArray())

const dateMap = {
  1: date1,
  2: date2,
  3: date3,
}

const dayArrayMap = {
  1: daysArray1,
  2: daysArray2,
  3: daysArray3,
}

const initDays = (index) => {
  dayArrayMap[index].value = getDaysArray(dateMap[index].value.year, dateMap[index].value.month)
  let days = Object.keys(dayArrayMap[index].value).length
  if (days < dateMap[index].value.days) {
    dateMap[index].value.days = dayArrayMap[index].value[days - 1]
  }
}
let daysGap = ref(365)

const result1 = computed(() => {
  const gap = getDayGap(date1.value, date2.value)
  return gap == 0 ? '两个日期是同一天' : `两个日期相差${Math.abs(gap)}天`
})

const result2 = computed(() => {
  const { year, month, days } = date3.value,
    _month = (month + '').padStart(2, '0'),
    _days = (days + '').padStart(2, '0'),
    fromDate = new Date(`${year}-${_month}-${_days}`),
    toDate = new Date(Date.parse(fromDate) + daysGap.value * 24 * 60 * 60 * 1000)
  return getTextDate(toDate)
})

// 判断两个日期是否为同一天
const isSameDay = (date1, date2) => {
  const { year: year1, month: month1, days: days1 } = date1,
    { year: year2, month: month2, days: days2 } = date2
  return (year1 == year2 && month1 == month2 && days1 == days2) ? true : false
}

// 跳转到今天
const jump2Today = (index) => {
  dateMap[index].value = getTODAYdate()
  initDays(index)
}
</script>

<style lang="less" scoped>
header {
  margin: 30px 0;
  text-align: center;
  font-size: 32px;
  font-weight: bold;

  &::after {
    content: '';
    position: absolute;
    display: block;
    left: 50%;
    margin-top: 10px;
    transform: translateX(-50%);
    height: 6px;
    width: 70px;
    border-radius: 3px;
    background-color: red;
  }
}

.title {
  text-align: center;
  color: red;
}

main {
  display: flex;
  justify-content: center;

  .calcBox {
    margin: 20px;
    padding: 30px;
    border: 5px solid #fff;
    border-radius: 10px;
    box-shadow: rgba(133, 138, 224, 0.3) 0px 10px 10px;

    h3 {
      padding: 5px 10px;
      border-left: 5px solid red;
      margin-bottom: 20px;
    }

    .dateSelect {
      margin: 10px 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border: 3px solid gray;
      border-radius: 5px;
      position: relative;

      select {
        padding: 10px 0px;
        background-color: transparent;
        text-align: center;
        border: none;
        cursor: pointer;
      }

      select:focus-visible {
        border: none;
        outline: none;
      }

      label {
        position: absolute;
        margin-left: 5px;
        font-size: 14px;
        color: red;
        left: 100%;
        cursor: pointer;
      }
    }

    .resultBox {
      margin: 10px 0;
      padding: 10px;
      border-bottom: 3px solid #000;
      color: red;
      text-align: center;
    }

    .tipsBox {
      color: gray;
      font-size: 14px;
      font-style: italic;
    }

    input {
      background-color: transparent;
      width: 90%;
      padding: 10px;
      text-align: center;
      border: 3px solid gray;
      border-radius: 5px;

      &:focus-visible {
        outline: none;
      }

    }
  }
}

footer {
  margin: 30px 0;
  color: gray;
  text-align: center;
}

@media screen and (max-width:500px) {
  main {
    flex-direction: column;
  }
}
</style>
