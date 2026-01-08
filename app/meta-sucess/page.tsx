"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const MetaSuccess = () => {
  const [status, setStatus] = useState("Processing Meta login...");

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const longLivedToken = params.get("long_lived_token");
    const accessToken = params.get("access_token");
    const errorReason = params.get("error_reason");

    if (errorReason) {
      setStatus("Meta login was cancelled or failed.");
      return;
    }

    if (!longLivedToken) {
      setStatus("Missing Meta long-lived token in redirect.");
      return;
    }

    // ✅ async side-effect
    const completeLogin = async () => {
      try {
        const res = await axios.post(
          "https://your-backend.com/auth/meta/complete",
          {
            long_lived_token: longLivedToken,
            short_lived_token: accessToken,
          }
        );

        setStatus(
          `Connected Instagram @${res.data.instagram_username || ""}`.trim()
        );
      } catch {
        setStatus("Failed to complete Meta onboarding on the server.");
      }
    };

    completeLogin();
  }, []);

  return <p>{status}</p>;
};

export default MetaSuccess;
