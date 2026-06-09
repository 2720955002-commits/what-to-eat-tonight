import type { Flavor, Season, Recipe } from './types'

// ============================================================
// 「今晚吃啥」— 73道内置菜谱种子数据
// ============================================================
// 图片：MVP 阶段使用 picsum.photos 占位图
//       后续替换为 Unsplash/Pexels 真实美食摄影图片
// ============================================================

/** 种子菜谱数据类型（不含自动生成的字段） */
export type SeedRecipeData = Omit<
  Recipe,
  'id' | 'createdAt' | 'updatedAt' | 'syncedAt'
>

/**
 * 生成菜品图片 URL（基于 picsum.photos 确定性占位图）
 * 后续可替换为 Unsplash/Pexels 真实美食图
 */
function img(slug: string): string {
  return `https://picsum.photos/seed/dinner-${slug}/400/300`
}

/**
 * ⭐ 难度映射：⭐ → 简单  ⭐⭐ → 中等  ⭐⭐⭐ → 困难
 */
const DIFF = { '⭐': '简单' as const, '⭐⭐': '中等' as const, '⭐⭐⭐': '困难' as const }

/**
 * 通用烹饪步骤模板（按分类）
 */
const STEPS: Record<string, string[]> = {
  /** 热菜/家常菜 — 快炒类 */
  stirFry: ['食材洗净，按要求切好备用', '热锅凉油，爆香葱姜蒜', '加入主食材翻炒至熟，调入适量调料，翻炒均匀后出锅'],
  /** 硬菜 — 炖煮红烧类 */
  braise: ['食材处理干净，焯水去血沫备用', '热锅炒糖色或爆香调料，放入食材煸炒上色', '加入适量水/料酒，小火慢炖至软烂入味，大火收汁'],
  /** 汤类 */
  soup: ['食材洗净切好备用', '锅中加水烧开，放入所有食材', '小火慢炖至食材熟透，加适量盐调味，出锅前撒上葱花'],
  /** 凉菜 */
  cold: ['主食材处理干净，该焯水的焯水，该切丝的切丝', '调制料汁：混合醋、酱油、蒜泥、辣椒油等调料', '将料汁淋入食材中，充分拌匀，静置入味后装盘'],
  /** 蒸菜 */
  steam: ['食材洗净，用料酒、姜片腌制去腥', '蒸锅加水烧开，将食材放入蒸盘，上锅大火蒸制', '蒸好后取出，淋上蒸鱼豉油或热油，撒上葱花即可'],
  /** 主食/面食 */
  staple: ['准备主食材和配料，按要求切配好', '按照经典做法烹饪（炒/煮/煎等）', '装盘，根据口味可加调料或配菜'],
  /** 配菜 */
  side: ['食材洗净切好', '热锅凉油，放入食材快速烹饪', '调入适量盐和调料，翻炒均匀后出锅'],
} satisfies Record<string, string[]>

/** 口味映射（recipes-plan.md 中的中文口味 → Flavor 类型） */
function flavors(s: string): Flavor[] {
  const map: Record<string, Flavor[]> = {
    '酸甜': ['酸甜'],
    '鲜香': ['鲜香'],
    '辣': ['辣'],
    '清淡': ['清淡'],
    '酸辣': ['酸辣'],
    '酱香': ['酱香'],
    '麻辣': ['麻辣'],
    '蒜香': ['蒜香'],
    '葱香': ['葱香'],
    '清甜': ['清甜'],
    '孜然香': ['孜然香'],
    '鲜甜': ['鲜香', '清甜'],
    '清爽': ['清淡'],
    '酱香甜': ['酱香', '清甜'],
    '酸甜辣': ['酸甜', '辣'],
  }
  return map[s] ?? ['鲜香']
}

