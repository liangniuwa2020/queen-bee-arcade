// =========================================================
// QUEEN BEE (女王蜂) - 街机 8-LINER 真实赔率与全盘奖算法
// 100% 对应原版街机双屏官方赔率表 (截图实证)：
// 
// 【表 1：单线连线赔率 (LINE MATCH PAYTABLE)】：
//  👑👑👑  3x 皇冠        : X200
//  💠💠💠  3x 浅蓝花      : X100
//  🌸🌸🌸  3x 粉红花      : X50
//  🌺🌺🌺  3x 金黄花      : X30
//  🦗🦗🦗  3x 蚱蜢        : X20
//  🐦🐦🐦  3x 小粉鸟      : X18
//  🕷️🕷️🕷️  3x 蜘蛛        : X14
//  💠🌸🌺  任意3种花色连线 : X10
//  🦋🦋🦋  3x 蜻蜓        : X10
//  🐞🐞🐞  3x 绿金龟      : X10
//  🐞🐞--  2x 绿金龟 (连续两格) : X5
//  🐞----  1x 绿金龟 (单格出现) : X2
//
// 【表 2：全盘特别大奖 (ALL AWARDS - 全盘9格)】：
//  ALL 👑 皇冠 (全盘9个)         x1000
//  ALL 💠 浅蓝花 (全盘9个)       x500
//  ALL 🌸 粉红花 (全盘9个)       x400
//  ALL 🐞 绿金龟 (全盘9个)       x400
//  ALL 🌺 金黄花 (全盘9个)       x300
//  ALL 🦗 蚂蚱/蚱蜢 (全盘9个)     x300
//  ALL 🐦 小粉鸟 (全盘9个)       x200
//  ALL 🕷️ 蜘蛛 (全盘9个)         x100
//  ALL 🦋 蜻蜓 (全盘9个)         x50
//  ALL INSECT (全盘皆为昆虫类)   x15
//  ALL ANY 花朵 (全盘皆为花朵类)  x50
//
// 【表 3：散牌皇冠奖 (SCATTER CROWNS - 盘面任意出现数量)】：
//  8 x 👑: x400
//  7 x 👑: x200
//  6 x 👑: x100
//  5 x 👑: x50
//  4 x 👑: x20
//  3 x 👑: x5
//  2 x 👑: x2
// =========================================================

// 图标定义表
const SYMBOLS = [
    { id: 'crown',         name: '皇冠',   icon: '👑', color: '#ffea00', category: 'special', lineOdds: 200, allOdds: 1000, weight: 6 },
    { id: 'blue_flower',   name: '浅蓝花', icon: '💠', color: '#00e5ff', category: 'flower',  lineOdds: 100, allOdds: 500,  weight: 10 },
    { id: 'pink_flower',   name: '粉红花', icon: '🌸', color: '#ff77aa', category: 'flower',  lineOdds: 50,  allOdds: 400,  weight: 12 },
    { id: 'gold_flower',   name: '金黄花', icon: '🌺', color: '#f39c12', category: 'flower',  lineOdds: 30,  allOdds: 300,  weight: 16 },
    { id: 'grasshopper',   name: '蚱蜢',   icon: '🦗', color: '#a8e063', category: 'insect',  lineOdds: 20,  allOdds: 300,  weight: 20 },
    { id: 'bird',          name: '小鸟',   icon: '🐦', color: '#ff9999', category: 'bird',    lineOdds: 18,  allOdds: 200,  weight: 22 },
    { id: 'spider',        name: '蜘蛛',   icon: '🕷️', color: '#9b59b6', category: 'insect',  lineOdds: 14,  allOdds: 100,  weight: 26 },
    { id: 'dragonfly',     name: '蜻蜓',   icon: '🦋', color: '#ff6b81', category: 'insect',  lineOdds: 10,  allOdds: 50,   weight: 30 },
    { id: 'beetle',        name: '绿金龟', icon: '🐞', color: '#2ecc71', category: 'insect',  lineOdds: 10,  allOdds: 400,  weight: 32 }
];

// 散牌皇冠倍率表
const SCATTER_CROWN_ODDS = {
    8: 400,
    7: 200,
    6: 100,
    5: 50,
    4: 20,
    3: 5,
    2: 2
};

// 8条支付线定义 (由3个单元格坐标组成: [行, 列])
const PAYLINES = [
    { id: 1, name: '顶横线', coords: [[0,0], [0,1], [0,2]], badge: 'row-0', lineId: 'line-1' },
    { id: 2, name: '中横线', coords: [[1,0], [1,1], [1,2]], badge: 'row-1', lineId: 'line-2' },
    { id: 3, name: '底横线', coords: [[2,0], [2,1], [2,2]], badge: 'row-2', lineId: 'line-3' },
    { id: 4, name: '左竖线', coords: [[0,0], [1,0], [2,0]], badge: 'col-0', lineId: 'line-4' },
    { id: 5, name: '中竖线', coords: [[0,1], [1,1], [2,1]], badge: 'col-1', lineId: 'line-5' },
    { id: 6, name: '右竖线', coords: [[0,2], [1,2], [2,2]], badge: 'col-2', lineId: 'line-6' },
    { id: 7, name: '主对角线', coords: [[0,0], [1,1], [2,2]], badge: 'diag-0', lineId: 'line-7' },
    { id: 8, name: '副对角线', coords: [[2,0], [1,1], [0,2]], badge: 'diag-1', lineId: 'line-8' }
];

