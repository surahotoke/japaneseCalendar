// カレンダーの要素を取得
const currentMonthElement = document.querySelector('#current-month');
const lastMonthButton = document.querySelector('#last-month');
const nextMonthButton = document.querySelector('#next-month');
const calendarBody = document.querySelector('#calendar-body');
// 祝日のAPIのURL
const holidayAPIUrl = 'https://holidays-jp.github.io/api/v1/date.json';
// 現在の日付を取得
const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
// テキストエリアの内容を保持するためのオブジェクト
const memoAreaContent = {};
const keysPressed = {};
// カレンダーの表示を更新
function updateCalendar() {
    // 現在の年月を表示
    const Era = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {year: 'numeric'}).format(new Date(currentYear, currentMonth));
    currentMonthElement.textContent = `${currentYear}年(${Era})${currentMonth + 1}月`;
    // カレンダーの表示をクリア
    calendarBody.innerHTML = '';
    // 月の初めの日を取得
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    // 月の日数を取得
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    // カレンダーのセルを作成
    for (let j = 0; j < 5; j++) {
        const calendarj = document.createElement('tr');
        for (let i = 0; i < 7; i++) {
            const calendarCell = document.createElement('td');
            const calendarContainer = document.createElement('div');
            calendarContainer.classList.add('calendar-container');
            calendarCell.appendChild(calendarContainer);
            const day = j * 7 + i - startingDayOfWeek + 1;
            // 今月か
            if (day <= 0 || day > totalDays) {
                const adjacentMonthDate = new Date(currentYear, currentMonth, day);
                calendarContainer.textContent = adjacentMonthDate.getDate();
                calendarContainer.classList.add('adjacent-month');
            }else{

                calendarContainer.textContent = day;
                calendarContainer.innerHTML += '<br/>';
                // 特別な日か
                specialDay(calendarCell, calendarContainer, day, totalDays, i, j);
                // テキストエリアを作成または復元
                const memoArea = document.createElement('textarea');
                memoArea.name = `memo-${currentYear}-${currentMonth}-${day}`;
                memoArea.classList.add('memo');
                memoArea.spellcheck = false;
                // テキストエリアの内容を復元
                if (memoAreaContent[memoArea.name]) {
                    memoArea.value = memoAreaContent[memoArea.name];
                }
                calendarContainer.appendChild(memoArea);
                // テキストエリアの内容が変更された場合に保存
                memoArea.addEventListener('input', (event) => {
                    memoAreaContent[memoArea.name] = event.target.value;
                });
            }
            calendarj.appendChild(calendarCell);
        }
        calendarBody.appendChild(calendarj);
    }
}
function specialDay(calendarCell, calendarContainer, day, totalDays, i, j) {
    // 6行になるか
    if(j==4 && day+7<=totalDays) {
        calendarContainer.textContent += `/${day+7}`;
    }
    // 祝日か
    const holiday = JapaneseHolidays.isHoliday(new Date(currentYear, currentMonth, day));
    if (holiday) {
        calendarContainer.innerHTML += ` <span class="holiday">${holiday}</span>`;
    }
    // 日曜日か・土曜日か
    if (i == 0) {
        calendarCell.classList.add('sunday');
    }else if (i == 6) {
        calendarCell.classList.add('saturday');
    }
    // 今日か
    if (currentDate.getFullYear() == currentYear && currentDate.getMonth() == currentMonth && currentDate.getDate() == day) {
        calendarCell.classList.add('today');
    }
}
function toLastMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentYear--;
        currentMonth = 11;
    }
    updateCalendar();
}
function toNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentYear++;
        currentMonth = 0;
    }
    updateCalendar();
}
// ボタンで先月・来月へ
lastMonthButton.addEventListener('click', toLastMonth);
nextMonthButton.addEventListener('click', toNextMonth);
// 左右矢印キーで先月・来月へ(yキーを押していると昨年・来年へ)
document.addEventListener('keydown', function(event) {
    if (document.activeElement.tagName == 'TEXTAREA'){
        return;
    }
    keysPressed[event.key] = true;
});
// 矢印キー押→yキー押→yキー離とするとdocument.addEventListener関数から外れる仕様から逃れるため
function keyupdate() {
    if (document.activeElement.tagName == 'TEXTAREA'){
        return;
    }
    if (keysPressed['ArrowLeft']){
        if (i==0 || i>3){
            if (keysPressed['y']){
                currentYear--;
                updateCalendar();
            }else{
                toLastMonth();
            }
        }
        i++;
    }else if (keysPressed['ArrowRight']) {
        if (i==0 || i>3){
            if (keysPressed['y']){
                currentYear++;
                updateCalendar();
            }else{
                toNextMonth();
            }
        }
        i++;
    }else {
        i=0;
    }
}
document.addEventListener('keyup', function(event) {
    keysPressed[event.key] = false;
});
// スクリーンショット機能
function Screenshot() {
    html2canvas(document.body, {
        onrendered: function(canvas) {
        const imgData = canvas.toDataURL();
        const link = document.getElementById("ss");
        link.href = imgData;
        link.download = currentYear+'年'+`${currentMonth+1}`+'月'+'.png';
        link.click();
      }
    });
}
// 現在時刻表示機能
function twoDigit(num) {
    let ret;
    if( num < 10 ) 
        ret = "0" + num; 
    else 
        ret = num; 
    return ret;
}
function showClock() {
    let nowTime = new Date();
    let nowHour = twoDigit(nowTime.getHours());
    let nowMin = twoDigit(nowTime.getMinutes());
    let nowSec = twoDigit(nowTime.getSeconds());
    let msg = nowHour + ":" + nowMin + ":" + nowSec;
    document.getElementById("realtime").innerHTML = msg;
}
// カレンダーの表示を初期化
updateCalendar();
// 時刻更新
showClock();
setInterval(showClock, 1000);
setInterval(keyupdate, 100);
