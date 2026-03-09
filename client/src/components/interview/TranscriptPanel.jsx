import React from 'react';
const TranscriptPanel = ({ transcript, analysis, evaluation }) => {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in my-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Your Answer</h3>
                <p className="text-gray-700 italic text-lg leading-relaxed">"{transcript || 'No transcript available'}"</p>
                {analysis && (
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-medium">
                        <div className="bg-gray-50 p-3 rounded flex flex-col items-center">
                            <span className="text-gray-500">Fillers</span>
                            <span className="text-xl text-orange-500">{analysis.filler_count}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded flex flex-col items-center">
                            <span className="text-gray-500">Speech Rate</span>
                            <span className="text-xl text-blue-500">{analysis.speech_rate.toFixed(1)} <span className="text-xs">wpm</span></span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded flex flex-col items-center">
                            <span className="text-gray-500">Pitch Stability</span>
                            <span className="text-xl text-purple-500">{analysis.pitch_stability.toFixed(1)}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded flex flex-col items-center">
                            <span className="text-gray-500">Pause Ratio</span>
                            <span className="text-xl text-green-500">{(analysis.pause_ratio * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                )}
            </div>
            {evaluation && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-indigo-100 transition duration-300">
                    <h3 className="text-xl font-extrabold text-indigo-900 mb-4 flex items-center justify-between">
                        AI Evaluation
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white text-indigo-700 rounded-full shadow-sm text-sm">
                                Score: {evaluation.answer_score}/100
                            </span>
                            <span className="px-3 py-1 bg-white text-blue-700 rounded-full shadow-sm text-sm">
                                Comm: {evaluation.communication_score}/100
                            </span>
                        </div>
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-green-700 font-bold mb-1 flex items-center gap-1">✅ Strengths</h4>
                            <ul className="list-disc pl-5 text-gray-700 text-sm">
                                {evaluation.strengths?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-red-600 font-bold mb-1 flex items-center gap-1">❌ Weaknesses</h4>
                            <ul className="list-disc pl-5 text-gray-700 text-sm">
                                {evaluation.weaknesses?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                            <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-1">💡 Suggestions</h4>
                            <ul className="list-disc pl-5 text-gray-800 text-sm">
                                {evaluation.suggestions?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TranscriptPanel;
