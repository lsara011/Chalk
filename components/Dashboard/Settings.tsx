
import React, { useState, useEffect } from 'react';
import { ThemeMode, User, LeagueInfo } from '../../types';

interface SettingsProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onBack: () => void;
  onLogout: () => void;
}

interface LeagueField {
  id: string;
  label: string;
  min?: number;
  max?: number;
  placeholder: string;
}

interface LeagueDefinition {
  id: string;
  name: string;
  fields: LeagueField[];
}

const AVAILABLE_LEAGUES: LeagueDefinition[] = [
  { 
    id: 'apa', 
    name: 'APA', 
    fields: [
      { id: 'apa8', label: '8-Ball SL', min: 2, max: 7, placeholder: '2-7' },
      { id: 'apa9', label: '9-Ball SL', min: 1, max: 9, placeholder: '1-9' }
    ] 
  },
  { 
    id: 'bca', 
    name: 'BCA', 
    fields: [{ id: 'bca_fargo', label: 'FargoRate', min: 1, max: 1000, placeholder: 'e.g. 525' }] 
  },
  { 
    id: 'usapl', 
    name: 'USAPL', 
    fields: [{ id: 'usapl_fargo', label: 'FargoRate', min: 1, max: 1000, placeholder: 'e.g. 480' }] 
  },
  { 
    id: 'vnea', 
    name: 'VNEA', 
    fields: [{ id: 'vnea_sl', label: 'Skill Level', min: 1, max: 10, placeholder: '1-10' }] 
  },
  { 
    id: 'tap', 
    name: 'TAP', 
    fields: [{ id: 'tap_sl', label: 'Rating', min: 2, max: 7, placeholder: '2-7' }] 
  }
];

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, themeMode, onThemeChange, onBack, onLogout }) => {


  const [isInternational, setIsInternational] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);


  const [isEditingLeagues, setIsEditingLeagues] = useState(false);
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>([]);
  const [leagueRatings, setLeagueRatings] = useState<Record<string, string>>({});

  // Parse current location and leagues on mount
  useEffect(() => {
    if (user.location) {
      const parts = user.location.split(', ');
      if (parts.length >= 2) {
        setSelectedCity(parts[0]);
        setSelectedState(parts[1]);
        if (parts[2]) {
          setSelectedCountry(parts[2]);
          setIsInternational(true);
        } else {
          setSelectedCountry('United States');
          setIsInternational(false);
        }
      }
    }

    if (user.leagues) {
      setSelectedLeagueIds(user.leagues.map(l => l.id));
      const initialRatings: Record<string, string> = {};
      user.leagues.forEach(l => {
        const def = AVAILABLE_LEAGUES.find(d => d.id === l.id);
        if (def) {
          def.fields.forEach(f => {
            const match = l.rating.match(new RegExp(`${f.label.split(' ')[0]}: (\\d+)`));
            if (match) initialRatings[f.id] = match[1];
            else if (def.fields.length === 1) initialRatings[f.id] = l.rating;
          });
        }
      });
      setLeagueRatings(initialRatings);
    }
  }, [user]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/positions');
        const data = await res.json();
        if (!data.error) setCountries(data.data.map((c: any) => c.name).sort());
      } catch (e) { console.error(e); }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) return;
      setLoadingLoc(true);
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: selectedCountry })
        });
        const data = await res.json();
        if (!data.error) setStates(data.data.states.map((s: any) => s.name).sort());
      } catch (e) { console.error(e); }
      setLoadingLoc(false);
    };
    fetchStates();
  }, [selectedCountry]);


  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState || !selectedCountry) return;
      setLoadingLoc(true);
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: selectedCountry, state: selectedState })
        });
        const data = await res.json();
        if (!data.error) setCities(data.data.sort());
      } catch (e) { console.error(e); }
      setLoadingLoc(false);
    };
    fetchCities();
  }, [selectedState, selectedCountry]);

  const handleApplyLocation = () => {
    const loc = `${selectedCity}, ${selectedState}${isInternational ? `, ${selectedCountry}` : ''}`;
    onUpdateUser({ location: loc });
  };

  const toggleLeagueSelection = (id: string) => {
    setSelectedLeagueIds(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleRatingChange = (fieldId: string, value: string) => {
    setLeagueRatings(prev => ({ ...prev, [fieldId]: value }));
  };

  const saveLeagues = () => {
    const updatedLeagues: LeagueInfo[] = selectedLeagueIds.map(id => {
      const def = AVAILABLE_LEAGUES.find(l => l.id === id)!;
      const ratingString = def.fields
        .filter(f => leagueRatings[f.id])
        .map(f => `${def.fields.length > 1 ? f.label.split(' ')[0] + ': ' : ''}${leagueRatings[f.id]}`)
        .join(', ');

      return {
        id,
        name: def.name,
        ratingLabel: def.fields.length > 1 ? 'SL' : def.fields[0].label,
        rating: ratingString || '-'
      };
    });
    onUpdateUser({ leagues: updatedLeagues });
    setIsEditingLeagues(false);
  };

  const renderAPASelector = (field: LeagueField) => {
    const options = [];
    for (let i = field.min || 1; i <= (field.max || 9); i++) options.push(i);

    return (
      <div className="w-full">
        <label className="block text-[8px] font-black uppercase tracking-wider text-muted-text dark:text-dark-text-muted mb-1.5">
          {field.label}
        </label>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {options.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleRatingChange(field.id, val.toString())}
              className={`flex-shrink-0 w-8 h-8 rounded-full border-2 font-black text-xs transition-all ${
                leagueRatings[field.id] === val.toString()
                  ? 'bg-chalk-blue border-chalk-blue text-deep-charcoal scale-110'
                  : 'bg-white dark:bg-dark-surface border-soft-gray dark:border-dark-border text-muted-text'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-off-white dark:bg-dark-bg overflow-hidden transition-colors">
      <header className="px-6 py-4 flex items-center gap-4 bg-white dark:bg-dark-surface border-b border-soft-gray dark:border-dark-border flex-shrink-0">
        <button 
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-dark-bg border border-soft-gray dark:border-dark-border flex items-center justify-center text-muted-text dark:text-dark-text-muted hover:text-deep-charcoal dark:hover:text-white transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <h1 className="text-lg font-extrabold text-deep-charcoal dark:text-white tracking-tight">Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
        <div className="space-y-8 pb-10">
          
          {/* Training Profile */}
          <section>
            <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest px-1 mb-3">Training Profile</h3>
            <div className="bg-white dark:bg-dark-surface rounded-[2rem] border border-soft-gray dark:border-dark-border overflow-hidden shadow-sm">
              <div className="p-5 border-b border-soft-gray dark:border-dark-border space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-muted-text dark:text-dark-text-muted uppercase tracking-wider">Location</label>
                  <button onClick={handleApplyLocation} className="text-[9px] font-black text-chalk-blue-dark uppercase tracking-widest bg-chalk-blue/10 px-2 py-1 rounded-md active:scale-95 transition-all">Save</button>
                </div>
                
                {/* Region Tabs */}
                <div className="flex p-1 bg-gray-50 dark:bg-dark-bg rounded-xl border border-soft-gray dark:border-dark-border mb-2">
                  <button 
                    onClick={() => { setIsInternational(false); setSelectedCountry('United States'); }}
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${!isInternational ? 'bg-white dark:bg-dark-surface text-deep-charcoal dark:text-white shadow-sm' : 'text-muted-text'}`}
                  >
                    US
                  </button>
                  <button 
                    onClick={() => { setIsInternational(true); setSelectedCountry(''); }}
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${isInternational ? 'bg-white dark:bg-dark-surface text-deep-charcoal dark:text-white shadow-sm' : 'text-muted-text'}`}
                  >
                    Intl
                  </button>
                </div>

                <div className="space-y-2">
                  {isInternational && (
                    <div className="relative">
                      <select 
                        className="input-field !py-2 !px-4 !text-xs !rounded-xl appearance-none"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                      >
                        <option value="" disabled>Country</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="relative">
                    <select 
                      className="input-field !py-2 !px-4 !text-xs !rounded-xl appearance-none"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      disabled={loadingLoc || !selectedCountry}
                    >
                      <option value="" disabled>{loadingLoc ? 'Loading...' : isInternational ? 'Dept / Province' : 'State'}</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text">
                      <span className="material-symbols-outlined text-xs">map</span>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      list="settings-city-list"
                      className="input-field !py-2 !px-4 !text-xs !rounded-xl"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      placeholder="Search City"
                      disabled={loadingLoc || !selectedState}
                    />
                    <datalist id="settings-city-list">
                      {cities.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center px-1 mb-3">
              <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest">Leagues & Ratings</h3>
              <button 
                onClick={() => isEditingLeagues ? saveLeagues() : setIsEditingLeagues(true)} 
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${isEditingLeagues ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-dark-surface border border-soft-gray dark:border-dark-border text-chalk-blue-dark'}`}
              >
                {isEditingLeagues ? 'Done' : 'Modify'}
              </button>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-[2rem] border border-soft-gray dark:border-dark-border overflow-hidden shadow-sm">
              {!isEditingLeagues ? (
                <div className="p-5 space-y-4">
                  {user.leagues && user.leagues.length > 0 ? (
                    user.leagues.map(l => (
                      <div key={l.id} className="flex justify-between items-center border-b border-soft-gray dark:border-dark-border last:border-0 pb-3 last:pb-0">
                        <div>
                          <div className="text-[11px] font-black text-deep-charcoal dark:text-white uppercase tracking-wider">{l.name}</div>
                          <div className="text-[9px] text-muted-text font-bold">{l.ratingLabel}</div>
                        </div>
                        <div className="text-lg font-black text-chalk-blue-dark text-right">
                          {l.rating.split(', ').map((r, i) => <div key={i}>{r}</div>)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-text font-medium italic">No leagues added yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_LEAGUES.map(l => (
                      <button
                        key={l.id}
                        onClick={() => toggleLeagueSelection(l.id)}
                        className={`py-3 rounded-xl border text-[11px] font-black transition-all ${selectedLeagueIds.includes(l.id) ? 'bg-chalk-blue/10 border-chalk-blue text-deep-charcoal dark:text-white' : 'border-soft-gray dark:border-dark-border text-muted-text'}`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 animate-fade-in">
                    {selectedLeagueIds.map(id => {
                      const league = AVAILABLE_LEAGUES.find(l => l.id === id)!;
                      return (
                        <div key={id} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl border border-soft-gray dark:border-dark-border space-y-3">
                           <div className="text-[10px] font-black uppercase text-deep-charcoal dark:text-white">{league.name}</div>
                           {league.id === 'apa' ? (
                             league.fields.map(f => renderAPASelector(f))
                           ) : (
                             league.fields.map(f => (
                               <div key={f.id}>
                                  <label className="block text-[8px] font-black uppercase tracking-wider text-muted-text mb-1">{f.label}</label>
                                  <input 
                                    type="number"
                                    className="input-field !py-2 !px-3 !text-xs !rounded-xl"
                                    placeholder={f.placeholder}
                                    value={leagueRatings[f.id] || ''}
                                    onChange={(e) => handleRatingChange(f.id, e.target.value)}
                                  />
                               </div>
                             ))
                           )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-extrabold text-muted-text dark:text-dark-text-muted uppercase tracking-widest px-1 mb-3">Appearance</h3>
            <div className="bg-white dark:bg-dark-surface rounded-[2rem] border border-soft-gray dark:border-dark-border overflow-hidden shadow-sm">
              {[
                { id: 'light', label: 'Light Mode', icon: 'light_mode' },
                { id: 'dark', label: 'Dark Mode', icon: 'dark_mode' },
                { id: 'auto', label: 'Automatic (Sunset)', icon: 'schedule' }
              ].map((option, idx, arr) => (
                <button
                  key={option.id}
                  onClick={() => onThemeChange(option.id as ThemeMode)}
                  className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-black/10 transition-colors ${idx !== arr.length - 1 ? 'border-b border-soft-gray dark:border-dark-border' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-chalk-blue-dark">{option.icon}</span>
                    <span className="font-bold text-sm text-deep-charcoal dark:text-white">{option.label}</span>
                  </div>
                  {themeMode === option.id && (
                    <span className="material-symbols-outlined text-chalk-blue-dark text-xl">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="pt-4">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/20 text-red-600 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Sign Out
            </button>
          </section>

          <footer className="mt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-text dark:text-dark-text-muted mb-2">Chalk Pro v2.4.0</p>
            <p className="text-[9px] text-muted-text dark:text-dark-text-muted/60 max-w-[200px] mx-auto">Engineered for champions. Performance starts here.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Settings;
