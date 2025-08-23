import React, { useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

import Asset from "./pages/Assets";
import AddAssetForm from "./forms/AddAssetForm";
import AMCExpiredAssets from "./tabs/Assetmanagement/AMCExpiredAssets";
import AddAMCForm from "./forms/AddAMCForm";
import AMCExpired90Days from "./tabs/Assetmanagement/AMCExpiringIn90Days";
import ChecklistTab from "./tabs/Assetmanagement/Checklist";
import Checklistform from "./forms/Checklistform";
import AssociationBtn from "./forms/Associationbtn";
import LogoutButton from "./components/LogoutButton";
import AssetDetails from "./pages/AssetDetails";
import Navbar from "./layouts/Navbar ";

import {
  refreshAccessToken,
  bootstrapAuth,
  interactiveLogin,
  getAuthState,
} from "./services/loginService";

function App() {
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      console.log("[App] bootstrapping…");
      const ok = await bootstrapAuth();
      console.log("[App] bootstrapAuth ->", ok, "authState:", getAuthState());

      // If refresh via cookie failed OR authState still missing -> prompt once
      if (!ok || !getAuthState()) {
        console.log("[App] No valid cookie/session. Prompting user…");
        const loggedIn = await interactiveLogin();
        console.log(
          "[App] interactiveLogin ->",
          loggedIn,
          "authState:",
          getAuthState()
        );
      }
    })();

    // periodic refresh
    const id = setInterval(() => {
      refreshAccessToken();
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <div className="flex justify-end p-2 bg-gray-100">
        <LogoutButton />
      </div>

      <Routes>
        <Route>
          <Route index element={<ChecklistTab />} />
          <Route path="assetmanagement" element={<Asset />} />
          <Route path="Navbar" element={<Navbar />} />
          <Route path="addasset" element={<AddAssetForm />} />
          <Route path="/assets/view" element={<AssetDetails />} />
          <Route path="amcexpiredassets" element={<AMCExpiredAssets />} />
          <Route path="addamc" element={<AddAMCForm onSubmit={() => {}} />} />
          <Route
            path="addchecklist"
            element={<Checklistform onSubmit={() => {}} onClose={() => {}} />}
          />
          <Route
            path="checklist/:id/associations"
            element={<AssociationBtn />}
          />
        </Route>
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
