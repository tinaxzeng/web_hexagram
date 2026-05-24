function getLiuQin(palaceElem, branchElem) {
    const order = ['金', '水', '木', '火', '土', '金', '水', '木', '火', '土'];
    const pIdx = order.indexOf(palaceElem);
    let bIdx = order.indexOf(branchElem, pIdx);
    if (bIdx === -1) bIdx = order.indexOf(branchElem);
    const diff = (bIdx - pIdx + 5) % 5;
    switch(diff) {
        case 0: return '兄弟'; case 1: return '子孫'; case 2: return '妻財'; case 3: return '官鬼'; case 4: return '父母';
    }
    return '';
}

const now = new Date();
const dateInput = document.getElementById('datePicker');
const timeInput = document.getElementById('timePicker');

const benGuaDisplay = document.getElementById('benGuaDisplay');
const bianGuaDisplay = document.getElementById('bianGuaDisplay');

const convertRocInput = document.getElementById('convertRocInput');
const resultGregOutput = document.getElementById('resultGregOutput');
const applyYearBtn = document.getElementById('applyYearBtn');

// 建立統一的折疊切換邏輯
const setupToggle = (btnId, boxId) => {
    document.getElementById(btnId).addEventListener('click', () => {
        document.getElementById(boxId).classList.toggle('open');
    });
};

setupToggle('toggleBenGua', 'benGuaBox');
setupToggle('toggleBianGua', 'bianGuaBox');
setupToggle('toggleMeaningBtn', 'meaningBox');
setupToggle('toggleBeastMeaningBtn', 'beastMeaningBox');

document.getElementById('copyTextBtn').addEventListener('click', () => {
    // 複製時彙整本卦與變卦
    const yaoRows = Array.from(benGuaDisplay.querySelectorAll('.yao-line-wrapper')).reverse();
    const hexLinesText = yaoRows.map(row => {
        const beast = row.querySelector('.six-beast').innerText;
        const mark = (row.querySelector('.shi-ying-box').innerText || "").padEnd(2);
        const isYang = row.querySelector('.yao-bar').classList.contains('yang');
        const line = isYang ? "[ --- ]" : "[ - - ]";
        const texts = row.querySelectorAll('.yao-text');
        const info = texts[0].innerText;
        const arrow = row.querySelector('.change-arrow').innerText;
        const changedInfo = texts[1]?.innerText || "";
        return `${beast} ${mark} ${line} ${info} ${arrow} ${changedInfo}`.trimEnd();
    }).join('\n');

    const text = [
        "【六爻排盤結果】",
        document.getElementById('stemBranchYear').innerText,
        document.getElementById('lunarDateDisplay').innerText,
        document.getElementById('dayPillarDisplay').innerText,
        document.getElementById('branchTime').innerText,
        "\n" + hexLinesText + "\n",
        document.getElementById('movingYaoDisplay').innerText,
        "卦象：" + document.getElementById('hexagramName').innerText,
        document.getElementById('mutualHexName').innerText
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => alert('✅ 已複製文字結果至剪貼簿'));
});

