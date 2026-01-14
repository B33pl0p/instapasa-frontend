"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const MetaSuccess = () => {
  const [status, setStatus] = useState("Processing Meta login...");
  const [canConnectInstagram, setCanConnectInstagram] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const errorReason = params.get("error_reason");

    if (errorReason) {
      setStatus("Meta login was cancelled or failed.");
      return;
    }

    if (!accessToken) {
      setStatus("Missing Meta access token in redirect.");
      return;
    }

    const completeLogin = async () => {
      try {
        const res = await axios.post(
          "https://api.lakhey.tech/api/v2/auth/meta/complete",
          {
            short_lived_token: accessToken, // frontend sends it as-is
          }
        );

        setStatus(
          `Connected Instagram @${res.data.instagram_username || ""}`.trim()
        );
        setCanConnectInstagram(true);
      } catch {
        setStatus("Failed to complete Meta onboarding on the server.");
      }
    };

    completeLogin();
  }, []);

  const handleInstagramOAuth = () => {
    const url =
      "https://www.instagram.com/oauth/authorize" +
      "?force_reauth=true" +
      "&client_id=851475697514434" +
      "&redirect_uri=" +
      encodeURIComponent(
        "https://api.lakhey.tech/api/v2/auth/instagram/callback"
      ) +
      "&response_type=code" +
      "&scope=" +
      encodeURIComponent(
        [
          "instagram_business_basic",
          "instagram_business_manage_messages",
          "instagram_business_manage_comments",
          "instagram_business_content_publish",
          "instagram_business_manage_insights",
        ].join(",")
      );

    window.location.href = url;
  };

  return (
    <div>
      <p>{status}</p>
      {canConnectInstagram && (
        <button
          onClick={handleInstagramOAuth}
          className="mt-4 bg-brand/90 text-white px-4 py-2 rounded-md text-sm hover:bg-brand hover:text-white/90 transition-all duration-200"
        >
          Also connect Instagram (required for chat tools)
        </button>
      )}
    </div>
  );
};

export default MetaSuccess;
