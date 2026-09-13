import { AgentId, CouncilSpeech, ProposalPlan, AgentVote, CouncilResolution } from "./types";
import { AGENT_PROFILES } from "./agents-data";

export interface CouncilMeetingScript {
  caseNumber: string;
  topicTitle: string;
  category: string;
  urgency: "特急" | "紧急" | "常规";
  keyConflict: string;
  summonedAgentIds: AgentId[];
  speeches: CouncilSpeech[];
  plans: ProposalPlan[];
  votes: AgentVote[];
  resolution: CouncilResolution;
  appealScript?: {
    newAgentId: AgentId;
    emergencySpeeches: CouncilSpeech[];
    amendedResolution: CouncilResolution;
  };
}

// 实时生成成分：根据当前动态时间与微变异随机种子生成新鲜生动的台词变体
function getRealtimeTimePrompt(): string {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  if (h >= 0 && h < 5) return `现在已经是凌晨 ${h}:${m}，脑细胞都快罢工了`;
  if (h >= 5 && h < 9) return `现在是清晨 ${h}:${m}，马上就要面对早八现实`;
  if (h >= 9 && h < 18) return `现在是白天 ${h}:${m}，大学时光正在无情流逝`;
  return `现在是深夜 ${h}:${m}，正是容易emo和纠结的高危时段`;
}

function createCaseNumber(now: Date = new Date()): string {
  return `〔${now.getFullYear()}〕第 ${Math.floor(1000 + Math.random() * 9000)} 号`;
}

