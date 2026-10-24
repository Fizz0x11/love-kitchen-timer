/* 嘟嘟的湘菜厨房 · 故事模式交互逻辑 */
(function () {
  'use strict';

  /* ================= 工具 ================= */
  function $(id) { return document.getElementById(id); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ================= 厨神「嘟嘟」全身形象 ================= */
  /* makeDudu(arms, cls)：美团黄袋鼠厨师全身造型——招牌大耳朵 + 厨师帽 + 白围裙 + 大脚丫 + 尾巴 */
  function makeDudu(arms, cls) {
    return '' +
    '<svg viewBox="0 0 220 260" class="' + (cls || '') + '">' +
    '<defs>' +
    '<linearGradient id="ggBody" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#FFDC5C"/><stop offset="100%" stop-color="#FFC400"/>' +
    '</linearGradient>' +
    '<linearGradient id="ggHat" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#FFFEFB"/><stop offset="100%" stop-color="#F0E7DB"/>' +
    '</linearGradient>' +
    '</defs>' +
    // 尾巴
    '<path d="M152 216 q46 4 50 32 q-30 12 -56 -4 z" fill="#F5B800"/>' +
    // 大脚丫 + 小腿
    '<ellipse cx="80" cy="246" rx="20" ry="9" fill="#D9A400"/>' +
    '<ellipse cx="140" cy="246" rx="20" ry="9" fill="#D9A400"/>' +
    '<rect x="88" y="214" width="14" height="30" rx="7" fill="#FFD100"/>' +
    '<rect x="118" y="214" width="14" height="30" rx="7" fill="#FFD100"/>' +
    // 圆肚身体
    '<ellipse cx="110" cy="188" rx="48" ry="44" fill="url(#ggBody)"/>' +
    // 白围裙 + 肩带 + 口袋
    '<path d="M94 168 l-9 -16" stroke="#F0E7DB" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M126 168 l9 -16" stroke="#F0E7DB" stroke-width="5" stroke-linecap="round"/>' +
    '<rect x="84" y="166" width="52" height="48" rx="12" fill="#FFFEFB" stroke="#F0E7DB" stroke-width="2"/>' +
    '<path d="M96 196 h28 v10 a14 10 0 0 1 -28 0 z" fill="#F7F0E6"/>' +
    // 脖子
    '<rect x="100" y="128" width="20" height="22" fill="#FFD100"/>' +
    // 圆脑袋
    '<circle cx="110" cy="96" r="40" fill="#FFD100"/>' +
    // 招牌大耳朵（立在帽两侧）
    '<ellipse cx="78" cy="34" rx="13" ry="32" fill="#F5B800" transform="rotate(-12 78 34)"/>' +
    '<ellipse cx="142" cy="34" rx="13" ry="32" fill="#F5B800" transform="rotate(12 142 34)"/>' +
    '<ellipse cx="78" cy="36" rx="6.5" ry="20" fill="#F7A8B8" transform="rotate(-12 78 36)"/>' +
    '<ellipse cx="142" cy="36" rx="6.5" ry="20" fill="#F7A8B8" transform="rotate(12 142 36)"/>' +
    // 厨师帽
    '<circle cx="92" cy="54" r="14" fill="url(#ggHat)" stroke="#E8DCCE" stroke-width="2"/>' +
    '<circle cx="110" cy="46" r="16" fill="url(#ggHat)" stroke="#E8DCCE" stroke-width="2"/>' +
    '<circle cx="128" cy="54" r="14" fill="url(#ggHat)" stroke="#E8DCCE" stroke-width="2"/>' +
    '<rect x="80" y="58" width="60" height="16" rx="8" fill="url(#ggHat)" stroke="#E8DCCE" stroke-width="2"/>' +
    // 帽徽小辣椒
    '<g transform="translate(140,62)">' +
    '<path d="M0 0 q9 1 8 11 q-8 3 -11 -5 z" fill="#D94F3D"/>' +
    '<path d="M0 0 q2 -4 5 -4" stroke="#5E8F4E" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
    '</g>' +
    // 脸：浅色嘴套 + 大眼睛 + 腮红
    '<ellipse cx="110" cy="106" rx="17" ry="12" fill="#FFEBB0"/>' +
    '<circle cx="94" cy="92" r="6" fill="#5B4A42"/>' +
    '<circle cx="126" cy="92" r="6" fill="#5B4A42"/>' +
    '<circle cx="96" cy="90" r="2" fill="#fff"/>' +
    '<circle cx="128" cy="90" r="2" fill="#fff"/>' +
    '<ellipse cx="82" cy="102" rx="8" ry="5" fill="#F4895F" opacity=".6"/>' +
    '<ellipse cx="138" cy="102" rx="8" ry="5" fill="#F4895F" opacity=".6"/>' +
    '<ellipse cx="110" cy="102" rx="4.5" ry="3.5" fill="#5B4A42"/>' +
    '<path d="M100 109 q10 9 20 0" stroke="#5B4A42" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
    arms +
    '</svg>';
  }

  /* 各姿势的手臂 */
  var ARMS_IDLE = '' +
    '<path d="M66 168 q-24 -6 -32 -28" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<circle cx="32" cy="136" r="9" fill="#FFD100"/>' +
    '<path d="M154 168 q26 -4 34 -22" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<g transform="translate(190,142) rotate(24)">' +
    '<rect x="-3" y="-34" width="7" height="36" rx="3.5" fill="#B5651D"/>' +
    '<ellipse cx="0" cy="-42" rx="11" ry="13" fill="#C98A5A"/>' +
    '<ellipse cx="0" cy="-42" rx="6" ry="8" fill="#DDA978"/>' +
    '</g>';
  var ARMS_PREP = '' +
    '<path d="M66 172 q-18 12 -16 30" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<circle cx="50" cy="204" r="9" fill="#FFD100"/>' +
    '<g class="dd-arm-chop">' +
    '<path d="M154 168 q24 8 26 30" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<g transform="translate(182,200) rotate(-15)">' +
    '<rect x="-14" y="0" width="28" height="9" rx="4" fill="#8A6A4A"/>' +
    '<path d="M-16 9 h32 v14 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6 z" fill="#C9CFD6"/>' +
    '</g></g>';
  var ARMS_COOK = '' +
    '<path d="M66 172 q-16 14 -8 30" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<circle cx="60" cy="204" r="9" fill="#FFD100"/>' +
    '<g class="dd-arm-stir">' +
    '<path d="M154 168 q26 -8 30 -30" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<g transform="translate(186,134) rotate(-18)">' +
    '<rect x="-3" y="-34" width="7" height="36" rx="3.5" fill="#B5651D"/>' +
    '<ellipse cx="0" cy="-42" rx="11" ry="13" fill="#C98A5A"/>' +
    '<ellipse cx="0" cy="-42" rx="6" ry="8" fill="#DDA978"/>' +
    '</g></g>';
  var ARMS_SERVE = '' +
    '<path d="M70 176 q-6 22 14 30" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<path d="M150 176 q6 22 -14 30" stroke="#F5B800" stroke-width="12" stroke-linecap="round" fill="none"/>' +
    '<g class="dd-arm-serve">' +
    '<ellipse cx="110" cy="208" rx="30" ry="10" fill="#FFFDF9" stroke="#E5D9CC" stroke-width="2"/>' +
    '<circle cx="110" cy="204" r="12" fill="#DF8A4E"/>' +
    '<circle cx="104" cy="202" r="3" fill="#B81F1F"/>' +
    '<circle cx="117" cy="206" r="3" fill="#B81F1F"/>' +
    '</g>';

  var GUOGUO_SVG = makeDudu(ARMS_IDLE);
  /* 阶段动作小人：备菜切菜 / 烹饪招牌袋鼠摇+翻炒 / 上桌端盘 */
  var DUDU_ACT = {
    prep: makeDudu(ARMS_PREP),
    cook: makeDudu(ARMS_COOK, 'dd-shake'),
    serve: makeDudu(ARMS_SERVE)
  };

  document.querySelectorAll('.dudu-slot').forEach(function (slot) {
    slot.innerHTML = GUOGUO_SVG;
  });

  var QUIPS = [
    '哎哟，戳我干啥，锅里的火还看着呢！',
    '别看我第一次下厨，爱意可是满分！',
    '锅气是什么？是我为 TA 鼓起勇气的声音！',
    '辣椒要爆香，日子要滚烫！',
    '别急别急，好菜都是等出来的。',
    '咸了淡了都是心意，TA 一定会懂的。',
    '戳我可以，但请温柔一点，谢谢您～',
    '您这一戳，差点把我锅铲戳掉了，请您高抬贵手～',
    '我承认我菜，但您也别一直戳我呀，谢谢您嘞～',
    '您这么闲，不如帮我看着火，我给您递个铲子～',
    '看火呢看火呢，您倒是比灶台还热情～',
    '我胆子肥嘟嘟，可经不起您这么戳～',
    '别催别催，好菜不催熟，谢谢配合～',
    '您对嘟嘟的喜爱，我收到了，也请您收一收手指～',
    '我这帽子可是新洗的，戳歪了您负责哦～',
    '您这一戳，我差点把盐当成糖，谢谢您手下留情～'
  ];

  /* ================= 九道湘菜数据 ================= */
  /* 阶段秒数：prep 备菜 / cook 烹饪 / serve 上桌 */
  /* raw/cooked 为写实美食图提示词（参照真实湘菜照片风格生成） */
  var IMG_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=square&prompt=';
  function foodImg(p) { return IMG_API + encodeURIComponent(p); }
  var STYLE_RAW = ', raw fresh ingredients neatly arranged on a light wooden cutting board, top-down view, warm soft kitchen light, photorealistic food photography, high detail, no text';
  var STYLE_DISH = ', served on clean white ceramic tableware, top-down view, warm soft light, photorealistic Chinese food photography, appetizing, glossy, high detail, no text';

  var DISHES = [
    {
      id: 'yutou', name: '剁椒鱼头', emoji: '🐟', spicy: 3,
      line: '鱼头要挑胖头鱼，剁椒要自家坛子里腌足的——这一口鲜辣，是湖南人的乡愁。',
      phases: [180, 780, 120],
      raw: 'one fresh raw fish head split open, small bowl of chopped red chili peppers beside it',
      cooked: 'Hunan steamed fish head covered with a thick layer of bright red chopped chili peppers, glossy chili oil, chopped scallions on top'
    },
    {
      id: 'lcr', name: '辣椒炒肉', emoji: '🥩', spicy: 2,
      line: '五花肉要煸出猪油香，螺丝椒要拍裂了再下锅——这道菜，是湖南人家灶台上的家常便饭，也是最勾人的那口。',
      phases: [180, 480, 60],
      raw: 'sliced raw pork belly with visible fat layers and fresh green screw peppers',
      cooked: 'Hunan stir-fried pork slices with blistered green peppers, glossy savory sauce, slight char on edges'
    },
    {
      id: 'hongsao', name: '毛氏红烧肉', emoji: '🍖', spicy: 1,
      line: '不放酱油，全靠糖色炒出红亮——小火慢煨三十分钟，肥而不腻，入口即化。这是主席家乡的味道，急不得。',
      phases: [480, 2040, 180],
      raw: 'cubed raw pork belly with skin, layered fat and lean meat, a few rock sugar pieces beside',
      cooked: 'glossy red-braised pork belly cubes stacked neatly, deep amber caramel glaze, Mao style hong shao rou'
    },
    {
      id: 'kwxia', name: '口味虾', emoji: '🦐', spicy: 3,
      line: '小龙虾要刷洗干净，紫苏和筒子骨汤是灵魂——夏天的长沙街头，人手一盆，剥得满手红油才叫过瘾！',
      phases: [240, 840, 120],
      raw: 'fresh cleaned raw gray crayfish with perilla leaves, garlic cloves and dried chilies beside',
      cooked: 'spicy Hunan crayfish with bright red shells in rich red chili oil broth, perilla leaves, served in a big bowl'
    },
    {
      id: 'beef', name: '小炒黄牛肉', emoji: '🐂', spicy: 2,
      line: '黄牛肉要逆着纹切薄片，大火快炒十八秒就出锅——嫩得咬得断，辣得直冒汗，下饭一绝！',
      phases: [120, 420, 60],
      raw: 'thinly sliced raw marbled beef with red chili rings, ginger slices and garlic',
      cooked: 'Hunan stir-fried sliced beef with red and green chilies and cilantro, glossy and tender'
    },
    {
      id: 'waipo', name: '外婆菜炒蛋', emoji: '🍳', spicy: 1,
      line: '外婆菜是坛子里腌出来的旧时光，配土鸡蛋一炒，咸香扑鼻——小孩子扒拉这道菜，能多吃两碗饭。',
      phases: [120, 300, 60],
      raw: 'two brown eggs and a small bowl of dark chopped preserved vegetables',
      cooked: 'golden fluffy scrambled eggs stir-fried with dark preserved vegetables, Hunan home style'
    },
    {
      id: 'lawei', name: '腊味合蒸', emoji: '🥓', spicy: 1,
      line: '腊肉、腊鱼、腊肠，都是冬天里柴火熏出来的——合蒸一钵，油润咸香，是湖南人过年待客的硬菜。',
      phases: [300, 1320, 180],
      raw: 'sliced cured pork belly, cured sausage links and a piece of cured fish',
      cooked: 'steamed Hunan cured meats platter, glossy translucent amber slices of lap mei arranged neatly, light steam'
    },
    {
      id: 'tangyou', name: '糖油粑粑', emoji: '🍡', spicy: 0,
      line: '糯米粉揉成小团，糖油里慢慢煎到金黄软糯——不辣，是湘菜里的温柔，细伢子最爱这一口甜。',
      phases: [180, 600, 120],
      raw: 'smooth white glutinous rice dough balls with brown sugar pieces beside',
      cooked: 'golden caramelized sugar oil glutinous rice cakes stacked on a plate, shiny syrup glaze, osmanthus flowers sprinkled'
    },
    {
      id: 'dongan', name: '东安子鸡', emoji: '🐔', spicy: 2,
      line: '嫩仔鸡配米醋和红辣椒，酸辣鲜嫩——这道菜从唐朝的东安县一路香到今天，是湘菜里的老前辈。',
      phases: [300, 1080, 120],
      raw: 'chopped raw young chicken pieces with red chilies, ginger slices and scallions',
      cooked: 'Hunan Dongan chicken, tender chicken pieces in glossy sour-spicy amber sauce with red chili strips and scallions'
    }
  ];

  /* 通用阶段台词（第一人称） */
  var PHASE_LINES = {
    prep: [
      '听我口令——食材先洗干净，砧板擦干！',
      '刀要快，手要稳，切成适口的大小。',
      '备菜备得好，下锅没烦恼。',
      '嚓嚓嚓——听这刀碰砧板的声音，多踏实。',
      '刀在这儿呢，您倒是帮我切两下呀，谢谢您～'
    ],
    cook: [
      '热锅凉油，听我数三声——下菜！',
      '闻到香味冒出来了没有？这就是锅气！',
      '火要旺，手要勤，你看这颜色越来越漂亮了。',
      '咕嘟咕嘟，食材在锅里唱歌呢。',
      '快尝尝咸淡……嗯，韵味！',
      '别光看着我呀，帮我递个盘子，谢谢您的配合～'
    ],
    serve: [
      '关火！出锅——摆盘要漂亮，吃饭要有仪式感。',
      '撒把葱花，点睛之笔！',
      '这道菜啊，要趁热端上桌才香。',
      '端走端走，别拍照了，凉了就不好吃了，谢谢您～'
    ]
  };
  var PHASE_DONE = {
    prep: '备菜完成！你看这大小，多匀称。下一步——开火！',
    cook: '到位！关火出锅，香得我自个都想先尝一口。',
    serve: '上桌咯——'
  };
  var PHASE_META = [
    { key: 'prep', name: '备菜', btn: '开始备菜 🔪' },
    { key: 'cook', name: '烹饪', btn: '开始烹饪 🔥' },
    { key: 'serve', name: '上桌', btn: '装盘上桌 🍽️' }
  ];

  /* ================= 状态 ================= */
  var BASE_TITLE = '嘟嘟的湘菜厨房 · 故事模式';
  var dish = null;
  var phaseIdx = 0;
  var phaseRemaining = 0;   // 秒（可为小数）
  var elapsedTotal = 0;
  var totalSeconds = 0;
  var running = false;
  var awaitingNext = false;
  var tickTimer = null;
  var speechTimer = null;
  var speechIdx = 0;
  var speedOn = false;
  var muted = false;
  try { muted = localStorage.getItem('lk-muted') === '1'; } catch (e) {}

  var sceneEls = [$('scene-prep'), $('scene-cook'), $('scene-serve')];
  var stepEls = [$('step-0'), $('step-1'), $('step-2')];
  var lineEls = [$('line-0'), $('line-1')];

  /* ================= 屏幕切换 ================= */
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.toggle('on', s.id === id);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= 嘟嘟戳一戳 ================= */
  document.querySelectorAll('.dudu-slot').forEach(function (slot) {
    slot.addEventListener('click', function () {
      slot.classList.remove('boop');
      void slot.offsetWidth;
      slot.classList.add('boop');
      if ($('screen-flow').classList.contains('on')) {
        say(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
      }
    });
  });

  function say(text) {
    var el = $('speech-text');
    el.style.opacity = 0;
    setTimeout(function () {
      el.textContent = text;
      el.style.opacity = 1;
    }, 220);
  }

  /* ================= 抽卡 ================= */
  var grid = $('card-grid');
  var pickedDish = null;

  function buildCards() {
    grid.innerHTML = '';
    pickedDish = null;
    $('card-info').classList.remove('show');
    var pool = shuffle(DISHES.slice());
    pool.forEach(function (d) {
      var card = document.createElement('button');
      card.className = 'card';
      card.innerHTML =
        '<div class="card-inner">' +
        '<div class="card-face card-back"><div class="seal">锅</div><div class="cb-txt">湘 味 食 谱</div></div>' +
        '<div class="card-face card-front">' +
        '<img class="cf-img" src="' + foodImg(d.cooked + STYLE_DISH) + '" alt="' + d.name + '">' +
        '<span class="cf-name">' + d.name + '</span>' +
        '<span class="cf-meta">约 ' + totalMin(d) + ' 分钟 · ' + spicyText(d) + '</span>' +
        '</div></div>';
      card.addEventListener('click', function () { pickCard(card, d); });
      grid.appendChild(card);
    });
  }

  function pickCard(card, d) {
    if (pickedDish) return;
    pickedDish = d;
    card.classList.add('flipped', 'picked');
    document.querySelectorAll('.card').forEach(function (c) {
      if (c !== card) c.classList.add('dim');
    });
    setTimeout(function () {
      $('ci-head').textContent = d.emoji + ' ' + d.name;
      $('ci-meta').textContent = '约 ' + totalMin(d) + ' 分钟 · ' + spicyText(d);
      $('ci-line').textContent = d.line;
      $('card-info').classList.add('show');
    }, 620);
  }

  function totalMin(d) { return Math.round((d.phases[0] + d.phases[1] + d.phases[2]) / 60); }
  function spicyText(d) {
    if (d.spicy === 0) return '清甜不辣';
    var s = '';
    for (var i = 0; i < d.spicy; i++) s += '🌶️';
    return '辣度 ' + s;
  }

  $('btn-go-draw').addEventListener('click', function () { buildCards(); show('screen-draw'); });
  $('btn-redraw').addEventListener('click', buildCards);

  /* ================= 流程 ================= */
  $('btn-cook').addEventListener('click', function () {
    if (!pickedDish) return;
    setupFlow(pickedDish);
    show('screen-flow');
  });

  function setupFlow(d) {
    dish = d;
    phaseIdx = 0;
    elapsedTotal = 0;
    totalSeconds = d.phases[0] + d.phases[1] + d.phases[2];
    running = false;
    awaitingNext = false;
    stopTick();

    $('db-name').textContent = d.emoji + ' ' + d.name;
    $('db-meta').textContent = '全程约 ' + totalMin(d) + ' 分钟 · ' + spicyText(d);

    // 注入三个场景的写实菜品图（生图 / 熟图）
    var imgRaw = foodImg(d.raw + STYLE_RAW);
    var imgCooked = foodImg(d.cooked + STYLE_DISH);
    $('prep-img').setAttribute('href', imgRaw);
    $('cook-img-raw').setAttribute('href', imgRaw);
    $('cook-img-cooked').setAttribute('href', imgCooked);
    $('cook-img-cooked').setAttribute('opacity', 0);
    $('serve-img').setAttribute('href', imgCooked);

    // 油泡
    var bubs = '';
    [[126, 80], [146, 92], [166, 78], [150, 66], [176, 94], [132, 96]].forEach(function (p, i) {
      bubs += '<circle class="bub" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (2.5 + (i % 3)) + '" fill="#F7C86B" style="animation-delay:' + (i * 0.22) + 's"/>';
    });
    $('wok-bubbles').innerHTML = bubs;

    // 葱花
    var gar = '';
    for (var i = 0; i < 10; i++) {
      var gx = 105 + Math.random() * 90;
      var gy = 112 + Math.random() * 34;
      gar += '<rect x="' + gx.toFixed(0) + '" y="' + gy.toFixed(0) + '" width="6" height="3" rx="1.5" fill="#6FA85C" transform="rotate(' + (Math.random() * 90).toFixed(0) + ' ' + gx.toFixed(0) + ' ' + gy.toFixed(0) + ')"/>';
    }
    $('garnish').innerHTML = gar;

    // 总进度条分段标记
    var p1 = d.phases[0] / totalSeconds * 100;
    var p2 = (d.phases[0] + d.phases[1]) / totalSeconds * 100;
    $('seg-1').style.left = p1 + '%';
    $('seg-2').style.left = p2 + '%';

    applyPhaseColors(0);
    updateStepper();
    setPhaseUI();
    say('好嘞！今天做「' + d.name + '」——' + d.line);
    document.title = BASE_TITLE;
  }

  function setPhaseUI() {
    var meta = PHASE_META[phaseIdx];
    phaseRemaining = dish.phases[phaseIdx];
    sceneEls.forEach(function (s, i) {
      s.classList.toggle('on', i === phaseIdx);
      s.classList.remove('running', 'done');
    });
    sceneEls[phaseIdx].classList.add('on');
    var actEl = $('dudu-action');
    if (actEl) actEl.innerHTML = DUDU_ACT[meta.key];
    $('phase-name').textContent = meta.name + '中';
    $('btn-flow-toggle').textContent = meta.btn;
    renderTime();
    renderOverall();
  }

  function updateStepper() {
    stepEls.forEach(function (el, i) {
      el.classList.toggle('done', i < phaseIdx);
      el.classList.toggle('active', i === phaseIdx);
    });
    lineEls.forEach(function (el, i) {
      el.classList.toggle('done', i < phaseIdx);
    });
  }

  function renderTime() {
    var t = Math.max(0, Math.ceil(phaseRemaining));
    $('phase-time').textContent = pad(Math.floor(t / 60)) + ':' + pad(t % 60);
  }

  function renderOverall() {
    var frac = totalSeconds > 0 ? Math.min(elapsedTotal / totalSeconds, 1) : 0;
    $('overall-fill').style.width = (frac * 100).toFixed(1) + '%';
  }

  /* 食材随烹饪进度真实变化：生图 → 熟图交叉渐变 */
  function applyPhaseColors(progress) {
    if (PHASE_META[phaseIdx].key === 'cook') {
      $('cook-img-cooked').setAttribute('opacity', progress.toFixed(3));
      var bubs = $('wok-bubbles');
      if (bubs) bubs.style.opacity = 0.1 + 0.9 * progress;
    }
  }

  /* ================= 计时 ================= */
  var TICK_MS = 500;
  var NORMAL_STEP = 0.5;
  var FAST_STEP = 15; // 试玩加速 ≈ 30x

  function startTick() {
    stopTick();
    tickTimer = setInterval(function () {
      var step = speedOn ? FAST_STEP : NORMAL_STEP;
      phaseRemaining -= step;
      elapsedTotal += step;
      var phaseSec = dish.phases[phaseIdx];
      var progress = Math.min(Math.max(1 - phaseRemaining / phaseSec, 0), 1);
      applyPhaseColors(progress);
      renderTime();
      renderOverall();
      syncTitle();
      if (phaseRemaining <= 0) onPhaseDone();
    }, TICK_MS);
  }
  function stopTick() {
    clearInterval(tickTimer);
    tickTimer = null;
  }

  function syncTitle() {
    var t = Math.max(0, Math.ceil(phaseRemaining));
    document.title = dish.name + ' · ' + PHASE_META[phaseIdx].name + ' ' +
      pad(Math.floor(t / 60)) + ':' + pad(t % 60) + ' · 嘟嘟的湘菜厨房';
  }

  function startSpeechRotation() {
    stopSpeechRotation();
    var key = PHASE_META[phaseIdx].key;
    speechTimer = setInterval(function () {
      speechIdx = (speechIdx + 1) % PHASE_LINES[key].length;
      say(PHASE_LINES[key][speechIdx]);
    }, 5000);
  }
  function stopSpeechRotation() {
    clearInterval(speechTimer);
    speechTimer = null;
    speechIdx = 0;
  }

  function onPhaseDone() {
    stopTick();
    stopSpeechRotation();
    running = false;
    elapsedTotal = Math.min(elapsedTotal, totalSeconds);
    renderOverall();
    var key = PHASE_META[phaseIdx].key;
    sceneEls[phaseIdx].classList.remove('running');
    sceneEls[phaseIdx].classList.add('done');

    if (phaseIdx < 2) {
      awaitingNext = true;
      say(PHASE_DONE[key]);
      $('phase-name').textContent = PHASE_META[phaseIdx].name + '完成 ✓';
      $('btn-flow-toggle').textContent = phaseIdx === 0 ? '进入烹饪 ▶' : '装盘上桌 ▶';
      phaseIdx++;
      updateStepper();
      softPop();
    } else {
      say(PHASE_DONE[key]);
      $('phase-name').textContent = '上桌完成 ✓';
      setTimeout(finale, 900);
    }
  }

  $('btn-flow-toggle').addEventListener('click', function () {
    if (!dish) return;
    if (awaitingNext) {
      awaitingNext = false;
      setPhaseUI();
      // 确认进入下一环节后自动开火
      running = true;
      sceneEls[phaseIdx].classList.add('running');
      $('btn-flow-toggle').textContent = '暂停一下';
      say(PHASE_LINES[PHASE_META[phaseIdx].key][0]);
      startSpeechRotation();
      startTick();
      return;
    }
    if (running) {
      running = false;
      stopTick();
      stopSpeechRotation();
      sceneEls[phaseIdx].classList.remove('running');
      $('btn-flow-toggle').textContent = '继续';
      say('先歇一下，灶台帮你看着火。');
      document.title = BASE_TITLE;
    } else {
      running = true;
      sceneEls[phaseIdx].classList.add('running');
      $('btn-flow-toggle').textContent = '暂停一下';
      if (elapsedTotal === 0 || phaseRemaining === dish.phases[phaseIdx]) {
        say(PHASE_LINES[PHASE_META[phaseIdx].key][0]);
      }
      startSpeechRotation();
      startTick();
    }
  });

  $('btn-repick').addEventListener('click', function () {
    stopTick();
    stopSpeechRotation();
    running = false;
    awaitingNext = false;
    dish = null;
    document.title = BASE_TITLE;
    buildCards();
    show('screen-draw');
  });

  /* ================= 试玩加速 ================= */
  $('chk-speed').addEventListener('change', function () {
    speedOn = this.checked;
    $('speed-label').classList.toggle('on', speedOn);
  });

  /* ================= 终幕：开饭 ================= */
  function finale() {
    document.title = BASE_TITLE;
    $('cel-text').innerHTML = '「' + dish.emoji + ' ' + dish.name + '」做好啦！<br>快喊家里人趁热吃——<br>幸福，就是灶台有火，桌上有菜，身边有你。';
    $('gg-celebrate').classList.add('show');
    playDing();
    rainHearts();
  }
  $('btn-again').addEventListener('click', function () {
    $('gg-celebrate').classList.remove('show');
    dish = null;
    buildCards();
    show('screen-draw');
  });
  $('btn-home').addEventListener('click', function () {
    location.href = 'love-kitchen-timer.html';
  });

  /* ================= 音效 / 庆祝 ================= */
  function playDing() {
    if (muted) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      [659.25, 880].forEach(function (freq, i) {
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
    } catch (e) {}
  }
  function softPop() {
    if (muted) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 520;
      var t0 = ctx.currentTime;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.35);
    } catch (e) {}
  }
  function rainHearts() {
    var hearts = ['❤️', '💗', '🧡', '💛', '💖', '🌶️'];
    for (var i = 0; i < 28; i++) {
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
        }, i * 120);
      })(i);
    }
  }

  /* ================= 静音 ================= */
  function updateMuteIcon() {
    $('btn-mute').textContent = muted ? '🔕' : '🔔';
    $('btn-mute').title = muted ? '提示音已关，点击开启' : '提示音已开，点击静音';
  }
  $('btn-mute').addEventListener('click', function () {
    muted = !muted;
    try { localStorage.setItem('lk-muted', muted ? '1' : '0'); } catch (e) {}
    updateMuteIcon();
  });
  updateMuteIcon();

  /* 打开即进入抽卡模式 */
  buildCards();
  show('screen-draw');
})();
