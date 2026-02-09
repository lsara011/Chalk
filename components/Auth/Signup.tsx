import React, { useState, useEffect } from "react";
import Logo from "../Logo";
import { LeagueInfo } from "../../types";
import { supabase } from "../../services/supabase";

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
    id: "apa",
    name: "APA",
    fields: [
      { id: "apa8", label: "8-Ball SL", min: 2, max: 7, placeholder: "2-7" },
      { id: "apa9", label: "9-Ball SL", min: 1, max: 9, placeholder: "1-9" },
    ],
  },
  {
    id: "bca",
    name: "BCA",
    fields: [
      {
        id: "bca_fargo",
        label: "FargoRate",
        min: 1,
        max: 1000,
        placeholder: "e.g. 525",
      },
    ],
  },
  {
    id: "usapl",
    name: "USAPL",
    fields: [
      {
        id: "usapl_fargo",
        label: "FargoRate",
        min: 1,
        max: 1000,
        placeholder: "e.g. 480",
      },
    ],
  },
  {
    id: "vnea",
    name: "VNEA",
    fields: [
      {
        id: "vnea_sl",
        label: "Skill Level",
        min: 1000,
        max: 2200,
        placeholder: "1000-2200",
      },
    ],
  },
  {
    id: "tap",
    name: "TAP",
    fields: [
      { id: "tap_sl", label: "Rating", min: 2, max: 8, placeholder: "2-7" },
    ],
  },
];

