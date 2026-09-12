export type AgentId = 
  | "gpa" 
  | "sleep" 
  | "happiness" 
  | "wallet" 
  | "social" 
  | "ambition" 
  | "future"
  | "love"       // 特派委员：恋爱
  | "dignity"    // 特派委员：尊严
  | "stomach"    // 特派委员：胃部
  | "chairman";  // 主席

export interface AgentProfile {
  id: AgentId;
  name: string;
  roleTitle: string;
  avatar: string;
  emoji: string;
  color: string;
  bgGlow: string;
  borderColor: string;
  badge: string;
  objective: string;
  personality: string;
  partyName: string;
  powerPercent: number;
}

export type MeetingPhase = 
  | "idle"
  | "analyzing"
  | "opening"       // Phase 1: 独立陈述
  | "rebuttal"      // Phase 2: 交叉互怼与抢话
  | "deliberation"  // Phase 3: 方案形成与表决
  | "verdict"       // 决议宣读与盖章
  | "appeal"        // 二审重审中
  | "finished";

export interface CouncilSpeech {
  id: string;
  agentId: AgentId;
  agentName: string;
  phase: "opening" | "rebuttal" | "interjection" | "chairman" | "user_response";
  content: string;
  thinking?: string; // 深度思考推演链 (潜意识算盘 / 利益函数量化)
  targetAgentId?: AgentId;
  interrupted?: boolean;
  timestamp: string;
  replyToUser?: boolean;
}

export interface ProposalPlan {
  id: "A" | "B" | "C";
  title: string;
  desc: string;
  supporterAgents: AgentId[];
  compromiseNotes: string;
}

export interface AgentVote {
  agentId: AgentId;
  agentName: string;
  planId: "A" | "B" | "C";
  reason: string;
  thinking?: string;
}

export interface CouncilResolution {
  caseNumber: string;
  title: string;
  urgency: "紧急" | "特急" | "常规";
  winningPlan: ProposalPlan;
  voteScore: {
    planA: number;
    planB: number;
    planC: number;
  };
  votes: AgentVote[];
  stipulations: string[]; // 具体强制执行条例
  supervisingAgent: AgentId;
  stampDate: string;
  appealCount: number;
  newEvidence?: string;
}

export interface PresetTopic {
  id: string;
  category: "学业与娱乐" | "情感社交" | "考试作息" | "人生规划";
  title: string;
  question: string;
  timeTag: string;
  urgency: "特急" | "紧急" | "常规";
  summonedAgents: AgentId[];
  accentColor: string;
  teaser: string;
}

export interface UserEcologyProfile {
  codename: string;
  grade: string;
  majorType: string;
  primaryAnxiety: "gpa" | "sleep" | "wallet" | "love" | "ambition" | "social";
  rulingParty: string;
  powerMap: Record<AgentId, number>;
  calibratedAt: string;
}
