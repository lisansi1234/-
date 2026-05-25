import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import persistedDefaults from "../data/persisted_defaults.json";

interface DeletableWrapperProps {
  id: string;
  isEditMode: boolean;
  children: React.ReactNode;
  className?: string;
  label?: string; // custom confirm delete label
}

export default function DeletableWrapper({
  id,
  isEditMode,
  children,
  className = "",
  label = "元素"
}: DeletableWrapperProps) {
  const localStorageKey = `ae_delwrap_v3_${id}`;
  
  const [isDeleted, setIsDeleted] = useState(() => {
    const local = localStorage.getItem(`${localStorageKey}_deleted`);
    if (local !== null) return local === "true";
    const persisted = (persistedDefaults?.localStorageDump as Record<string, any>)?.[`${localStorageKey}_deleted`];
    if (persisted !== undefined) {
      return persisted === true || persisted === "true";
    }
    return false;
  });

  useEffect(() => {
    const handleCommit = () => {
      if (isDeleted) {
        localStorage.setItem(`${localStorageKey}_deleted`, "true");
      } else {
        localStorage.removeItem(`${localStorageKey}_deleted`);
      }
    };
    window.addEventListener("ae_commit_save", handleCommit);
    return () => {
      window.removeEventListener("ae_commit_save", handleCommit);
    };
  }, [localStorageKey, isDeleted]);

  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(`${localStorageKey}_deleted`);
      setIsDeleted(false);
    };

    window.addEventListener("ae_reset_all_custom", handleReset);
    return () => {
      window.removeEventListener("ae_reset_all_custom", handleReset);
    };
  }, [localStorageKey]);

  if (isDeleted) return null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleted(true);
    window.dispatchEvent(new Event("ae_unsaved_change"));
    
    window.dispatchEvent(new CustomEvent("ae_save_success", {
      detail: { 
        title: "已临时隐藏 / Element Hidden", 
        desc: `已将此${label}临时隐藏，点击顶部的“保存修改”以完成永久保存。` 
      }
    }));
  };

  if (isEditMode) {
    return (
      <div className={`relative group/edit duration-150 outline-dashed outline-1 outline-orange-500/20 hover:outline-orange-500/80 p-0.5 rounded ${className}`}>
        {children}
        <button
          type="button"
          onClick={handleDelete}
          className="absolute -top-2.5 -right-2 bg-rose-600 hover:bg-rose-500 text-white p-0.5 rounded-full shadow-md opacity-0 group-hover/edit:opacity-100 transition-opacity z-50 flex items-center justify-center cursor-pointer"
          title={`删除/隐藏此${label}`}
          style={{ width: "16px", height: "16px" }}
        >
          <X style={{ width: "10px", height: "10px" }} />
        </button>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
