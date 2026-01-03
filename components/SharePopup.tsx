"use client";

import React, { useState, useEffect } from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

const SharePopup = ({
  isOpen,
  onClose,
  url,
  title = "Share this content",
}: SharePopupProps) => {
  const [shareUrl, setShareUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setShareUrl(
      url || (typeof window !== "undefined" ? window.location.href : "")
    );
  }, [url]);

  useEffect(() => {
    if (isOpen && typeof navigator !== "undefined" && !!navigator.share) {
      navigator
        .share({
          title: title,
          url:
            shareUrl ||
            url ||
            (typeof window !== "undefined" ? window.location.href : ""),
        })
        .then(() => onClose())
        .catch((err) => {
          console.error("Error sharing:", err);
          // If it's an AbortError (user cancelled), we still close it as per instructions
          onClose();
        });
    }
  }, [isOpen, shareUrl, url, title, onClose]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      () => console.error("Failed to copy")
    );
  };

  if (!isOpen || (typeof navigator !== "undefined" && !!navigator.share))
    return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 border border-slate-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Share via
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-slate-400 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Social Icons Grid */}
          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <WhatsappShareButton
                url={shareUrl}
                title={title}
                className="transform transition-all hover:scale-110 active:scale-95"
              >
                <WhatsappIcon size={64} round className="shadow-lg" />
              </WhatsappShareButton>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                WhatsApp
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <FacebookShareButton
                url={shareUrl}
                className="transform transition-all hover:scale-110 active:scale-95"
              >
                <FacebookIcon size={64} round className="shadow-lg" />
              </FacebookShareButton>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Facebook
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <TwitterShareButton
                url={shareUrl}
                title={title}
                className="transform transition-all hover:scale-110 active:scale-95"
              >
                <TwitterIcon size={64} round className="shadow-lg" />
              </TwitterShareButton>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Twitter
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 font-medium">
                or copy link
              </span>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-white/5 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 ml-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 dark:text-slate-300 outline-none truncate font-bold px-2"
            />
            <button
              onClick={copyToClipboard}
              className={`
                px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer
                ${
                  copySuccess
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 shadow-lg"
                }
              `}
            >
              {copySuccess ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
