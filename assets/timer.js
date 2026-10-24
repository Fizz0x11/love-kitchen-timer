/* 爱的厨房 · 倒计时器交互逻辑 */
(function () {
  'use strict';

  /* ---------- 常量 ---------- */
  var RING_R = 112;
  var CIRCUMFERENCE = 2 * Math.PI * RING_R;
  var DEFAULT_MIN = 5;
  var BASE_TITLE = '爱的厨房 · 倒计时器';

  var PHRASES_RUNNING = [
    '咕嘟咕嘟…听，幸福的冒泡声',
    '香气正在厨房里打转～',
    '爱，正在慢慢入味',
    '再等等，美味马上就好',
    '小火慢炖的，都是心意'
  ];
  var PHRASE_IDLE = '嘟嘟：选一道菜，我陪你一起计时～';
  var PHRASE_PAUSED = '嘟嘟：先歇一下，灶台我帮你看着～';

  /* ---------- 元素 ---------- */
  var card = document.getElementById('timer-card');
  var ringProg = document.getElementById('ring-prog');
  var timeText = document.getElementById('time-text');
  var statusText = document.getElementById('status-text');
  var dishLabel = document.getElementById('dish-label');
  var btnToggle = document.getElementById('btn-toggle');
  var btnReset = document.getElementById('btn-reset');
  var btnMinus = document.getElementById('btn-minus');
  var btnPlus = document.getElementById('btn-plus');
  var btnMute = document.getElementById('btn-mute');
  var celebrate = document.getElementById('celebrate');
  var celDish = document.getElementById('cel-dish');
  var btnCloseCel = document.getElementById('btn-close-cel');
  var dishBtns = document.querySelectorAll('.dish');
  var btnVoice = document.getElementById('btn-voice');
  var voiceToast = document.getElementById('voice-toast');
  var voiceToastText = document.getElementById('voice-toast-text');

  /* ---------- 状态 ---------- */
  var totalSeconds = DEFAULT_MIN * 60;
  var remaining = totalSeconds;
  var timerId = null;
  var running = false;
  var currentDish = null; // { name, emoji, min }
  var phraseIdx = 0;
  var phraseTimer = null;
  var muted = false;
  try { muted = localStorage.getItem('lk-muted') === '1'; } catch (e) {}

  /* ---------- 语音陪伴状态 ---------- */
  var synth = window.speechSynthesis || null;
  var zhVoice = null;
  var speechQueue = [];
  var speakingNow = false;
  var voiceOn = true;
  try { voiceOn = localStorage.getItem('lk-voice') !== '0'; } catch (e) {}
  var halfDone = false;
  var lastMinuteDone = false;
  var toastTimer = null;

  /* ---------- 预录语音（剪映「文本朗读」等导出的台词音频） ----------
     规则：assets/voice/ 下存在同名音频（mp3/m4a/wav）就播音频，没有就用浏览器 TTS 兜底 */
  var VOICE_DIR = 'assets/voice/';
  var VOICE_EXTS = ['mp3', 'm4a', 'wav'];
  var VOICE_FILES = {
    greet: 'greet',
    resume: 'resume',
    start: 'start',
    startLong: 'start-long',
    half: 'half',
    last: 'last',
    finish: 'finish',
    pause: 'pause',
    reset: 'reset',
    plus: 'plus',
    minus: 'minus',
    voiceOn: 'voice-on',
    demo: 'demo',
    'dish-溏心蛋': 'dish-tangxindan',
    'dish-泡面': 'dish-paomian',
    'dish-清蒸鲈鱼': 'dish-luyu',
    'dish-煮饺子': 'dish-jiaozi',
    'dish-白灼虾': 'dish-xia',
    'dish-蜜汁烤翅': 'dish-chiji',
    'dish-小米粥': 'dish-xiaomi',
    'dish-蒸蛋羹': 'dish-zhengdan'
  };
  var voiceFileReady = {};   // key -> 可用音频地址
  var voiceFileBroken = {};  // key -> 已确认没有对应音频
  var currentAudio = null;

  function voiceUrl(name, ext) { return VOICE_DIR + name + '.' + ext; }

  function stopAudio() {
    if (!currentAudio) return;
    try { currentAudio.pause(); } catch (e) {}
    currentAudio = null;
  }

  function playAudio(url, opts) {
    opts = opts || {};
    stopAudio();
    if (opts.priority === 'now') {
      speechQueue.length = 0;
      if (synth) { try { synth.cancel(); } catch (e) {} }
      speakingNow = false;
    }
    try {
      var a = new Audio(url);
      currentAudio = a;
      a.addEventListener('ended', function () {
        if (currentAudio === a) currentAudio = null;
      });
      a.addEventListener('error', function () {
        if (currentAudio === a) currentAudio = null;
      });
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { currentAudio = null; }
  }

  /* 找出某个 key 对应的音频文件（首次按 mp3 → m4a → wav 顺序试） */
  function resolveVoice(key, cb) {
    if (voiceFileReady[key]) return cb(voiceFileReady[key]);
    if (voiceFileBroken[key]) return cb(null);
    var name = VOICE_FILES[key];
    (function tryExt(i) {
      if (i >= VOICE_EXTS.length) { voiceFileBroken[key] = true; return cb(null); }
      var url = voiceUrl(name, VOICE_EXTS[i]);
      var a = new Audio();
      a.preload = 'auto';
      a.addEventListener('loadedmetadata', function () {
        voiceFileReady[key] = url;
        cb(url);
      }, { once: true });
      a.addEventListener('error', function () { tryExt(i + 1); }, { once: true });
      a.src = url;
    })(0);
  }

  /* 有音频就播音频并返回 true；返回 true 表示已经接管这次播报（失败会自动退回 TTS） */
  function playVoiceFile(key, opts, text) {
    if (!key || !VOICE_FILES[key]) return false;
    if (voiceFileReady[key]) { playAudio(voiceFileReady[key], opts); return true; }
    if (voiceFileBroken[key]) return false;
    resolveVoice(key, function (url) {
      if (url) playAudio(url, opts);
      else if (voiceOn) speakTTS(text, opts); /* 没有音频：退回 TTS，字幕已显示过，不重复 */
    });
    return true;
  }

  /* 嘟嘟的软萌语气台词 */
  var DISH_TIPS = {
    '溏心蛋': '水开下锅哦，捞出来记得过凉水嘛～',
    '泡面': '水开下面呀，三分钟就够啦，别煮软了哦～',
    '清蒸鲈鱼': '水开再上锅哦，蒸好了焖两分钟，更嫩呢～',
    '煮饺子': '水开下锅呀，点两次凉水，就熟啦～',
    '白灼虾': '虾身变红、卷起来，就可以捞啦～',
    '蜜汁烤翅': '中途记得翻个面，刷点蜂蜜哦～',
    '小米粥': '小火慢熬呀，滴两滴油，就不溢锅啦～',
    '蒸蛋羹': '蛋液过筛哦，中小火蒸，才滑嫩呢～'
  };
  var COMPANION_LINES = [
    '我在这儿陪着你呢～',
    '咕嘟咕嘟…听见了没有呀？这是幸福的声音哦。',
    '别走太远嘛，火还开着呢～',
    '家里有饭菜香，就是最踏实的日子呀。',
    '慢一点也没关系哦，好吃的，都值得等～',
    '水开啦，别只顾着刷手机哦，谢谢配合～',
    '我闻到了，是幸福的味道，也可能有一点点糊味～',
    '您慢慢来，锅我帮您看着，谢谢您信任～'
  ];

  /* 礼貌型吐槽：您字当头，谢谢收尾 */
  var SASS = {
    pause: [
      '又暂停？可以可以，锅要是凉了，您可别怪我没提醒～',
      '您这是在跟火候玩捉迷藏吗？它都快睡着了～',
      '这都第几次暂停了呀，锅说谢谢您的关照，但它有点冷～'
    ],
    plus: [
      '又加一分钟？尊敬的用户，加水也是要付水费的哦～',
      '加加加，您这是打算把锅熬穿吗？我不心疼锅，我心疼您～',
      '您对时间的慷慨，真是让我佩服得五体投地，谢谢您～'
    ],
    minus: [
      '再减就要吃生的了哦，我先声明一下，这个我不负责～',
      '您刀工还没练，时间倒是先砍得挺利索～',
      '减到只剩锅气了，您这是要做空气料理吗？那我先摘帽子～'
    ],
    reset: [
      '又重来？您这锅菜，怕不是要练成绝世武功～',
      '这都第几次重来了呀，锅说它有点晕，请您高抬贵手～',
      '没关系，火我帮您看着，您慢慢重来，我不着急～'
    ],
    dish: [
      '又选这个？您对它真是情有独钟，我尊重您的选择～',
      '好的好的，您说了算，反正洗锅的不是您～'
    ]
  };
  var actCount = { pause: 0, plus: 0, minus: 0, reset: 0 };
  var lastSass = '';

  function pickSass(kind) {
    var pool = SASS[kind];
    if (!pool || !pool.length) return '';
    var line = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && line === lastSass) {
      line = pool[(pool.indexOf(line) + 1) % pool.length];
    }
    lastSass = line;
    return line;
  }

  /* ---------- 语音陪伴引擎（软萌童声：高音高、语速轻） ---------- */
  function loadVoices() {
    if (!synth) return;
    var list = synth.getVoices() || [];
    if (!list.length) return;
    var zh = list.filter(function (v) {
      return /^zh/i.test(v.lang) || /中文|Chinese|普通话/i.test(v.name);
    });
    if (!zh.length) { zhVoice = list[0]; return; }
    var prefer = ['Yaoyao', 'Xiaoxiao', 'Xiaoyi', 'Huihui', 'Tingting', 'Meijia', 'Female', '女'];
    for (var i = 0; i < prefer.length; i++) {
      var key = prefer[i].toLowerCase();
      for (var j = 0; j < zh.length; j++) {
        if (zh[j].name.toLowerCase().indexOf(key) >= 0) { zhVoice = zh[j]; return; }
      }
    }
    zhVoice = zh[0];
  }

  function initVoice() {
    if (!synth) {
      /* 浏览器不支持语音合成：只保留「嘟嘟说」字幕，不显示语音开关 */
      if (btnVoice) btnVoice.style.display = 'none';
      return;
    }
    loadVoices();
    if ('onvoiceschanged' in synth) synth.onvoiceschanged = loadVoices;
  }

  function updateVoiceIcon() {
    if (!btnVoice) return;
    btnVoice.textContent = voiceOn ? '🗣️' : '🤫';
    btnVoice.classList.toggle('off', !voiceOn);
    btnVoice.title = voiceOn ? '语音陪伴已开，点击关闭' : '语音陪伴已关，点击开启';
  }

  function showVoiceToast(text) {
    if (!voiceToast || !voiceToastText) return;
    voiceToastText.textContent = text;
    voiceToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      voiceToast.classList.remove('show');
    }, Math.max(2400, text.length * 280));
  }

  function hideVoiceToast() {
    if (voiceToast) voiceToast.classList.remove('show');
    clearTimeout(toastTimer);
  }

  /* 语气基线：童声本身偏高，不再叠得太尖；语速放慢，带一点拖音 */
  function basePitch() {
    return (zhVoice && /yaoyao/i.test(zhVoice.name)) ? 1.18 : 1.56;
  }
  function baseRate() { return 0.94; }

  /* 按标点断句：每段单独给音高和停顿，做出「奶声奶气」的起伏 */
  function enqueueProsody(text, opts) {
    var parts = text.match(/[^，。！？…～]+[，。！？…～]*/g) || [text];
    parts = parts.map(function (s) { return s.trim(); })
                 .filter(function (s) { return !!s; });
    if (parts.length > 4) {
      parts = parts.slice(0, 3).concat([parts.slice(3).join('')]);
    }
    var p0 = opts.pitch || basePitch();
    var r0 = opts.rate || baseRate();
    parts.forEach(function (part, i) {
      var last = i === parts.length - 1;
      var pitch = p0 + (last ? 0.05 : 0);
      var rate = r0 * (last ? 0.94 : 1);
      if (/[？！]$/.test(part)) pitch += 0.07;
      if (/[～…]$/.test(part)) pitch += 0.04;
      if (part.length <= 3) rate *= 0.9;
      pitch += (Math.random() - 0.5) * 0.05;
      speechQueue.push({
        text: part,
        rate: Math.max(0.7, Math.min(1.4, rate)),
        pitch: Math.max(0.8, Math.min(2, pitch)),
        gap: last ? 180 : 230
      });
    });
  }

  /* priority: 'now' 会打断当前播报，用于倒数与开饭；flat 用于数字倒数；key 指定预录音频 */
  function speak(text, opts) {
    if (!text || !voiceOn) return;
    opts = opts || {};
    if (opts.toast !== false) showVoiceToast(text);
    if (playVoiceFile(opts.key, opts, text)) return;
    speakTTS(text, opts);
  }

  function speakTTS(text, opts) {
    if (!synth) return; /* 无语音合成时只显示字幕 */
    if (opts.priority === 'now') {
      speechQueue.length = 0;
      try { synth.cancel(); } catch (e) {}
      speakingNow = false;
    }
    if (opts.flat) {
      speechQueue.push({
        text: text,
        rate: opts.rate || baseRate(),
        pitch: opts.pitch || basePitch(),
        gap: 150
      });
    } else {
      enqueueProsody(text, opts);
    }
    pumpSpeech();
  }

  function pumpSpeech() {
    if (speakingNow || !speechQueue.length || !synth) return;
    var item = speechQueue.shift();
    var u = new SpeechSynthesisUtterance(item.text);
    u.lang = 'zh-CN';
    if (zhVoice) u.voice = zhVoice;
    u.pitch = item.pitch;
    u.rate = item.rate;
    u.volume = 1;
    var guard = null;
    var done = function () {
      if (guard) clearTimeout(guard);
      speakingNow = false;
      setTimeout(pumpSpeech, item.gap || 150);
    };
    u.onend = done;
    u.onerror = done;
    /* 兜底：个别浏览器 onend 不触发时避免队列卡死 */
    guard = setTimeout(done, 1800 + item.text.length * 300);
    speakingNow = true;
    try { synth.speak(u); } catch (e) { speakingNow = false; }
  }

  function startLine() {
    if (Math.round(totalSeconds / 60) >= 20) {
      return '胆子真是肥嘟嘟～说开火，就开火啦！这么久呀，够您追半集剧了哦，我帮您看着嘛～';
    }
    return '胆子真是肥嘟嘟～说开火，就开火啦！我帮你看着火候哦～';
  }

  function startLineKey() {
    return Math.round(totalSeconds / 60) >= 20 ? 'startLong' : 'start';
  }

  /* 里程碑播报：像导航一样，在该提醒的时候说话 */
  function announceMilestones() {
    var ratio = 1 - remaining / totalSeconds;
    if (!halfDone && totalSeconds >= 150 && ratio >= 0.5) {
      halfDone = true;
      speak('过半啦，过半啦～闻到香味了没有呀？', { key: 'half' });
      return;
    }
    if (!lastMinuteDone && totalSeconds > 120 && remaining === 60) {
      lastMinuteDone = true;
      speak('最后一分钟咯～请您放下手机嘛，碗筷可以先摆好啦。', { priority: 'now', key: 'last' });
      return;
    }
    if (remaining <= 5) {
      var nums = ['', '一', '二', '三', '四', '五'];
      speak(nums[remaining], { priority: 'now', toast: false, flat: true, rate: 1.18, pitch: 1.8 });
      return;
    }
    if (remaining > 70 && remaining % 75 === 0) {
      speak(COMPANION_LINES[Math.floor(Math.random() * COMPANION_LINES.length)]);
    }
  }

  /* ---------- 初始化 ---------- */
  ringProg.style.strokeDasharray = CIRCUMFERENCE;
  ringProg.style.strokeDashoffset = 0;
  updateMuteIcon();
  initVoice();
  updateVoiceIcon();
  render();

  /* ---------- 渲染 ---------- */
  function render() {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    var text = pad(m) + ':' + pad(s);
    timeText.textContent = text;

    var frac = totalSeconds > 0 ? remaining / totalSeconds : 0;
    ringProg.style.strokeDashoffset = CIRCUMFERENCE * (1 - frac);

    if (running) {
      document.title = text + ' · ' + BASE_TITLE;
    } else {
      document.title = BASE_TITLE;
    }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function setStatus(text) {
    statusText.style.opacity = 0;
    setTimeout(function () {
      statusText.textContent = text;
      statusText.style.opacity = 1;
    }, 200);
  }

  function renderDishLabel() {
    if (currentDish) {
      dishLabel.textContent = currentDish.emoji + ' ' + currentDish.name + ' · ' + Math.round(totalSeconds / 60) + ' 分钟';
    } else {
      dishLabel.textContent = '🦘 嘟嘟陪你 · ' + Math.round(totalSeconds / 60) + ' 分钟';
    }
  }

  function markActiveDish() {
    dishBtns.forEach(function (b) {
      var isActive = currentDish && b.dataset.name === currentDish.name;
      b.classList.toggle('active', !!isActive);
    });
  }

  /* ---------- 计时核心 ---------- */
  function start() {
    if (running || remaining <= 0) {
      if (remaining <= 0) resetTimer();
      else return;
    }
    running = true;
    card.classList.add('running');
    btnToggle.textContent = '暂停一下';
    setStatus(PHRASES_RUNNING[0]);
    var resuming = remaining < totalSeconds;
    if (!resuming) { halfDone = false; lastMinuteDone = false; }
    speak(resuming ? '好嘞～接着来，火候刚刚好哦！' : startLine(),
          resuming ? { key: 'resume' } : { key: startLineKey() });
    startPhraseRotation();
    timerId = setInterval(tick, 1000);
  }

  function pause() {
    actCount.pause++;
    running = false;
    card.classList.remove('running');
    btnToggle.textContent = '继续烹饪';
    setStatus(PHRASE_PAUSED);
    stopPhraseRotation();
    clearInterval(timerId);
    timerId = null;
    speak(actCount.pause >= 2 ? pickSass('pause') : '累了吧？那就先歇一会儿嘛…灶台，我帮你看着呢～',
          { key: actCount.pause >= 2 ? null : 'pause' });
    render();
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      render();
      finish();
      return;
    }
    announceMilestones();
    render();
  }

  function resetTimer() {
    actCount.reset++;
    clearInterval(timerId);
    timerId = null;
    running = false;
    card.classList.remove('running');
    remaining = totalSeconds;
    halfDone = false;
    lastMinuteDone = false;
    btnToggle.textContent = '开始烹饪';
    setStatus(PHRASE_IDLE);
    stopPhraseRotation();
    speak(actCount.reset >= 2 ? pickSass('reset') : '没关系呀，重新来过嘛～什么时候开始，都来得及哦。',
          { key: actCount.reset >= 2 ? null : 'reset' });
    render();
  }

  function finish() {
    clearInterval(timerId);
    timerId = null;
    running = false;
    card.classList.remove('running');
    btnToggle.textContent = '开始烹饪';
    stopPhraseRotation();
    document.title = BASE_TITLE;
    celDish.textContent = currentDish
      ? currentDish.emoji + ' ' + currentDish.name + ' 做好啦，趁热享用～'
      : '美味出炉，趁热享用～';
    celebrate.classList.add('show');
    speak('开饭啦，开饭啦！小心烫哦～慢慢吃嘛。', { priority: 'now', key: 'finish' });
    playDing();
    rainHearts();
    remaining = totalSeconds;
    render();
  }

  /* ---------- 温馨文案轮播 ---------- */
  function startPhraseRotation() {
    stopPhraseRotation();
    phraseTimer = setInterval(function () {
      phraseIdx = (phraseIdx + 1) % PHRASES_RUNNING.length;
      setStatus(PHRASES_RUNNING[phraseIdx]);
    }, 4000);
  }
  function stopPhraseRotation() {
    clearInterval(phraseTimer);
    phraseTimer = null;
    phraseIdx = 0;
  }

  /* ---------- 提示音（WebAudio 叮咚） ---------- */
  function playDing() {
    if (muted) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var notes = [659.25, 880]; // E5 -> A5，温柔的叮咚
      notes.forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        var t0 = ctx.currentTime + i * 0.35;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.25, t0 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 1.2);
      });
    } catch (e) { /* 无音频环境时静默 */ }
  }

  /* ---------- 爱心飘落 ---------- */
  function rainHearts() {
    var hearts = ['❤️', '💗', '🧡', '💛', '💖'];
    for (var i = 0; i < 26; i++) {
      (function (i) {
        setTimeout(function () {
          var el = document.createElement('span');
          el.className = 'heart';
          el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
          el.style.left = Math.random() * 96 + 'vw';
          el.style.fontSize = (1 + Math.random() * 1.4) + 'rem';
          el.style.animationDuration = (2.4 + Math.random() * 2.2) + 's';
          document.body.appendChild(el);
          setTimeout(function () { el.remove(); }, 5200);
        }, i * 130);
      })(i);
    }
  }

  /* ---------- 静音 ---------- */
  function updateMuteIcon() {
    btnMute.textContent = muted ? '🔕' : '🔔';
    btnMute.title = muted ? '提示音已关，点击开启' : '提示音已开，点击静音';
  }
  btnMute.addEventListener('click', function () {
    muted = !muted;
    try { localStorage.setItem('lk-muted', muted ? '1' : '0'); } catch (e) {}
    updateMuteIcon();
  });

  /* ---------- 事件绑定 ---------- */
  btnToggle.addEventListener('click', function () {
    if (running) pause(); else start();
  });

  btnReset.addEventListener('click', resetTimer);

  btnPlus.addEventListener('click', function () {
    if (totalSeconds + 60 > 99 * 60) return;
    totalSeconds += 60;
    remaining += 60;
    renderDishLabel();
    render();
    actCount.plus++;
    speak(actCount.plus >= 2 ? pickSass('plus') : '再给你加一分钟哦～慢慢来，不着急嘛。',
          { key: actCount.plus >= 2 ? null : 'plus' });
  });

  btnMinus.addEventListener('click', function () {
    if (totalSeconds - 60 < 60) return;
    totalSeconds -= 60;
    remaining = Math.max(remaining - 60, remaining > 60 ? remaining - 60 : remaining);
    if (remaining > totalSeconds) remaining = totalSeconds;
    renderDishLabel();
    render();
    actCount.minus++;
    speak(actCount.minus >= 2 ? pickSass('minus') : '减掉一分钟啦～小心哦，别煮过头了。',
          { key: actCount.minus >= 2 ? null : 'minus' });
  });

  dishBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var min = parseInt(btn.dataset.min, 10);
      var emoEl = btn.querySelector('.emo');
      var repeatPick = !!(currentDish && currentDish.name === btn.dataset.name);
      currentDish = {
        name: btn.dataset.name,
        emoji: emoEl ? emoEl.textContent : '🍲',
        min: min
      };
      clearInterval(timerId);
      timerId = null;
      running = false;
      card.classList.remove('running');
      stopPhraseRotation();
      totalSeconds = min * 60;
      remaining = totalSeconds;
      halfDone = false;
      lastMinuteDone = false;
      actCount = { pause: 0, plus: 0, minus: 0, reset: 0 };
      btnToggle.textContent = '开始烹饪';
      setStatus('已选好「' + currentDish.name + '」，按开始就开火～');
      renderDishLabel();
      markActiveDish();
      render();
      if (repeatPick) {
        speak(pickSass('dish') + ' ' + currentDish.name + '，' + min + '分钟，我再帮您盯着～');
      } else {
        speak(currentDish.name + '呀，' + min + '分钟就好哦。' + (DISH_TIPS[currentDish.name] || '我陪你一起等哦～'),
              { key: 'dish-' + currentDish.name });
      }
    });
  });

  btnCloseCel.addEventListener('click', function () {
    celebrate.classList.remove('show');
    speak('好吃就多添一碗嘛～我陪你，慢慢吃哦。');
  });
  celebrate.addEventListener('click', function (e) {
    if (e.target === celebrate) celebrate.classList.remove('show');
  });

  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space') return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'BUTTON') e.target.blur();
    e.preventDefault();
    if (celebrate.classList.contains('show')) {
      celebrate.classList.remove('show');
      return;
    }
    if (running) pause(); else start();
  });

  /* ---------- 语音开关 ---------- */
  if (btnVoice) {
    btnVoice.addEventListener('click', function () {
      voiceOn = !voiceOn;
      try { localStorage.setItem('lk-voice', voiceOn ? '1' : '0'); } catch (e) {}
      if (!voiceOn) {
        speechQueue.length = 0;
        stopAudio();
        if (synth) { try { synth.cancel(); } catch (e) {} }
        speakingNow = false;
        hideVoiceToast();
      } else {
        speak('语音开啦～我会一直陪着你哦。', { priority: 'now', key: 'voiceOn' });
      }
      updateVoiceIcon();
    });
  }

  /* ---------- 试听语气 ---------- */
  var btnVoiceDemo = document.getElementById('btn-voice-demo');
  if (btnVoiceDemo) {
    btnVoiceDemo.addEventListener('click', function () {
      if (!voiceOn) {
        voiceOn = true;
        try { localStorage.setItem('lk-voice', '1'); } catch (e) {}
        updateVoiceIcon();
      }
      speak('你好呀～我是嘟嘟，胆子嘛，肥嘟嘟！', { priority: 'now', key: 'demo' });
    });
  }

  /* 首次点击页面（非按钮）时打招呼，规避浏览器自动播放限制 */
  function firstGreet(e) {
    document.removeEventListener('pointerdown', firstGreet);
    if (e.target && e.target.closest && e.target.closest('button')) return;
    if (voiceOn) speak('欢迎回来呀～今天，想做点什么好吃的呀？', { key: 'greet' });
  }
  document.addEventListener('pointerdown', firstGreet);

  /* 初始标签 */
  renderDishLabel();
})();
