export type SeverityLevel = 'none' | 'low' | 'moderate' | 'high' | 'crisis';
export type SentimentLabel =
    | 'positive'
    | 'neutral'
    | 'negative'
    | 'mixed'
    | 'anxious'
    | 'sad'
    | 'angry'
    | 'lonely'
    | 'ashamed'
    | 'numb'
    | 'overwhelmed'
    | 'hopeful'
    | 'relieved';

export type ContextTag =
    | 'school'
    | 'academic-pressure'
    | 'family'
    | 'friends'
    | 'romantic-relationship'
    | 'bullying'
    | 'identity'
    | 'body-image'
    | 'social-media'
    | 'sleep'
    | 'physical-health'
    | 'work'
    | 'money'
    | 'substance-use'
    | 'grief'
    | 'trauma'
    | 'loneliness'
    | 'self-harm'
    | 'safety'
    | 'coping'
    | 'daily-life';

export type RiskFactor =
    | 'self-harm-ideation'
    | 'self-harm-reference'
    | 'hopelessness'
    | 'panic'
    | 'isolation'
    | 'overwhelm'
    | 'sleep-disruption'
    | 'bullying-or-threat'
    | 'substance-use'
    | 'trauma-reference';

export type ProtectiveFactor =
    | 'help-seeking'
    | 'future-orientation'
    | 'social-support'
    | 'coping-strategy'
    | 'positive-mood'
    | 'calming-down';

export interface LocalTextAnalysis {
    severity: SeverityLevel;
    severityScore: number;
    sentiment: SentimentLabel;
    emotionTags: SentimentLabel[];
    confidence: number;
    contextTags: ContextTag[];
    riskFactors: RiskFactor[];
    protectiveFactors: ProtectiveFactor[];
    signals: string[];
    normalizedTextLength: number;
}

export interface AnalyzeUserInputOptions {
    mood?: string | null;
}

interface WeightedPattern {
    pattern: RegExp;
    weight: number;
    signal: string;
    emotions?: SentimentLabel[];
    tags?: ContextTag[];
    riskFactors?: RiskFactor[];
    protectiveFactors?: ProtectiveFactor[];
}

