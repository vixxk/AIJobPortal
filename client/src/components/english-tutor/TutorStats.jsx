import React from 'react';

const StatCard = ({ label, value, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-3 md:gap-4 text-center group hover:border-indigo-200 transition-all"
    >
        <div className="w-full">
            <span className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">{value}%</span>
            <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 md:mt-1">{label}</p>
        </div>
        <div className="w-full bg-slate-100 h-1 md:h-1.5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className={`h-full bg-indigo-600 rounded-full`}
            />
        </div>
    </motion.div>
);

const TutorStats = ({ stats, errorTracking }) => {
    return (
        <div className="space-y-4 md:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Fluency" value={stats?.overallFluency || 0} delay={0.1} />
                <StatCard label="Grammar" value={stats?.overallGrammar || 0} delay={0.2} />
                <StatCard label="Vocab" value={stats?.overallVocab || 0} delay={0.3} />
                <StatCard label="Pronun." value={stats?.overallPronunciation || 0} delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4 md:mb-8">
                        <h2 className="text-base md:text-xl font-bold text-slate-900">Skill Proficiency</h2>
                        <div className="px-2 py-0.5 bg-amber-50 rounded-full text-amber-600 text-[8px] md:text-[10px] font-bold uppercase border border-amber-100">Target</div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        {[
                            { label: 'Grammar Nuance', val: errorTracking?.GRAMMAR_TENSE || 0, desc: 'Working on tenses' },
                            { label: 'Phonetic Accuracy', val: errorTracking?.PRONUNCIATION_PHONEME || 0, desc: 'Focus on phonemes' },
                            { label: 'Conversational Flow', val: errorTracking?.FLUENCY_PAUSE || 0, desc: 'Managing pauses' },
                        ].map((err, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-end mb-1 md:mb-2">
                                    <div>
                                        <p className="text-[11px] md:text-sm font-bold text-slate-800 uppercase tracking-tight">{err.label}</p>
                                        <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1">{err.desc}</p>
                                    </div>
                                    <span className="text-[9px] md:text-xs font-bold text-slate-600 truncate ml-2">{err.val} Indicators</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, err.val * 20)}%` }}
                                        className="h-full bg-indigo-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 border border-slate-200 shadow-sm flex flex-col"
                >
                    <h2 className="text-base md:text-xl font-bold text-slate-900 mb-4 md:mb-8">Feedback</h2>

                    <div className="flex-1 space-y-3 md:space-y-4">
                        {errorTracking?.frequent_mistakes?.length > 0 ? (
                            errorTracking.frequent_mistakes.map((mistake, i) => (
                                <div key={i} className="flex gap-3 p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] md:text-xs">💡</div>
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-slate-700 leading-snug">{mistake}</p>
                                        <p className="text-[8px] md:text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Suggested Focus</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-6 md:p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs md:text-slate-500 font-bold uppercase tracking-widest">Ready for Assessment</p>
                                <p className="text-[9px] md:text-xs text-slate-400 mt-1 leading-tight">Complete sessions for detailed analysis.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TutorStats;