interface SignupProps {
  onSignupComplete: (userData: {
    email: string;
    name: string;
    location: string;
    leagues: LeagueInfo[];
  }) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({
  onSignupComplete,
  onSwitchToLogin,
}) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Location States
  const [isInternational, setIsInternational] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [leagueRatings, setLeagueRatings] = useState<Record<string, string>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/positions"
        );
        const data = await res.json();
        if (!data.error) {
          setCountries(data.data.map((c: any) => c.name).sort());
        }
      } catch (e) {
        console.error("Error fetching countries", e);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) return;
      setLoadingLoc(true);
      setSelectedState("");
      setSelectedCity("");
      setCities([]);
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: selectedCountry }),
          }
        );
        const data = await res.json();
        if (!data.error) {
          setStates(data.data.states.map((s: any) => s.name).sort());
        }
      } catch (e) {
        console.error("Error fetching states", e);
      }
      setLoadingLoc(false);
    };
    fetchStates();
  }, [selectedCountry]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState || !selectedCountry) return;
      setLoadingLoc(true);
      setSelectedCity("");
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              country: selectedCountry,
              state: selectedState,
            }),
          }
        );
        const data = await res.json();
        if (!data.error) {
          setCities(data.data.sort());
        }
      } catch (e) {
        console.error("Error fetching cities", e);
      }
      setLoadingLoc(false);
    };
    fetchCities();
  }, [selectedState, selectedCountry]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("at least 8 characters");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("a number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(password)) {
      errors.push("a special character");
    }

    return errors;
  };

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (step === 1) {
      const passwordIssues = validatePassword(password);

      if (passwordIssues.length > 0) {
        setErrors({
          password: `Password must contain ${passwordIssues.join(", ")}.`,
        });
        return;
      }

      if (password !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      setErrors({});
    }

    if (step === 2) {
      if (!selectedCity || !selectedState) {
        setErrors({ location: "Please complete your location details" });
        return;
      }
      setErrors({});
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  const toggleLeague = (id: string) => {
    setSelectedLeagues((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleRatingChange = (fieldId: string, value: string) => {
    setLeagueRatings((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  const prettyAuthError = (msg: string) => {
    const m = msg.toLowerCase();

    if (m.includes("already registered") || m.includes("already exists")) {
      return "That email is already registered. Try signing in instead.";
    }
    if (m.includes("password")) {
      return "Password is too weak. Try a longer password with numbers/symbols.";
    }
    if (m.includes("invalid email")) {
      return "That email looks invalid.";
    }

    return msg;
  };

  const validateLeagues = () => {
    const newErrors: Record<string, string> = {};

    selectedLeagues.forEach((leagueId) => {
      const def = AVAILABLE_LEAGUES.find((l) => l.id === leagueId)!;
      const values = def.fields.map((f) => leagueRatings[f.id] || "");

      if (values.every((v) => v === "")) {
        newErrors[
          def.fields[0].id
        ] = `Enter at least one rating for ${def.name}`;
      }

      def.fields.forEach((field) => {
        const val = leagueRatings[field.id];
        if (val !== "") {
          const num = parseInt(val);
          if (isNaN(num)) {
            newErrors[field.id] = "Must be a number";
          } else if (field.min !== undefined && num < field.min) {
            newErrors[field.id] = `Min: ${field.min}`;
          } else if (field.max !== undefined && num > field.max) {
            newErrors[field.id] = `Max: ${field.max}`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signUpWithSupabase = async () => {
    setAuthError("");
    setAuthLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password; // don't trim passwords
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    // Optional: local validation to avoid 422s
    if (!cleanEmail) {
      setAuthError("Email is required.");
      setAuthLoading(false);
      return null;
    }
    if (cleanPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      setAuthLoading(false);
      return null;
    }

    try {
      console.log("RAW email:", JSON.stringify(email));
      console.log("TRIMMED email:", JSON.stringify(cleanEmail));
      console.log(
        "email chars:",
        [...cleanEmail].map((c) => c.charCodeAt(0))
      );

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              first_name: cleanFirst,
              last_name: cleanLast,
              full_name: `${cleanFirst} ${cleanLast}`.trim(),
            },
          },
        });

      if (signUpError) {
        const raw = signUpError.message.toLowerCase();

        const exists =
          raw.includes("user already registered") ||
          raw.includes("already registered") ||
          raw.includes("already exists");

        setEmailExists(exists);

        const msg = prettyAuthError(signUpError.message);
        setAuthError(msg);
        return null;
      }

      return signUpData;
    } catch (err: any) {
      console.log("Signup exception:", err);
      setAuthError("Signup failed. Please try again.");
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const validateAllBeforePersist = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 1 requirements
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";

    const passwordIssues = validatePassword(password);
    if (passwordIssues.length > 0) {
      newErrors.password = `Password must contain ${passwordIssues.join(
        ", "
      )}.`;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (isInternational) {
      if (!selectedCountry) newErrors.country = "Country is required";
    }
    if (!selectedState) newErrors.location = "State/Province is required";
    if (!selectedCity) newErrors.location = "City is required";

    if (selectedLeagues.length > 0) {
      const leaguesOk = validateLeagues();
      if (!leaguesOk) return false; // validateLeagues already setErrors
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      setAuthError("Please fix the highlighted fields.");
      return false;
    }

    return true;
  };

  const handleComplete = async () => {
    setAuthError("");

    // 0) Hard gate: validate everything before any network call
    const ok = validateAllBeforePersist();
    if (!ok) return;

    // 1) Create auth user (or sign in if already exists)
    const authResult = await signUpWithSupabase();
    if (!authResult) return;

    // 2) Confirm session user is available
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      console.error(userErr);
      setAuthError("Could not start a session. Please log in and try again.");
      return;
    }

    // 3) Only now: write to DB (your choice)
    // If you kept RPC:
    const { error: rpcErr } = await supabase.rpc("complete_signup", {
      p_first_name: firstName.trim(),
      p_last_name: lastName.trim(),
      p_country: isInternational ? selectedCountry : "United States",
      p_state: selectedState,
      p_city: selectedCity,
      p_is_international: isInternational,
      p_apa_8ball_sl: leagueRatings.apa8 ? Number(leagueRatings.apa8) : null,
      p_apa_9ball_sl: leagueRatings.apa9 ? Number(leagueRatings.apa9) : null,
      p_fargo: leagueRatings.bca_fargo ? Number(leagueRatings.bca_fargo) : null,
      p_usapl: leagueRatings.usapl_fargo
        ? Number(leagueRatings.usapl_fargo)
        : null,
      p_vnea: leagueRatings.vnea_sl ? Number(leagueRatings.vnea_sl) : null,
      p_tap: leagueRatings.tap_sl ? Number(leagueRatings.tap_sl) : null,
    });

    if (rpcErr) {
      console.error(rpcErr);
      setAuthError("Could not save your profile. Please try again.");
      return;
    }

    // 4) Only after DB succeeds: build payload and finish
    const leagues: LeagueInfo[] = selectedLeagues.map((id) => {
      const def = AVAILABLE_LEAGUES.find((l) => l.id === id)!;

      const ratingString = def.fields
        .filter((f) => leagueRatings[f.id])
        .map(
          (f) =>
            `${def.fields.length > 1 ? f.label.split(" ")[0] + ": " : ""}${
              leagueRatings[f.id]
            }`
        )
        .join(", ");

      return {
        id,
        name: def.name,
        ratingLabel: def.fields.length > 1 ? "SL" : def.fields[0].label,
        rating: ratingString || "-",
      };
    });

    const fullLocation = `${selectedCity}, ${selectedState}${
      isInternational ? `, ${selectedCountry}` : ""
    }`;

    const fullName = `${firstName} ${lastName}`.trim();

    onSignupComplete({
      email: email.trim(),
      name: fullName,
      location: fullLocation,
      leagues,
    });
  };

  const renderAPASelector = (field: LeagueField) => {
    const options = [];
    const min = field.min || 1;
    const max = field.max || 9;

    for (let i = min; i <= max; i++) {
      options.push(i);
    }

    return (
      <div className="w-full">
        <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-text dark:text-dark-text-muted mb-2">
          {field.label}
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {options.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleRatingChange(field.id, val.toString())}
              className={`flex-shrink-0 w-10 h-10 rounded-full border-2 font-black text-sm transition-all duration-300 ${
                leagueRatings[field.id] === val.toString()
                  ? "bg-chalk-blue border-chalk-blue text-deep-charcoal shadow-lg shadow-chalk-blue/20 scale-110"
                  : "bg-white dark:bg-dark-bg border-soft-gray dark:border-dark-border text-muted-text dark:text-dark-text-muted hover:border-chalk-blue/50"
              }`}
            >
              {val}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleRatingChange(field.id, "")}
            className={`flex-shrink-0 px-3 h-10 rounded-full border-2 font-bold text-[9px] uppercase tracking-tighter transition-all duration-300 ${
              !leagueRatings[field.id]
                ? "bg-gray-100 dark:bg-dark-border border-gray-300 dark:border-white/10 text-deep-charcoal dark:text-white"
                : "bg-transparent border-transparent text-muted-text dark:text-dark-text-muted hover:text-red-500"
            }`}
          >
            Clear
          </button>
        </div>
        {errors[field.id] && (
          <p className="text-[9px] text-red-500 font-bold mt-1 px-1 animate-slide-down">
            {errors[field.id]}
          </p>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="w-full text-center animate-slide-down">
              <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-1">
                Start your journey
              </h2>
              <p className="text-sm text-muted-text dark:text-dark-text-muted">
                Join the world's best pool platform.
              </p>
            </div>

            <form
              onSubmit={handleNext}
              className="space-y-3 animate-slide-up stagger-item-1"
            >
              <input
                className="input-field !py-3 !px-4"
                placeholder="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />

              <input
                className="input-field !py-3 !px-4"
                placeholder="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <input
                className="input-field !py-3 !px-4"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailExists) setEmailExists(false);
                  if (authError) setAuthError("");
                }}
                required
              />


              <div className="space-y-3">
                {/* Password */}
                <div className="relative">
                  <input
                    className={`input-field !py-3 !px-4 ${
                      errors.password
                        ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                        : ""
                    }`}
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);

                      if (errors.password) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.password;
                          return next;
                        });
                      }
                    }}
                    required
                  />
                  {errors.password && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 px-1 animate-slide-down">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    className={`input-field !py-3 !px-4 ${
                      errors.confirmPassword
                        ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                        : password &&
                          confirmPassword &&
                          password !== confirmPassword
                        ? "border-red-500"
                        : password &&
                          confirmPassword &&
                          password === confirmPassword
                        ? "border-green-500"
                        : ""
                    }`}
                    placeholder="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);

                      if (errors.confirmPassword) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.confirmPassword;
                          return next;
                        });
                      }
                    }}
                    required
                  />

                  {/* Live match feedback */}
                  {password && confirmPassword && (
                    <p
                      className={`text-[10px] font-bold mt-1 px-1 animate-slide-down ${
                        password === confirmPassword
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {password === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}

                  {/* Submit-time error */}
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 px-1 animate-slide-down">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary !py-3 mt-2 shadow-lg active:scale-95 transition-all"
              >
                Continue
              </button>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="w-full text-center animate-slide-down">
              <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-1">
                Where do you play?
              </h2>
              <p className="text-sm text-muted-text dark:text-dark-text-muted">
                Mandatory to find local clubs and events.
              </p>
            </div>

            <div className="space-y-5 animate-slide-up stagger-item-1">
              {/* Region Selection "Tabs" */}
              <div className="flex p-1 bg-gray-100 dark:bg-dark-surface rounded-2xl border border-soft-gray dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsInternational(false);
                    setSelectedCountry("United States");
                  }}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                    !isInternational
                      ? "bg-white dark:bg-dark-bg text-deep-charcoal dark:text-white shadow-sm"
                      : "text-muted-text dark:text-dark-text-muted"
                  }`}
                >
                  United States
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsInternational(true);
                    setSelectedCountry("");
                  }}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                    isInternational
                      ? "bg-white dark:bg-dark-bg text-deep-charcoal dark:text-white shadow-sm"
                      : "text-muted-text dark:text-dark-text-muted"
                  }`}
                >
                  International
                </button>
              </div>

              <div className="space-y-3">
                {/* Country Dropdown (Only for International) */}
                {isInternational && (
                  <div className="relative">
                    <select
                      className={`input-field !py-3 !px-4 appearance-none ${
                        errors.location && !selectedCountry
                          ? "border-red-500"
                          : ""
                      }`}
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Country
                      </option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text">
                      <span className="material-symbols-outlined text-sm">
                        public
                      </span>
                    </div>
                  </div>
                )}

                {/* State / Department Dropdown */}
                <div className="relative">
                  <select
                    className={`input-field !py-3 !px-4 appearance-none ${
                      errors.location && !selectedState ? "border-red-500" : ""
                    }`}
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={loadingLoc || !selectedCountry}
                  >
                    <option value="" disabled>
                      {loadingLoc
                        ? "Loading..."
                        : isInternational
                        ? "Select Department / Province"
                        : "Select State"}
                    </option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text">
                    <span className="material-symbols-outlined text-sm">
                      map
                    </span>
                  </div>
                </div>

                {/* City Search/Select */}
                <div className="relative">
                  <input
                    list="city-list"
                    className={`input-field !py-3 !px-4 ${
                      errors.location && !selectedCity ? "border-red-500" : ""
                    }`}
                    placeholder={
                      loadingLoc ? "Loading cities..." : "Search City"
                    }
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={loadingLoc || !selectedState}
                  />
                  <datalist id="city-list">
                    {cities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text">
                    {loadingLoc ? (
                      <div className="w-4 h-4 border-2 border-chalk-blue border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined text-sm">
                        location_city
                      </span>
                    )}
                  </div>
                </div>

                {errors.location && (
                  <p className="text-[10px] text-red-500 font-bold px-1 animate-slide-down">
                    {errors.location}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-text dark:text-dark-text-muted px-1">
                  Are you in a league?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_LEAGUES.map((league, i) => (
                    <button
                      key={league.id}
                      type="button"
                      onClick={() => toggleLeague(league.id)}
                      className={`p-4 rounded-2xl border transition-all text-left animate-zoom-in stagger-item-${
                        i + 1
                      } ${
                        selectedLeagues.includes(league.id)
                          ? "border-chalk-blue bg-chalk-blue/10 dark:bg-chalk-blue/5 shadow-[0_4px_12px_rgba(135,206,235,0.1)]"
                          : "border-soft-gray dark:border-dark-border bg-white dark:bg-dark-surface hover:border-chalk-blue/40"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm dark:text-white">
                          {league.name}
                        </span>
                        {selectedLeagues.includes(league.id) && (
                          <span className="material-symbols-outlined text-chalk-blue-dark text-sm animate-zoom-in">
                            check_circle
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 btn-secondary !py-3"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={
                    selectedLeagues.length > 0 ? handleNext : handleComplete
                  }
                  className="flex-[2] btn-primary !py-3 active:scale-95 transition-all shadow-chalk-blue/20"
                >
                  {selectedLeagues.length > 0 ? "Next" : "Create Account"}
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="w-full text-center animate-slide-down">
              <h2 className="text-xl font-bold text-deep-charcoal dark:text-white mb-1">
                League Rankings
              </h2>
              <p className="text-sm text-muted-text dark:text-dark-text-muted">
                Enter your current ratings. APA players can fill one or both
                formats.
              </p>
            </div>
            <div className="space-y-4 animate-slide-up stagger-item-1 max-h-[45vh] overflow-y-auto no-scrollbar pr-1 pb-4">
              {selectedLeagues.map((leagueId, i) => {
                const league = AVAILABLE_LEAGUES.find(
                  (l) => l.id === leagueId
                )!;
                return (
                  <div
                    key={leagueId}
                    className={`p-5 bg-white dark:bg-dark-surface border border-soft-gray dark:border-dark-border rounded-2xl animate-slide-left stagger-item-${
                      i + 1
                    } shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-chalk-blue animate-pulse"></div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-deep-charcoal dark:text-white">
                        {league.name}
                      </h3>
                    </div>

                    <div
                      className={`${
                        league.id === "apa"
                          ? "space-y-5"
                          : league.fields.length > 1
                          ? "grid grid-cols-2 gap-3"
                          : "space-y-3"
                      }`}
                    >
                      {league.fields.map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          {league.id === "apa" ? (
                            renderAPASelector(field)
                          ) : (
                            <>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-muted-text dark:text-dark-text-muted">
                                {field.label}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  placeholder={field.placeholder}
                                  className={`input-field !py-2.5 !px-4 !text-sm ${
                                    errors[field.id]
                                      ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                      : ""
                                  }`}
                                  value={leagueRatings[field.id] || ""}
                                  onChange={(e) =>
                                    handleRatingChange(field.id, e.target.value)
                                  }
                                />
                                {errors[field.id] && (
                                  <p className="text-[9px] text-red-500 font-bold mt-1 px-1 animate-slide-down">
                                    {errors[field.id]}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 pt-2 animate-slide-up stagger-item-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 btn-secondary !py-3"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="flex-[2] btn-primary !py-3 active:scale-95 transition-all shadow-chalk-blue/20"
              >
                Complete Profile
              </button>
            </div>
            {emailExists && (
                <div className="text-center bg-red-50 dark:bg-red-900/10">
                  <p className="text-[11px] font-bold text-red-600 p-5">
                    E-mail is already registered. Try signing in instead
                  </p>
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="flex-[2] btn-primary  active:scale-95 transition-all shadow-chalk-blue/20"
                  >
                    Sign in
                  </button>
                </div>
              )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="w-full px-8 py-6 flex flex-col items-center h-full overflow-hidden bg-white dark:bg-dark-bg transition-all duration-500">
      <div className="mt-4 mb-8 flex flex-col items-center animate-slide-down">
        <div className="relative mb-4 hover:scale-110 transition-transform cursor-pointer">
          <Logo size="sm" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-deep-charcoal dark:text-white">
          Chalk
        </h1>
      </div>

      <div className="w-full flex-1 flex flex-col items-center">
        {renderStep()}
      </div>

      {step === 1 && (
        <div className="w-full mt-auto mb-4 animate-slide-up stagger-item-3">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-soft-gray dark:border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-white dark:bg-dark-bg px-3 text-muted-text dark:text-dark-text-muted">
                Or sign up with
              </span>
            </div>
          </div>

          {/* <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-secondary !py-2.5 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span className="text-xs">Google</span>
            </button>
            <button
              type="button"
              className="btn-secondary !py-2.5 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2 text-deep-charcoal dark:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.05 20.28c-.96.95-2.04 1.72-3.23 1.72-1.16 0-1.54-.71-2.94-.71-1.41 0-1.84.7-2.95.71-1.19 0-2.31-.83-3.29-1.78-1.98-1.91-3.41-5.38-3.41-8.39 0-2.99 1.51-4.72 3.12-4.72 1.01 0 1.83.6 2.62.6.79 0 1.83-.65 3.01-.65 1.13 0 2.21.46 3.01 1.34-2.84 1.34-2.38 5.48.51 6.81-.72 1.84-1.63 3.44-2.26 4.07zM12.03 7.25c-.23-2.03 1.55-3.87 3.34-3.87.24 2.16-1.87 4.03-3.34 3.87z"></path>
              </svg>
              <span className="text-xs">Apple</span>
            </button>
          </div> */}

          <footer className="mt-6 text-center">
            <p className="text-xs text-muted-text dark:text-dark-text-muted">
              Already a member?
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="ml-1 text-chalk-blue-dark font-bold hover:underline transition-all active:scale-95 inline-block"
              >
                Sign In
              </button>
            </p>
          </footer>
        </div>
      )}
    </main>
  );
};

export default Signup;