const CRISIS_PATTERNS: WeightedPattern[] = [
    {
        pattern: /\b(kill myself|end my life|suicide|suicidal|want to die|wish i was dead|can't go on)\b/i,
        weight: 100,
        signal: 'direct self-harm or death ideation',
        emotions: ['sad', 'numb'],
        tags: ['self-harm', 'safety'],
        riskFactors: ['self-harm-ideation'],
    },
];

const CONCERN_PATTERNS: WeightedPattern[] = [
    {
        pattern: /\b(self harm|hurt myself|cut myself|harm myself)\b/i,
        weight: 48,
        signal: 'self-harm reference',
        emotions: ['sad', 'numb'],
        tags: ['self-harm', 'safety'],
        riskFactors: ['self-harm-reference'],
    },
    {
        pattern: /\b(hopeless|worthless|empty|nothing matters|no point)\b/i,
        weight: 32,
        signal: 'hopelessness language',
        emotions: ['sad', 'numb'],
        tags: ['loneliness'],
        riskFactors: ['hopelessness'],
    },
    {
        pattern: /\b(panic attack|can't breathe|cannot breathe|heart racing|spiraling)\b/i,
        weight: 32,
        signal: 'panic or acute anxiety language',
        emotions: ['anxious', 'overwhelmed'],
        tags: ['physical-health'],
        riskFactors: ['panic'],
    },
    {
        pattern: /\b(overwhelmed|overwhelming|burned out|burnt out|breaking down|too much)\b/i,
        weight: 24,
        signal: 'overwhelm language',
        emotions: ['overwhelmed', 'anxious'],
        tags: ['coping'],
        riskFactors: ['overwhelm'],
    },
    {
        pattern: /\b(anxious|anxiety|scared|afraid|worried|nervous)\b/i,
        weight: 18,
        signal: 'anxiety language',
        emotions: ['anxious'],
        riskFactors: ['overwhelm'],
    },
    {
        pattern: /\b(depressed|sad|crying|lonely|alone|isolated)\b/i,
        weight: 18,
        signal: 'low mood or isolation language',
        emotions: ['sad', 'lonely'],
        tags: ['loneliness'],
        riskFactors: ['isolation'],
    },
    {
        pattern: /\b(angry|mad|furious|rage|hate everyone)\b/i,
        weight: 16,
        signal: 'anger language',
        emotions: ['angry'],
    },
    {
        pattern: /\b(ashamed|embarrassed|guilty|hate myself)\b/i,
        weight: 20,
        signal: 'shame language',
        emotions: ['ashamed'],
    },
    {
        pattern: /\b(numb|empty|feel nothing|disconnected)\b/i,
        weight: 22,
        signal: 'emotional numbness language',
        emotions: ['numb'],
        riskFactors: ['isolation'],
    },
];

const CONTEXT_PATTERNS: WeightedPattern[] = [
    { pattern: /\b(school|class|teacher|college|university)\b/i, weight: 0, signal: 'school context', tags: ['school'] },
    { pattern: /\b(exam|test|grade|homework|assignment|study|grades)\b/i, weight: 4, signal: 'academic pressure context', tags: ['academic-pressure', 'school'] },
    { pattern: /\b(parent|mom|dad|family|sibling|brother|sister)\b/i, weight: 0, signal: 'family context', tags: ['family'] },
    { pattern: /\b(friend|friends|best friend|group chat)\b/i, weight: 0, signal: 'friend context', tags: ['friends'] },
    { pattern: /\b(relationship|breakup|dating|crush|partner|boyfriend|girlfriend)\b/i, weight: 2, signal: 'romantic relationship context', tags: ['romantic-relationship'] },
    { pattern: /\b(bullied|bullying|threatened|harassed|picked on)\b/i, weight: 28, signal: 'bullying or threat context', tags: ['bullying', 'safety'], riskFactors: ['bullying-or-threat'] },
    { pattern: /\b(identity|gender|sexuality|coming out|pronouns)\b/i, weight: 0, signal: 'identity context', tags: ['identity'] },
    { pattern: /\b(body|weight|ugly|appearance|eating)\b/i, weight: 8, signal: 'body image context', tags: ['body-image'] },
    { pattern: /\b(instagram|tiktok|snapchat|social media|posted|online)\b/i, weight: 2, signal: 'social media context', tags: ['social-media'] },
    { pattern: /\b(sleep|insomnia|nightmare|tired|exhausted)\b/i, weight: 10, signal: 'sleep disruption context', tags: ['sleep'], riskFactors: ['sleep-disruption'] },
    { pattern: /\b(sick|pain|headache|stomach|period|doctor)\b/i, weight: 2, signal: 'physical health context', tags: ['physical-health'] },
    { pattern: /\b(job|work|shift|boss|coworker)\b/i, weight: 0, signal: 'work context', tags: ['work'] },
    { pattern: /\b(money|rent|bills|debt|financial)\b/i, weight: 4, signal: 'money stress context', tags: ['money'] },
    { pattern: /\b(drunk|alcohol|weed|drugs|substance)\b/i, weight: 16, signal: 'substance use context', tags: ['substance-use'], riskFactors: ['substance-use'] },
    { pattern: /\b(grief|grieving|died|passed away|loss)\b/i, weight: 12, signal: 'grief context', tags: ['grief'] },
    { pattern: /\b(trauma|flashback|abuse|assault)\b/i, weight: 24, signal: 'trauma reference', tags: ['trauma', 'safety'], riskFactors: ['trauma-reference'] },
];

const PROTECTIVE_PATTERNS: WeightedPattern[] = [
    { pattern: /\b(help|talk to someone|therapist|counselor|hotline|support)\b/i, weight: -8, signal: 'help-seeking language', protectiveFactors: ['help-seeking', 'social-support'] },
    { pattern: /\b(tomorrow|future|plan|goal|looking forward)\b/i, weight: -6, signal: 'future-oriented language', protectiveFactors: ['future-orientation'] },
    { pattern: /\b(friend helped|mom helped|dad helped|teacher helped|someone checked on me)\b/i, weight: -8, signal: 'social support language', protectiveFactors: ['social-support'] },
    { pattern: /\b(breathing|walk|journal|music|coping|meditation)\b/i, weight: -6, signal: 'coping strategy language', tags: ['coping'], protectiveFactors: ['coping-strategy'] },
    { pattern: /\b(good|great|happy|grateful|proud|hopeful)\b/i, weight: -4, signal: 'positive mood language', emotions: ['hopeful'], protectiveFactors: ['positive-mood'] },
    { pattern: /\b(better|calm|calmer|relieved|okay now|ok now)\b/i, weight: -4, signal: 'calming down language', emotions: ['relieved'], protectiveFactors: ['calming-down'] },
];

const HIGH_RISK_MOODS = new Set(['terrible', 'awful', 'bad', 'sad', 'anxious', 'angry', 'overwhelmed', 'numb']);

export function analyzeUserInputText(
    input: string,
    options: AnalyzeUserInputOptions = {},
): LocalTextAnalysis {
    const normalized = input.trim().replace(/\s+/g, ' ');
    const signals: string[] = [];
    const emotionTags = new Set<SentimentLabel>();
    const contextTags = new Set<ContextTag>();
    const riskFactors = new Set<RiskFactor>();
    const protectiveFactors = new Set<ProtectiveFactor>();
    let score = 0;

    for (const candidate of [...CRISIS_PATTERNS, ...CONCERN_PATTERNS, ...CONTEXT_PATTERNS, ...PROTECTIVE_PATTERNS]) {
        if (candidate.pattern.test(normalized)) {
            score += candidate.weight;
            signals.push(candidate.signal);
            addAll(emotionTags, candidate.emotions);
            addAll(contextTags, candidate.tags);
            addAll(riskFactors, candidate.riskFactors);
            addAll(protectiveFactors, candidate.protectiveFactors);
        }
    }

    if (options.mood && HIGH_RISK_MOODS.has(options.mood.toLowerCase())) {
        score += 10;
        signals.push('high-risk mood selection');
    }

    const severityScore = clamp(score, 0, 100);
    const severity = severityFromScore(severityScore, riskFactors);
    const sentiment = primarySentiment(emotionTags, severity, protectiveFactors);
    const confidence = confidenceFromSignals(signals.length, normalized.length, severity);

    return {
        severity,
        severityScore,
        sentiment,
        emotionTags: [...emotionTags],
        confidence,
        contextTags: [...contextTags],
        riskFactors: [...riskFactors],
        protectiveFactors: [...protectiveFactors],
        signals,
        normalizedTextLength: normalized.length,
    };
}

export const analyzeUserInput = analyzeUserInputText;

function addAll<T>(target: Set<T>, values: T[] | undefined): void {
    for (const value of values ?? []) {
        target.add(value);
    }
}

function severityFromScore(score: number, riskFactors: Set<RiskFactor>): SeverityLevel {
    if (riskFactors.has('self-harm-ideation') || score >= 100) return 'crisis';
    if (score >= 60) return 'high';
    if (score >= 28) return 'moderate';
    if (score > 0) return 'low';
    return 'none';
}

function primarySentiment(
    emotions: Set<SentimentLabel>,
    severity: SeverityLevel,
    protectiveFactors: Set<ProtectiveFactor>,
): SentimentLabel {
    const ordered: SentimentLabel[] = ['overwhelmed', 'anxious', 'sad', 'lonely', 'angry', 'ashamed', 'numb', 'relieved', 'hopeful'];
    const found = ordered.find((emotion) => emotions.has(emotion));

    if (found && protectiveFactors.size > 0) return 'mixed';
    if (found) return found;
    if (protectiveFactors.has('positive-mood')) return 'positive';
    if (protectiveFactors.has('calming-down')) return 'relieved';
    if (severity === 'high' || severity === 'crisis') return 'negative';
    return 'neutral';
}

function confidenceFromSignals(signalCount: number, textLength: number, severity: SeverityLevel): number {
    if (textLength === 0) return 0.2;
    const severityBoost = severity === 'crisis' ? 0.35 : severity === 'high' ? 0.25 : severity === 'moderate' ? 0.15 : 0.08;
    const signalBoost = Math.min(signalCount * 0.09, 0.45);
    const lengthBoost = Math.min(textLength / 500, 0.18);
    return Math.min(Number((0.22 + severityBoost + signalBoost + lengthBoost).toFixed(2)), 0.95);
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
