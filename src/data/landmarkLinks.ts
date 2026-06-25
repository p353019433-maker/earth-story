/**
 * 地标关联图 —— 定义哪些地标之间有故事/历史/文化关联
 * 点击"关联模式"按钮后，会在地球上用弧线连接这些地标
 * 
 * 每条记录: { from, to, label }
 * label: 描述关联原因
 */

export interface LandmarkLink {
  from: string
  to: string
  label: string
}

export const landmarkLinks: LandmarkLink[] = [
  // === 古埃及 ===
  { from: 'lm01', to: 'lm56', label: '法老诅咒：金字塔与图坦卡蒙墓共享诅咒传说' },
  { from: 'lm01', to: 'lm59', label: '圣物之谜：金字塔与都灵裹尸布同属未解之谜' },

  // === 希腊/罗马 ===
  { from: 'lm04', to: 'lm13', label: '罗马帝国：斗兽场与帕特农神庙同属古典世界' },
  { from: 'lm04', to: 'lm12', label: '罗马帝国：庞贝与斗兽场同属罗马文明遗迹' },
  { from: 'lm12', to: 'lm13', label: '古典世界：庞贝与帕特农同属古希腊罗马文明' },
  { from: 'lm26', to: 'lm13', label: '希腊文明：特洛伊与帕特农同属希腊世界' },
  { from: 'lm26', to: 'lm30', label: '爱琴海文明：特洛伊与以弗所同属安纳托利亚' },

  // === 美洲文明 ===
  { from: 'lm03', to: 'lm24', label: '安第斯文明：马丘比丘与蒂亚瓦纳科同源' },
  { from: 'lm03', to: 'lm17', label: '南美谜团：马丘比丘与纳斯卡线条同属秘鲁' },
  { from: 'lm11', to: 'lm21', label: '中美文明：特奥蒂瓦坎与奇琴伊察同属中美洲' },
  { from: 'lm09', to: 'lm11', label: '美洲谜团：复活节岛与特奥蒂瓦康同为未解之谜' },

  // === 亚洲 ===
  { from: 'lm05', to: 'lm18', label: '东南亚佛教：吴哥窟与婆罗浮屠同属佛教建筑' },
  { from: 'lm05', to: 'lm25', label: '东南亚佛塔：吴哥窟与蒲甘佛塔群' },
  { from: 'lm18', to: 'lm25', label: '佛教建筑：婆罗浮屠与蒲甘佛塔群' },
  { from: 'lm02', to: 'lm23', label: '中国文明：长城与良渚同属中华文明' },
  { from: 'lm29', to: 'lm25', label: '佛教遗产：巴米扬大佛与蒲甘佛塔群' },

  // === 中东/北非 ===
  { from: 'lm07', to: 'lm22', label: '中东古文明：佩特拉与波斯波利斯' },
  { from: 'lm01', to: 'lm07', label: '古代世界：金字塔与佩特拉同为古代奇迹' },

  // === 非洲 ===
  { from: 'lm15', to: 'lm19', label: '非洲文明：廷巴克图与大津巴布韦' },
  { from: 'lm46', to: 'lm19', label: '非洲神秘：海地伏都教与大津巴布韦' },

  // === 深海传说 ===
  { from: 'lm31', to: 'lm35', label: '魔鬼三角：百慕大三角与龙三角并称两大死亡海域' },
  { from: 'lm31', to: 'lm38', label: '加勒比海：百慕大三角与加勒比蓝洞同域' },
  { from: 'lm33', to: 'lm32', label: '深海之谜：亚特兰蒂斯与马里亚纳海沟' },
  { from: 'lm33', to: 'lm20', label: '沉没大陆：亚特兰蒂斯与南马都尔' },
  { from: 'lm34', to: 'lm37', label: '欧洲海怪：挪威海沟与赫伦海沟同有海兽传说' },
  { from: 'lm36', to: 'lm49', label: '幽灵船：好望角异响与玛丽·赛勒斯特号' },
  { from: 'lm39', to: 'lm58', label: '克苏鲁体系：南极宁根与洛夫克拉夫特' },
  { from: 'lm40', to: 'lm47', label: '欧洲地下：波罗的海异象与爱丁堡地下城' },

  // === 恐怖/惊悚 ===
  { from: 'lm41', to: 'lm60', label: '维多利亚恐怖：德古拉与开膛手杰克同属维多利亚时代' },
  { from: 'lm41', to: 'lm47', label: '欧洲鬼魂：德古拉堡与爱丁堡地下城' },
  { from: 'lm42', to: 'lm62', label: '死亡之地：青木原树海与寂静岭同为死亡象征' },
  { from: 'lm44', to: 'lm62', label: '废墟恐惧：切尔诺贝利与寂静岭同为废弃之地' },
  { from: 'lm45', to: 'lm55', label: '死亡艺术：娃娃岛与人骨教堂同以死亡物品为祭' },
  { from: 'lm46', to: 'lm61', label: '巫术体系：海地伏都教与湘西蛊术同属巫术信仰' },
  { from: 'lm48', to: 'lm50', label: '凶宅电影：闪灵与阿米蒂维尔同属凶宅恐怖' },
  { from: 'lm48', to: 'lm43', label: '鬼屋传说：斯坦利酒店与温彻斯特神秘屋' },
  { from: 'lm51', to: 'lm55', label: '人骨圣地：巴黎地下墓穴与人骨教堂' },
  { from: 'lm51', to: 'lm47', label: '地下黑暗：巴黎地下墓穴与爱丁堡地下城' },
  { from: 'lm52', to: 'lm46', label: '巫术恐惧：塞勒姆女巫与海地伏都教' },
  { from: 'lm52', to: 'lm56', label: '诅咒传说：塞勒姆女巫与法老诅咒' },
  { from: 'lm53', to: 'lm05', label: '那伽崇拜：蛇神殿与吴哥窟同有那伽雕刻' },
  { from: 'lm54', to: 'lm44', label: '苏联谜案：迪亚特洛夫与切尔诺贝利同属苏联未解事件' },
  { from: 'lm56', to: 'lm01', label: '法老诅咒：图坦卡蒙与金字塔共享诅咒传说' },
  { from: 'lm57', to: 'lm60', label: '犯罪恐怖：八仙饭店与开膛手杰克同为食人传说' },
  { from: 'lm58', to: 'lm39', label: '克苏鲁体系：洛夫克拉夫特与南极宁根' },
  { from: 'lm58', to: 'lm37', label: '深海恐惧：克苏鲁与利维坦/克拉肯' },
  { from: 'lm58', to: 'lm33', label: '沉没文明：克苏鲁与亚特兰蒂斯' },
  { from: 'lm59', to: 'lm56', label: '宗教圣物：都灵裹尸布与法老诅咒同属超自然遗物' },
  { from: 'lm61', to: 'lm46', label: '巫术体系：湘西蛊术与海地伏都教' },
  { from: 'lm61', to: 'lm41', label: '不死传说：湘西赶尸与德古拉吸血鬼' },

  // === 伊斯兰文明 ===
  { from: 'lm27', to: 'lm10', label: '宗教建筑：阿尔罕布拉宫与圣索菲亚' },
  { from: 'lm27', to: 'lm07', label: '中东遗产：阿尔罕布拉宫与佩特拉' },

  // === 远古谜团 ===
  { from: 'lm06', to: 'lm16', label: '远古石阵：巨石阵与哥贝克力石阵' },
  { from: 'lm16', to: 'lm14', label: '远古文明：哥贝克力与摩亨佐-达罗同为最早文明' },

  // === 大洋洲/太平洋 ===
  { from: 'lm28', to: 'lm09', label: '太平洋谜团：乌鲁鲁与复活节岛' },
  { from: 'lm20', to: 'lm09', label: '太平洋遗迹：南马都尔与复活节岛' },

  // === 新增 lm63-lm90 关联 ===
  { from: 'lm63', to: 'lm17', label: '南美谜团：纳斯卡线条与马丘比丘同属秘鲁未解之谜' },
  { from: 'lm64', to: 'lm44', label: '末日预言：通古斯大爆炸与切尔诺贝利同属灾难遗址' },
  { from: 'lm65', to: 'lm09', label: '太平洋石像：复活节岛摩艾与南马都尔巨石建筑' },
  { from: 'lm65', to: 'lm20', label: '太平洋谜团：复活节岛与南马都尔同为太平洋未解之谜' },
  { from: 'lm66', to: 'lm67', label: '远古石阵：巨石阵与哥贝克力同为史前巨型建筑' },
  { from: 'lm66', to: 'lm81', label: '众神遗迹：巨石阵与奥林匹亚同属古代祭祀中心' },
  { from: 'lm67', to: 'lm14', label: '远古文明：哥贝克力与摩亨佐-达罗同为最早城市' },
  { from: 'lm68', to: 'lm07', label: '中东古城：佩特拉与波斯波利斯同为沙漠帝国遗迹' },
  { from: 'lm68', to: 'lm79', label: '伊斯兰文明：佩特拉与阿尔罕布拉同为伊斯兰建筑遗产' },
  { from: 'lm69', to: 'lm05', label: '东南亚佛教：吴哥窟与婆罗浮屠同为佛教巨构' },
  { from: 'lm69', to: 'lm77', label: '曼荼罗：吴哥窟与婆罗浮屠同为佛教宇宙建筑' },
  { from: 'lm70', to: 'lm44', label: '核灾难：广岛原爆与切尔诺贝利同为核灾难遗址' },
  { from: 'lm70', to: 'lm62', label: '废墟之美：广岛圆顶屋与寂静岭同为废弃地标' },
  { from: 'lm71', to: 'lm01', label: '古埃及：吉萨金字塔与胡夫金字塔共享法老之谜' },
  { from: 'lm71', to: 'lm56', label: '法老诅咒：吉萨金字塔与图坦卡蒙墓共享诅咒传说' },
  { from: 'lm72', to: 'lm41', label: '吸血鬼传说：德古拉堡与布朗城堡同为吸血鬼起源' },
  { from: 'lm72', to: 'lm60', label: '维多利亚恐怖：德古拉与开膛手杰克同属维多利亚时代' },
  { from: 'lm73', to: 'lm03', label: '印加文明：马丘比丘与蒂亚瓦纳科同为安第斯帝国' },
  { from: 'lm73', to: 'lm76', label: '安第斯之谜：马丘比丘与太阳门同为印加起源' },
  { from: 'lm74', to: 'lm02', label: '中国文明：长城与良渚同属中华文明遗迹' },
  { from: 'lm74', to: 'lm78', label: '帝国永生：长城与秦始皇陵同为秦朝遗产' },
  { from: 'lm75', to: 'lm11', label: '中美文明：奇琴伊察与特奥蒂瓦坎同为中美洲文明' },
  { from: 'lm75', to: 'lm21', label: '玛雅文明：奇琴伊察与帕伦克同为玛雅城邦' },
  { from: 'lm76', to: 'lm24', label: '安第斯文明：蒂亚瓦纳科与马丘比丘同源' },
  { from: 'lm76', to: 'lm73', label: '印加起源：太阳门与天窗祭坛同为印加宗教' },
  { from: 'lm77', to: 'lm18', label: '东南亚佛教：婆罗浮屠与吴哥窟同属佛教建筑' },
  { from: 'lm77', to: 'lm05', label: '佛教宇宙：婆罗浮屠与吴哥窟同为曼荼罗建筑' },
  { from: 'lm78', to: 'lm74', label: '秦朝遗产：秦始皇陵与长城同为秦帝国工程' },
  { from: 'lm78', to: 'lm71', label: '法老永生：秦始皇陵与金字塔同为帝王陵墓' },
  { from: 'lm79', to: 'lm27', label: '伊斯兰文明：阿尔罕布拉与佩特拉同为伊斯兰建筑' },
  { from: 'lm79', to: 'lm86', label: '帝国穹顶：阿尔罕布拉与圣索菲亚同为伊斯兰穹顶建筑' },
  { from: 'lm80', to: 'lm05', label: '东南亚佛塔：蒲甘与吴哥窟同为佛教建筑群' },
  { from: 'lm80', to: 'lm25', label: '万塔佛国：蒲甘佛塔群与吴哥窟佛塔群' },
  { from: 'lm81', to: 'lm13', label: '希腊文明：奥林匹亚与帕特农同属古希腊圣地' },
  { from: 'lm81', to: 'lm66', label: '远古祭祀：奥林匹亚与巨石阵同为古代祭祀中心' },
  { from: 'lm82', to: 'lm15', label: '非洲文明：大津巴布韦与廷巴克图同为非洲古城' },
  { from: 'lm82', to: 'lm19', label: '非洲石城：大津巴布韦与大津巴布韦同为南部非洲遗迹' },
  { from: 'lm83', to: 'lm84', label: '古代巨像：罗得岛巨像与特洛伊同为古代奇迹' },
  { from: 'lm83', to: 'lm04', label: '罗马帝国：罗得岛与罗马斗兽场同属罗马世界' },
  { from: 'lm84', to: 'lm26', label: '爱琴海文明：特洛伊与帕特农同属希腊世界' },
  { from: 'lm84', to: 'lm81', label: '史诗战场：特洛伊与奥林匹亚同为古希腊圣地' },
  { from: 'lm85', to: 'lm12', label: '罗马废墟：庞贝与斗兽场同属罗马文明遗迹' },
  { from: 'lm85', to: 'lm04', label: '帝国荣光：庞贝与罗马斗兽场同为罗马帝国象征' },
  { from: 'lm86', to: 'lm10', label: '宗教建筑：圣索菲亚与阿尔罕布拉同为伊斯兰建筑' },
  { from: 'lm86', to: 'lm79', label: '帝国穹顶：圣索菲亚与阿尔罕布拉同为帝国穹顶' },
  { from: 'lm87', to: 'lm30', label: '爱琴海文明：以弗所与特洛伊同属安纳托利亚' },
  { from: 'lm87', to: 'lm84', label: '古代奇迹：阿尔忒弥斯神庙与罗得岛巨像同为七大奇迹' },
  { from: 'lm88', to: 'lm09', label: '太平洋遗迹：南马都尔与复活节岛同为太平洋谜团' },
  { from: 'lm88', to: 'lm20', label: '巨石建筑：南马都尔与摩艾石像同为巨石遗迹' },
  { from: 'lm89', to: 'lm17', label: '南美谜团：纳斯卡线条与马丘比丘同属秘鲁' },
  { from: 'lm89', to: 'lm63', label: '外星遗迹：纳斯卡线条与巨人之书同为未解之谜' },
  { from: 'lm90', to: 'lm15', label: '非洲文明：廷巴克图与大津巴布韦同为非洲古城' },
  { from: 'lm90', to: 'lm82', label: '沙漠知识：廷巴克图与大津巴布韦同为非洲学术中心' },
  { from: 'lm91', to: 'lm99', label: '禁区：南极暗湖与切尔诺贝利同为人类禁区中的生命奇迹' },
  { from: 'lm91', to: 'lm50', label: '冰渊传说：南极暗湖与冰渊传说同属极地未知世界' },
  { from: 'lm92', to: 'lm06', label: '宗教圣殿：哭墙与圣索菲亚同为圣地' },
  { from: 'lm92', to: 'lm102', label: '古代密室：哭墙地下圣殿与金字塔密室同为未开启的古代空间' },
  { from: 'lm93', to: 'lm102', label: '远古建筑：巨石阵与金字塔同为最神秘的古代建筑' },
  { from: 'lm93', to: 'lm97', label: '声波之谜：巨石阵声学与亚特兰蒂斯声波切割技术' },
  { from: 'lm94', to: 'lm102', label: '帝王陵墓：秦始皇陵与金字塔同为最伟大的帝王陵墓' },
  { from: 'lm94', to: 'lm05', label: '帝国荣光：秦始皇陵与长城同属秦帝国遗产' },
  { from: 'lm95', to: 'lm06', label: '宗教建筑：佩特拉与圣索菲亚同为中东古代奇迹' },
  { from: 'lm95', to: 'lm97', label: '失落文明：佩特拉与亚特兰蒂斯同为消失的古代城市' },
  { from: 'lm96', to: 'lm105', label: '时空异常：百慕大三角与罗阿诺克同纬度时空裂缝' },
  { from: 'lm96', to: 'lm97', label: '海底秘密：百慕大海底金字塔与亚特兰蒂斯沉没大陆' },
  { from: 'lm97', to: 'lm93', label: '声波技术：亚特兰蒂斯声波切割与巨石阵声学幻境' },
  { from: 'lm98', to: 'lm95', label: '失落文明：复活节岛与佩特拉同为孤立中的奇迹' },
  { from: 'lm98', to: 'lm104', label: '石像之谜：复活节岛摩艾与马丘比丘拴日石同为未解之谜' },
  { from: 'lm99', to: 'lm91', label: '禁区生命：切尔诺贝利辐射真菌与南极暗湖微生物' },
  { from: 'lm99', to: 'lm101', label: '鬼域：切尔诺贝利与温彻斯特屋同为闹鬼之地' },
  { from: 'lm100', to: 'lm95', label: '宗教建筑：吴哥窟与佩特拉同为石凿奇迹' },
  { from: 'lm100', to: 'lm92', label: '圣殿：吴哥窟与哭墙同为宗教圣地' },
  { from: 'lm101', to: 'lm103', label: '超自然：温彻斯特屋时间褶皱与迪亚特洛夫事件' },
  { from: 'lm102', to: 'lm94', label: '帝王陵墓：金字塔与秦始皇陵同为最伟大陵墓' },
  { from: 'lm102', to: 'lm93', label: '远古建筑：金字塔与巨石阵同为史前建筑奇迹' },
  { from: 'lm103', to: 'lm101', label: '超自然事件：迪亚特洛夫与温彻斯特屋同为无法解释的异常' },
  { from: 'lm103', to: 'lm91', label: '极地异常：迪亚特洛夫与南极暗湖同为极端环境中的未知' },
  { from: 'lm104', to: 'lm98', label: '石像之谜：马丘比丘与复活节岛同为巨石文明' },
  { from: 'lm104', to: 'lm01', label: '安第斯文明：马丘比丘与马丘比丘同属印加帝国' },
  { from: 'lm105', to: 'lm96', label: '时空异常：罗阿诺克与百慕大同纬度失踪事件' },
  { from: 'lm105', to: 'lm99', label: '消失：罗阿诺克殖民者与切尔诺贝利清理人同为集体失踪' },
  { from: 'lm106', to: 'lm96', label: '对跖点：魔鬼海与百慕大三角隔地球相对——全球两大吞噬之涡' },
  { from: 'lm106', to: 'lm108', label: '深渊信号：魔鬼海USO与波多黎各海沟深渊之声' },
  { from: 'lm107', to: 'lm96', label: '三角异常：密歇根湖三角与百慕大三角同为失踪三角区' },
  { from: 'lm107', to: 'lm93', label: '巨石阵：湖底巨石阵与英国巨石阵惊人相似' },
  { from: 'lm108', to: 'lm96', label: '百慕大边缘：波多黎各海沟为百慕大三角南缘——深渊与失踪' },
  { from: 'lm108', to: 'lm106', label: '深渊信号：波多黎各海沟Bloop与魔鬼海USO同为海洋未知' },
  { from: 'lm109', to: 'lm113', label: '共振异常：陶斯嗡鸣地下共振与苏联时间折射场' },
  { from: 'lm109', to: 'lm112', label: '超自然热点：陶斯嗡鸣与皮肤行者牧场同为美国西部异常区' },
  { from: 'lm110', to: 'lm103', label: '灾难预言：天蛾人银桥预言与迪亚特洛夫事件同为预兆性灾难' },
  { from: 'lm110', to: 'lm112', label: '超自然实体：天蛾人与皮肤行者牧场非人类实体' },
  { from: 'lm111', to: 'lm89', label: '纳斯卡：纳斯卡线条外星跑道与纳斯卡线条同为秘鲁谜团' },
  { from: 'lm111', to: 'lm97', label: '外星信号：纳斯卡地下铜管天线与亚特兰蒂斯声波技术' },
  { from: 'lm112', to: 'lm109', label: '美国异常带：皮肤行者牧场与陶斯嗡鸣同属西部超自然走廊' },
  { from: 'lm112', to: 'lm110', label: '超自然实体：牧场非人类实体与天蛾人同为无法解释的存在' },
  { from: 'lm113', to: 'lm103', label: '苏联异常：瓦伊诺河时间实验与迪亚特洛夫事件同为苏联未解之谜' },
  { from: 'lm113', to: 'lm109', label: '时间异常：科济列夫镜与陶斯嗡鸣同属时空共振现象' },
  { from: 'lm114', to: 'lm103', label: '西伯利亚异常：通古斯爆炸与迪亚特洛夫事件同为西伯利亚未解之谜' },
  { from: 'lm114', to: 'lm113', label: '苏联秘密：通古斯特斯拉理论与苏联时间实验' },
  { from: 'lm115', to: 'lm103', label: '雪山谜案：喜马拉雅雪人与迪亚特洛夫事件同为高山未解之谜' },
  { from: 'lm115', to: 'lm91', label: '极端生命：雪人冰封密室与南极暗湖微生物同为极端环境生命' },
]

/** 获取与某个地标关联的所有链接 */
export function getLinksForLandmark(landmarkId: string): LandmarkLink[] {
  return landmarkLinks.filter(l => l.from === landmarkId || l.to === landmarkId)
}

/** 获取与某个地标关联的所有地标ID */
export function getConnectedLandmarkIds(landmarkId: string): string[] {
  const links = getLinksForLandmark(landmarkId)
  const ids = new Set<string>()
  links.forEach(l => {
    if (l.from === landmarkId) ids.add(l.to)
    else ids.add(l.from)
  })
  return Array.from(ids)
}
