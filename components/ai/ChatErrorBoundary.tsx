"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { MessageSquareOff } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ChatErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chatbot Error Boundary Caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-5 right-5 z-[70] flex h-14 items-center gap-2 rounded-2xl border border-red-500/20 bg-[#080d1d]/95 px-4 text-sm font-semibold text-red-400 shadow-[0_18px_55px_rgba(0,0,0,.55)] backdrop-blur-xl sm:bottom-6 sm:right-6">
          <MessageSquareOff size={21} className="text-red-400" />
          <span className="hidden sm:inline">AI temporarily unavailable</span>
        </div>
      );
    }

    return this.props.children;
  }
}