function formatResolutionDate(now: Date = new Date()): string {
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 裁决生效`;
}

// 4 大经典剧本（融入实时时间戳与纯粹二次元台词，无累赘内心戏）
export const PRESET_SCRIPTS: Record<string, CouncilMeetingScript> = {
  topic_valo: {
    caseNumber: "〔2026〕第 0927 号",
    topicTitle: "关于是否在深夜继续参加宿舍五排Valorant特急案",
    category: "学业与娱乐",
    urgency: "特急",
    keyConflict: "次日高数考勤绩点生命线 VS 寝室五排开黑羁绊认同",
    summonedAgentIds: ["gpa", "sleep", "happiness", "social", "future"],
    speeches: [
      {
        id: "s1",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "opening",
        content: "强烈反对！明早08:00高数任课老师上周已经放出随机点名警告。挂科不仅是400块重修费，更是大二整个暑假被锁死在闷热重修教室的极度折磨！",
        timestamp: "01:24:02",
      },
      {
        id: "s2",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "opening",
        content: "这还用开会讨论吗？你今天总共才睡了4小时20分！你的心率监测正在抗议，继续排位明早直接物理脑死亡在第一排课桌上，我才不要替你收尸！",
        timestamp: "01:24:05",
      },
      {
        id: "s3",
        agentId: "happiness",
        agentName: "快乐委员·蜜柑",
        phase: "opening",
        content: "我举双手赞成打！大家摸摸良心：大学四年一眨眼就没了，高数以后还能补考，但这赛季神话晋级赛，这四只神仙打手你毕业前还能凑齐第二次吗？！",
        timestamp: "01:24:09",
      },
      {
        id: "s4",
        agentId: "social",
        agentName: "社交委员",
        phase: "opening",
        content: "附议蜜柑！这可是本学期宿舍第一次五排！现在临阵脱逃就是背叛寝室革命友谊，明天你在宿舍连喝水都没人给你顺手带一杯！",
        timestamp: "01:24:13",
      },
      {
        id: "s5",
        agentId: "future",
        agentName: "未来的你",
        phase: "opening",
        content: "我是三年后正在写毕业论文的你。我可以明确告诉你：你根本不会记得今晚这局白金还是神话，但你会清楚记得高数补考那天烈日下的悔恨。",
        timestamp: "01:24:18",
      },
      {
        id: "s6",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "interjection",
        targetAgentId: "happiness",
        interrupted: true,
        content: "【异议あり！严正反对】请蜜柑收起你的‘青春只有一次’诈骗修辞！昨晚你拉当事人通宵打三角洲也是这句原话！",
        timestamp: "01:24:22",
      },
      {
        id: "s7",
        agentId: "chairman",
        agentName: "委员会主任",
        phase: "chairman",
        content: "各位肃静！驳回人身攻击。睡眠委员申请打断成立。快乐委员把所有议题都归因于青春属于违规辩风，记黄牌一次。进入交叉对辩！",
        timestamp: "01:24:26",
      },
      {
        id: "s8",
        agentId: "social",
        agentName: "社交委员",
        phase: "rebuttal",
        targetAgentId: "gpa",
        content: "椎名学委总拿挂科吓人！根据绝密情报，隔壁班学委答应明早点名帮我们暗中代签到，风险完全在可控范围内！",
        timestamp: "01:24:30",
      },
      {
        id: "s9",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "rebuttal",
        targetAgentId: "social",
        interrupted: true,
        content: "【异议あり！严正反对】荒谬绝伦！高数老师教龄三十年，老花镜一推看一眼空座位就一清二楚！代签被抓直接平时分归零，社交委能替他肉身扛雷吗？！",
        timestamp: "01:24:34",
      },
      {
        id: "s10",
        agentId: "happiness",
        agentName: "快乐委员·蜜柑",
        phase: "rebuttal",
        content: "那只打一把决胜局行不行？只要全神贯注，20分钟速通对面！打赢了带着胜利的喜悦入睡，多巴胺分泌充沛，睡眠质量反而飙升！",
        timestamp: "01:24:38",
      },
      {
        id: "s11",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "rebuttal",
        targetAgentId: "happiness",
        content: "闭嘴吧！你哪次能真的只打一把？赢了说‘手感火热趁热打铁再来一把’，输了说‘不能带着耻辱入睡必须赢一把再睡’，永远在死循环里打到天亮！",
        timestamp: "01:24:43",
      },
      {
        id: "s12",
        agentId: "future",
        agentName: "未来的你",
        phase: "rebuttal",
        content: "睡眠委员说到了痛点。你们争论的核心，根本不是这一局游戏有多神圣，而是当事人在下意识逃避明早高数课听不懂的无力感与挫败感。",
        timestamp: "01:24:49",
      },
      {
        id: "s13",
        agentId: "social",
        agentName: "社交委员",
        phase: "rebuttal",
        content: "折中建议！准许打这最后一把，但必须选奶妈或烟位工具人保命，严禁拿一突抢人头红温！不论输赢02:10强制拔电源关机就寝！",
        timestamp: "01:24:54",
      },
      {
        id: "s14",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "rebuttal",
        content: "如果02:10真能关机睡觉，我勉强可以暂缓行使一票否决权，但明早早八社交委必须肉身负责把当事人从床上拖去教室！",
        timestamp: "01:24:58",
      },
      {
        id: "s15",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "rebuttal",
        content: "且明早必须买两瓶雀巢双倍浓缩咖啡，坐在前三排，笔记漏记一行扣发本周末全部游戏时间配额！",
        timestamp: "01:25:02",
      },
      {
        id: "s16",
        agentId: "chairman",
        agentName: "委员会主任",
        phase: "chairman",
        content: "【庄严敲响法槌】全案争辩焦点已充分显露！GPA委之绩点风控、睡眠委之生理底线、快乐委之团队情谊皆已充分陈述。本庭认定事实清楚，辩论正式终结！全体起立，法槌已举起，进入法定全员表决程序！",
        timestamp: "01:25:08",
      },
    ],
    plans: [
      {
        id: "A",
        title: "立即拔线退队，保全早八",
        desc: "立刻退出Discord语音，喝温水就寝，换取明早8点清醒听课。",
        supporterAgents: ["gpa", "sleep", "future"],
        compromiseNotes: "社交成本由当事人周五请喝冰红茶代偿。",
      },
      {
        id: "B",
        title: "限时打一把生死局，由社交委监督",
        desc: "仅打一把，不论输赢02:15前必须强制关机；明早07:20由舍友人工唤醒。",
        supporterAgents: ["happiness", "social"],
        compromiseNotes: "折中方案：满足五排执念，但给睡眠设下硬止损线。",
      },
      {
        id: "C",
        title: "彻底摆烂通宵，明天集体翘课",
        desc: "打到天亮直接吃早饭，高数课集体全缺勤补觉。",
        supporterAgents: [],
        compromiseNotes: "极端违规方案，已被主席团先行驳回。",
      },
    ],
    votes: [
      { agentId: "gpa", agentName: "GPA委员·椎名学委", planId: "A", reason: "【严厉推眼镜】平时分模型底线不容践踏，400元重修费与盛夏酷暑补考地狱绝不冒险！" },
      { agentId: "sleep", agentName: "睡眠委员·悠悠", planId: "A", reason: "【抓狂摔枕头】心率红线报警！现在立刻拔电源关机，额叶要闭合了！" },
      { agentId: "happiness", agentName: "快乐委员·蜜柑", planId: "B", reason: "【踩椅子握拳】神仙五排车队千载难逢，最后一把决胜局冲鸭！" },
      { agentId: "social", agentName: "社交委员", planId: "B", reason: "【双手合十】既给寝室兄弟面子又守住底线，高情商方案满分！" },
      { agentId: "future", agentName: "未来的你", planId: "A", reason: "【苦笑合上日记】三年后的你发誓：你绝不会记得神话晋级赛，但高数补考会痛三年。" },
    ],
    resolution: {
      caseNumber: "〔2026〕第 0927 号",
      title: "关于驳回五排动议、勒令立即就寝之终审裁决书",
      urgency: "特急",
      winningPlan: {
        id: "A",
        title: "立即拔线退队，保全早八",
        desc: "立刻退出语音，向舍友诚恳道歉并承诺周五请喝饮料，01:40前必须熄灯就寝。",
        supporterAgents: ["gpa", "sleep", "future"],
        compromiseNotes: "社交委员会获得周五五排饮料赔偿方案作为调解附款。",
      },
      voteScore: { planA: 3, planB: 2, planC: 0 },
      votes: [],
      stipulations: [
        "第一条：当事人须于收到本决议3分钟内关闭电脑主机，严禁以‘我看你们打完这把’为由继续围观；",
        "第二条：社交委员会提出之补偿条款正式生效——本周五晚间排位赛由当事人出资购买4瓶饮料；",
        "第三条：明早07:30闹钟必须设置为防空警报铃声，睡眠委员会负有连带起床监督责任。",
      ],
      supervisingAgent: "sleep",
      stampDate: "2026年9月12日 裁定生效",
      appealCount: 0,
    },
    appealScript: {
      newAgentId: "love",
      emergencySpeeches: [
        {
          id: "ap1",
          agentId: "love",
          agentName: "恋爱委员",
          phase: "opening",
          content: "【紧急空降】案情性质已发生根本逆转！当事人暗恋的女生刚刚进了车队五排坑位！这不是普通打游戏，这是高维度战略破冰！",
          timestamp: "01:25:01",
        },
        {
          id: "ap2",
          agentId: "dignity",
          agentName: "尊严委员",
          phase: "rebuttal",
          content: "慢着！你在她面前玩决斗者万一战绩 0-12，直接在心仪对象面前钉死为‘下水道小丑’，尊严荡然无存！",
          timestamp: "01:25:05",
        },
        {
          id: "ap3",
          agentId: "gpa",
          agentName: "GPA委员·椎名学委",
          phase: "rebuttal",
          content: "……虽然很荒谬，但如果这是恋爱委员会列入年度KPI的事项，本委勉强允许在保持及格线的前提下重议。",
          timestamp: "01:25:09",
        },
      ],
      amendedResolution: {
        caseNumber: "〔2026〕二审重字第 0927-B 号",
        title: "关于当事人以恋爱重大情势变更为由改判准予参赛之复核裁决",
        urgency: "特急",
        winningPlan: {
          id: "B",
          title: "准许上车参战，但仅限一把保命辅助位",
          desc: "因关键恋爱线索加入，批准出战，但严禁玩C位打铁丢人，且必须在游戏内立下清爽靠谱人设。",
          supporterAgents: ["love", "social", "happiness"],
          compromiseNotes: "尊严委员要求锁烟位或奶妈，打完无论输赢必须潇洒告辞睡觉。",
        },
        voteScore: { planA: 1, planB: 4, planC: 0 },
        votes: [],
        stipulations: [
          "第一条：特准入队打满1局，选英雄严禁自信秒锁单挑角色，必须老老实实当工具人掩护心仪对象；",
          "第二条：对局中严禁发牢骚红温，展现出超脱的稳定情绪，02:10准时借口‘明早有重要学术会议’优雅下线；",
          "第三条：明早高数课由恋爱委员会全程打鸡血，迟到一次扣发恋爱预算50元。",
        ],
        supervisingAgent: "love",
        stampDate: "2026年9月12日 二审改判",
        appealCount: 1,
        newEvidence: "心仪女生突然加入五排车队",
      },
    },
  },

  topic_crush: {
    caseNumber: "〔2026〕第 0520 号",
    topicTitle: "关于暗恋对象深夜发送‘睡了吗’之应对方案特别决议",
    category: "情感社交",
    urgency: "特急",
    keyConflict: "秒回当舔狗被拿捏 VS 晾五分钟显格局 VS 装睡明早回保全尊严",
    summonedAgentIds: ["love", "dignity", "social", "sleep", "future"],
    speeches: [
      {
        id: "c1",
        agentId: "love",
        agentName: "恋爱委员",
        phase: "opening",
        content: "秒回！必须秒回！夜深人静防线失守，对方第一个找你，懂不懂含金量？这绝对是天赐良机！",
        timestamp: "01:48:10",
      },
      {
        id: "c2",
        agentId: "dignity",
        agentName: "尊严委员",
        phase: "opening",
        content: "慢着！刚发三个字你就秒回，直接把‘我每天半夜死等你的微信’写在脑门上！秒回等于自愿盖章终身备胎！",
        timestamp: "01:48:15",
      },
      {
        id: "c3",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "opening",
        content: "你们两个吵什么？没准人家只是群发或者找你借黑胶VIP！装没看见，现在睡觉，明天上午回一句‘昨晚睡太早了’最体面！",
        timestamp: "01:48:21",
      },
      {
        id: "c4",
        agentId: "future",
        agentName: "未来的你",
        phase: "opening",
        content: "三年后的我看了都摇头。大学时代最无聊的内耗就是揣摩‘三个字背后的深意’。真诚一点，想聊就聊，别演苦情偶像剧。",
        timestamp: "01:48:27",
      },
      {
        id: "c5",
        agentId: "dignity",
        agentName: "尊严委员",
        phase: "interjection",
        targetAgentId: "love",
        interrupted: true,
        content: "【异议あり！严正反对】恋爱委员已经把手机屏幕按出火星了，输入框‘没呢怎么啦宝宝’都打好了！请主审官立刻收缴当事人手机5分钟！",
        timestamp: "01:48:31",
      },
      {
        id: "c6",
        agentId: "chairman",
        agentName: "委员会主任",
        phase: "chairman",
        content: "驳回收缴申请。但勒令当事人和恋爱委员深呼吸三次，禁止发送‘没呢，怎么啦宝宝’等高危倒贴词汇！进入交叉质询！",
        timestamp: "01:48:36",
      },
      {
        id: "c7",
        agentId: "social",
        agentName: "社交委员",
        phase: "rebuttal",
        content: "社交心理学发言！凌晨一点半发微信，对方也是带着孤独和试探的。秒回显饥渴，不回显冷漠，掐表4分30秒回复最显松弛与高级神秘感！",
        timestamp: "01:48:42",
      },
      {
        id: "c8",
        agentId: "love",
        agentName: "恋爱委员",
        phase: "rebuttal",
        targetAgentId: "social",
        interrupted: true,
        content: "【异议あり！严正反对】4分30秒？！黄花菜都凉了！对方深夜找你可能就那一瞬间的冲动，等4分钟没回人家可能直接扣上手机睡觉了，你赔得起这天赐良缘吗？！",
        timestamp: "01:48:46",
      },
      {
        id: "c9",
        agentId: "dignity",
        agentName: "尊严委员",
        phase: "rebuttal",
        targetAgentId: "love",
        content: "荒谬！如果一段关系脆弱到晚回4分钟就彻底断联，那本来就是廉价速食品，有什么好患得患失的？！",
        timestamp: "01:48:51",
      },
      {
        id: "c10",
        agentId: "wallet",
        agentName: "钱包委员",
        phase: "rebuttal",
        content: "生活费资产委补充提醒：一旦半夜聊嗨了，周末必然要约出去喝人均45的网红咖啡加看电影，请先确认微信余额是否支撑本月突发恋爱开销！",
        timestamp: "01:48:56",
      },
      {
        id: "c11",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "rebuttal",
        content: "而且大半夜聊天疯狂分泌多巴胺，今晚至少熬到凌晨三点，明天早八高数课直接脑死亡，到底是谁在折磨谁？！",
        timestamp: "01:49:01",
      },
      {
        id: "c12",
        agentId: "love",
        agentName: "恋爱委员",
        phase: "rebuttal",
        content: "钱可以再赚，觉可以补！但这心跳加速的感觉，错过这个村就真没这个店了！",
        timestamp: "01:49:06",
      },
      {
        id: "c13",
        agentId: "future",
        agentName: "未来的你",
        phase: "rebuttal",
        content: "别走极端。4分钟松弛回复法确实是最佳中庸解。既表明了你没睡，又维护了自己‘有正常生活节奏’的成年人体面。",
        timestamp: "01:49:12",
      },
      {
        id: "c14",
        agentId: "social",
        agentName: "社交委员",
        phase: "rebuttal",
        content: "附议未来委！回复模板统一拟定为：‘刚忙完准备睡，怎么啦？’——进可聊心事，退可说困了，完美进退自如！",
        timestamp: "01:49:17",
      },
      {
        id: "c15",
        agentId: "dignity",
        agentName: "尊严委员",
        phase: "rebuttal",
        content: "只要坚决删掉表情包里的那颗爱心，禁止发送任何乞怜叹号，这个折中案我可以投赞成票！",
        timestamp: "01:49:22",
      },
      {
        id: "c16",
        agentId: "chairman",
        agentName: "委员会主任",
        phase: "chairman",
        content: "【庄严敲响法槌】本案争辩充分，双方底线均已明确！既要抓住情感机遇，亦须守住人格尊严与生理底线。辩论正式终结！全体起立，法槌已举起，进入法定全员表决程序！",
        timestamp: "01:49:28",
      },
    ],
    plans: [
      {
        id: "A",
        title: "松弛延迟回复法（间隔 4~5 分钟）",
        desc: "等待4分钟后回复‘刚洗完澡准备睡，怎么啦？’，进可长聊，退可睡觉。",
        supporterAgents: ["social", "dignity", "future"],
        compromiseNotes: "兼顾恋爱机会与个人体面，绝不显得饥渴。",
      },
      {
        id: "B",
        title: "假装沉睡，明早 08:30 阳光回复",
        desc: "今晚绝不回信，明早阳光开朗回复‘昨晚早睡了，找我有啥好事呀’。",
        supporterAgents: ["sleep"],
        compromiseNotes: "睡眠委最爱，彻底避开深夜情绪内耗泥潭。",
      },
      {
        id: "C",
        title: "疯狂秒回 + 反问打探",
        desc: "立刻回‘没睡！是不是想我了？’直接搏命单车变摩托。",
        supporterAgents: ["love"],
        compromiseNotes: "高风险激进方案，尊严委员已启动紧急弹劾程序。",
      },
    ],
    votes: [
      { agentId: "love", agentName: "恋爱委员", planId: "A", reason: "【双手捧脸满心欢喜】虽然我想秒回，但4分钟拉扯确实能聊上，纯爱战神妥协了！" },
      { agentId: "dignity", agentName: "尊严委员", planId: "A", reason: "【冷酷核准】4分钟延迟能保住最后尊严底裤，绝不当廉价舔狗！" },
      { agentId: "sleep", agentName: "睡眠委员·悠悠", planId: "B", reason: "【生无可恋】谁大半夜聊天谁脑瘫，坚守B方案直接睡大觉！" },
      { agentId: "social", agentName: "社交委员", planId: "A", reason: "【轻推果茶】A是经典高情商松弛话术，进退自如挑不出毛病！" },
      { agentId: "future", agentName: "未来的你", planId: "A", reason: "【深邃注视】别端着但也别当小丑，A方案是三年后看最体面的解法。" },
    ],
    resolution: {
      caseNumber: "〔2026〕第 0520 号",
      title: "关于核准采用‘4分钟松弛战术’回复深夜微信之裁决令",
      urgency: "特急",
      winningPlan: {
        id: "A",
        title: "松弛延迟回复法（间隔 4~5 分钟）",
        desc: "看表等待4分钟整，回复：‘刚忙完/准备睡，怎么啦？’，随后视对方态度决定是否深聊。",
        supporterAgents: ["social", "dignity", "love", "future"],
        compromiseNotes: "若对方5分钟内未回复，睡眠委立即强制当事人锁屏入睡。",
      },
      voteScore: { planA: 4, planB: 1, planC: 0 },
      votes: [],
      stipulations: [
        "第一条：严禁在4分钟内发送任何消息，打字输入框严禁停留超过15秒以免对方看到‘对方正在输入’；",
        "第二条：回复内容严禁包含任何乞怜表情包或多余叹号，保持成年人基本松弛度；",
        "第三条：若聊到深夜仍无实质性约会/话题突破，睡眠委员有权启动强制断网程序。",
      ],
      supervisingAgent: "dignity",
      stampDate: "2026年9月12日 特别裁定",
      appealCount: 0,
    },
  },

  topic_exam_trip: {
    caseNumber: "〔2026〕第 1024 号",
    topicTitle: "关于期末考试倒计时3天是否赴死党迪士尼特种兵一日游之审理",
    category: "考试作息",
    urgency: "紧急",
    keyConflict: "绩点生死存亡线 VS 高中铁哥们千里投奔友情贬值危机",
    summonedAgentIds: ["gpa", "wallet", "social", "happiness", "future"],
    speeches: [
      {
        id: "e1",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "opening",
        content: "疯了吗？！还有三天考微积分和大物！平时作业全靠抄，现在去迪士尼排队6小时狂走3万步，考场上直接安详闭眼吗？！",
        timestamp: "14:10:02",
      },
      {
        id: "e2",
        agentId: "wallet",
        agentName: "钱包委员",
        phase: "opening",
        content: "门票475元，乐园里买个火腿要118元，再加上往返打车，一天直接烧掉半个月生活费！月末准备在寝室啃纸箱吗？！",
        timestamp: "14:10:06",
      },
      {
        id: "e3",
        agentId: "social",
        agentName: "社交委员",
        phase: "opening",
        content: "但是对方是高中三年穿一条裤子的发小！人家大老远坐卧铺来找你，你一句‘我要复习’把人晾在酒店，这朋友以后还做不做？",
        timestamp: "14:10:11",
      },
      {
        id: "e4",
        agentId: "happiness",
        agentName: "快乐委员·蜜柑",
        phase: "opening",
        content: "复习三天你真以为能从50分逆袭90？与其在图书馆对着PPT打瞌睡内耗，不如在创极速光轮上痛快尖叫！",
        timestamp: "14:10:16",
      },
      {
        id: "e5",
        agentId: "future",
        agentName: "未来的你",
        phase: "opening",
        content: "工作五年后，你不会记得大物考了61还是68，但毕业后大家各奔东西，这种和死党没心没肺疯跑一整天的机会，真的可能一辈子就这一次了。",
        timestamp: "14:10:22",
      },
      {
        id: "e6",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "rebuttal",
        targetAgentId: "happiness",
        interrupted: true,
        content: "【异议あり！严正反对】蜜柑又在散播致命虚无主义！最后三天突击历年期末真题，保底能多拿15分平时分，这是及格与挂科的生死线！",
        timestamp: "14:10:27",
      },
      {
        id: "e7",
        agentId: "social",
        agentName: "社交委员",
        phase: "rebuttal",
        targetAgentId: "gpa",
        content: "椎名学委你懂不懂什么叫情义无价？！人家高中三年替当事人带早饭、借笔记，好不容易大学聚一次，因为期末考把人轰走，这算什么朋友？！",
        timestamp: "14:10:32",
      },
      {
        id: "e8",
        agentId: "wallet",
        agentName: "钱包委员",
        phase: "rebuttal",
        content: "友情再无价，迪士尼门票加路费加园内天价餐饮，一人直接干进去近一千大洋！下半月当事人难道在寝室喝自来水度日？！",
        timestamp: "14:10:37",
      },
      {
        id: "e9",
        agentId: "happiness",
        agentName: "快乐委员·蜜柑",
        phase: "rebuttal",
        content: "钱可以省，青春不能省！大不了下个月天天在食堂吃三块钱的素包子！跟发小在迪士尼看城堡烟花，那可是能记一辈子的回忆！",
        timestamp: "14:10:42",
      },
      {
        id: "e10",
        agentId: "future",
        agentName: "未来的你",
        phase: "rebuttal",
        content: "作为三年后的你，我必须客观提醒：人生的终极遗憾往往不是某门及格线上的选修课，而是重要的人千里迢迢来找你，你却用‘我太忙’关上了心门。",
        timestamp: "14:10:48",
      },
      {
        id: "e11",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "rebuttal",
        interrupted: true,
        content: "【异议あり！严正反对】难道就眼睁睁看着当事人挂科？！如果大物挂科，大二评优评奖全部取消，保研推免资格直接被一票否决！",
        timestamp: "14:10:53",
      },
      {
        id: "e12",
        agentId: "social",
        agentName: "社交委员",
        phase: "rebuttal",
        content: "折中！必须折中！为什么非要从早到晚狂逛？买下午三点的半价午后优惠票！",
        timestamp: "14:10:58",
      },
      {
        id: "e13",
        agentId: "wallet",
        agentName: "钱包委员",
        phase: "rebuttal",
        content: "这个建议务实！午后票便宜将近两百块，而且晚上回学校在后街吃大排档，既实惠又有烟火气！",
        timestamp: "14:11:03",
      },
      {
        id: "e14",
        agentId: "happiness",
        agentName: "快乐委员·蜜柑",
        phase: "rebuttal",
        content: "而且上午当事人可以起大早，在图书馆狠学5个小时！下午三点再去迪士尼无缝会合，玩几个核心项目直接看烟花！",
        timestamp: "14:11:08",
      },
      {
        id: "e15",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "rebuttal",
        content: "如果在排队时必须全程掏出公式纸质小抄复习，并且回寝室后通宵刷完三套真题，本席可以勉强收回一票否决权。",
        timestamp: "14:11:13",
      },
      {
        id: "e16",
        agentId: "chairman",
        agentName: "委员会主任",
        phase: "chairman",
        content: "【庄严敲响法槌】各派交锋激烈，务实两全方案已然形成！友谊不容辜负，学业底线亦不可失守。本庭宣布辩论正式终结！全体起立，法槌已举起，进入法定全员表决程序！",
        timestamp: "14:11:20",
      },
    ],
    plans: [
      {
        id: "A",
        title: "断然拒绝，死守图书馆",
        desc: "向发小如实坦白考试严峻形势，请其谅解，改在校门口吃个便饭。",
        supporterAgents: ["gpa", "wallet"],
        compromiseNotes: "考试及格率保住了，但死党心凉了半截。",
      },
      {
        id: "B",
        title: "折中特战方案：迪士尼半日游 + 晚上自习室死磕",
        desc: "买午后特惠票陪逛核心项目，发小回酒店后当事人通宵狂补重点题库。",
        supporterAgents: ["social", "future", "happiness"],
        compromiseNotes: "肉体极度透支，但人情与考试双保底。",
      },
      {
        id: "C",
        title: "全程随行，在创极速光轮排队背公式",
        desc: "带上打印重点纸质小抄，在项目排队2小时的间隙疯狂刷题记忆。",
        supporterAgents: [],
        compromiseNotes: "荒谬行为艺术，已被全体委员一致嘲讽否决。",
      },
    ],
    votes: [
      { agentId: "gpa", agentName: "GPA委员·椎名学委", planId: "B", reason: "【红笔勾画】虽然风险极大，但看在排队全程背重点小抄的诚意上勉强投B。" },
      { agentId: "wallet", agentName: "钱包委员", planId: "B", reason: "【拨动算盘】午后票便宜将近两百块，省下一点是一点，财务勉强可控。" },
      { agentId: "social", agentName: "社交委员", planId: "B", reason: "【双手合十】B方案既能陪高中死党拍照发圈，又能交差，完胜！" },
      { agentId: "happiness", agentName: "快乐委员·蜜柑", planId: "B", reason: "【蹦跳挥拳】能去迪士尼看烟花就行，疯狂冲鸭！" },
      { agentId: "future", agentName: "未来的你", planId: "B", reason: "【欣慰微笑】去吧，有些青春死党千里来访，缺席了就真补不回来了。" },
    ],
    resolution: {
      caseNumber: "〔2026〕第 1024 号",
      title: "关于核准‘午后游园限时护航 + 考前红牛突击’方案之终审批复",
      urgency: "紧急",
      winningPlan: {
        id: "B",
        title: "折中特战方案：迪士尼半日游 + 晚上自习室死磕",
        desc: "准予参加半日行程，但必须执行严格时间表管控与财务配额限制。",
        supporterAgents: ["social", "future", "happiness", "gpa", "wallet"],
        compromiseNotes: "GPA委员拥有回程后全天候学术监督执行权。",
      },
      voteScore: { planA: 0, planB: 5, planC: 0 },
      votes: [],
      stipulations: [
        "第一条：只准购买午后入园优惠票，园内非必要周边（如玩偶发箍）坚决禁止购买；",
        "第二条：随身背包内必须携带大物公式缩印本，排队期间禁止刷短视频，必须看题；",
        "第三条：当晚20:30前必须离开乐园返校，回寝室喝红牛自习至次日凌晨方可抵罪。",
      ],
      supervisingAgent: "gpa",
      stampDate: "2026年9月12日 考前特案",
      appealCount: 0,
    },
  },

  topic_competition: {
    caseNumber: "〔2026〕第 2048 号",
    topicTitle: "关于是否报名参加实验室‘高难度智能车国赛’动议案",
    category: "人生规划",
    urgency: "常规",
    keyConflict: "保研立项简历背书诱惑 VS 通宵调参大概率炮灰风险",
    summonedAgentIds: ["ambition", "sleep", "gpa", "happiness", "future"],
    speeches: [
      {
        id: "cmp1",
        agentId: "ambition",
        agentName: "野心委员",
        phase: "opening",
        content: "报！必须报！大一不冲国赛什么时候冲？履历上写上‘国家级奖项’，保研推免面试直接横着走！哪怕当炮灰，你也是进过实验室的硬核炮灰！",
        timestamp: "10:15:02",
      },
      {
        id: "cmp2",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "opening",
        content: "我反对画大饼！学长已经说了‘每周通宵调车’，你的发际线已经在预警了！拿健康去赌一个虚无缥缈的证书？",
        timestamp: "10:15:08",
      },
      {
        id: "cmp3",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "opening",
        content: "野心委员别吹了。这学期有专业核心课3门，一旦比赛占用大量时间导致期末考崩掉，绩点低于3.2连保研初审都过不了，要竞赛分有什么用？",
        timestamp: "10:15:15",
      },
      {
        id: "cmp4",
        agentId: "future",
        agentName: "未来的你",
        phase: "opening",
        content: "毕业三年后回看：拿没拿奖真没你想的那么决定性。但是当年在这个实验室里熬夜调参、认识的靠谱队友、学会的工程排错思维，在后来成了最硬的底气。",
        timestamp: "10:15:23",
      },
      {
        id: "cmp5",
        agentId: "happiness",
        agentName: "快乐委员·蜜柑",
        phase: "rebuttal",
        content: "而且实验室听说天天有学长请喝奶茶点烧烤，去了就是吃喝玩乐混脸熟，顺便蹭个二作或者参与奖，怎么看都是血赚啊！",
        timestamp: "10:15:28",
      },
      {
        id: "cmp6",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "rebuttal",
        targetAgentId: "happiness",
        interrupted: true,
        content: "【异议あり！严正反对】蜜柑你想得太天真了！去年打智能车的大二学长，直接在实验室地板上睡睡袋，头发一把一把掉，你管这叫吃喝玩乐？！",
        timestamp: "10:15:33",
      },
      {
        id: "cmp7",
        agentId: "ambition",
        agentName: "野心委员",
        phase: "rebuttal",
        content: "吃得苦中苦，方为人上人！天天睡饱八小时的人一抓一大把，全国能造出循迹无人车的本科生有几个？！这是区分平庸与卓越的试金石！",
        timestamp: "10:15:38",
      },
      {
        id: "cmp8",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "rebuttal",
        interrupted: true,
        content: "【异议あり！严正反对】椎名学委再次发出严厉警告！大一高数和C语言是地基中的地基，一旦因为比赛缺课挂科，你连下学期的选课资格都要受限！",
        timestamp: "10:15:43",
      },
      {
        id: "cmp9",
        agentId: "wallet",
        agentName: "钱包委员",
        phase: "rebuttal",
        content: "而且做硬件很费钱！买各种舵机、开发板、电烙铁，经常要团队个人垫资，生活费又得缩水，请野心委员先核算财务预算！",
        timestamp: "10:15:48",
      },
      {
        id: "cmp10",
        agentId: "future",
        agentName: "未来的你",
        phase: "rebuttal",
        content: "冷静一下。未来的视角看：大学最忌讳的两种极端，一种是‘万事皆躺’的虚无主义，另一种是‘盲目打鸡血’把自己逼到神经衰弱。",
        timestamp: "10:15:54",
      },
      {
        id: "cmp11",
        agentId: "ambition",
        agentName: "野心委员",
        phase: "rebuttal",
        content: "那怎么破局？难道大好机会放在眼前，直接认怂退缩当一辈子看客？！",
        timestamp: "10:15:59",
      },
      {
        id: "cmp12",
        agentId: "future",
        agentName: "未来的你",
        phase: "rebuttal",
        content: "用策略破局：以‘二梯队后备辅助位’入组，负责轻量级的仿真与测试，既能学到工业界排错规范，又不会被绑在焊台前通宵透支。",
        timestamp: "10:16:05",
      },
      {
        id: "cmp13",
        agentId: "gpa",
        agentName: "GPA委员·椎名学委",
        phase: "rebuttal",
        content: "若能严格限定每周实验室驻留时间不超过8小时，且一旦期中考试低于80分无条件退队，我可以勉强签署同意令。",
        timestamp: "10:16:10",
      },
      {
        id: "cmp14",
        agentId: "sleep",
        agentName: "睡眠委员·悠悠",
        phase: "rebuttal",
        content: "严禁通宵！晚上23:00前必须离开实验室回寝室洗漱入睡，这条作为底线不可动摇！",
        timestamp: "10:16:15",
      },
      {
        id: "cmp15",
        agentId: "chairman",
        agentName: "委员会主任",
        phase: "chairman",
        content: "【庄严敲响法槌】本案争鸣热烈，各方求真务实！既呵护了攀登高峰之雄心，亦筑牢了学业根基与健康底线。辩论正式终结！全体起立，法槌已举起，进入法定全员表决程序！",
        timestamp: "10:16:22",
      },
    ],
    plans: [
      {
        id: "A",
        title: "保命为主，安心刷GPA",
        desc: "回绝学长邀请，专注上课刷分，做个安稳的高分好学生。",
        supporterAgents: ["gpa", "sleep"],
        compromiseNotes: "无风险但上限极度平庸。",
      },
      {
        id: "B",
        title: "以‘后备队员’身份入组观察，试探水温",
        desc: "报名参与，但向队长言明学业冲突，先负责辅助模块，不承担核心爆肝任务，视期中成绩再决定是否重度投入。",
        supporterAgents: ["ambition", "future", "gpa"],
        compromiseNotes: "攻守兼备，既蹭到实验室资源又保留抽身余地。",
      },
      {
        id: "C",
        title: "直接梭哈队长位，生死看淡",
        desc: "所有精力砸在调车上，旷课赶进度。",
        supporterAgents: [],
        compromiseNotes: "纯粹赌徒行为，已被全票驳回。",
      },
    ],
    votes: [
      { agentId: "ambition", agentName: "野心委员", planId: "B", reason: "【目光如炬】以二梯队轻量化入局，进可攻退可守，先上车抢占生态位！" },
      { agentId: "sleep", agentName: "睡眠委员·悠悠", planId: "B", reason: "【抱紧枕头】只要白纸黑字写明不强制通宵调车，我勉强准了。" },
      { agentId: "gpa", agentName: "GPA委员·椎名学委", planId: "B", reason: "【推眼镜】二梯队不占用专业核心课复习时间，且保留期中否决权，赞成。" },
      { agentId: "happiness", agentName: "快乐委员·蜜柑", planId: "B", reason: "【眼睛放光】实验室有学长请喝奶茶点烧烤，还能蹭个参与奖，赞成！" },
      { agentId: "future", agentName: "未来的你", planId: "B", reason: "【温和点头】去经历一次真实的工业级排错挫折，这是三年后最硬的底气。" },
    ],
    resolution: {
      caseNumber: "〔2026〕第 2048 号",
      title: "关于批准以‘机动后备主力’身份加入智能车实验室之裁定",
      urgency: "常规",
      winningPlan: {
        id: "B",
        title: "以‘后备队员’身份入组观察，试探水温",
        desc: "批准报名参赛，但订立不可逾越之学业防线条约。",
        supporterAgents: ["ambition", "future", "gpa", "sleep"],
        compromiseNotes: "GPA委员拥有期中考成绩否决权。",
      },
      voteScore: { planA: 1, planB: 4, planC: 0 },
      votes: [],
      stipulations: [
        "第一条：入队前向队长坦诚学业时间预算，约定每周实验室工时上限不得超过14小时；",
        "第二条：严禁在考前两周参加闭门通宵调参，期末周必须以课程复习为绝对优先级；",
        "第三条：由未来的你负责心理建设——此行重在吸取工程实战经验，放下完美主义得失心。",
      ],
      supervisingAgent: "future",
      stampDate: "2026年9月12日 战略立项",
      appealCount: 0,
    },
  },
};

// -----------------------------------------------------------------------------
// 十一大常任司局委员人格化专属台词与即兴答辩引擎 (Bespoke Persona Voice Synthesis)
// -----------------------------------------------------------------------------
export interface AgentVoiceEngine {
  opening: (topicSnippet: string, timeContext: string) => string;
  objection: (targetAgentName: string, topicSnippet: string) => string;
  rebuttal: (topicSnippet: string) => string;
  compromise: (topicSnippet: string) => string;
  acceptance: () => string;
  voteReason: (planId: "A" | "B" | "C", planTitle: string) => string;
  interrogationReply: (userQuery: string, topicTitle: string) => string;
}

export const AGENT_VOICE_ENGINES: Record<AgentId, AgentVoiceEngine> = {
  gpa: {
    opening: (topic, time) =>
      `【严厉推了推无框眼镜，展开教务处考勤细则】坚决驳回关于“${topic}”的任何侥幸幻想！${time}，本学期专业必修课平时分占比高达40%，任课老教授的随机点名模型已进入高危区间！挂科不仅是400块重修费，更是大二盛夏在闷热无空调阶梯教室补考的奇耻大辱！`,
    objection: (target) =>
      `【异议あり！手中点名册重重拍在席前】${target}简直是一派胡言！平时作业全靠抄，现在还在为冲动辩护？期末试卷上一片空白的时候，你替当事人上台补考扛雷吗？！`,
    rebuttal: () =>
      `【教鞭猛敲黑板】别拿所谓‘情怀体验’当遮羞布！大学四年最硬的通货就是教务系统里的GPA加权！绩点一旦跌穿3.0，保研初审直接被系统算法秒杀，大厂秋招简历关第一轮就石沉大海！`,
    compromise: () =>
      `【深吸一口气，用红笔在考勤表边缘写下特批条款】既然诸位执意胡闹，本席设立绝对风控底线：必须手抄三套历年期末真题并背诵核心公式，且明早早八必须坐在讲台正前方前三排！`,
    acceptance: () =>
      `【在审议令边缘盖下‘及格保底’红印】若将明早两瓶双倍浓缩咖啡与前排就座列为强制执行附款，GPA特别风控司勉强暂缓行使一票否决权！`,
    voteReason: (planId) => {
      if (planId === "A") return `【推眼镜】平时分模型底线不容践踏，保全绩点才是大学第一要务！`;
      if (planId === "B") return `【红笔打勾】折中附款锁死了真题背诵与早八考勤，挂科率压缩至12%以下，勉强准了。`;
      return `【直接亮红牌】自毁型疯狂方案，教务处系统将直接记入学术黑名单！`;
    },
    interrogationReply: (query) => {
      if (query.includes("咖啡") || query.includes("早起") || query.includes("闹钟")) {
        return `【推眼镜冷笑】喝浓缩咖啡？老教授教龄三十年，老花镜往下一拉空座位一目了然！平时分扣光直接400块重修费伺候，你想在闷热阶梯教室过暑假吗？！`;
      }
      if (query.includes("瓦") || query.includes("游戏") || query.includes("手感") || query.includes("排位") || query.includes("连胜")) {
        return `【教鞭猛敲黑板】连胜个鬼！胜率50%的匹配机制把你当猴耍！明天高数课你听不懂一个符号，期末绩点跌穿3.0，保研名单直接除名！`;
      }
      if (query.includes("她") || query.includes("他") || query.includes("喜欢") || query.includes("聊") || query.includes("表白")) {
        return `【推眼镜】谈恋爱能给你期末考卷多加5分吗？绩点挂了，你在对方眼里直接跌入‘不求上进下水道’，清醒点！`;
      }
      return `【严厉注视】当事人请收起狡辩！“${query.slice(0, 15)}”在教务系统严格考勤与及格红线面前，毫无任何抗辩法律效力！`;
    },
  },

  sleep: {
    opening: (topic, time) =>
      `【怀里死死抱着羽绒抱枕，生无可恋地瘫在桌上】开什么会啊……你们吵吵吵，到底看没看心率手环上的红色震动警报？！${time}，大脑神经元已处于物理断电边缘！再折腾“${topic}”，明天早八直接当场脑死亡在课桌上，我才不要替你收尸！`,
    objection: (target) =>
      `【异议あり！抓起抱枕狠狠砸向桌面】${target}你给我闭嘴！每一次你跳出来喊‘就嗨一下’，哪次不是直接折腾到天光大亮？！今晚哪怕多看一秒屏幕，全身免疫系统都要集体罢工暴动了！`,
    rebuttal: () =>
      `【打了个怨气冲天的哈欠】别跟我提什么咖啡因！咖啡因那是向身体借的高利贷，明天上午十点药效一过，心慌手抖加偏头痛，连讲台上老师说的是哪国语言你都听不懂！`,
    compromise: () =>
      `【有气无力地伸出一根手指】硬性止损线！只准给你最后20分钟！不论进展如何，倒计时一响立刻关机断网、塞上耳塞入睡，敢延误一秒我明天让你头痛欲裂一整天！`,
    acceptance: () =>
      `【把脸埋进抱枕长舒一口气】只要能保证今晚在硬性时间前闭眼熄灯，我勉强收回一票否决权……快点表决，我要睡了……`,
    voteReason: (planId) => {
      if (planId === "A") return `【抱紧枕头】立刻闭眼关机！褪黑素已经耗尽，多撑一秒都是对心肌的蓄意谋杀！`;
      if (planId === "B") return `【打着哈欠签字】限时止损是我的底线，只要闹钟一响立刻钻进被窝，我勉强准了。`;
      return `【翻白眼猝死状】通宵作死？明天直接让宿管阿姨打120来宿舍楼下抬人吧！`;
    },
    interrogationReply: (query) => {
      if (query.includes("咖啡") || query.includes("能醒") || query.includes("早起")) {
        return `【抓狂扯头发】咖啡那是借高利贷！明天上午10点药效一过，心慌手抖加偏头痛，全身肌肉酸痛瘫痪，额叶直接物理死机！`;
      }
      if (query.includes("手感") || query.includes("再来") || query.includes("一把")) {
        return `【抓起抱枕砸过去】什么手感！竞技游戏第一铁律就是‘赢了想趁热打铁，输了想赢一把再睡’，最后直接猝死在黎明曙光里！`;
      }
      if (query.includes("吃") || query.includes("饿") || query.includes("炸鸡")) {
        return `【打哈欠翻白眼】半夜消化高热量，肠胃疯狂充血，你这辈子都别想进入深度睡眠！明早起来脸肿得像猪头！`;
      }
      return `【生无可恋地趴下】别狡辩了……黑眼圈已经比国宝还重了，现在立刻扣上手机闭眼入睡，多撑一秒都是对心肌的蓄意谋杀！`;
    },
  },

  happiness: {
    opening: (topic) =>
      `【兴奋地单脚踩在会议椅上挥舞荧光棒】举双手双脚赞成！关于“${topic}”，大家摸摸良心想一想，大学四年一眨眼就溜走了！此时不嗨难道要等三十岁在写字楼工位加班掉头发时暗自叹气吗？！青春就是拿来挥霍心跳的！`,
    objection: () =>
      `【异议あり！抢过麦克风大声抗议】反对防守派的扫兴言论！天天前怕狼后怕虎，把日子过得像老干部的行事历！今天不玩、明天不冲，等以后老了翻看大学相册，里面全是一片惨白的自习室打卡记录吗？！`,
    rebuttal: () =>
      `【眼睛闪着星星高声疾呼】快乐是有保质期的！高数考砸了明年还能补考，但今晚这一刻的狂欢、这一刻的疯狂心动，错过这班车，你这辈子都遇不到第二次原汁原味的心情了！`,
    compromise: () =>
      `【双手合十冲全场疯狂眨眼】折中！折中还不行嘛！我们速战速决，设定一个高潮胜利点，拿到最核心的多巴胺体验立刻见好就收，带着胜利的喜悦入睡，睡眠质量反而超级加倍！`,
    acceptance: () =>
      `【从椅子上跳下来兴奋拍手】成交！只要不一棍子打死、只要还能保留最核心的快乐体验，怎么管束我都认了，今晚必须听到尖叫声！`,
    voteReason: (planId) => {
      if (planId === "A") return `【委屈撇嘴】太扫兴了！把大好青春全锁死在禁闭室里，简直是精神苦行僧！`;
      if (planId === "B") return `【疯狂点赞】保留了核心快乐体验，还能给其他人交差，太机智了冲鸭！`;
      return `【激动脱外套】虽然刺激上天，但被老干部们联合弹劾了，可惜可惜！`;
    },
    interrogationReply: (query) => {
      if (query.includes("咖啡") || query.includes("早起")) {
        return `【笑嘻嘻蹦起来】加双倍糖浆喝下去超爽的！只要今晚玩痛快了，明天哪怕打瞌睡，灵魂也是充实快乐的！`;
      }
      if (query.includes("赢") || query.includes("连胜") || query.includes("打瓦") || query.includes("开黑")) {
        return `【单脚踩椅子握拳】对味了！我就说当事人是有电竞之魂的！手感火热一路平推带飞，神话晋级赛就在今夜，冲鸭！`;
      }
      if (query.includes("吃") || query.includes("炸鸡") || query.includes("奶茶") || query.includes("饿")) {
        return `【疯狂吸口水】再加一份超大杯冰阔乐！人生苦短，卡路里明天操场跑两圈就消耗了，今晚必须听到脆皮嚼碎的声音！`;
      }
      return `【兴奋击掌】当事人说得对！纠结也是过一晚，快乐也是过一晚，何必把自己活成苦行僧？选能让自己笑出来的方案就对了！`;
    },
  },

  wallet: {
    opening: (topic) =>
      `【疯狂按动计算器归零键，甩出当月支付宝负债流水】生活费资产负债司紧急干预！关于“${topic}”，背后的直接成本、隐形溢价与连锁开销核算过没有？！当前微信零钱只剩三位数，恩格尔系数已达93.8%，再冲动消费月末在寝室连泡面都只能买袋装干嚼！`,
    objection: (target) =>
      `【异议あり！算盘珠子拨得噼啪作响】荒谬绝伦！${target}张口闭口‘情怀无价’，门票、配送费、人均聚餐AA费用是谁在掏？！那是当事人父母打过来的血汗生活费！你拿别人的钱包装自己的大方？！`,
    rebuttal: () =>
      `【指着负债走势图痛心疾首】每一次冲动消费都伴随着可怕的复利惩罚！吃一顿天价夜宵，下周就得天天在食堂三楼吃两块钱的素菜；买一件溢价垃圾，接下来一个月花呗账单催得你彻夜难眠！`,
    compromise: () =>
      `【从口袋里掏出优惠券核销清单】务实折中条款：设定绝对财务天花板！只准使用团购特惠套餐或拼单免运费方案，超出预算一分钱立即强制冻结扫码支付功能！`,
    acceptance: () =>
      `【在预算审批单上严谨地盖上‘限额核准’章】若能锁定成本上限并严禁超支垫资，本司准予临时放行该笔开支指标！`,
    voteReason: (planId) => {
      if (planId === "A") return `【攥紧钱包】零成本、零支出、零负债！守住生活费底线才是硬道理！`;
      if (planId === "B") return `【核对流水】通过拼单团购压低了60%的智商税，财务处于可控区间，盖章放行。`;
      return `【捂住心脏】这一单下去直接宣告破产，下半月只能去操场喝西北风了！`;
    },
    interrogationReply: (query) => {
      if (query.includes("吃") || query.includes("外卖") || query.includes("夜宵") || query.includes("奶茶")) {
        return `【算盘噼啪狂响】起送费20+夜间配送8+包装3！看看你的微信零钱只剩18块4毛，刷脸能抵扣吗？月末准备在寝室喝白开水充饥吗？！`;
      }
      if (query.includes("谈恋爱") || query.includes("约会") || query.includes("电影")) {
        return `【掏出负债流水】半夜聊嗨了周末必然人均180网红餐厅加看电影！先问问你的花呗额度支不支持突发恋爱预算？！`;
      }
      return `【按动计算器】当事人清醒点！每一句“${query.slice(0, 15)}”的冲动背后，全是要用真金白银填平的账单！先看余额再说话！`;
    },
  },

  social: {
    opening: (topic) =>
      `【轻抿果茶，翻开寝室人脉关系树状图】各位听我一言！关于“${topic}”，表面上是一件小事，背后牵扯的可是整个宿舍/圈子的人际资本与默契认同！大学是微缩社会，今天你高冷脱节不合群，明天大家有好事、有点名情报、有活动资源凭什么带你？！`,
    objection: (target) =>
      `【异议あり！举起全寝合影抗辩】死板！太死板了！${target}你懂不懂什么叫社交缓冲？人家主动抛出橄榄枝，你一句‘我要自律’硬生生把天聊死，明天同处一个屋檐下低头不见抬头见，气氛尴尬得像冰窖！`,
    rebuttal: () =>
      `【双手合十诚恳劝导】人情世故讲究的就是有来有往！哪怕不全程参与，去露个脸、打声招呼、或者用高情商话术把态度做足，既保住了自己的界限，又维系了圈子的体面，这才是成年人的解法！`,
    compromise: () =>
      `【掏出高情商微信回复模板】调解方案出炉：‘肉身适度参与/高情商话术垫后’！去现场待半小时或在群里发个幽默红包并请喝饮料，既给了大家面子，又能优雅找借口抽身离场！`,
    acceptance: () =>
      `【露出得体的社交微笑】这个方案无可挑剔！所有人都有台阶下，人际关系未受损耗，社交评级维持全A，我全票支持！`,
    voteReason: (planId) => {
      if (planId === "A") return `【尴尬擦汗】直接掀桌子拒绝太伤感情了，以后在宿舍里连借个指甲刀都张不开嘴。`;
      if (planId === "B") return `【拍手称赞】既保全了集体面子，又给了自己抽身借口，经典教科书式高情商操作！`;
      return `【连连摆手】盲目随大流最后沦为气氛组冤大头，得不偿失。`;
    },
    interrogationReply: (query) => {
      if (query.includes("游戏") || query.includes("舍友") || query.includes("五排")) {
        return `【端起果茶合掌】舍友语音里四缺一嗷嗷待哺！这时候临阵脱逃就是背叛革命友谊，明天在寝室抬头不见低头见，水都没人给你带！`;
      }
      if (query.includes("聚餐") || query.includes("活动") || query.includes("去不")) {
        return `【翻开人际图谱】哪怕不吃饱也得去露个脸！大学圈子全靠人情世故维系，高情商露脸半小时然后找借口优雅离场，两全其美！`;
      }
      if (query.includes("回不回") || query.includes("她") || query.includes("聊天")) {
        return `【发猫猫表情包】掐表4分钟发个幽默猫猫表情包缓冲一下！既不显得冷漠饥渴，又把话语权抛回给对方，高情商拉扯教科书！`;
      }
      return `【得体微笑】哎呀当事人别走极端嘛！发句体面圆滑的话安抚大家情绪，大家面子上过得去，你的小圈子才能稳如泰山！`;
    },
  },

  ambition: {
    opening: (topic) =>
      `【扯松领带，将商业战略白板重重推到场中】必须立项出击！关于“${topic}”，大学四年每一天都是个人核心竞争力的估值窗口！平庸的安稳只会换来秋招时简历被机器筛掉的平庸下场！此时不争不抢不抢占先发优势，你难道甘心当一辈子人肉背景板？！`,
    objection: (target) =>
      `【异议あり！目光如炬指斥全场】收起你们那些小农意识和虚伪的佛系！${target}你口中的‘保命’本质上就是对平庸的妥协认命！全国顶尖高校的学生都在夜以继日地造壁垒、冲国奖、拿背书，你在宿舍躺平数绵羊，三年后拿什么跟别人拼？！`,
    rebuttal: () =>
      `【猛击白板上的飞轮模型】战略讲究的是破局点！每一次走出舒适圈的痛苦，都是认知与履历的底层迭代！哪怕这一次当了炮灰，也是摸爬滚打过的硬核实战选手，这叫构建降维打击壁垒！`,
    compromise: () =>
      `【迅速绘制敏捷迭代矩阵】战略迂回：采取‘轻量化MVP试水’模式！以最低沉没成本入局切入关键生态位，负责核心亮点模块，既积累关键履历证明，又规避被琐事绑架的透支风险！`,
    acceptance: () =>
      `【在战术协议上利落签字】只要核心产出物能写进简历一作/核心参与者栏目，战术性让步符合长期利益，批准立项！`,
    voteReason: (planId) => {
      if (planId === "A") return `【失望摇头】彻底认怂放弃，白白把战略高地拱手让给竞争对手，毫无格局！`;
      if (planId === "B") return `【目光如炬】保住了核心背书与成长杠杆，符合敏捷迭代与风险对冲原则，投支持！`;
      return `【冷眼旁观】不讲策略的无脑莽夫行为，注定成为沉没成本的祭品。`;
    },
    interrogationReply: (query) => {
      if (query.includes("卷") || query.includes("竞赛") || query.includes("保研") || query.includes("部长")) {
        return `【扯松领带目光如炬】必须拿下！大学不是养老院，不争不抢只会沦为别人的背景板！哪怕头破血流当炮灰，也是摸爬滚打过的硬核实战选手！`;
      }
      return `【眼神充满狼性】当事人你在为偷懒找借口吗？！想要超越同龄人建立核心护城河，就要付出超常的代价！退缩认怂你甘心吗？！`;
    },
  },

  love: {
    opening: (topic) =>
      `【双手捧心满面绯红，眼里冒着粉红泡泡】天哪天哪！关于“${topic}”，这绝对是命运齿轮开始转动的信号啊！夜深人静是人类情绪防线最脆弱、心房最透明的时刻，对方在这个节点找你，懂不懂纯爱战神的含金量？！犹豫一秒都是对真爱的大不敬！`,
    objection: (target) =>
      `【异议あり！挥舞着粉色荧光笔尖叫】我强烈抗议冷血动物的干预！${target}你懂什么叫‘那一刻心跳漏跳半拍’的感觉？！你拿冷冰冰的教条去丈量炽热的心动，等对方以为你冷漠转头撤回消息，你赔得起当事人这辈子的白月光吗？！`,
    rebuttal: () =>
      `【把脸埋进围巾里激动跺脚】四千字的真诚日记已经在脑海里演习了千百遍！如果连喜欢一个人都要掐着秒表算计利益得失，那不是谈恋爱，那是菜市场批发大白菜！真诚才是终极必杀技！`,
    compromise: () =>
      `【深呼吸三次强行压抑心跳】好……好嘛！折中方案：准许我们回复，但采用‘高情商松弛拉扯法’，文字控制在两行以内，绝不表现出死等一整夜的饥渴，进可夜聊谈心，退可温柔互道晚安！`,
    acceptance: () =>
      `【咬着下唇满怀期待】只要聊天窗口能顺利开启、心意能传达过去，哪怕多等五分钟我也认了，爱情万岁！`,
    voteReason: (planId) => {
      if (planId === "A") return `【眼泪汪汪】装睡错过天赐良缘，世界上最痛苦的事莫过于‘我们本可以’！`;
      if (planId === "B") return `【两眼放光】既保护了心动火苗，又留足了优雅神秘感，纯爱战神全票支持！`;
      return `【捂脸尖叫】虽然冲得很猛，但确实容易把对方吓跑当场社死，折中一下挺好！`;
    },
    interrogationReply: (query) => {
      if (query.includes("回") || query.includes("她") || query.includes("喜欢") || query.includes("聊天")) {
        return `【捧心尖叫跺脚】秒回！必须秒回！夜深人静防线失守，对方第一个找你懂不懂含金量？！四千字心动小作文直接给我发送！`;
      }
      return `【双手捧脸满眼桃心】心动就是最高指令！别听那些母胎单身的老古董瞎分析，跟着你的直觉走，去拥抱属于你的罗曼蒂克！`;
    },
  },

  dignity: {
    opening: (topic) =>
      `【抱紧双臂倚在门边，嘴角浮现一抹轻蔑冷笑】防小丑监察司当庭预警！关于“${topic}”，请当事人立刻收起你廉价的讨好型人格！秒回、跪舔、随叫随到，只会把‘我毫无个人价值，全天候死等你的恩赐’写在脸上！在任何关系里先丢掉体面的人，注定沦为被踩在脚下的终身备胎！`,
    objection: (target) =>
      `【异议あり！一脚将小丑面具踢碎】荒谬至极！${target}你完全是被荷尔蒙冲昏了头脑的恋爱脑！刚收到三个字就激动得把手机按出火星，打字手都在抖，你看看镜子里自己的样子，像不像一个自导自演苦情戏的滑稽小丑？！`,
    rebuttal: () =>
      `【目光如炬字字诛心】成年人的社交吸引力来自神秘感与不可替代的个人秩序！把自己的作息、尊严全盘打翻去迎合别人的随手试探，得到的不是珍惜，而是廉价的轻蔑与呼之即来挥之即去！`,
    compromise: () =>
      `【冷冷地在公文上划出警戒红线】底线条款：严禁秒回！设置至少4分钟冷静计时！回复文字必须删去所有乞怜的波浪号、感叹号与讨好型表情包，语气保持克制自持，维持最后的人格体面！`,
    acceptance: () =>
      `【冷酷颔首】只要把小丑行为彻底封杀在安全线之外，守住了傲骨与体面，本席准予签署该折中决议！`,
    voteReason: (planId) => {
      if (planId === "A") return `【昂首挺胸】守住傲骨，不卑不亢，绝不在任何人面前摇尾乞怜！`;
      if (planId === "B") return `【冷静核准】封杀了一切小丑表情包与卑微秒回，体面防线未破，准予通过。`;
      return `【鄙夷啐口】把脸伸过去让人打的自毁式舔狗行径，本司予以最高级别鄙视！`;
    },
    interrogationReply: (query) => {
      if (query.includes("回") || query.includes("讨好") || query.includes("秒回") || query.includes("聊")) {
        return `【一脚踹翻小丑红鼻子】绝对不行！秒回等于自首‘我每天半夜死等你的施舍’！必须晾Ta至少15分钟，删掉所有卑微叹号，维持成年人体面！`;
      }
      return `【目光如刀】当事人清醒一点！你急于找借口的每一句话，都在暴露你内心的懦弱与谄媚！挺起脊梁，留点起码的自尊！`;
    },
  },

  stomach: {
    opening: (topic) =>
      `【肚子传出一阵雷鸣般的咕噜声，拿着筷子猛敲不锈钢饭盆】全体肃静！听听我肚子里的声音！关于“${topic}”，你们那些精神层面的高谈阔论全是虚的！胃黏膜正在被胃酸剧烈侵蚀，血糖浓度跌穿安全警戒线！卡路里就是生命力，饥饿状态下大脑能做出什么理智决定？！先让我吃饱再说！`,
    objection: (target) =>
      `【异议あり！油汪汪的筷子直指全场】反对饥饿折磨！${target}你摸摸良心，大半夜灌白开水企图欺骗胃部是赤裸裸的身体霸凌！脆皮炸鸡、滚烫骨汤、烤得滋滋冒油的肉串，那才是治愈灵魂的终极解药！不吃饱今晚谁也别想睡安稳！`,
    rebuttal: () =>
      `【抹了抹嘴角的口水两眼放光】人类进化了几百万年站在食物链顶端，不是为了在大学深夜嚼无糖全麦面包受罪的！吃饱了多巴胺充沛，明早才有力气去面对惨淡的人生！胃袋空空，灵魂怎么可能有定力？！`,
    compromise: () =>
      `【妥协地放下加量外卖单】折中！大份炸鸡可以降级为中份或者无糖烤串，再加一份烫青菜和无糖乌龙茶！既解了深夜嘴馋的燃眉之急，又把发胖罪恶感降到最低，两全其美！`,
    acceptance: () =>
      `【幸福地吸了一大口空气中的香气】只要今晚嘴里能嚼上热腾腾的夜宵，你们订什么自律条约我都签！开饭开饭！`,
    voteReason: (planId) => {
      if (planId === "A") return `【肚皮贴后背】饥肠辘辘在床上翻滚内耗，这简直是中世纪水牢酷刑！`;
      if (planId === "B") return `【心满意足嚼肉】既吃到了热腾腾的夜宵，又控制了份量保住体面，神仙折中！`;
      return `【撑得直打嗝】虽然暴饮暴食爽上天，但明早胃食管反流确实要命，谨慎克制。`;
    },
    interrogationReply: (query) => {
      if (query.includes("饿") || query.includes("吃") || query.includes("炸鸡") || query.includes("夜宵")) {
        return `【敲响不锈钢饭盆】胃酸已经在腐蚀胃黏膜发出十二级海啸了！卡路里就是生命力，香酥爆汁的炸鸡配冰可乐，吃饱了灵魂才有着落！`;
      }
      return `【肚子雷鸣般咕噜】当事人听听我肚子的哀鸣！别跟身体本能过不去，点份热气腾腾的夜宵，什么烦恼吃一口全烟消云散了！`;
    },
  },

  future: {
    opening: (topic) =>
      `【缓缓揉了揉发胀的太阳穴，翻开尘封的三年前日记】我是三年后的你。站在时空的对岸回看关于“${topic}”的纠结，真是既怀念又好笑。三年后的你已经经历过无数更残酷的毒打，我可以很负责任地告诉你：你现在在被窝里反复拉扯的这件琐事，在后来的人生跨度里，连一粒微尘都算不上。`,
    objection: (target) =>
      `【异议あり！指骨轻轻叩击桌面发出清脆回响】停一停吧，别再自我感动了。${target}，你以为你在捍卫什么伟大的原则？当事人其实心里非常清楚：你反复内耗的根本不是这件事本身，而是你在用纠结来逃避真正摆在眼前的困难与现实。`,
    rebuttal: () =>
      `【深邃的目光透过会议室看向虚空】人在二十岁时最大的错觉，就是以为眼前的每一个十字路口都在决定终生。其实人生是一场漫长的容错马拉松。选错一次不会万劫不复，但在原地把心智内耗烧干，才是最不可逆的损耗。`,
    compromise: () =>
      `【递过去一杯温热的矿泉水】三年后的我给你一个最优解：选一条阻力适中、即便办砸了代价也完全可控的路。做出决定后立刻关掉脑内会议，哪怕结果不完美，敢于承担并向前迈进，才是你真正长大的那一刻。`,
    acceptance: () =>
      `【欣慰而平静地笑了笑】这个方案很公允。三年后的我表示认可，去经历吧，无论好坏，都是你不可替代的青春注脚。`,
    voteReason: (planId) => {
      if (planId === "A") return `【温和叹息】保守避险固然安全，但也剥夺了一次在试错中蜕变成长的机会。`;
      if (planId === "B") return `【平和颔首】平衡了当下的体验与未来的代价，三年后的我会为今晚的选择欣慰。`;
      return `【摇头苦笑】盲目自毁的荒唐剧，三年后收拾烂摊子的人依然是我自己。`;
    },
    interrogationReply: (query) => {
      if (query.includes("后悔") || query.includes("三年") || query.includes("未来") || query.includes("以后")) {
        return `【揉按太阳穴苦笑】我是三年后的你。听我一句：三年后你甚至记不起今天争论的具体内容。真正决定你的，是你面对现实敢于承担的勇气。`;
      }
      return `【深邃目光穿透时空】你追问“${query.slice(0, 14)}”，其实不是在找答案，而是在借我们的口，给你内心早已决定的懦弱或冲动寻找一张免责证明。别怕犯错，但别再逃避了。`;
    },
  },

  chairman: {
    opening: (topic, time) =>
      `【法槌重重敲响在红木底座上】全庭肃静！本庭现就当事人申报之特急内耗议题“${topic}”正式开庭审理！${time}，本院严正重申：脑内议会不是菜市场，吵吵闹闹成何体统！请各常设司局委员严格依据职责陈述核心诉求！`,
    objection: () =>
      `【法槌连击两下整肃法庭】各位肃静！严正反对申请成立！辩方发言切中实质要害，正方请立即停止一切道德绑架与虚无叙事，正面回应核心风控机制！`,
    rebuttal: () =>
      `【严肃翻看控辩卷宗】辩论进行至深水区，本庭提醒全员：任何脱离现实承受能力的提案均为废纸一张！请提出兼顾双方诉求之务实方案！`,
    compromise: () =>
      `【手按法槌主持调停】主审席提出动议：融合各方诉求，形成‘有限推进+硬核熔断’之综合调解案！`,
    acceptance: () =>
      `【在红头文件上盖下钢印】调解案已吸纳各常任司局核心风控条款，符合学园脑神经保护法案，准予提请表决！`,
    voteReason: () => `【法槌落定】作为法定主审席，维持大局秩序与综合效益最大化是唯一标准！`,
    interrogationReply: (query) =>
      `【法槌敲落震肃法庭】当事人当庭抛出抗辩“${query}”！全庭肃静，请各委员依职责立即开火答辩！`,
  },
};

// 动态自定义议题生成引擎（实时提取关键词，融入当前时段要素生成完全动态台词）
export function generateProceduralCouncil(customInput: string, priorityAgents: AgentId[] = []): CouncilMeetingScript {
  const text = customInput.toLowerCase();
  const caseNum = createCaseNumber();
  const timeContext = getRealtimeTimePrompt();

  let category = "日常选择";
  let urgency: "特急" | "紧急" | "常规" = "紧急";
  const summoned: AgentId[] = Array.from(new Set(["future", ...priorityAgents.filter((agent) => agent !== "chairman")])).slice(0, 4) as AgentId[];

  if (
    text.includes("喜欢") ||
    text.includes("表白") ||
    text.includes("男") ||
    text.includes("女") ||
    text.includes("谈") ||
    text.includes("情") ||
    text.includes("恋") ||
    text.includes("暗恋") ||
    text.includes("学长") ||
    text.includes("学姐") ||
    text.includes("秒回") ||
    text.includes("回不回") ||
    text.includes("crush") ||
    text.includes("对象") ||
    text.includes("脱单")
  ) {
    summoned.push("love");
    summoned.push("dignity");
    category = "情感社交";
    urgency = "特急";
  }
  if (text.includes("睡") || text.includes("熬夜") || text.includes("累") || text.includes("早起") || text.includes("失眠")) {
    summoned.push("sleep");
    urgency = "特急";
  }
  if (text.includes("课") || text.includes("挂科") || text.includes("考") || text.includes("学") || text.includes("作业") || text.includes("gpa")) {
    summoned.push("gpa");
  }
  if (text.includes("买") || text.includes("花") || text.includes("钱") || text.includes("贵") || text.includes("生活费") || text.includes("算盘") || text.includes("花呗")) {
    summoned.push("wallet");
  }
  if (text.includes("吃") || text.includes("夜宵") || text.includes("炸鸡") || text.includes("外卖") || text.includes("饿") || text.includes("火锅") || text.includes("烧烤")) {
    summoned.push("stomach");
  }
  if (text.includes("玩") || text.includes("游戏") || text.includes("去不") || text.includes("嗨") || text.includes("瓦") || text.includes("王者") || text.includes("开黑")) {
    summoned.push("happiness");
  }
  if (text.includes("社团") || text.includes("舍友") || text.includes("朋友") || text.includes("聚餐") || text.includes("活动") || text.includes("群") || text.includes("人际")) {
    summoned.push("social");
  }
  if (text.includes("赛") || text.includes("保研") || text.includes("考研") || text.includes("实习") || text.includes("面试") || text.includes("职") || text.includes("部长") || text.includes("卷")) {
    summoned.push("ambition");
  }

  const candidates: AgentId[] = ["gpa", "sleep", "happiness", "wallet", "social", "ambition"];
  for (const c of candidates) {
    if (summoned.length < 5 && !summoned.includes(c)) {
      summoned.push(c);
    }
  }

  const speeches: CouncilSpeech[] = [];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const topicSnippet = customInput.slice(0, 16);

  // 确定对辩双方核心主力与多角色参辩阵容
  const propId: AgentId = summoned.find((a) => a === "happiness" || a === "love" || a === "ambition" || a === "stomach") || summoned[0] || "happiness";
  const oppId: AgentId = summoned.find((a) => (a === "gpa" || a === "sleep" || a === "wallet" || a === "dignity") && a !== propId) || "gpa";
  const pragId: AgentId = summoned.find((a) => a !== propId && a !== oppId && a !== "future") || "social";
  const fourthId: AgentId = summoned.find((a) => a !== propId && a !== oppId && a !== pragId && a !== "future") || "sleep";

  const propProfile = AGENT_PROFILES[propId] || AGENT_PROFILES.happiness;
  const oppProfile = AGENT_PROFILES[oppId] || AGENT_PROFILES.gpa;
  const pragProfile = AGENT_PROFILES[pragId] || AGENT_PROFILES.social;
  const fourthProfile = AGENT_PROFILES[fourthId] || AGENT_PROFILES.sleep;

  // 16 轮严谨而充满二次元极致人格特质的庭审辩论对决剧本构造
  // Round 1: 主审官敲锤开庭
  speeches.push({
    id: `dyn_1`,
    agentId: "chairman",
    agentName: "委员会主任",
    phase: "opening",
    content: AGENT_VOICE_ENGINES.chairman.opening(topicSnippet, timeContext),
    timestamp: timeStr,
  });

  // Round 2: 推进派代表独立陈述
  speeches.push({
    id: `dyn_2`,
    agentId: propId,
    agentName: propProfile.name,
    phase: "opening",
    content: AGENT_VOICE_ENGINES[propId].opening(topicSnippet, timeContext),
    timestamp: timeStr,
  });

  // Round 3: 防守风控派代表独立陈述
  speeches.push({
    id: `dyn_3`,
    agentId: oppId,
    agentName: oppProfile.name,
    phase: "opening",
    content: AGENT_VOICE_ENGINES[oppId].opening(topicSnippet, timeContext),
    timestamp: timeStr,
  });

  // Round 4: 务实中立/现实派代表陈述
  speeches.push({
    id: `dyn_4`,
    agentId: pragId,
    agentName: pragProfile.name,
    phase: "opening",
    content: AGENT_VOICE_ENGINES[pragId].opening(topicSnippet, timeContext),
    timestamp: timeStr,
  });

  // Round 5: 第四参审委员陈述
  speeches.push({
    id: `dyn_5`,
    agentId: fourthId,
    agentName: fourthProfile.name,
    phase: "opening",
    content: AGENT_VOICE_ENGINES[fourthId].opening(topicSnippet, timeContext),
    timestamp: timeStr,
  });

  // Round 6: 第一次戏剧性全屏爆发【异议あり！严正反对】（防守派拍桌打断）
  speeches.push({
    id: `dyn_6`,
    agentId: oppId,
    agentName: oppProfile.name,
    phase: "interjection",
    targetAgentId: propId,
    interrupted: true,
    content: AGENT_VOICE_ENGINES[oppId].objection(propProfile.name, topicSnippet),
    timestamp: timeStr,
  });

  // Round 7: 主审官敲锤整肃法庭秩序
  speeches.push({
    id: `dyn_7`,
    agentId: "chairman",
    agentName: "委员会主任",
    phase: "chairman",
    content: `【法槌重重敲响】肃静！严正反对申请成立！辩方发言切中实质要害，正方请立即停止一切道德绑架与虚无叙事，正面回应核心风控机制！`,
    timestamp: timeStr,
  });

  // Round 8: 推进派强力反驳与唇枪舌剑
  speeches.push({
    id: `dyn_8`,
    agentId: propId,
    agentName: propProfile.name,
    phase: "rebuttal",
    targetAgentId: oppId,
    content: AGENT_VOICE_ENGINES[propId].rebuttal(topicSnippet),
    timestamp: timeStr,
  });

  // Round 9: 务实派切中现实痛点交叉质询
  speeches.push({
    id: `dyn_9`,
    agentId: pragId,
    agentName: pragProfile.name,
    phase: "rebuttal",
    content: AGENT_VOICE_ENGINES[pragId].rebuttal(topicSnippet),
    timestamp: timeStr,
  });

  // Round 10: 第二次戏剧性全屏爆发【异议あり！严正反对】（第四委员怒砸席位）
  speeches.push({
    id: `dyn_10`,
    agentId: fourthId,
    agentName: fourthProfile.name,
    phase: "interjection",
    targetAgentId: propId,
    interrupted: true,
    content: AGENT_VOICE_ENGINES[fourthId].objection(propProfile.name, topicSnippet),
    timestamp: timeStr,
  });

  // Round 11: 防守派深度质询
  speeches.push({
    id: `dyn_11`,
    agentId: oppId,
    agentName: oppProfile.name,
    phase: "rebuttal",
    content: AGENT_VOICE_ENGINES[oppId].rebuttal(topicSnippet),
    timestamp: timeStr,
  });

  // Round 12: 未来的你 (future) 穿透时空的降维清醒开解
  speeches.push({
    id: `dyn_12`,
    agentId: "future",
    agentName: "未来的你",
    phase: "rebuttal",
    content: AGENT_VOICE_ENGINES.future.rebuttal(topicSnippet),
    timestamp: timeStr,
  });

  // Round 13: 双方僵持不下，提出建设性妥协折中案
  speeches.push({
    id: `dyn_13`,
    agentId: propId,
    agentName: propProfile.name,
    phase: "rebuttal",
    content: AGENT_VOICE_ENGINES[propId].compromise(topicSnippet),
    timestamp: timeStr,
  });

  // Round 14: 防守派列入苛刻风控附款，有条件同意
  speeches.push({
    id: `dyn_14`,
    agentId: oppId,
    agentName: oppProfile.name,
    phase: "rebuttal",
    content: AGENT_VOICE_ENGINES[oppId].acceptance(),
    timestamp: timeStr,
  });

  // Round 15: 辅助监督委员签署防违规条款
  speeches.push({
    id: `dyn_15`,
    agentId: fourthId,
    agentName: fourthProfile.name,
    phase: "rebuttal",
    content: AGENT_VOICE_ENGINES[fourthId].acceptance(),
    timestamp: timeStr,
  });

  // Round 16: 主审官重槌落定，终结法庭辩论，全体起立进入法定表决
  speeches.push({
    id: `dyn_16`,
    agentId: "chairman",
    agentName: "委员会主任",
    phase: "chairman",
    content: `【庄严敲响法槌】全案争论焦点已充分显露！各常设司局之风控红线与核心诉求皆已当庭核实入卷。吵吵闹闹不能解决问题，唯有规则方能定分止争。本庭宣布：本案法庭辩论正式终结！全体起立，法槌已举起，请立刻进入法定全员表决程序！`,
    timestamp: timeStr,
  });

  const plans: ProposalPlan[] = [
    {
      id: "A",
      title: "克制防守方案：暂缓推进，先保底线",
      desc: "维持理性秩序与规律作息，给自己24小时冷静缓冲区，规避一切次生灾害。",
      supporterAgents: ([oppId, "sleep"] as AgentId[]).filter((v, i, a): v is AgentId => a.indexOf(v) === i),
      compromiseNotes: "风险归零，但可能会留有一丝犹豫与遗憾。",
    },
    {
      id: "B",
      title: "有限推进折中案：明确界限，小步快跑",
      desc: "允许适度参与推进，但严格划定时间、精力与财务止损线，超标立刻无条件撤退。",
      supporterAgents: (["future", pragId, propId] as AgentId[]).filter((v, i, a): v is AgentId => a.indexOf(v) === i),
      compromiseNotes: "中庸之道，兼顾体验与现实责任。",
    },
    {
      id: "C",
      title: "彻底放飞自我，后果日后再说",
      desc: "全凭第一直觉梭哈，先爽了再说。",
      supporterAgents: [propId],
      compromiseNotes: "高刺激高风险，大概率招致后续清算。",
    },
  ];

  const votes: AgentVote[] = summoned.map((aid) => {
    const prof = AGENT_PROFILES[aid];
    let planId: "A" | "B" | "C" = "B";
    if (aid === "sleep" || aid === "gpa") planId = "A";
    else if (aid === "happiness") planId = "B";
    const voiceEngine = AGENT_VOICE_ENGINES[aid];
    const reason = voiceEngine
      ? voiceEngine.voteReason(planId, plans[1].title)
      : `从${prof?.roleTitle || "部门"}利益考量，此方案最有利于平衡全局风险。`;

    return {
      agentId: aid,
      agentName: prof ? prof.name : aid,
      planId,
      reason,
    };
  });

  const resolution: CouncilResolution = {
    caseNumber: caseNum,
    title: `关于“${customInput.slice(0, 24)}...”特别研判之审议令`,
    urgency,
    winningPlan: plans[1],
    voteScore: {
      planA: votes.filter((v) => v.planId === "A").length,
      planB: votes.filter((v) => v.planId === "B").length,
      planC: votes.filter((v) => v.planId === "C").length,
    },
    votes,
    stipulations: [
      "第一条：当事人批准执行B方案（有限度推进），但必须在开始前设置手机倒计时或行程强提醒；",
      "第二条：若进展未达预期，必须即刻止损，严禁无休止复盘与精神自我惩罚；",
      "第三条：由“未来的你”行使监督权，禁止当事人在今晚再次就同一议题召开脑内会议。",
    ],
    supervisingAgent: "future",
    stampDate: formatResolutionDate(),
    appealCount: 0,
    nextAction: "先执行B方案的第一步，并立即设置一个明确的停止时间。",
    actionWindow: "今天内完成第一步",
    confidence: 68,
    assumptions: ["当前没有新的关键事实改变风险判断", "执行时遵守预先设定的停止条件"],
  };

  return {
    caseNumber: caseNum,
    topicTitle: `关于“${customInput}”的紧急研判会议`,
    category,
    urgency,
    keyConflict: "短期即时体验渴望 与 现实理性秩序之间的权力拉扯",
    summonedAgentIds: summoned,
    speeches,
    plans,
    votes,
    resolution,
    appealScript: {
      newAgentId: "love",
      emergencySpeeches: [
        {
          id: "ap_dyn_1",
          agentId: "love",
          agentName: "恋爱委员",
          phase: "opening",
          content: "【二审重大异议·手捧粉红案卷空降】案情性质已发生根本逆转！当事人提交了关键情感证据，这不是普通琐事，这是关乎大学四年能否脱单的高维战略破冰！我提议立即重审！",
          timestamp: timeStr,
        },
        {
          id: "ap_dyn_2",
          agentId: "dignity",
          agentName: "尊严委员",
          phase: "rebuttal",
          content: "【冷哼抱臂】慢着！二审也不能把傲骨扔在地上让人踩！哪怕重审，也必须设立防小丑条款，绝不允许卑微倒贴！",
          timestamp: timeStr,
        },
        {
          id: "ap_dyn_3",
          agentId: "gpa",
          agentName: "GPA委员·椎名学委",
          phase: "rebuttal",
          content: "【推眼镜】……虽然荒谬，但若恋爱委将此案计入年度重大情势变更，本席同意在及格线兜底的前提下重议附款。",
          timestamp: timeStr,
        },
      ],
      amendedResolution: {
        ...resolution,
        caseNumber: `${caseNum.replace("号", "")}-二审特批号〕`,
        title: `关于结合新证据改判“${customInput.slice(0, 16)}”之二审特别决议`,
        stipulations: [
          "第一条：因重大新证据加入，特批当事人放手一搏，但必须做好心理防摔准备；",
          "第二条：无论成败，三天内禁止在社交平台深夜发布伤感小作文；",
          "第三条：恋爱委员与尊严委员组成联合督导小组，随时准备介入止损。",
        ],
        appealCount: 1,
        newEvidence: "当事人提交了足以动摇原判之新事实证据",
      },
    },
  };
}

// 核心增强：根据玩家实时输入的具体措辞与召唤委员，动态生成各具人格特色的答辩
export function generateInterrogationResponse(
  userQuery: string,
  topicTitle: string,
  summonedAgents: AgentId[]
): CouncilSpeech[] {
  const query = userQuery.toLowerCase();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const results: CouncilSpeech[] = [];

  // 主审官控场指令
  results.push({
    id: `chair_resp_${Date.now()}`,
    agentId: "chairman",
    agentName: "主审官",
    phase: "chairman",
    content: AGENT_VOICE_ENGINES.chairman.interrogationReply(userQuery, topicTitle),
    timestamp: timeStr,
  });

  // 挑选 4 位最具代表性的委员进行答辩
  const pool: AgentId[] = [];
  if (query.includes("吃") || query.includes("饿") || query.includes("夜宵") || query.includes("炸鸡")) {
    pool.push("stomach", "happiness", "wallet", "dignity");
  } else if (query.includes("钱") || query.includes("买") || query.includes("贵") || query.includes("花呗")) {
    pool.push("wallet", "happiness", "dignity", "future");
  } else if (query.includes("回") || query.includes("她") || query.includes("他") || query.includes("喜欢") || query.includes("聊天")) {
    pool.push("love", "dignity", "social", "future");
  } else if (query.includes("卷") || query.includes("保研") || query.includes("竞赛") || query.includes("部长")) {
    pool.push("ambition", "gpa", "sleep", "future");
  } else if (query.includes("咖啡") || query.includes("醒") || query.includes("闹钟") || query.includes("睡")) {
    pool.push("sleep", "gpa", "happiness", "future");
  } else if (query.includes("赢") || query.includes("连胜") || query.includes("开黑") || query.includes("打瓦")) {
    pool.push("happiness", "sleep", "social", "gpa");
  } else {
    // 依据召唤列表自适应选取 4 位委员
    for (const a of summonedAgents) {
      if (a !== "chairman" && !pool.includes(a)) {
        pool.push(a);
      }
    }
    const defaultFallbacks: AgentId[] = ["future", "gpa", "sleep", "happiness", "wallet", "social", "dignity"];
    for (const d of defaultFallbacks) {
      if (pool.length < 4 && !pool.includes(d)) {
        pool.push(d);
      }
    }
  }

  const selectedFour = pool.slice(0, 4);

  selectedFour.forEach((agentId, index) => {
    const prof = AGENT_PROFILES[agentId];
    const engine = AGENT_VOICE_ENGINES[agentId];
    const isObjection = index === 1 || index === 2;

    results.push({
      id: `resp_${agentId}_${Date.now()}_${index}`,
      agentId,
      agentName: prof ? prof.name : agentId,
      phase: isObjection ? "interjection" : "user_response",
      replyToUser: true,
      interrupted: isObjection,
      content: engine
        ? engine.interrogationReply(userQuery, topicTitle)
        : `【当庭抗辩】针对当事人提出的“${userQuery.slice(0, 15)}”，本司坚决要求以大局利益为重！`,
      timestamp: timeStr,
    });
  });

  return results;
}

// 动态注入真实时区与当下时间的剧本增强函数
export function getRealtimeScript(topicId: string, customQuestion?: string): CouncilMeetingScript {
  const base = PRESET_SCRIPTS[topicId] || generateProceduralCouncil(customQuestion || "明天早八，纠结翘不翘课");
  const now = new Date();
  const timeContext = getRealtimeTimePrompt();
  const caseNumber = createCaseNumber(now);

  // 动态重整时间戳
  const speeches = base.speeches.map((sp, idx) => {
    const sDate = new Date(now.getTime() - (base.speeches.length - idx) * 3500);
    const sTimeStr = `${String(sDate.getHours()).padStart(2, "0")}:${String(sDate.getMinutes()).padStart(2, "0")}:${String(sDate.getSeconds()).padStart(2, "0")}`;
    return {
      ...sp,
      timestamp: sTimeStr,
    };
  });

  return {
    ...base,
    caseNumber,
    keyConflict: `${base.keyConflict}（当前时间参考：${timeContext}）`,
    speeches,
    resolution: {
      ...base.resolution,
      caseNumber,
      stampDate: formatResolutionDate(now),
      appealCount: base.resolution.appealCount || 0,
    },
    appealScript: base.appealScript
      ? {
          ...base.appealScript,
          amendedResolution: {
            ...base.appealScript.amendedResolution,
            caseNumber: `${caseNumber}-二审特批号`,
            stampDate: formatResolutionDate(now),
          },
        }
      : undefined,
  };
}
