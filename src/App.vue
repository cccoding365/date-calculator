<template>
  <div class="min-h-dvh bg-white flex justify-center p-0 md:p-4">
    <div class="w-full md:max-w-md">
      <div class="md:rounded-3xl bg-white shadow-[inset_0_2px_8px_rgba(255,255,255,0.6)] ring-1 ring-neutral-300 p-4 h-full">
        <!-- 显示区域：拼接句子（更大字号） -->
        <div class="rounded-xl bg-black text-white p-4 mb-4 shadow-inner">
          <div class="text-xl md:text-2xl font-mono tracking-wide flex whitespace-nowrap overflow-x-auto">
            <span :class="segmentClass(yearEntered)">{{ yearDisplay }}年</span>
            <span :class="segmentClass(monthEntered)">{{ monthDisplay }}月</span>
            <span :class="segmentClass(dayEntered)">{{ dayDisplay }}日</span>
            <span :class="intervalEntered ? 'text-white' : 'text-neutral-400'">{{ intervalEntered ? (intervalValue + '天') : '__天' }}</span>
            <span :class="direction ? 'text-white' : 'text-neutral-400'">{{ directionLabel }}</span>
          </div>
          <div class="text-xl md:text-2xl font-mono tracking-wide mt-5 flex items-baseline gap-3">
            <span class="text-white">→</span>
            <span :class="resultDate ? 'text-white' : 'text-neutral-400'">{{ resultDisplay }}</span>
          </div>
          <div v-if="errorMsg" class="mt-3 text-white text-sm">{{ errorMsg }}</div>
        </div>

        <!-- 阶段确认：年/月/日 -->
        <div class="grid grid-cols-3 gap-3 mb-3">
          <button :class="keyClass(activeTarget === 'year')" @click="confirmYearStage" :disabled="!yearEntered || activeTarget !== 'year'">年</button>
          <button :class="keyClass(activeTarget === 'month')" @click="confirmMonthStage" :disabled="!monthEntered || activeTarget !== 'month'">月</button>
          <button :class="keyClass(activeTarget === 'day')" @click="confirmDayStage" :disabled="!dayEntered || activeTarget !== 'day'">日</button>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <button :class="keyClass(direction === 'past')" @click="setDirection('past')" :disabled="!intervalEntered">前</button>
          <button :class="keyClass(direction === 'future')" @click="setDirection('future')" :disabled="!intervalEntered">后</button>
        </div>

        <!-- 辅助功能：今天、回退、复位 -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <button :class="keySecondaryClass" @click="fillToday">今天</button>
          <button :class="keySecondaryClass" @click="backToPrevious">回退</button>
          <button :class="keyDangerClass" @click="resetAll">复位</button>
        </div>

        <!-- 数字键盘 -->
        <div class="grid grid-cols-3 gap-3">
          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('7')">7</button>
          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('8')">8</button>
          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('9')">9</button>

          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('4')">4</button>
          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('5')">5</button>
          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('6')">6</button>

          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('1')">1</button>
          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('2')">2</button>
          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('3')">3</button>

          <button :class="keyClass(activeTarget !== null)" @click="pressDigit('0')">0</button>
          <button class="col-span-2" :class="keyPrimaryClass" @click="compute" :disabled="!canCompute">是</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 输入状态
const year = ref('')
const month = ref('')
const day = ref('')
const activeTarget = ref('year') // 'year' | 'month' | 'day' | 'interval'

// 操作设置
const intervalUnit = ref('day') // 固定按“日”计算差值
const intervalValue = ref(0)
const direction = ref('') // '', 'past' | 'future'

// 结果与错误
const resultDate = ref(null)
const errorMsg = ref('')

// 显示格式化与阶段确认
const monthConfirmed = ref(false)
const dayConfirmed = ref(false)
const stageHistory = ref([]) // 记录阶段确认与方向选择，用于回退

const yearDisplay = computed(() => (year.value ? year.value : '____'))
const monthDisplay = computed(() => {
  if (!month.value) return '__'
  return monthConfirmed.value ? String(month.value).padStart(2, '0') : month.value
})
const dayDisplay = computed(() => {
  if (!day.value) return '__'
  return dayConfirmed.value ? String(day.value).padStart(2, '0') : day.value
})

// 输入阶段完成度
const yearEntered = computed(() => year.value.length > 0)
const monthEntered = computed(() => month.value.length > 0)
const dayEntered = computed(() => day.value.length > 0)
const intervalEntered = computed(() => intervalValue.value > 0)
const canCompute = computed(() => yearEntered.value && monthEntered.value && dayEntered.value && intervalEntered.value && !!direction.value)

const directionLabel = computed(() => {
  if (!direction.value) return ''
  return direction.value === 'past' ? '前' : '后'
})

