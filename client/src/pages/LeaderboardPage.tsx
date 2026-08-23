import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '@/api';
import type { LeaderboardEntry, WardLeaderboardEntry } from '@/types';
import { Award, Trophy, Medal, MapPin, Flame } from 'lucide-react';
import { LEVEL_CONFIG } from '@/utils/constants';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'city' | 'ward'>('city');
  const [cityRankings, setCityRankings] = useState<LeaderboardEntry[]>([]);
  const [wardRankings, setWardRankings] = useState<WardLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboards() {
      try {
        const [cityData, wardData] = await Promise.all([
          leaderboardAPI.getCity(),
          leaderboardAPI.getWard(),
        ]);
        setCityRankings(cityData || []);
        setWardRankings(wardData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboards();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-warning to-accent mx-auto flex items-center justify-center shadow-xl shadow-warning/20 mb-3">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary">EcoScore Rankings</h1>
        <p className="text-xs text-text-muted mt-1">
          Top citizen contributors driving Puducherry urban decision support
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-primary/20">
        <button
          onClick={() => setActiveTab('city')}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'city'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Award size={16} /> City-Wide Citizen Rankings
        </button>

        <button
          onClick={() => setActiveTab('ward')}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ward'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <MapPin size={16} /> Ward Challenge Standings
        </button>
      </div>

      {/* City Rankings */}
      {activeTab === 'city' && (
        <div className="card p-0 overflow-hidden shadow-xl">
          <div className="divide-y divide-primary/10">
            {cityRankings.map((user) => {
              const levelCfg = LEVEL_CONFIG[user.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.NEWCOMER;
              return (
                <div
                  key={user.id}
                  className="p-4 flex items-center justify-between hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-extrabold text-sm">
                      {user.rank === 1 ? (
                        <span className="text-yellow-400 text-lg">🥇</span>
                      ) : user.rank === 2 ? (
                        <span className="text-gray-300 text-lg">🥈</span>
                      ) : user.rank === 3 ? (
                        <span className="text-amber-600 text-lg">🥉</span>
                      ) : (
                        <span className="text-text-muted">#{user.rank}</span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent">
                      {user.name.charAt(0)}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-text-primary">{user.name}</h4>
                      <span className="text-[11px] text-text-muted">
                        {user.ward} Ward • {levelCfg.icon} {user.level}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-accent block">{user.eco_score}</span>
                    <span className="text-[10px] text-text-muted">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ward Challenge Standings */}
      {activeTab === 'ward' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {wardRankings.map((ward) => (
            <div key={ward.ward} className="card p-5 border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold text-lg">
                  #{ward.rank}
                </div>
                <div>
                  <h4 className="font-extrabold text-text-primary text-base">{ward.ward} Ward</h4>
                  <span className="text-xs text-text-muted">{ward.citizen_count} Active Citizen Reporters</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-accent block">{ward.total_score}</span>
                <span className="text-[10px] text-text-muted">total pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
