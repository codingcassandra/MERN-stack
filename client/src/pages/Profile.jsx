import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/client";
import "./Profile.css";

const DEMO_PROFILE = {
  name: "Jordan Ray",
  email: "jordan@example.com",
  emailVerified: true,
  calorieGoal: 2100,
  proteinGoal: 140,
  carbGoal: 230,
  fatGoal: 70,
};

export default function Profile() {
  const [profile, setProfile] = useState(DEMO_PROFILE);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error

  useEffect(() => {
    let active = true;
    api
      .getProfile()
      .then((res) => active && setProfile(res))
      .catch(() => {
        /* keep demo profile if backend isn't reachable */
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (field) => (e) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      await api.updateProfile(profile);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  return (
    <>
      <Navbar user={profile} />
      <main className="container profile-page">
        <header>
          <p className="eyebrow">Account</p>
          <h1>Profile & goals</h1>
        </header>

        <div className="profile-grid">
          <div className="label-panel">
            <p className="label-panel-title">Account</p>
            <p className="label-panel-sub">Signed in as</p>

            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" value={profile.name} onChange={update("name")} />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={profile.email} onChange={update("email")} />
              {profile.emailVerified ? (
                <span className="verify-badge verified">✓ Verified</span>
              ) : (
                <span className="verify-badge unverified">Not verified — check your inbox</span>
              )}
            </div>
          </div>

          <form className="label-panel" onSubmit={handleSave}>
            <p className="label-panel-title">Daily goals</p>
            <p className="label-panel-sub">Used to calculate your dashboard progress</p>

            <div className="field">
              <label htmlFor="calorieGoal">Calories</label>
              <input
                id="calorieGoal"
                type="number"
                min="1000"
                step="10"
                value={profile.calorieGoal}
                onChange={update("calorieGoal")}
              />
            </div>

            <div className="goal-row">
              <div className="field">
                <label htmlFor="proteinGoal">Protein (g)</label>
                <input
                  id="proteinGoal"
                  type="number"
                  min="0"
                  value={profile.proteinGoal}
                  onChange={update("proteinGoal")}
                />
              </div>
              <div className="field">
                <label htmlFor="carbGoal">Carbs (g)</label>
                <input
                  id="carbGoal"
                  type="number"
                  min="0"
                  value={profile.carbGoal}
                  onChange={update("carbGoal")}
                />
              </div>
              <div className="field">
                <label htmlFor="fatGoal">Fat (g)</label>
                <input
                  id="fatGoal"
                  type="number"
                  min="0"
                  value={profile.fatGoal}
                  onChange={update("fatGoal")}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={saveStatus === "saving"}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : "Save changes"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