const resultDisplay = computed(() => {
  if (!resultDate.value) return '等待计算'
  const y = resultDate.value.getFullYear()
  const m = String(resultDate.value.getMonth() + 1).padStart(2, '0')
  const d = String(resultDate.value.getDate()).padStart(2, '0')
  return `是${y}年${m}月${d}日`
})

// 按键样式（实体按键拟态）
const keyBase = 'select-none text-center font-semibold rounded-lg px-4 py-3 bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_0_0_rgba(0,0,0,0.18),0_8px_12px_rgba(0,0,0,0.18)] active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_0_0_rgba(0,0,0,0.18),0_5px_8px_rgba(0,0,0,0.18)] transition-all disabled:opacity-40 disabled:cursor-not-allowed'
const keyClass = (highlight) => [keyBase, highlight ? 'ring-2 ring-neutral-700' : 'ring-1 ring-neutral-400']
const keyPrimaryClass = [
  keyBase,
  'bg-black text-black ring-2 ring-neutral-700'
]
const keySecondaryClass = [
  keyBase,
  'bg-white text-black ring-2 ring-neutral-500'
]
const keyDangerClass = [
  keyBase,
  'bg-white text-black ring-2 ring-neutral-700'
]

// 交互函数
function segmentClass(done) {
  return done ? 'text-white' : 'text-neutral-400'
}

function confirmYearStage() {
  if (!yearEntered.value || activeTarget.value !== 'year') return
  stageHistory.value.push({ type: 'year' })
  activeTarget.value = 'month'
}

function confirmMonthStage() {
  if (!monthEntered.value || activeTarget.value !== 'month') return
  monthConfirmed.value = true
  stageHistory.value.push({ type: 'month' })
  activeTarget.value = 'day'
}

function confirmDayStage() {
  if (!dayEntered.value || activeTarget.value !== 'day') return
  dayConfirmed.value = true
  stageHistory.value.push({ type: 'day' })
  activeTarget.value = 'interval'
}

function setDirection(dir) {
  if (!intervalEntered.value) return
  direction.value = dir
  stageHistory.value.push({ type: 'direction' })
}

function pressDigit(d) {
  errorMsg.value = ''
  if (activeTarget.value === 'interval') {
    const next = String(intervalValue.value) + d
    intervalValue.value = clampInt(next, 1, 9999)
    return
  }

  if (activeTarget.value === 'year') {
    if (year.value.length >= 4) return
    year.value = (year.value + d).slice(0, 4)
    if (year.value.length === 4) {
      // 自动触发年确认
      confirmYearStage()
    }
    return
  }
  if (activeTarget.value === 'month') {
    // 月份范围 1-12：
    // - 第一位是 1 时，第二位只能是 0/1/2；
    // - 第一位大于 1（2-9）时，直接完成月份输入（单数字月份）并触发月按钮；
    if (month.value.length === 0) {
      if (d === '0') return // 首位不能是 0
      month.value = d
      if (d !== '1') {
        // 单位数月份，自动确认
        confirmMonthStage()
      }
      return
    }
    if (month.value.length === 1) {
      if (month.value === '1') {
        if (d === '0' || d === '1' || d === '2') {
          month.value = month.value + d
          confirmMonthStage()
        } else {
          // 非法第二位：将 1 作为完成的月份，进入日阶段并处理该数字作为日的第一位
          confirmMonthStage()
          pressDigit(d)
        }
      } else {
        // 理论上不会到这里，因为非 1 的首位已确认
      }
      return
    }
    return
  }
  if (activeTarget.value === 'day') {
    // 特殊：当月份为 2 月时，引导到 28/29 上限，输入 3 表示日期完成
    const mInt = monthEntered.value ? parseInt(month.value, 10) : NaN
    if (mInt === 2) {
      const yInt = yearEntered.value && year.value.length === 4 ? parseInt(year.value, 10) : NaN
      const maxDay = isLeapYear(yInt) ? 29 : 28
      if (day.value.length === 0) {
        if (d === '0') return // 首位不能是 0
        if (d === '3') {
          day.value = String(maxDay)
          confirmDayStage()
          return
        }
        day.value = d
        const first = parseInt(d, 10)
        if (first > 2) {
          // 单数字 4-9，合法，直接确认
          confirmDayStage()
        }
        return
      }
      if (day.value.length === 1) {
        const candidate = parseInt(day.value + d, 10)
        if (candidate <= maxDay) {
          day.value = day.value + d
          confirmDayStage()
        } else {
          // 超过上限：直接用上限完成，并将该数字用于下一阶段
          day.value = String(maxDay)
          confirmDayStage()
          pressDigit(d)
        }
        return
      }
      return
    }

    // 常规月份：日期范围 1-31
    if (day.value.length === 0) {
      if (d === '0') return // 首位不能是 0
      day.value = d
      const first = parseInt(d, 10)
      if (first > 3) {
        // 单位数日期，自动确认
        confirmDayStage()
      }
      return
    }
    if (day.value.length === 1) {
      if (day.value === '3') {
        if (d === '0' || d === '1') {
          day.value = day.value + d
          confirmDayStage()
        } else {
          // 非法第二位：将 3 作为完成的日期，进入间隔阶段并处理该数字作为间隔的第一位
          confirmDayStage()
          pressDigit(d)
        }
      } else {
        // 第一位是 1 或 2，第二位任意 0-9
        day.value = day.value + d
        confirmDayStage()
      }
      return
    }
    return
  }
}

