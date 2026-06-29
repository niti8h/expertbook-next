"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
}

interface DialogContextValue {
  confirm: (options: string | DialogOptions) => Promise<boolean>;
  prompt: (options: string | DialogOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrompt, setIsPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [options, setOptions] = useState<DialogOptions>({ message: "" });
  
  // Resolvers
  const [confirmResolver, setConfirmResolver] = useState<(value: boolean) => void>();
  const [promptResolver, setPromptResolver] = useState<(value: string | null) => void>();

  const confirm = (opts: string | DialogOptions): Promise<boolean> => {
    const dialogOptions = typeof opts === "string" ? { message: opts } : opts;
    setOptions({
      title: dialogOptions.title || "Confirm Action",
      message: dialogOptions.message,
      confirmText: dialogOptions.confirmText || "Confirm",
      cancelText: dialogOptions.cancelText || "Cancel"
    });
    setIsPrompt(false);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setConfirmResolver(() => resolve);
    });
  };

  const promptDialog = (opts: string | DialogOptions): Promise<string | null> => {
    const dialogOptions = typeof opts === "string" ? { message: opts } : opts;
    setOptions({
      title: dialogOptions.title || "Input Required",
      message: dialogOptions.message,
      confirmText: dialogOptions.confirmText || "Submit",
      cancelText: dialogOptions.cancelText || "Cancel",
      defaultValue: dialogOptions.defaultValue || ""
    });
    setPromptValue(dialogOptions.defaultValue || "");
    setIsPrompt(true);
    setIsOpen(true);

    return new Promise((resolve) => {
      setPromptResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (isPrompt) {
      if (promptResolver) promptResolver(promptValue);
    } else {
      if (confirmResolver) confirmResolver(true);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (isPrompt) {
      if (promptResolver) promptResolver(null);
    } else {
      if (confirmResolver) confirmResolver(false);
    }
  };

  return (
    <DialogContext.Provider value={{ confirm, prompt: promptDialog }}>
      {children}
      {isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "100%",
            maxWidth: "400px",
            transform: "scale(1)",
            animation: "scaleUp 0.2s ease-out"
          }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.125rem", color: "#111827" }}>{options.title}</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.5 }}>{options.message}</p>
            
            {isPrompt && (
              <input 
                type="text" 
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "0.875rem"
                }}
                autoFocus
              />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                onClick={handleCancel}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                {options.cancelText}
              </button>
              <button 
                onClick={handleConfirm}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#ef4444", // Assuming destructive action as default, can be customized
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
