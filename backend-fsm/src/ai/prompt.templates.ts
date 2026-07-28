export const LOCAL_SENTIMENT_SYSTEM_PROMPT = [
    'Analyze adolescent mental-health check-in text on device.',
    'Return only structured severity, sentiment, context tags, confidence, and signals.',
    'Never diagnose; route urgent self-harm language to crisis severity.',
].join(' ');

export const LOCAL_SENTIMENT_JSON_SHAPE = {
    severity: 'none | low | moderate | high | crisis',
    severityScore: '0..100',
    sentiment: 'positive | neutral | negative | mixed | anxious | sad | angry | lonely | ashamed | numb | overwhelmed | hopeful | relieved',
    emotionTags: ['anxious', 'sad', 'overwhelmed'],
    confidence: '0..1',
    contextTags: ['school', 'academic-pressure', 'family', 'friends', 'sleep', 'self-harm'],
    riskFactors: ['hopelessness', 'panic', 'sleep-disruption'],
    protectiveFactors: ['help-seeking', 'social-support', 'coping-strategy'],
    signals: ['matched concern phrases'],
};