function compute() {
  errorMsg.value = ''
  resultDate.value = null

  const y = parseInt(year.value, 10)
  const m = parseInt(month.value, 10)
  const d = parseInt(day.value, 10)

  if (!isFinite(y) || !isFinite(m) || !isFinite(d)) {
    errorMsg.value = '请输入完整且有效的年月日'
    return
  }
  if (!isValidDate(y, m, d)) {
    errorMsg.value = '日期无效，请检查年月日范围'
    return
  }

  const base = new Date(y, m - 1, d)
  const qty = direction.value === 'past' ? -intervalValue.value : intervalValue.value

  let out
  switch (intervalUnit.value) {
    case 'day':
      out = addDays(base, qty)
      break
    case 'week':
      out = addDays(base, qty * 7)
      break
    case 'month':
      out = addMonths(base, qty)
      break
    case 'year':
      out = addYears(base, qty)
      break
    default:
      out = base
  }
  resultDate.value = out
}

// 工具函数
function clampInt(strInt, min, max) {
  const n = parseInt(strInt, 10)
  if (!isFinite(n)) return min
  return Math.min(Math.max(n, min), max)
}

function isValidDate(y, m, d) {
  if (m < 1 || m > 12) return false
  const dim = daysInMonth(y, m)
  return d >= 1 && d <= dim
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate()
}

function addDays(date, days) {
  const out = new Date(date)
  out.setDate(out.getDate() + days)
  return out
}

function addMonths(date, months) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  const targetMonthIndex = m + months
  const targetYear = y + Math.floor(targetMonthIndex / 12)
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12
  const dim = daysInMonth(targetYear, normalizedMonth + 1)
  const safeDay = Math.min(d, dim)
  return new Date(targetYear, normalizedMonth, safeDay)
}

function addYears(date, years) {
  const y = date.getFullYear() + years
  const m = date.getMonth()
  const d = date.getDate()
  const dim = daysInMonth(y, m + 1)
  const safeDay = Math.min(d, dim)
  return new Date(y, m, safeDay)
}

function isLeapYear(y) {
  if (!isFinite(y)) return false
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)
}

// 新增：复位、回退、填充今天
function resetAll() {
  year.value = ''
  month.value = ''
  day.value = ''
  intervalUnit.value = 'day'
  intervalValue.value = 0
  direction.value = ''
  resultDate.value = null
  errorMsg.value = ''
  activeTarget.value = 'year'
  monthConfirmed.value = false
  dayConfirmed.value = false
  stageHistory.value = []
}

function backToPrevious() {
  errorMsg.value = ''
  // 1) 先撤销当前阶段的数字输入
  if (activeTarget.value === 'interval') {
    if (intervalValue.value > 0) {
      const s = String(intervalValue.value)
      const t = s.slice(0, -1)
      intervalValue.value = t.length ? parseInt(t, 10) : 0
      return
    }
  } else if (activeTarget.value === 'day') {
    if (day.value.length > 0) {
      day.value = day.value.slice(0, -1)
      return
    }
  } else if (activeTarget.value === 'month') {
    if (month.value.length > 0) {
      month.value = month.value.slice(0, -1)
      return
    }
  } else if (activeTarget.value === 'year') {
    if (year.value.length > 0) {
      year.value = year.value.slice(0, -1)
      return
    }
  }

  // 2) 若当前阶段已为空，则撤销上一个阶段按钮操作
  if (stageHistory.value.length === 0) return
  const last = stageHistory.value.pop()
  switch (last.type) {
    case 'direction':
      direction.value = ''
      activeTarget.value = 'interval'
      break
    case 'day':
      dayConfirmed.value = false
      activeTarget.value = 'day'
      break
    case 'month':
      monthConfirmed.value = false
      activeTarget.value = 'month'
      break
    case 'year':
      activeTarget.value = 'year'
      break
  }
}

function fillToday() {
  const t = new Date()
  year.value = String(t.getFullYear())
  month.value = String(t.getMonth() + 1).padStart(2, '0')
  day.value = String(t.getDate()).padStart(2, '0')
  activeTarget.value = 'interval'
  direction.value = ''
}
</script>
