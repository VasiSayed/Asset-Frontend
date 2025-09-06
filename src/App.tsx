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
import AssetDetails from "./pages/AssetDetails";
import Navbar from "./layouts/Navbar ";
import AssetChecklist from "./pages/AssetChecklist";
import RunSubmit from "./pages/RunSubmit";


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
      const ok = await bootstrapAuth();
      if (!ok || !getAuthState()) {
        await interactiveLogin();
      }
    })();

    const id = setInterval(() => {
      refreshAccessToken();
    }, 10 * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Fixed top navbar */}
      <Navbar />

      {/* Full-width content area below navbar */}
      <main className="min-h-screen bg-gray-100 pt-20 w-full">
        {/* optional horizontal padding; remove px-* if you want true edge-to-edge */}
        <div className="w-full px-4 md:px-6">
          <Routes>
            <Route>
              <Route
                path="/assets/:assetId/checklist"
                element={<AssetChecklist />}
              />
              <Route path="/runs/:runId" element={<RunSubmit />} />
              <Route index element={<ChecklistTab />} />
              <Route path="assetmanagement" element={<Asset />} />
              <Route path="addasset" element={<AddAssetForm />} />
              <Route path="/assets/view" element={<AssetDetails />} />
              <Route path="amcexpiredassets" element={<AMCExpiredAssets />} />
              <Route path="amcexpiring90days" element={<AMCExpired90Days />} />
              <Route
                path="addamc"
                element={<AddAMCForm onSubmit={() => {}} />}
              />
              <Route
                path="addchecklist"
                element={
                  <Checklistform onSubmit={() => {}} onClose={() => {}} />
                }
              />
              <Route
                path="checklist/:id/associations"
                element={<AssociationBtn />}
              />
            </Route>
          </Routes>
        </div>
      </main>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
