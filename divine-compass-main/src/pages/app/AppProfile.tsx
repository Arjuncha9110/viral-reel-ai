import React, { useEffect, useState } from "react";
import { LogOut, Pencil, Check, X, Loader2, UserPlus, Star, MapPin, Calendar, Clock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { UserProfile } from "../../types/user";
import { LocationSelector, LocationData } from "../../components/LocationSelector";
import AppShell from "./AppShell";
import { cn } from "../../lib/utils";

type ActiveUser = 1 | 2;
type EditField = "date" | "time" | "place" | "label" | null;
type BirthDetails = NonNullable<UserProfile["birthDetails"]>;

const emptyBD = (): BirthDetails => ({
  date: "", time: "", googlePlaceId: null, formattedAddress: "",
  latitude: null, longitude: null, city: "", state: "", country: "",
  timezoneId: "Asia/Kolkata", timezoneName: "", rawOffset: 0, dstOffset: 0, utcOffset: "+05:30",
});

interface AddUser2Form {
  name: string;
  date: string;
  time: string;
  location: LocationData | null;
}

// ─── Avatar initials helper ────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Icon badge (small rounded square) ────────────────────────────────────────
const IconBadge: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div
    className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
    style={{ background: color }}
  >
    {children}
  </div>
);

export const AppProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveUser>(1);
  const [activeKundaliProfile, setActiveKundaliProfile] = useState<ActiveUser>(
    () => (localStorage.getItem("activeKundaliProfile") === "2" ? 2 : 1)
  );
  const [editField, setEditField] = useState<EditField>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddUser2Form>({ name: "", date: "", time: "", location: null });
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    userService.getCurrentUserProfile(currentUser.uid).then(setProfile).catch(console.error);
  }, [currentUser]);

  const handleSignOut = async () => {
    await userService.signOutUser();
    navigate("/", { replace: true });
  };

  const bd1 = profile?.birthDetails;
  const bd2 = profile?.birthDetails2;
  const activeBD = activeUser === 1 ? bd1 : bd2;
  const user2Label = (bd2 as { label?: string } | undefined)?.label || "User 2";
  const user1Label = profile?.profile?.displayName?.split(" ")[0] || "Me";
  const displayName = profile?.profile?.displayName || currentUser?.displayName || "Your Profile";

  const placeDisplay = (bd?: BirthDetails | typeof bd2 | null) =>
    bd ? [bd.city, bd.state].filter(Boolean).join(", ") || bd.formattedAddress || "—" : "—";

  const startEdit = (field: EditField) => {
    setEditField(field);
    if (field === "date") setEditDate(activeBD?.date ?? "");
    if (field === "time") setEditTime(activeBD?.time ?? "");
    if (field === "label") setEditLabel(user2Label);
  };
  const cancelEdit = () => setEditField(null);

  const saveToFirestore = async (patch: Record<string, unknown>) => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", currentUser.uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
      const updated = await userService.getCurrentUserProfile(currentUser.uid);
      setProfile(updated);
      setEditField(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const saveField = async (field: "date" | "time") => {
    const value = field === "date" ? editDate : editTime;
    if (activeUser === 1) {
      await saveToFirestore({ birthDetails: { ...(bd1 ?? emptyBD()), [field]: value } });
    } else {
      await saveToFirestore({ birthDetails2: { ...(bd2 ?? emptyBD()), [field]: value } });
    }
  };

  const savePlace = async (loc: LocationData) => {
    const patch = {
      city: loc.name, state: loc.stateCode ?? "", country: loc.countryCode ?? "",
      latitude: loc.lat, longitude: loc.lon, timezoneId: loc.timezone,
      timezoneName: loc.timezone, formattedAddress: loc.formattedAddress ?? loc.name,
      googlePlaceId: loc.placeId ?? null, rawOffset: 0, dstOffset: 0, utcOffset: "+05:30",
    };
    if (activeUser === 1) {
      await saveToFirestore({ birthDetails: { ...(bd1 ?? emptyBD()), ...patch } });
    } else {
      await saveToFirestore({ birthDetails2: { ...(bd2 ?? emptyBD()), ...patch } });
    }
  };

  const setKundaliProfile = (user: ActiveUser) => {
    localStorage.setItem("activeKundaliProfile", String(user));
    setActiveKundaliProfile(user);
  };

  const saveLabel = async () => {
    await saveToFirestore({ birthDetails2: { ...(bd2 ?? emptyBD()), label: editLabel } });
  };

  const handleAddUser2 = async () => {
    if (!currentUser || !addForm.name || !addForm.date || !addForm.time || !addForm.location) return;
    setAddSaving(true);
    try {
      const loc = addForm.location;
      const locPatch = {
        city: loc.name, state: loc.stateCode ?? "", country: loc.countryCode ?? "",
        latitude: loc.lat, longitude: loc.lon, timezoneId: loc.timezone,
        timezoneName: loc.timezone, formattedAddress: loc.formattedAddress ?? loc.name,
        googlePlaceId: loc.placeId ?? null, rawOffset: 0, dstOffset: 0, utcOffset: "+05:30",
      };
      await setDoc(doc(db, "users", currentUser.uid), {
        birthDetails2: { label: addForm.name, date: addForm.date, time: addForm.time, ...locPatch },
        updatedAt: serverTimestamp(),
      }, { merge: true });
      const updated = await userService.getCurrentUserProfile(currentUser.uid);
      setProfile(updated);
      setShowAddForm(false);
      setAddForm({ name: "", date: "", time: "", location: null });
      setActiveUser(2);
    } catch (e) { console.error(e); }
    finally { setAddSaving(false); }
  };

  const formatTime = (t: string) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <AppShell>
      <div
        className="flex flex-col min-h-full"
        style={{ background: "#FFF8EF" }}
      >
        {/* ── Premium Profile Header ──────────────────────────────────────── */}
        <div
          className="relative overflow-hidden px-5 pt-12 pb-6"
          style={{
            background: "linear-gradient(160deg, #FFF6E0 0%, #FFE082 60%, #FFCA28 100%)",
          }}
        >
          {/* Decorative glow */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #F59E0B, transparent 70%)" }} />

          {/* Top row: title + settings */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800/60">
              Profile
            </p>
          </div>

          {/* Avatar + name + email */}
          <div className="flex items-center gap-4">
            {/* Avatar circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-xl text-white"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                boxShadow: "0 4px 18px rgba(217,119,6,0.4)",
              }}
            >
              {getInitials(displayName)}
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="font-display font-bold text-[#0E1A3A] truncate"
                style={{ fontSize: 22, lineHeight: 1.2 }}
              >
                {displayName}
              </h1>
              <p className="text-[12px] text-amber-900/50 truncate mt-0.5">
                {currentUser?.email}
              </p>

              {/* Badges row */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-700"
                  style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.2)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Active
                </span>
                {bd1?.date && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-amber-800"
                    style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.2)" }}
                  >
                    ✦ Kundali Ready
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable content ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 space-y-4">

          {/* ── Birth Profile Switcher ───────────────────────────────────── */}
          <div
            className="rounded-[22px] overflow-hidden"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
          >
            {/* Section header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-50">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                Birth Profiles
              </p>
              {/* Segmented control */}
              <div
                className="flex items-center p-0.5 gap-0.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.06)" }}
              >
                <button
                  onClick={() => { setActiveUser(1); setEditField(null); }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all",
                    activeUser === 1
                      ? "text-amber-800 shadow-sm"
                      : "text-stone-500"
                  )}
                  style={activeUser === 1 ? {
                    background: "linear-gradient(135deg, #FFF8E7, #FFE9A0)",
                    border: "1px solid rgba(217,119,6,0.2)",
                  } : {}}
                >
                  {user1Label}
                </button>
                <button
                  onClick={() => { setActiveUser(2); setEditField(null); }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all",
                    activeUser === 2
                      ? "text-amber-800 shadow-sm"
                      : "text-stone-500"
                  )}
                  style={activeUser === 2 ? {
                    background: "linear-gradient(135deg, #FFF8E7, #FFE9A0)",
                    border: "1px solid rgba(217,119,6,0.2)",
                  } : {}}
                >
                  {user2Label}
                </button>
              </div>
            </div>

            {/* ── User 2 empty state ── */}
            {activeUser === 2 && !bd2 && !showAddForm && (
              <div className="px-5 py-8 flex flex-col items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(245,158,11,0.10)" }}
                >
                  <UserPlus size={22} className="text-amber-500" />
                </div>
                <p className="text-sm text-stone-500 text-center">
                  Add a second profile — partner, family member, or anyone else.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-1 px-5 py-2.5 rounded-[14px] text-[13px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 3px 14px rgba(217,119,6,0.35)" }}
                >
                  Add Profile
                </button>
              </div>
            )}

            {/* ── Add User 2 form ── */}
            {activeUser === 2 && !bd2 && showAddForm && (
              <div className="px-5 py-4 space-y-4">
                {[
                  { label: "Name", type: "text", placeholder: "e.g. Partner, Spouse...", value: addForm.name, onChange: (v: string) => setAddForm(f => ({ ...f, name: v })) },
                  { label: "Date of Birth", type: "date", placeholder: "", value: addForm.date, onChange: (v: string) => setAddForm(f => ({ ...f, date: v })) },
                  { label: "Time of Birth", type: "time", placeholder: "", value: addForm.time, onChange: (v: string) => setAddForm(f => ({ ...f, time: v })) },
                ].map(({ label, type, placeholder, value, onChange }) => (
                  <div key={label}>
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1 block">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      className="w-full border border-stone-200 rounded-[14px] px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-amber-400 bg-stone-50"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1 block">Place of Birth</label>
                  <LocationSelector onLocationSelect={loc => setAddForm(f => ({ ...f, location: loc }))} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setShowAddForm(false); setAddForm({ name: "", date: "", time: "", location: null }); }}
                    className="flex-1 py-2.5 rounded-[14px] border border-stone-200 text-stone-600 text-sm font-semibold bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser2}
                    disabled={addSaving || !addForm.name || !addForm.date || !addForm.time || !addForm.location}
                    className="flex-1 py-2.5 rounded-[14px] text-white text-sm font-bold disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
                  >
                    {addSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Birth detail rows ── */}
            {activeBD && (
              <div className="divide-y divide-stone-50/80">

                {/* User 2 label rename */}
                {activeUser === 2 && (
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <IconBadge color="rgba(245,158,11,0.12)">
                        <span className="text-[14px]">👤</span>
                      </IconBadge>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Name</p>
                        {editField === "label" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editLabel}
                              onChange={e => setEditLabel(e.target.value)}
                              className="flex-1 border border-stone-200 rounded-[12px] px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-400 bg-stone-50"
                            />
                            <button onClick={saveLabel} disabled={saving}
                              className="p-2 rounded-[10px] text-white" style={{ background: "#F59E0B" }}>
                              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button onClick={cancelEdit}
                              className="p-2 rounded-[10px] bg-stone-100 text-stone-500">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-semibold text-stone-800">{user2Label}</p>
                            <button onClick={() => startEdit("label")}
                              className="p-1.5 rounded-[10px] bg-stone-50 text-stone-400 border border-stone-100">
                              <Pencil size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Date of Birth */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <IconBadge color="rgba(59,130,246,0.10)">
                      <Calendar size={15} className="text-blue-500" />
                    </IconBadge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Date of Birth</p>
                      {editField === "date" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            className="flex-1 border border-stone-200 rounded-[12px] px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-400 bg-stone-50"
                          />
                          <button onClick={() => saveField("date")} disabled={saving}
                            className="p-2 rounded-[10px] text-white" style={{ background: "#F59E0B" }}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button onClick={cancelEdit}
                            className="p-2 rounded-[10px] bg-stone-100 text-stone-500">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-semibold text-stone-800">{formatDate(activeBD.date)}</p>
                          <button onClick={() => startEdit("date")}
                            className="p-1.5 rounded-[10px] bg-stone-50 text-stone-400 border border-stone-100">
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time of Birth */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <IconBadge color="rgba(139,92,246,0.10)">
                      <Clock size={15} className="text-violet-500" />
                    </IconBadge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Time of Birth</p>
                      {editField === "time" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={editTime}
                            onChange={e => setEditTime(e.target.value)}
                            className="flex-1 border border-stone-200 rounded-[12px] px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-400 bg-stone-50"
                          />
                          <button onClick={() => saveField("time")} disabled={saving}
                            className="p-2 rounded-[10px] text-white" style={{ background: "#F59E0B" }}>
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button onClick={cancelEdit}
                            className="p-2 rounded-[10px] bg-stone-100 text-stone-500">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-semibold text-stone-800">{formatTime(activeBD.time)}</p>
                          <button onClick={() => startEdit("time")}
                            className="p-1.5 rounded-[10px] bg-stone-50 text-stone-400 border border-stone-100">
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place of Birth */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <IconBadge color="rgba(5,150,105,0.10)">
                      <MapPin size={15} className="text-emerald-600" />
                    </IconBadge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Place of Birth</p>
                      {editField === "place" ? (
                        <div className="space-y-2">
                          <LocationSelector
                            onLocationSelect={async (loc) => { await savePlace(loc); }}
                          />
                          <button onClick={cancelEdit} className="text-xs text-stone-400 underline">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-semibold text-stone-800">{placeDisplay(activeBD)}</p>
                          <button onClick={() => startEdit("place")}
                            className="p-1.5 rounded-[10px] bg-stone-50 text-stone-400 border border-stone-100">
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active / Use this profile */}
            {activeBD && (
              <div className="px-5 py-4 border-t border-stone-50">
                {activeKundaliProfile === activeUser ? (
                  <div
                    className="flex items-center justify-center gap-2 py-2.5 rounded-[14px]"
                    style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.15)" }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-[12px] font-bold text-emerald-700">Active profile for Kundali</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setKundaliProfile(activeUser)}
                    className="w-full py-2.5 rounded-[14px] text-white text-[13px] font-bold"
                    style={{ background: "linear-gradient(135deg, #1a0f30, #221040)" }}
                  >
                    Use this profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Join as Astrologer ───────────────────────────────────────── */}
          <Link
            to="/join-astrologer"
            className="flex items-center gap-4 rounded-[22px] p-4 active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(145deg, #1c0f02, #2d1805, #1a0e03)",
              border: "1px solid rgba(245,158,11,0.15)",
              boxShadow: "0 4px 24px rgba(20,11,38,0.3)",
              textDecoration: "none",
            }}
          >
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <Star size={18} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-white leading-snug">Join as Astrologer</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Share your wisdom · Set your rates
              </p>
            </div>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="rgba(245,158,11,0.6)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* ── Sign Out ─────────────────────────────────────────────────── */}
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-[18px] flex items-center justify-center gap-2 text-sm font-bold text-red-500 transition-all active:scale-[0.98]"
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1.5px solid rgba(239,68,68,0.25)",
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default AppProfile;