document.getElementById('saveImgBtn').addEventListener('click', () => {
    const target = document.querySelector('.result-section');
    html2canvas(target, {
        backgroundColor: getComputedStyle(document.body).backgroundColor, scale: 2,
        onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll('.yao-line-wrapper').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.animation = 'none'; el.style.filter = 'none'; });
            clonedDoc.querySelectorAll('.yao-bar').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.animation = 'none'; });
        }
    }).then(canvas => {
        const link = document.createElement('a'); link.download = `卦象排盤_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png'); link.click();
    });
});

convertRocInput.addEventListener('input', () => {
    const rocYear = parseInt(convertRocInput.value);
    resultGregOutput.value = (!isNaN(rocYear) && rocYear > 0) ? `西元 ${rocYear + 1911} 年` : '';
});

applyYearBtn.addEventListener('click', () => {
    const rocYear = parseInt(convertRocInput.value);
    if (!isNaN(rocYear) && rocYear > 0) {
        const parts = dateInput.value.split('-');
        if (parts.length === 3) {
            dateInput.value = `${rocYear + 1911}-${parts[1]}-${parts[2]}`;
            updateConversion();
        }
    }
});

function updateConversion() {
    const date = new Date(dateInput.value);
    const [hours, minutes] = timeInput.value.split(':').map(Number);
    const year = date.getFullYear();
    const rocYear = year - 1911;
    const yearIndex = (year - 4) % 60;
    const stemBranchYear = stems[yearIndex % 10] + branches[yearIndex % 12] + '年';

    const baseDate = new Date(2000, 0, 1);
    const calcDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((calcDate.getTime() - baseDate.getTime()) / (24 * 3600 * 1000));
    let dayIdx = (54 + diffDays) % 60; if (dayIdx < 0) dayIdx += 60;
    const dayStemIdx = dayIdx % 10; const dayZhiIdx = dayIdx % 12;
    const v1Idx = (dayZhiIdx - dayStemIdx - 2 + 12) % 12;
    const v2Idx = (dayZhiIdx - dayStemIdx - 1 + 12) % 12;
    const voidBranches = [branches[v1Idx], branches[v2Idx]];
    
    const dayPillarStr = `日柱：${stems[dayStemIdx]}${branches[dayZhiIdx]} (旬空：${voidBranches.join('')})`;
    document.getElementById('rocInputHint').innerText = `(民國 ${rocYear} 年)`;
    
    const branchIndex = Math.floor(((hours + 1) % 24) / 2);
    let lunarMonth, lunarDay;
    try {
        const lunarParts = new Intl.DateTimeFormat('zh-u-ca-chinese', { month: 'numeric', day: 'numeric' }).formatToParts(date);
        lunarMonth = parseInt(lunarParts.find(p => p.type === 'month').value);
        lunarDay = parseInt(lunarParts.find(p => p.type === 'day').value);
    } catch(e) {
        lunarMonth = date.getMonth() + 1; lunarDay = date.getDate();
    }

    const monthNames = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '臘'];
    const lunarMonthStr = monthNames[lunarMonth] || lunarMonth;

    // 重新排版文字輸出
    document.getElementById('stemBranchYear').innerText = `${stemBranchYear} (民國${rocYear}年, 西元 ${year} 年)`;
    document.getElementById('lunarDateDisplay').innerText = `農曆：${lunarMonthStr}月${lunarDay}日`;
    document.getElementById('dayPillarDisplay').innerText = dayPillarStr;
    document.getElementById('branchTime').innerText = `出生時辰：${branches[branchIndex]}時`;

    const l = (lunarMonth - 1) % 8; const u = (lunarDay - 1) % 8;
    const yearVal = (yearIndex % 12) + 1;
    const movingYao = (yearVal + lunarMonth + lunarDay + (branchIndex + 1)) % 6 || 6;
    document.getElementById('movingYaoDisplay').innerText = `動爻：第 ${movingYao} 爻`;

    const originalLines = [...trigramLinesMap[l], ...trigramLinesMap[u]];
    const changedLines = [...originalLines];
    changedLines[movingYao - 1] = changedLines[movingYao - 1] === 1 ? 0 : 1;
    const findTrigramIdx = (bits) => trigramLinesMap.findIndex(m => m.every((v, i) => v === bits[i]));
    const l2 = findTrigramIdx(changedLines.slice(0, 3));
    const u2 = findTrigramIdx(changedLines.slice(3, 6));

    if (hexagramNames[l] && hexagramNames[l][u]) {
        document.getElementById('hexagramName').innerHTML = `${hexagramNames[l][u]} <span style="color: #666; font-size: 20px;">➔ 變 ${hexagramNames[l2][u2]}</span>`;
    } else { document.getElementById('hexagramName').innerHTML = "查無此卦"; }

    const meta = hexMeta[`${u},${l}`] || {p:0, s:6};
    const palaceElem = palaceElements[meta.p];
    const ying = meta.s > 3 ? meta.s - 3 : meta.s + 3;
    
    // 計算互卦
    const ml = findTrigramIdx([originalLines[1], originalLines[2], originalLines[3]]);
    const mu = findTrigramIdx([originalLines[2], originalLines[3], originalLines[4]]);
    document.getElementById('mutualHexName').innerText = `互卦：${hexagramNames[ml][mu]}`;

    renderHexagram(palaceElem, ying, meta, voidBranches, movingYao, l, u, l2, u2, originalLines, changedLines, dayStemIdx);
}

function renderHexagram(palaceElem, ying, meta, voidBranches, movingYao, l, u, l2, u2, originalLines, changedLines, dayStemIdx) {
    benGuaDisplay.innerHTML = '';
    bianGuaDisplay.innerHTML = '';

    const allBranches = [...trigramNaJia[l].b[0], ...trigramNaJia[u].b[1]];
    const allChangedBranches = [...trigramNaJia[l2].b[0], ...trigramNaJia[u2].b[1]];
    
    const beastMapping = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5];
    const startBeastIdx = beastMapping[dayStemIdx];

    // 繪製本卦
    originalLines.forEach((isYang, i) => {
        const pos = i + 1; 
        const branch = allBranches[i];
        const isVoid = voidBranches.includes(branch);
        const isMoving = (pos === movingYao);
        const voidMark = isVoid ? '<span style="color: var(--accent-red); font-size: 10px;">(空)</span>' : '';
        const movingMark = isMoving ? '<span style="color: var(--accent-red); margin-left: 8px;">●</span>' : '';
        const branchElem = branchElements[branch];
        const relation = getLiuQin(palaceElem, branchElem);
        const mark = (pos === meta.s) ? '世' : (pos === ying ? '應' : '');
        const beast = sixBeasts[(startBeastIdx + i) % 6];
        
        const wrapper = document.createElement('div'); wrapper.className = 'yao-line-wrapper';
        const beastBox = document.createElement('div'); beastBox.className = 'six-beast'; beastBox.innerText = beast;
        const markBox = document.createElement('div'); markBox.className = 'shi-ying-box'; markBox.innerText = mark;
        const bar = document.createElement('div'); bar.className = `yao-bar ${isYang ? 'yang' : 'yin'}`;
        if (!isYang) bar.innerHTML = '<div class="segment"></div><div class="segment"></div>';
        const textBox = document.createElement('div'); textBox.className = `yao-text elem-${branchElem}`;
        textBox.innerHTML = `${relation}${branch}${branchElem}${voidMark}${movingMark}`.trim();

        wrapper.append(beastBox, markBox, bar, textBox);
        benGuaDisplay.appendChild(wrapper);
    });

    // 繪製變卦 (僅在下方列出)
    changedLines.forEach((isYang, i) => {
        const branch = allChangedBranches[i];
        const branchElem = branchElements[branch];
        const relation = getLiuQin(palaceElem, branchElem);
        const beast = sixBeasts[(startBeastIdx + i) % 6];

        const wrapper = document.createElement('div'); wrapper.className = 'yao-line-wrapper';
        
        // 變卦同樣顯示六獸，保持對齊與資訊完整
        const beastBox = document.createElement('div'); beastBox.className = 'six-beast'; beastBox.innerText = beast;
        const markSpacer = document.createElement('div'); markSpacer.className = 'shi-ying-box';
        
        const bar = document.createElement('div'); bar.className = `yao-bar ${isYang ? 'yang' : 'yin'}`;
        if (!isYang) bar.innerHTML = '<div class="segment"></div><div class="segment"></div>';
        const textBox = document.createElement('div'); textBox.className = `yao-text elem-${branchElem}`;
        textBox.innerHTML = `${relation}${branch}${branchElem}`.trim();

        wrapper.append(beastBox, markSpacer, bar, textBox);
        bianGuaDisplay.appendChild(wrapper);
    });
}

dateInput.value = now.toISOString().split('T')[0];
timeInput.value = now.toTimeString().slice(0, 5);
dateInput.addEventListener('change', updateConversion);
timeInput.addEventListener('change', updateConversion);
updateConversion();