class QueenBeeGame {
    constructor() {
        this.credit = 1000;
        this.betPerLine = 0; // 每条线的押注 (0 ~ 30)
        this.maxBetPerLine = 30; // 街机原版最高单线 30分 (8线合计 240分)
        this.lastWin = 0;
        this.currentPot = 0; // 待收分或可进入比倍的奖金
        this.isSpinning = false;
        this.autoSpin = false;
        this.activePaytableTab = 'line'; // 'line' or 'all'

        // 3x3 盘面格子 [row][col] => { symbol, isWild, mult }
        this.grid = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];

        this.initDOM();
        this.bindEvents();
        this.initInitialGrid();
        this.updateDisplay();
    }

    initDOM() {
        // 数码管
        this.txtCredit = document.getElementById('txtCredit');
        this.txtWin = document.getElementById('txtWin');
        this.txtTotalBet = document.getElementById('txtTotalBet');
        this.txtStatusMsg = document.getElementById('txtStatusMsg');

        // 指示灯
        this.lampFever = document.getElementById('lampFever');
        this.lampDouble = document.getElementById('lampDouble');

        // 操作台按钮
        this.btnCoin = document.getElementById('btnCoin');
        this.btnBet1 = document.getElementById('btnBet1');
        this.btnMaxBet = document.getElementById('btnMaxBet');
        this.btnStartSpin = document.getElementById('btnStartSpin');
        this.btnTakeScore = document.getElementById('btnTakeScore');
        this.btnEnterDouble = document.getElementById('btnEnterDouble');
        this.btnAutoSpin = document.getElementById('btnAutoSpin');
        this.btnToggleSound = document.getElementById('btnToggleSound');
        this.btnViewPaytable = document.getElementById('btnViewPaytable');

        // 赔率表切换按钮
        this.btnTabLine = document.getElementById('btnTabLine');
        this.btnTabAll = document.getElementById('btnTabAll');
        this.tableLine = document.getElementById('tableLine');
        this.tableAll = document.getElementById('tableAll');

        // 比倍猜大小浮层
        this.doubleOverlay = document.getElementById('doubleOverlay');
        this.diceDigit = document.getElementById('diceDigit');
        this.doublePrompt = document.getElementById('doublePrompt');
        this.curPotVal = document.getElementById('curPotVal');
        this.nextPotVal = document.getElementById('nextPotVal');
        this.btnDoubleSmall = document.getElementById('btnDoubleSmall');
        this.btnDoubleSeven = document.getElementById('btnDoubleSeven');
        this.btnDoubleBig = document.getElementById('btnDoubleBig');
        this.btnDoubleTake = document.getElementById('btnDoubleTake');

        // 规则弹窗
        this.rulesModal = document.getElementById('rulesModal');
        this.btnCloseRules = document.getElementById('btnCloseRules');
    }

    bindEvents() {
        this.btnCoin.addEventListener('click', () => this.insertCoin());
        this.btnBet1.addEventListener('click', () => this.addBet(1));
        this.btnMaxBet.addEventListener('click', () => this.setMaxBet());
        this.btnStartSpin.addEventListener('click', () => this.startSpin());
        this.btnTakeScore.addEventListener('click', () => this.takeScore());
        this.btnEnterDouble.addEventListener('click', () => this.openDoubleGame());
        
        this.btnAutoSpin.addEventListener('click', () => this.toggleAutoSpin());
        this.btnToggleSound.addEventListener('click', () => this.toggleSound());
        this.btnViewPaytable.addEventListener('click', () => { this.rulesModal.style.display = 'flex'; });
        this.btnCloseRules.addEventListener('click', () => { this.rulesModal.style.display = 'none'; });

        // 赔率表切换选项卡
        if (this.btnTabLine && this.btnTabAll) {
            this.btnTabLine.addEventListener('click', () => this.switchPaytable('line'));
            this.btnTabAll.addEventListener('click', () => this.switchPaytable('all'));
        }

        // 比倍操作
        this.btnDoubleSmall.addEventListener('click', () => this.handleGuess('small'));
        this.btnDoubleSeven.addEventListener('click', () => this.handleGuess('seven'));
        this.btnDoubleBig.addEventListener('click', () => this.handleGuess('big'));
        this.btnDoubleTake.addEventListener('click', () => this.takeScoreFromDouble());

        // 键盘快捷键
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.currentPot > 0 && !this.isSpinning) {
                    this.takeScore();
                } else {
                    this.startSpin();
                }
            } else if (e.code === 'KeyC') {
                this.insertCoin();
            } else if (e.code === 'KeyB') {
                this.addBet(1);
            } else if (e.code === 'KeyM') {
                this.setMaxBet();
            } else if (e.code === 'KeyD') {
                if (this.currentPot > 0) this.openDoubleGame();
            } else if (e.code === 'Tab') {
                e.preventDefault();
                this.switchPaytable(this.activePaytableTab === 'line' ? 'all' : 'line');
            }
        });
    }

    switchPaytable(tab) {
        this.activePaytableTab = tab;
        if (tab === 'line') {
            this.btnTabLine.classList.add('active');
            this.btnTabAll.classList.remove('active');
            this.tableLine.style.display = 'grid';
            this.tableAll.style.display = 'none';
        } else {
            this.btnTabLine.classList.remove('active');
            this.btnTabAll.classList.add('active');
            this.tableLine.style.display = 'none';
            this.tableAll.style.display = 'grid';
        }
    }

    // 随机抽取一个符号（依权重分布）
    getRandomSymbol() {
        const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const s of SYMBOLS) {
            if (rand < s.weight) return s;
            rand -= s.weight;
        }
        return SYMBOLS[SYMBOLS.length - 1];
    }

    // 初始化初始盘面
    initInitialGrid() {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const sym = this.getRandomSymbol();
                const isWild = (r === 1 && c === 1) || Math.random() < 0.08; // 女王蜂百搭
                const isDouble = Math.random() < 0.12; // 偶尔带 x2 乘数标签 (如原图蚱蜢x2)
                this.grid[r][c] = {
                    symbol: sym,
                    isWild: isWild,
                    mult: isDouble ? 2 : 1
                };
                this.renderCell(r, c);
            }
        }
    }

    renderCell(r, c) {
        const cellEl = document.getElementById(`cell-${r}-${c}`);
        if (!cellEl) return;
        const cellData = this.grid[r][c];
        const inner = cellEl.querySelector('.symbol-inner');
        
        let extraHtml = '';
        if (cellData.isWild) {
            extraHtml += `<span class="wild-marker">🐝 QUEEN</span>`;
        }
        if (cellData.mult === 2) {
            extraHtml += `<span class="multiplier-tag">x2</span>`;
        }

        const displayIcon = cellData.isWild ? '🐝' : cellData.symbol.icon;
        const displayName = cellData.isWild ? '女王蜂' : cellData.symbol.name;

        inner.innerHTML = `
            <span>${displayIcon}</span>
            <span class="symbol-name">${displayName}</span>
            ${extraHtml}
        `;
    }

    // 投币
    insertCoin() {
        this.credit += 100;
        audio.playCoin();
        this.flashStatus('COIN INSERTED (+100)');
        this.updateDisplay();
    }

    // 加注 (单押 8 线)
    addBet(amount = 1) {
        if (this.isSpinning) return;
        if (this.currentPot > 0) {
            this.takeScore(); // 若有未收奖金，先自动收分
        }

        if (this.betPerLine + amount > this.maxBetPerLine) {
            this.betPerLine = 1; // 循环归 1
        } else {
            this.betPerLine += amount;
        }

        const totalBet = this.betPerLine * 8;
        if (totalBet > this.credit) {
            this.flashStatus('CREDIT INSUFFICIENT! PLEASE INSERT COIN');
            return;
        }

        audio.playBet();
        this.updateDisplay();
        this.flashStatus(`BET PER LINE: ${this.betPerLine} (TOTAL: ${totalBet})`);
    }

    // 全满押 (每线 30，满注 240)
    setMaxBet() {
        if (this.isSpinning) return;
        if (this.currentPot > 0) {
            this.takeScore();
        }

        if (this.credit < 240) {
            const possiblePerLine = Math.floor(this.credit / 8);
            if (possiblePerLine <= 0) {
                this.flashStatus('CREDIT INSUFFICIENT! PLEASE INSERT COIN');
                return;
            }
            this.betPerLine = Math.min(this.maxBetPerLine, possiblePerLine);
        } else {
            this.betPerLine = this.maxBetPerLine;
        }

        audio.playBet();
        this.updateDisplay();
        this.flashStatus(`MAX BET ACTIVATED: ${this.betPerLine * 8}!`);
    }

    // 更新界面状态
    updateDisplay() {
        const totalBet = this.betPerLine * 8;
        this.txtCredit.textContent = this.credit;
        this.txtTotalBet.textContent = totalBet;
        this.txtWin.textContent = this.currentPot > 0 ? this.currentPot : this.lastWin;

        // 8条线的外围徽章显示押分 (如同街机原图上的红色方块数字 30)
        PAYLINES.forEach(line => {
            const badgeEl = document.getElementById(`badge-${line.badge}`);
            if (badgeEl) {
                const valEl = badgeEl.querySelector('.badge-val');
                if (valEl) valEl.textContent = this.betPerLine;
                if (this.betPerLine > 0) {
                    badgeEl.classList.add('active');
                } else {
                    badgeEl.classList.remove('active');
                }
            }
        });

        // 按钮使能状态
        const hasPot = this.currentPot > 0;
        this.btnTakeScore.disabled = !hasPot || this.isSpinning;
        this.btnEnterDouble.disabled = !hasPot || this.isSpinning;
        this.lampDouble.classList.toggle('active', hasPot);
    }

    flashStatus(msg) {
        this.txtStatusMsg.textContent = msg;
    }

    // 开始旋转
    async startSpin() {
        if (this.isSpinning) return;

        // 若有未收分，先收取
        if (this.currentPot > 0) {
            this.takeScore();
        }

        const totalBet = this.betPerLine * 8;
        if (totalBet <= 0) {
            this.flashStatus('PLEASE BET FIRST (PRESS BET)');
            return;
        }

        if (this.credit < totalBet) {
            this.flashStatus('INSUFFICIENT CREDIT! PLEASE INSERT COIN');
            if (this.autoSpin) this.toggleAutoSpin();
            return;
        }

        // 扣除押注
        this.credit -= totalBet;
        this.isSpinning = true;
        this.clearHighlights();
        this.updateDisplay();
        this.flashStatus('REELS SPINNING...');

        // 音效与九宫格动画
        const spinDuration = 1300;
        const tickInterval = setInterval(() => {
            audio.playReelTick();
        }, 90);

        // 为各个格子施加模糊旋转动效
        const cells = document.querySelectorAll('.symbol-inner');
        cells.forEach(c => c.classList.add('blur'));

        // 阶梯式依次停轮（左列、中列、右列）
        const stopPromises = [0, 1, 2].map((colIndex) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    for (let r = 0; r < 3; r++) {
                        const sym = this.getRandomSymbol();
                        const isWild = Math.random() < 0.09;
                        const isDouble = Math.random() < 0.15; // 15% 几率附加 x2 翻倍
                        this.grid[r][colIndex] = {
                            symbol: sym,
                            isWild: isWild,
                            mult: isDouble ? 2 : 1
                        };
                        this.renderCell(r, colIndex);
                        const cellEl = document.getElementById(`cell-${r}-${colIndex}`);
                        cellEl.querySelector('.symbol-inner').classList.remove('blur');
                    }
                    audio.playReelStop();
                    resolve();
                }, spinDuration + colIndex * 280);
            });
        });

        await Promise.all(stopPromises);
        clearInterval(tickInterval);

        // 停轮结算：计算单线奖、散牌皇冠奖、以及全盘特别大奖
        this.evaluateOutcomes();
        this.isSpinning = false;
        this.updateDisplay();

        // 自动旋转判断
        if (this.autoSpin && this.credit >= this.betPerLine * 8) {
            setTimeout(() => {
                if (this.autoSpin && !this.isSpinning) {
                    this.startSpin();
                }
            }, 1200);
        }
    }

    clearHighlights() {
        document.querySelectorAll('.payline').forEach(line => line.classList.remove('active'));
        document.querySelectorAll('.reel-cell').forEach(cell => cell.classList.remove('win-highlight'));
    }

    // 核心判定：依据原厂两张实拍赔率表进行精确判定
    evaluateOutcomes() {
        let totalWin = 0;
        const winningLines = [];
        const totalBet = this.betPerLine * 8;

        // 获取全盘 9 个格子
        const allNineCells = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                allNineCells.push(this.grid[r][c]);
            }
        }

        // 1. 检查全盘特别大奖 (ALL AWARDS - 对应表2)
        const allAward = this.checkAllAward(allNineCells);
        if (allAward) {
            const winVal = totalBet * allAward.mult;
            totalWin += winVal;
            audio.playBigWin();
            this.flashStatus(`🎉 ${allAward.name}! WIN: ${winVal}! 🎉`);
            document.querySelectorAll('.reel-cell').forEach(c => c.classList.add('win-highlight'));
            this.lastWin = totalWin;
            this.currentPot = totalWin;
            return;
        }

        // 2. 检查散牌皇冠奖 (SCATTER CROWNS: 2 ~ 8 个皇冠 - 对应表2右栏)
        const crownCount = allNineCells.filter(c => c.symbol.id === 'crown' || c.isWild).length;
        if (crownCount >= 2 && crownCount <= 8 && SCATTER_CROWN_ODDS[crownCount]) {
            const scatterMult = SCATTER_CROWN_ODDS[crownCount];
            const scatterWin = totalBet * scatterMult;
            totalWin += scatterWin;
            this.flashStatus(`👑 SCATTER CROWNS (${crownCount}x 皇冠)! WIN: ${scatterWin}!`);
        }

        // 3. 检查 8 条线路单线匹配 (LINE MATCHES - 对应表1实拍赔率)
        let triggerRouletteBonus = false;
        PAYLINES.forEach(line => {
            const cells = line.coords.map(([r, c]) => this.grid[r][c]);
            const match = this.checkLineMatch(cells);
            if (match.isWin) {
                let mult = cells.reduce((m, item) => m * item.mult, 1);
                const lineWin = this.betPerLine * match.odds * mult;
                totalWin += lineWin;
                winningLines.push({ line, coords: line.coords, winAmount: lineWin });

                // 原厂机制：当达成同色钻石花(浅蓝花/粉红花)连线时，触发第二屏幕钻石跑马灯奖励！
                if (match.symbol && (match.symbol.id === 'blue_flower' || match.symbol.id === 'pink_flower' || match.symbol.id === 'crown')) {
                    triggerRouletteBonus = true;
                }
            }
        });

        // 随机幸运触发奖励
        if (Math.random() < 0.05) {
            triggerRouletteBonus = true;
        }

        if (totalWin > 0) {
            this.lastWin = totalWin;
            this.currentPot = totalWin;
            this.highlightWins(winningLines);
            if (totalWin >= totalBet * 5) {
                audio.playBigWin();
                this.flashStatus(`🔥 MEGA WIN! YOU WON ${totalWin} CREDITS! 🔥`);
            } else {
                audio.playWin();
                this.flashStatus(`WIN: ${totalWin} CREDITS! (PRESS DOUBLE OR TAKE)`);
            }

            // 若达成触发条件，延迟 1.5 秒进入钻石跑马灯奖励关！
            if (triggerRouletteBonus) {
                setTimeout(() => {
                    this.flashStatus('⚡ ENTERING DIAMOND ROULETTE BONUS! ⚡');
                    this.startRouletteBonus();
                }, 1500);
            }
        } else {
            this.lastWin = 0;
            this.currentPot = 0;
            this.flashStatus('TRY AGAIN! PRESS START TO SPIN');
        }
    }

    // 检查全盘特别奖 (ALL 表)
    checkAllAward(nineCells) {
        const counts = {};
        let insectCount = 0;
        let flowerCount = 0;

        nineCells.forEach(cell => {
            const symId = cell.symbol.id;
            counts[symId] = (counts[symId] || 0) + 1;
            if (cell.symbol.category === 'insect') insectCount++;
            if (cell.symbol.category === 'flower') flowerCount++;
        });

        // 1. 全盘单一图标 (ALL SAME)
        for (const sym of SYMBOLS) {
            if (counts[sym.id] === 9) {
                return { name: `ALL ${sym.name} (x${sym.allOdds})`, mult: sym.allOdds };
            }
        }

        // 2. ALL ANY 花朵 (全盘9格全为花朵: 浅蓝花/粉红花/金黄花) -> x50
        if (flowerCount === 9) {
            return { name: 'ALL ANY 花朵大满贯 (x50)', mult: 50 };
        }

        // 3. ALL INSECT (全盘9格全为昆虫: 绿金龟/蚱蜢/蜘蛛/蜻蜓) -> x15
        if (insectCount === 9) {
            return { name: 'ALL INSECT 昆虫大满贯 (x15)', mult: 15 };
        }

        return null;
    }

    // 单线连线匹配判定 (对应表1原版截图)：
    // 👑x3: 200, 💠x3: 100, 🌸x3: 50, 🌺x3: 30, 🦗x3: 20, 🐦x3: 18, 🕷️x3: 14
    // 任意花色x3: 10, 🦋x3: 10, 🐞x3: 10, 🐞x2: 5, 🐞x1: 2
    checkLineMatch(cells) {
        const nonWilds = cells.filter(c => !c.isWild);

        // 全是Wild女王蜂，视为最高奖皇冠
        if (nonWilds.length === 0) {
            return { isWin: true, odds: 200, name: '3x 皇冠 (Wild)' };
        }

        const targetId = nonWilds[0].symbol.id;
        const allSame = nonWilds.every(c => c.symbol.id === targetId);

        // 1. 3个完全相同符号
        if (allSame) {
            const sym = nonWilds[0].symbol;
            return { isWin: true, odds: sym.lineOdds, name: `3x ${sym.name}` };
        }

        // 2. 任意花色混合连线 (浅蓝花 💠 / 粉红花 🌸 / 金黄花 🌺 混合3朵) -> x10
        const isAllFlowers = cells.every(c => c.isWild || c.symbol.category === 'flower');
        if (isAllFlowers) {
            return { isWin: true, odds: 10, name: '任意三色花连线' };
        }

        // 3. 绿金龟 🐞 散线特征 (左起2格 或 单格)
        const firstIsBeetle = cells[0].isWild || cells[0].symbol.id === 'beetle';
        const secondIsBeetle = cells[1].isWild || cells[1].symbol.id === 'beetle';
        if (firstIsBeetle && secondIsBeetle) {
            return { isWin: true, odds: 5, name: '2x 绿金龟' };
        }
        if (firstIsBeetle) {
            return { isWin: true, odds: 2, name: '1x 绿金龟' };
        }

        return { isWin: false, odds: 0, name: null };
    }

    highlightWins(winningLines) {
        winningLines.forEach(item => {
            const lineEl = document.getElementById(item.line.lineId);
            if (lineEl) lineEl.classList.add('active');

            item.coords.forEach(([r, c]) => {
                const cellEl = document.getElementById(`cell-${r}-${c}`);
                if (cellEl) cellEl.classList.add('win-highlight');
            });
        });
    }

    // 收分 (TAKE SCORE)
    takeScore() {
        if (this.currentPot <= 0) return;
        this.credit += this.currentPot;
        audio.playCollect();
        this.flashStatus(`COLLECTED ${this.currentPot} CREDITS!`);
        this.currentPot = 0;
        this.clearHighlights();
        this.updateDisplay();
    }

    // 开启猜大小 (DOUBLE UP)
    openDoubleGame() {
        if (this.currentPot <= 0 || this.isSpinning) return;
        this.doubleOverlay.style.display = 'flex';
        this.diceDigit.textContent = '?';
        this.curPotVal.textContent = this.currentPot;
        this.nextPotVal.textContent = this.currentPot * 2;
        this.doublePrompt.textContent = '请猜点数：【小 1~6】 或 【大 8~13】';
        this.setDoubleButtonsEnabled(true);
    }

    setDoubleButtonsEnabled(enabled) {
        this.btnDoubleSmall.disabled = !enabled;
        this.btnDoubleSeven.disabled = !enabled;
        this.btnDoubleBig.disabled = !enabled;
        this.btnDoubleTake.disabled = !enabled;
    }

    // 猜大小逻辑
    handleGuess(type) {
        this.setDoubleButtonsEnabled(false);
        audio.playDiceRoll();

        let count = 0;
        const rollInterval = setInterval(() => {
            this.diceDigit.textContent = Math.floor(Math.random() * 13) + 1;
            count++;
            if (count > 10) {
                clearInterval(rollInterval);
                this.finishDouble(type);
            }
        }, 60);
    }

    finishDouble(type) {
        const finalNumber = Math.floor(Math.random() * 13) + 1;
        this.diceDigit.textContent = finalNumber;

        let won = false;
        let multiplier = 2;

        if (type === 'small' && finalNumber >= 1 && finalNumber <= 6) {
            won = true;
        } else if (type === 'big' && finalNumber >= 8 && finalNumber <= 13) {
            won = true;
        } else if (type === 'seven' && finalNumber === 7) {
            won = true;
            multiplier = 6;
        }

        if (won) {
            audio.playDoubleSuccess();
            this.currentPot = this.currentPot * multiplier;
            this.curPotVal.textContent = this.currentPot;
            this.nextPotVal.textContent = this.currentPot * 2;
            this.doublePrompt.textContent = `🎉 猜中点数 ${finalNumber}！奖金翻倍为 ${this.currentPot}！`;
            this.setDoubleButtonsEnabled(true);
            this.updateDisplay();
        } else {
            audio.playDoubleFail();
            this.doublePrompt.textContent = `💥 开出 ${finalNumber}，比倍失败！`;
            this.currentPot = 0;
            this.updateDisplay();
            setTimeout(() => {
                this.doubleOverlay.style.display = 'none';
                this.clearHighlights();
            }, 1400);
        }
    }

    takeScoreFromDouble() {
        this.doubleOverlay.style.display = 'none';
        this.takeScore();
    }

    toggleAutoSpin() {
        this.autoSpin = !this.autoSpin;
        this.btnAutoSpin.textContent = this.autoSpin ? '⚡ 自动旋转: 开' : '⚡ 自动旋转: 关';
        this.btnAutoSpin.style.background = this.autoSpin ? '#ff0055' : '#092c2f';
        if (this.autoSpin && !this.isSpinning) {
            this.startSpin();
        }
    }

    toggleSound() {
        const isOn = audio.toggle();
        this.btnToggleSound.textContent = isOn ? '🔊 音效: 开' : '🔇 音效: 关';
    }

    // =========================================================
    // 钻石跑马灯奖励关卡 (DIAMOND ROULETTE BONUS)
    // 还原截图：24格绿色外圈 (含4个角落EXIT) + 中间4个大奖转轮
    // =========================================================
    initRouletteDOM() {
        this.rouletteOverlay = document.getElementById('rouletteOverlay');
        this.trackRing = document.getElementById('trackRing');
        this.rWinVal = document.getElementById('rWinVal');
        this.rRoundMult = document.getElementById('rRoundMult');
        this.rCreditVal = document.getElementById('rCreditVal');
        this.rBetVal = document.getElementById('rBetVal');
        this.rStatusMsg = document.getElementById('rStatusMsg');
        this.btnRouletteAction = document.getElementById('btnRouletteAction');

        // 4个中间轮子奖金与图标
        this.rReelBoxes = [0, 1, 2, 3].map(i => ({
            box: document.getElementById(`rReel-${i}`),
            sym: document.getElementById(`rReelSym-${i}`),
            prize: document.getElementById(`rReelPrize-${i}`)
        }));

        this.rouletteState = 'idle'; // 'idle', 'reels_spinning', 'light_running', 'finished'
        this.currentLightIndex = 4; // 跑灯当前所在索引 (0 ~ 23)
        this.rouletteWin = 0;
        this.rouletteMultiplier = 1;

        // 生成 24 个格子定义 (周圈围绕: 顶8格, 右4格, 底8格, 左4格)
        // 参照截图：4个角落为 EXIT，其余为 红花、蜻蜓、蚱蜢、黄蝴蝶、蜘蛛、绿金龟、大树
        this.trackItems = [
            // 顶排 8 格 (r=0, c=0..7)
            { r: 0, c: 0, type: 'exit', name: 'EXIT', icon: 'EXIT' },
            { r: 0, c: 1, type: 'flower', name: '红花', icon: '🌺' },
            { r: 0, c: 2, type: 'dragonfly', name: '蜻蜓', icon: '🦋' },
            { r: 0, c: 3, type: 'grasshopper', name: '蚱蜢', icon: '🦗' },
            { r: 0, c: 4, type: 'butterfly', name: '黄蝴蝶', icon: '🟡' },
            { r: 0, c: 5, type: 'spider', name: '蜘蛛', icon: '🕷️' },
            { r: 0, c: 6, type: 'beetle', name: '绿金龟', icon: '🐞' },
            { r: 0, c: 7, type: 'exit', name: 'EXIT', icon: 'EXIT' },
            // 右列 4 格 (r=1..4, c=7)
            { r: 1, c: 7, type: 'flower', name: '红花', icon: '🌺' },
            { r: 2, c: 7, type: 'dragonfly', name: '蜻蜓', icon: '🦋' },
            { r: 3, c: 7, type: 'flower_blue', name: '蓝花', icon: '💠' },
            { r: 4, c: 7, type: 'beetle', name: '绿金龟', icon: '🐞' },
            // 底排 8 格 (逆序 c=7..0, r=5)
            { r: 5, c: 7, type: 'exit', name: 'EXIT', icon: 'EXIT' },
            { r: 5, c: 6, type: 'grasshopper', name: '蚱蜢', icon: '🦗' },
            { r: 5, c: 5, type: 'dragonfly', name: '蜻蜓', icon: '🦋' },
            { r: 5, c: 4, type: 'beetle', name: '绿金龟', icon: '🐞' },
            { r: 5, c: 3, type: 'flower', name: '红花', icon: '🌺' },
            { r: 5, c: 2, type: 'spider', name: '蜘蛛', icon: '🕷️' },
            { r: 5, c: 1, type: 'tree', name: '大树', icon: '🌳' },
            { r: 5, c: 0, type: 'exit', name: 'EXIT', icon: 'EXIT' },
            // 左列 4 格 (逆序 r=4..1, c=0)
            { r: 4, c: 0, type: 'dragonfly', name: '蜻蜓', icon: '🦋' },
            { r: 3, c: 0, type: 'beetle', name: '绿金龟', icon: '🐞' },
            { r: 2, c: 0, type: 'flower_blue', name: '蓝花', icon: '💠' },
            { r: 1, c: 0, type: 'spider', name: '蜘蛛', icon: '🕷️' }
        ];

        this.renderTrackRing();

        if (this.btnRouletteAction) {
            this.btnRouletteAction.addEventListener('click', () => this.handleRouletteAction());
        }
    }

    renderTrackRing() {
        if (!this.trackRing) return;
        this.trackRing.innerHTML = '';
        this.trackCellsEl = [];

        this.trackItems.forEach((item, idx) => {
            const cell = document.createElement('div');
            cell.className = `track-cell ${item.type === 'exit' ? 'cell-exit' : ''}`;
            cell.style.gridRow = item.r + 1;
            cell.style.gridColumn = item.c + 1;
            cell.textContent = item.icon;
            cell.setAttribute('data-index', idx);
            this.trackRing.appendChild(cell);
            this.trackCellsEl.push(cell);
        });
    }

    // 开启跑马灯奖励关卡
    startRouletteBonus() {
        if (!this.rouletteOverlay) this.initRouletteDOM();
        this.rouletteOverlay.style.display = 'flex';
        this.rouletteWin = 0;
        this.rouletteMultiplier = 1;
        this.rWinVal.textContent = '0';
        this.rRoundMult.textContent = 'X 1';
        this.rCreditVal.textContent = this.credit;
        const totalBet = this.betPerLine > 0 ? this.betPerLine * 8 : 240;
        this.rBetVal.textContent = totalBet;
        this.rStatusMsg.textContent = 'PRESS STOP TO FIX 4 REELS!';

        // 默认让中间 4 个转轮开始高速旋转
        this.spinCenterReels();
    }

    // 中间 4 个转轮高速旋转
    spinCenterReels() {
        this.rouletteState = 'reels_spinning';
        this.btnRouletteAction.innerHTML = `<span>按键停轮<br><small>STOP REELS</small></span>`;
        this.rReelBoxes.forEach(r => r.sym.classList.add('blur'));

        // 奖池符号列表
        this.centerPool = [
            { sym: '🕷️', name: '蜘蛛', baseMult: 3 },
            { sym: '📦', name: '宝箱', baseMult: 12 },
            { sym: '👑', name: '皇冠', baseMult: 20 },
            { sym: '🦗', name: '蚱蜢', baseMult: 5 }
        ];

        this.reelsInterval = setInterval(() => {
            audio.playReelTick();
            this.rReelBoxes.forEach((r, idx) => {
                const randItem = this.centerPool[Math.floor(Math.random() * this.centerPool.length)];
                r.sym.textContent = randItem.sym;
            });
        }, 80);
    }

    // 停止中间 4 个转轮并计算各自奖金
    stopCenterReels() {
        clearInterval(this.reelsInterval);
        const bet = this.betPerLine > 0 ? this.betPerLine * 8 : 240;

        // 依次定格四个轮子并显示奖金（如截图中 720, 2880, 4800, 1200）
        this.centerReelsResult = [
            { sym: '🕷️', prize: Math.round(bet * 3) },
            { sym: '📦', prize: Math.round(bet * 12) },
            { sym: '👑', prize: Math.round(bet * 20) },
            { sym: '🦗', prize: Math.round(bet * 5) }
        ];

        this.rReelBoxes.forEach((r, idx) => {
            r.sym.classList.remove('blur');
            const res = this.centerReelsResult[idx];
            r.sym.textContent = res.sym;
            r.prize.textContent = res.prize;
        });

        audio.playReelStop();
        this.rStatusMsg.textContent = '4 REELS FIXED! RUNNING ROULETTE LIGHT...';

        // 自动启动外圈跑马灯
        setTimeout(() => {
            this.startLightRunning();
        }, 800);
    }

    // 启动周圈跑马灯旋转
    startLightRunning() {
        this.rouletteState = 'light_running';
        this.btnRouletteAction.innerHTML = `<span>停止跑灯<br><small>STOP LIGHT</small></span>`;
        this.btnRouletteAction.disabled = false;

        let speed = 60; // 高速旋转
        this.lightInterval = setInterval(() => {
            this.stepLight();
            audio.playReelTick();
        }, speed);
    }

    stepLight() {
        this.trackCellsEl.forEach(c => c.classList.remove('light-active'));
        this.currentLightIndex = (this.currentLightIndex + 1) % this.trackItems.length;
        const activeCell = this.trackCellsEl[this.currentLightIndex];
        if (activeCell) activeCell.classList.add('light-active');
    }

    // 减速停止跑灯
    stopLightRunning() {
        clearInterval(this.lightInterval);
        this.rouletteState = 'stopping';
        this.btnRouletteAction.disabled = true;

        // 减速走 8 ~ 14 步然后平稳停下
        let extraSteps = Math.floor(Math.random() * 7) + 8;
        let delay = 90;

        const slowStep = () => {
            this.stepLight();
            audio.playReelTick();
            extraSteps--;
            if (extraSteps > 0) {
                delay += 40;
                setTimeout(slowStep, delay);
            } else {
                this.evaluateRouletteHit();
            }
        };
        setTimeout(slowStep, delay);
    }

    // 跑马灯停在某格判定
    evaluateRouletteHit() {
        const hitItem = this.trackItems[this.currentLightIndex];

        // 1. 若停在 EXIT：关卡结束，结算奖金
        if (hitItem.type === 'exit') {
            audio.playDoubleFail();
            this.rStatusMsg.textContent = '💥 HIT [EXIT]! BONUS ROUND OVER!';
            this.btnRouletteAction.innerHTML = `<span>收分退出<br><small>COLLECT</small></span>`;
            this.btnRouletteAction.disabled = false;
            this.rouletteState = 'finished';
            return;
        }

        // 2. 若中奖（停在某种昆虫/花朵/蝴蝶/大树）：
        // 匹配中间4个轮子之一或直接派奖！
        let awardAmount = 0;
        let matchedReel = null;

        if (hitItem.type === 'spider') {
            matchedReel = this.rReelBoxes[0];
            awardAmount = this.centerReelsResult[0].prize;
        } else if (hitItem.type === 'crown' || hitItem.type === 'butterfly') {
            matchedReel = this.rReelBoxes[2];
            awardAmount = this.centerReelsResult[2].prize;
        } else if (hitItem.type === 'grasshopper') {
            matchedReel = this.rReelBoxes[3];
            awardAmount = this.centerReelsResult[3].prize;
        } else {
            // 任意花/大树/绿金龟对应宝箱神秘奖
            matchedReel = this.rReelBoxes[1];
            awardAmount = this.centerReelsResult[1].prize;
        }

        // 翻倍与累加
        this.rouletteWin += awardAmount * this.rouletteMultiplier;
        this.rWinVal.textContent = this.rouletteWin;
        audio.playBigWin();

        if (matchedReel) {
            matchedReel.box.classList.add('win-pulse');
            setTimeout(() => matchedReel.box.classList.remove('win-pulse'), 1200);
        }

        this.rStatusMsg.textContent = `🎉 HIT ${hitItem.name}! WON ${awardAmount}! PRESS TO CONTINUE!`;
        this.rouletteMultiplier++;
        this.rRoundMult.textContent = `X ${this.rouletteMultiplier}`;

        this.btnRouletteAction.innerHTML = `<span>继续转动<br><small>NEXT SPIN</small></span>`;
        this.btnRouletteAction.disabled = false;
        this.rouletteState = 'round_won';
    }

    handleRouletteAction() {
        if (this.rouletteState === 'reels_spinning') {
            this.stopCenterReels();
        } else if (this.rouletteState === 'light_running') {
            this.stopLightRunning();
        } else if (this.rouletteState === 'round_won') {
            // 继续下一轮跑灯
            this.startLightRunning();
        } else if (this.rouletteState === 'finished') {
            // 收取跑马灯全部奖金并返回主游戏
            this.credit += this.rouletteWin;
            this.lastWin = this.rouletteWin;
            this.currentPot = this.rouletteWin;
            audio.playCollect();
            this.rouletteOverlay.style.display = 'none';
            this.updateDisplay();
            this.flashStatus(`ROULETTE BONUS WON: ${this.rouletteWin} CREDITS!`);
        }
    }
}

// 启动游戏实例
window.addEventListener('DOMContentLoaded', () => {
    window.game = new QueenBeeGame();

    // 绑定跑马灯触发按钮
    const btnTriggerBonus = document.getElementById('btnTriggerBonus');
    if (btnTriggerBonus) {
        btnTriggerBonus.addEventListener('click', () => {
            window.game.startRouletteBonus();
        });
    }
});

