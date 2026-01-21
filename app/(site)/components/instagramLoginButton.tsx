// InstagramLoginButton.tsx
import React from "react";

const META_APP_ID = "869172442507684";
const REDIRECT_URI = "http://localhost:3000/message";

type InstagramLoginButtonProps = {
  disabled?: boolean;
};

const InstagramLoginButton: React.FC<InstagramLoginButtonProps> = ({
  disabled = false,
}) => {
  const handleClick = () => {
    if (disabled) return;

    const url = new URL("https://www.facebook.com/v24.0/dialog/oauth");

    url.searchParams.set("client_id", META_APP_ID);
    url.searchParams.set("display", "page");
    url.searchParams.set( 
      "extras",
      JSON.stringify({ setup: { channel: "IG_API_ONBOARDING" } })
    );
    url.searchParams.set("redirect_uri", REDIRECT_URI); 
    url.searchParams.set("response_type", "token");
    url.searchParams.set(
      "scope",
      [
        "instagram_basic",
        "instagram_manage_messages",
        "pages_show_list",
        "pages_messaging",
        "business_management",
        "pages_manage_metadata",
      ].join(",")
    );

    window.location.href = url.toString();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center rounded-md px-2 py-2 text-sm text-white transition-all duration-200
        bg-[linear-gradient(86deg,_rgba(249,206,52,0.75)_-7.01%,_rgba(238,42,123,0.75)_52.81%,_rgba(98,40,215,0.75)_110.91%)]
        hover:bg-[linear-gradient(86deg,_rgba(249,206,52,1)_-7.01%,_rgba(238,42,123,1)_52.81%,_rgba(98,40,215,1)_110.91%)]
        hover:text-white/90
        ${disabled ? "cursor-not-allowed opacity-60 hover:bg-[linear-gradient(86deg,_rgba(249,206,52,0.75)_-7.01%,_rgba(238,42,123,0.75)_52.81%,_rgba(98,40,215,0.75)_110.91%)]" : ""}`}
    >
      <img src="/instagram.png" alt="Instagram" className="h-4 w-4" />
      <span className="px-2 text-lg font-semibold">Connect with Instagram</span>
    </button>
  );
};

export default InstagramLoginButton;