/** 季节映射 */
function seasons(s: string): Season[] {
  const map: Record<string, Season[]> = {
    '四季': ['春', '夏', '秋', '冬'],
    '春夏': ['春', '夏'],
    '夏秋': ['夏', '秋'],
    '秋冬': ['秋', '冬'],
    '冬春': ['冬', '春'],
    '春秋': ['春', '秋'],
  }
  return map[s] ?? ['春', '夏', '秋', '冬']
}

// ============================================================
// 一、热菜类 — 家常菜（28道）
// ============================================================

const 热菜_家常: SeedRecipeData[] = [
  { name: '番茄炒蛋', image: img('fanqie-chao-dan'), ingredients: ['番茄', '鸡蛋', '葱'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('酸甜'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '青椒肉丝', image: img('qingjiao-rousi'), ingredients: ['青椒', '瘦肉', '蒜'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '麻婆豆腐', image: img('mapo-doufu'), ingredients: ['豆腐', '肉末', '豆瓣酱'], cookTime: 20, difficulty: '中等', servings: 2, flavors: flavors('辣'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '可乐鸡翅', image: img('kele-jichi'), ingredients: ['鸡翅', '可乐', '姜'], cookTime: 30, difficulty: '简单', servings: 2, flavors: flavors('鲜甜'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '蒜蓉小白菜', image: img('suanrong-xiaobaicai'), ingredients: ['小白菜', '蒜', '蚝油'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '酸辣土豆丝', image: img('suanla-tudousi'), ingredients: ['土豆', '辣椒', '醋'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('酸辣'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '鱼香肉丝', image: img('yuxiang-rousi'), ingredients: ['瘦肉', '木耳', '胡萝卜', '笋'], cookTime: 25, difficulty: '中等', servings: 2, flavors: flavors('酸甜辣'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '宫保鸡丁', image: img('gongbao-jiding'), ingredients: ['鸡胸肉', '花生', '干辣椒'], cookTime: 25, difficulty: '中等', servings: 2, flavors: flavors('辣'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '干煸四季豆', image: img('ganbian-sijidou'), ingredients: ['四季豆', '干辣椒', '蒜'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('夏秋'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '回锅肉', image: img('huiguorou'), ingredients: ['五花肉', '青蒜', '豆瓣酱'], cookTime: 30, difficulty: '中等', servings: 2, flavors: flavors('酱香'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '红烧茄子', image: img('hongshao-qiezi'), ingredients: ['茄子', '蒜', '酱油'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('酱香'), season: seasons('夏秋'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '西葫芦炒蛋', image: img('xihulu-chaodan'), ingredients: ['西葫芦', '鸡蛋'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('春夏'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '蚝油生菜', image: img('haoyou-shengcai'), ingredients: ['生菜', '蚝油', '蒜'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '洋葱炒肉', image: img('yangcong-chaorou'), ingredients: ['洋葱', '瘦肉', '青椒'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '黄瓜炒蛋', image: img('huanggua-chaodan'), ingredients: ['黄瓜', '鸡蛋'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('春夏'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '豆角焖面', image: img('doujiao-menmian'), ingredients: ['豆角', '面条', '五花肉'], cookTime: 25, difficulty: '中等', servings: 2, flavors: flavors('酱香'), season: seasons('夏秋'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '红烧豆腐', image: img('hongshao-doufu'), ingredients: ['豆腐', '葱', '酱油'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '醋溜白菜', image: img('culiu-baicai'), ingredients: ['白菜', '醋', '干辣椒'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('酸辣'), season: seasons('秋冬'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '干锅花菜', image: img('ganguo-huacai'), ingredients: ['花菜', '五花肉', '干辣椒'], cookTime: 25, difficulty: '中等', servings: 2, flavors: flavors('辣'), season: seasons('秋冬'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '蒜苔炒肉', image: img('suantai-chaorou'), ingredients: ['蒜苔', '瘦肉'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('春夏'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '腐竹烧肉', image: img('fuzhu-shaorou'), ingredients: ['腐竹', '五花肉'], cookTime: 30, difficulty: '中等', servings: 2, flavors: flavors('酱香'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '木须肉', image: img('muxurou'), ingredients: ['瘦肉', '木耳', '黄瓜', '鸡蛋'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '地三鲜', image: img('disanxian'), ingredients: ['茄子', '土豆', '青椒'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('酱香'), season: seasons('夏秋'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '荷兰豆炒腊肉', image: img('helandou-chaolarou'), ingredients: ['荷兰豆', '腊肉'], cookTime: 15, difficulty: '中等', servings: 2, flavors: flavors('鲜香'), season: seasons('冬春'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '尖椒炒蛋', image: img('jianjiao-chaodan'), ingredients: ['尖椒', '鸡蛋'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('辣'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '韭菜炒鸡蛋', image: img('jiucai-chaojidan'), ingredients: ['韭菜', '鸡蛋'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('春夏'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '香菇油菜', image: img('xianggu-youcai'), ingredients: ['香菇', '油菜'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('四季'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '肉末茄子', image: img('roumo-qiezi'), ingredients: ['茄子', '肉末'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('酱香'), season: seasons('夏秋'), category: '家常菜', isBuiltIn: true, steps: STEPS.stirFry },
]

// ============================================================
// 一、热菜类 — 硬菜（10道）
// ============================================================

const 热菜_硬菜: SeedRecipeData[] = [
  { name: '红烧肉', image: img('hongshaorou'), ingredients: ['五花肉', '冰糖', '八角'], cookTime: 60, difficulty: '中等', servings: 3, flavors: flavors('酱香甜'), season: seasons('四季'), category: '硬菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '糖醋排骨', image: img('tangcu-paigu'), ingredients: ['排骨', '糖', '醋'], cookTime: 45, difficulty: '中等', servings: 3, flavors: flavors('酸甜'), season: seasons('四季'), category: '硬菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '啤酒鸭', image: img('pijiuya'), ingredients: ['鸭肉', '啤酒', '姜蒜'], cookTime: 50, difficulty: '中等', servings: 3, flavors: flavors('酱香'), season: seasons('秋冬'), category: '硬菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '水煮肉片', image: img('shuizhu-roupian'), ingredients: ['瘦肉', '豆芽', '干辣椒'], cookTime: 40, difficulty: '困难', servings: 3, flavors: flavors('麻辣'), season: seasons('秋冬'), category: '硬菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '红烧牛腩', image: img('hongshao-niunan'), ingredients: ['牛腩', '番茄', '土豆'], cookTime: 90, difficulty: '困难', servings: 3, flavors: flavors('鲜香'), season: seasons('秋冬'), category: '硬菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '黄焖鸡', image: img('huangmenji'), ingredients: ['鸡腿', '香菇', '青椒'], cookTime: 40, difficulty: '中等', servings: 3, flavors: flavors('酱香'), season: seasons('四季'), category: '硬菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '酸菜鱼', image: img('suancaiyu'), ingredients: ['草鱼', '酸菜', '干辣椒'], cookTime: 45, difficulty: '困难', servings: 3, flavors: flavors('酸辣'), season: seasons('秋冬'), category: '硬菜', isBuiltIn: true, steps: STEPS.soup },
  { name: '红烧猪蹄', image: img('hongshao-zhuti'), ingredients: ['猪蹄', '冰糖', '八角'], cookTime: 90, difficulty: '困难', servings: 3, flavors: flavors('酱香'), season: seasons('秋冬'), category: '硬菜', isBuiltIn: true, steps: STEPS.braise },
  { name: '油焖大虾', image: img('youmen-daxia'), ingredients: ['虾', '姜', '葱'], cookTime: 20, difficulty: '中等', servings: 3, flavors: flavors('鲜香'), season: seasons('夏秋'), category: '硬菜', isBuiltIn: true, steps: STEPS.stirFry },
  { name: '孜然羊肉', image: img('ziran-yangrou'), ingredients: ['羊肉', '孜然', '洋葱'], cookTime: 25, difficulty: '中等', servings: 2, flavors: flavors('孜然香'), season: seasons('秋冬'), category: '硬菜', isBuiltIn: true, steps: STEPS.stirFry },
]

// ============================================================
// 二、汤类（10道）
// ============================================================

const 汤类: SeedRecipeData[] = [
  { name: '番茄蛋花汤', image: img('fanqie-danhuatang'), ingredients: ['番茄', '鸡蛋', '葱'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('酸甜'), season: seasons('四季'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '紫菜蛋花汤', image: img('zicai-danhuatang'), ingredients: ['紫菜', '鸡蛋', '虾皮'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('四季'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '玉米排骨汤', image: img('yumi-paigu-tang'), ingredients: ['玉米', '排骨', '胡萝卜'], cookTime: 60, difficulty: '简单', servings: 3, flavors: flavors('清甜'), season: seasons('四季'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '冬瓜肉丸汤', image: img('donggua-rouwan-tang'), ingredients: ['冬瓜', '肉末', '姜'], cookTime: 30, difficulty: '中等', servings: 2, flavors: flavors('清淡'), season: seasons('夏秋'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '菌菇豆腐汤', image: img('jungu-doufu-tang'), ingredients: ['菌菇', '豆腐', '葱'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('四季'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '酸辣汤', image: img('suanlatang'), ingredients: ['豆腐', '木耳', '鸡蛋', '醋'], cookTime: 20, difficulty: '中等', servings: 2, flavors: flavors('酸辣'), season: seasons('秋冬'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '萝卜炖牛腩汤', image: img('luobo-dunniunan-tang'), ingredients: ['白萝卜', '牛腩', '姜'], cookTime: 90, difficulty: '困难', servings: 3, flavors: flavors('鲜香'), season: seasons('秋冬'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '西红柿鸡蛋疙瘩汤', image: img('xihongshi-geda-tang'), ingredients: ['番茄', '鸡蛋', '面粉'], cookTime: 20, difficulty: '简单', servings: 2, flavors: flavors('酸甜'), season: seasons('四季'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '丝瓜蛋汤', image: img('sigua-dantang'), ingredients: ['丝瓜', '鸡蛋'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('夏秋'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
  { name: '海带排骨汤', image: img('haidai-paigu-tang'), ingredients: ['海带', '排骨', '姜'], cookTime: 60, difficulty: '中等', servings: 3, flavors: flavors('鲜香'), season: seasons('秋冬'), category: '汤', isBuiltIn: true, steps: STEPS.soup },
]

// ============================================================
// 三、凉菜 & 快手小菜（8道）
// ============================================================

const 凉菜: SeedRecipeData[] = [
  { name: '凉拌黄瓜', image: img('liangban-huanggua'), ingredients: ['黄瓜', '蒜', '醋'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('清爽'), season: seasons('春夏'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
  { name: '凉拌木耳', image: img('liangban-muer'), ingredients: ['木耳', '蒜', '辣椒油'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('酸辣'), season: seasons('四季'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
  { name: '皮蛋豆腐', image: img('pidan-doufu'), ingredients: ['皮蛋', '嫩豆腐', '葱花'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('鲜香'), season: seasons('夏秋'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
  { name: '口水鸡', image: img('koushuiji'), ingredients: ['鸡腿', '辣椒油', '花生'], cookTime: 30, difficulty: '中等', servings: 2, flavors: flavors('麻辣'), season: seasons('四季'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
  { name: '凉拌三丝', image: img('liangban-sansi'), ingredients: ['粉丝', '黄瓜', '胡萝卜'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('清爽'), season: seasons('春夏'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
  { name: '拍黄瓜变蛋', image: img('paihuanggua-biandan'), ingredients: ['黄瓜', '变蛋', '蒜泥'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('清爽'), season: seasons('春夏'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
  { name: '糖拌番茄', image: img('tangban-fanqie'), ingredients: ['番茄', '白糖'], cookTime: 5, difficulty: '简单', servings: 2, flavors: flavors('清甜'), season: seasons('夏秋'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
  { name: '蒜泥白肉', image: img('suanni-bairou'), ingredients: ['五花肉', '蒜泥', '辣椒油'], cookTime: 25, difficulty: '中等', servings: 2, flavors: flavors('蒜香'), season: seasons('四季'), category: '凉菜', isBuiltIn: true, steps: STEPS.cold },
]

// ============================================================
// 四、蒸菜（5道）
// ============================================================

const 蒸菜: SeedRecipeData[] = [
  { name: '清蒸鲈鱼', image: img('qingzheng-luyu'), ingredients: ['鲈鱼', '葱姜', '蒸鱼豉油'], cookTime: 25, difficulty: '中等', servings: 2, flavors: flavors('清淡'), season: seasons('四季'), category: '蒸菜', isBuiltIn: true, steps: STEPS.steam },
  { name: '粉蒸肉', image: img('fenzhengrou'), ingredients: ['五花肉', '米粉', '红薯'], cookTime: 60, difficulty: '困难', servings: 3, flavors: flavors('酱香'), season: seasons('秋冬'), category: '蒸菜', isBuiltIn: true, steps: STEPS.steam },
  { name: '蒜蓉粉丝蒸虾', image: img('suanrong-fensi-zhengxia'), ingredients: ['虾', '粉丝', '蒜蓉'], cookTime: 20, difficulty: '中等', servings: 2, flavors: flavors('蒜香'), season: seasons('四季'), category: '蒸菜', isBuiltIn: true, steps: STEPS.steam },
  { name: '剁椒鱼头', image: img('duojiao-yutou'), ingredients: ['鱼头', '剁椒', '姜'], cookTime: 30, difficulty: '困难', servings: 3, flavors: flavors('辣'), season: seasons('秋冬'), category: '蒸菜', isBuiltIn: true, steps: STEPS.steam },
  { name: '蒜蓉蒸茄子', image: img('suanrong-zhengqiezi'), ingredients: ['茄子', '蒜蓉', '生抽'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('蒜香'), season: seasons('夏秋'), category: '蒸菜', isBuiltIn: true, steps: STEPS.steam },
]

// ============================================================
// 五、主食 & 面食（7道）
// ============================================================

const 主食: SeedRecipeData[] = [
  { name: '蛋炒饭', image: img('danchaofan'), ingredients: ['米饭', '鸡蛋', '葱花'], cookTime: 10, difficulty: '简单', servings: 1, flavors: flavors('鲜香'), season: seasons('四季'), category: '主食', isBuiltIn: true, steps: STEPS.staple },
  { name: '西红柿鸡蛋面', image: img('xihongshi-jidan-mian'), ingredients: ['面条', '番茄', '鸡蛋'], cookTime: 20, difficulty: '简单', servings: 1, flavors: flavors('酸甜'), season: seasons('四季'), category: '主食', isBuiltIn: true, steps: STEPS.staple },
  { name: '葱油拌面', image: img('congyou-banmian'), ingredients: ['面条', '葱', '酱油'], cookTime: 15, difficulty: '简单', servings: 1, flavors: flavors('葱香'), season: seasons('四季'), category: '主食', isBuiltIn: true, steps: STEPS.staple },
  { name: '扬州炒饭', image: img('yangzhou-chaofan'), ingredients: ['米饭', '虾仁', '火腿', '鸡蛋'], cookTime: 15, difficulty: '中等', servings: 1, flavors: flavors('鲜香'), season: seasons('四季'), category: '主食', isBuiltIn: true, steps: STEPS.staple },
  { name: '酸汤水饺', image: img('suantang-shuijiao'), ingredients: ['饺子', '醋', '辣椒油'], cookTime: 15, difficulty: '简单', servings: 1, flavors: flavors('酸辣'), season: seasons('秋冬'), category: '主食', isBuiltIn: true, steps: STEPS.staple },
  { name: '鸡蛋煎饼', image: img('jidan-jianbing'), ingredients: ['面粉', '鸡蛋', '葱花'], cookTime: 15, difficulty: '简单', servings: 1, flavors: flavors('鲜香'), season: seasons('四季'), category: '主食', isBuiltIn: true, steps: STEPS.staple },
  { name: '炒河粉', image: img('chao-hefen'), ingredients: ['河粉', '豆芽', '鸡蛋'], cookTime: 15, difficulty: '简单', servings: 1, flavors: flavors('鲜香'), season: seasons('四季'), category: '主食', isBuiltIn: true, steps: STEPS.staple },
]

// ============================================================
// 六、简易配菜（5道）
// ============================================================

const 配菜: SeedRecipeData[] = [
  { name: '煎荷包蛋', image: img('jian-hebaodan'), ingredients: ['鸡蛋'], cookTime: 5, difficulty: '简单', servings: 1, flavors: flavors('鲜香'), season: seasons('四季'), category: '配菜', isBuiltIn: true, steps: STEPS.side },
  { name: '蒜蓉西兰花', image: img('suanrong-xilanhua'), ingredients: ['西兰花', '蒜'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('清淡'), season: seasons('秋冬'), category: '配菜', isBuiltIn: true, steps: STEPS.side },
  { name: '虎皮青椒', image: img('hupi-qingjiao'), ingredients: ['青椒', '酱油', '醋'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('酱香'), season: seasons('夏秋'), category: '配菜', isBuiltIn: true, steps: STEPS.side },
  { name: '炝炒圆白菜', image: img('qiangchao-yuanbaicai'), ingredients: ['圆白菜', '干辣椒'], cookTime: 10, difficulty: '简单', servings: 2, flavors: flavors('酸辣'), season: seasons('四季'), category: '配菜', isBuiltIn: true, steps: STEPS.side },
  { name: '葱爆豆腐', image: img('congbao-doufu'), ingredients: ['老豆腐', '大葱', '酱油'], cookTime: 15, difficulty: '简单', servings: 2, flavors: flavors('葱香'), season: seasons('四季'), category: '配菜', isBuiltIn: true, steps: STEPS.side },
]

// ============================================================
// 全部种子菜谱数据
// ============================================================

export const SEED_RECIPES: SeedRecipeData[] = [
  ...热菜_家常,
  ...热菜_硬菜,
  ...汤类,
  ...凉菜,
  ...蒸菜,
  ...主食,
  ...配菜,
]

/** 验证数据完整性 */
export function validateSeeds(): {
  total: number
  categories: Record<string, number>
  errors: string[]
} {
  const errors: string[] = []
  const categories: Record<string, number> = {}

  for (const r of SEED_RECIPES) {
    // 统计分类
    categories[r.category] = (categories[r.category] ?? 0) + 1

    // 基础字段验证
    if (!r.name) errors.push('存在空 name 的菜谱')
    if (!r.image) errors.push(`${r.name} 缺少图片`)
    if (!r.ingredients || r.ingredients.length === 0)
      errors.push(`${r.name} 缺少食材`)
    if (!r.steps || r.steps.length === 0) errors.push(`${r.name} 缺少步骤`)
    if (r.cookTime <= 0) errors.push(`${r.name} 烹饪时间无效`)
    if (!r.difficulty) errors.push(`${r.name} 缺少难度`)
    if (!r.flavors || r.flavors.length === 0) errors.push(`${r.name} 缺少口味`)
    if (!r.season || r.season.length === 0) errors.push(`${r.name} 缺少季节`)
    if (!r.category) errors.push(`${r.name} 缺少分类`)
  }

  return { total: SEED_RECIPES.length, categories, errors }
}
