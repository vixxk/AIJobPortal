import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, Trophy, PlayCircle, Plus } from 'lucide-react';

const MockTestsList = () => {
    const { user } = useAuth();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // We assume backend has a public mock tests endpoint
    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await axios.get('/mocktests');
                if (res.data.success) {
                    setTests(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch mock tests", error);
                setError("Failed to fetch mock tests. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    const isAdmin = user?.role === 'SUPER_ADMIN';

    if (loading) {
        return <div className="p-10 text-center animate-pulse">Loading assessments...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">!</span>
                </div>
                <p className="text-slate-700 font-medium mb-2">Oops!</p>
                <p className="text-slate-500">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Mock Assessments</h1>
                        <p className="text-slate-500 mt-1">Test your skills under timed conditions and compete on leaderboards.</p>
                    </div>
                </div>

                {isAdmin && (
                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                        <Plus className="w-5 h-5" /> Create Test
                    </button>
                )}
            </div>

            {tests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
                    <Trophy className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">No Tests Available</h3>
                    <p className="text-slate-500">Check back later for new skill assessments.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map(test => (
                        <div key={test._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                            <div className="p-6 pb-5 flex-1 border-b border-slate-100">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{test.title}</h3>
                                    <span className="bg-blue-50 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shrink-0 border border-blue-100">
                                        {test.difficulty || 'Medium'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                    {test.description || 'Test your proficiency with standardized questions and timed constraints to prepare for technical rounds.'}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-indigo-500" /> {test.durationMinutes} Mins
                                    </div>
                                    <div className="w-px h-4 bg-slate-300"></div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {test.totalMarks} Points
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50/50 flex gap-3">
                                <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <PlayCircle className="w-4 h-4" /> Attempt Now
                                </button>
                                <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <Trophy className="w-4 h-4" /> Ranks
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MockTestsList;
