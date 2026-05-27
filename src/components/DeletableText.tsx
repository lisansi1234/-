import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import persistedDefaults from "../data/persisted_defaults.json";

interface DeletableTextProps {
  id: string;
  defaultText: string;
  isEditMode: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "li" | "b" | "strong" | "italic" | "em";
}

export default function DeletableText({
  id,
  defaultText,
  isEditMode,
  className = "",
  as = "span"
}: DeletableTextProps) {
  const localStorageKey = `ae_deltext_v3_${id}`;
  
  const [text, setText] = useState(() => {
    try {
      const local = localStorage.getItem(localStorageKey);
      if (local !== null) return local;
    } catch (e) {
      console.warn("localStorage block listed or empty", e);
    }
    const persisted = (persistedDefaults?.localStorageDump as Record<string, string>)?.[localStorageKey];
    if (persisted !== undefined) return persisted;
    return defaultText;
  });
  
  const [isDeleted, setIsDeleted] = useState(() => {
    try {
      const local = localStorage.getItem(`${localStorageKey}_deleted`);
      if (local !== null) return local === "true";
    } catch (e) {
      console.warn("localStorage block listed or empty", e);
    }
    const persisted = (persistedDefaults?.localStorageDump as Record<string, any>)?.[`${localStorageKey}_deleted`];
    if (persisted !== undefined) {
      return persisted === true || persisted === "true";
    }
    return false;
  });

  const [extraClasses, setExtraClasses] = useState(() => {
    try {
      const local = localStorage.getItem(`ae_delstyle_${id}`);
      if (local !== null) return local;
    } catch (e) {
      console.warn("localStorage block listed or empty", e);
    }
    const persisted = (persistedDefaults?.localStorageDump as Record<string, string>)?.[`ae_delstyle_${id}`];
    if (persisted !== undefined) return persisted;
    return "";
  });

  const [siblings, setSiblings] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`ae_deltext_v3_${id}_siblings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed parsing saved partners", e);
    }
    try {
      const persisted = (persistedDefaults?.localStorageDump as Record<string, any>)?.[`ae_deltext_v3_${id}_siblings`];
      if (persisted !== undefined && persisted !== null) {
        return typeof persisted === "string" ? JSON.parse(persisted) : persisted;
      }
    } catch (e) {
      console.warn("Failed parsing persisted siblings", e);
    }
    return [];
  });

  // Listen for the global save event to commit changes to localStorage
  useEffect(() => {
    const handleCommit = () => {
      localStorage.setItem(localStorageKey, text);
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
  }, [localStorageKey, text, isDeleted]);

  // Listen to custom event for resets
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem(localStorageKey);
      localStorage.removeItem(`${localStorageKey}_deleted`);
      localStorage.removeItem(`ae_delstyle_${id}`);
      localStorage.removeItem(`ae_deltext_v3_${id}_siblings`);
      setText(defaultText);
      setIsDeleted(false);
      setExtraClasses("");
      setSiblings([]);
    };

    window.addEventListener("ae_reset_all_custom", handleReset);
    return () => {
      window.removeEventListener("ae_reset_all_custom", handleReset);
    };
  }, [localStorageKey, defaultText, id]);

  // Synchronize state dynamically when the live server defaults are retrieved/fetched
  useEffect(() => {
    const handleDefaultsLoaded = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const data = customEvent.detail;
      if (data && data.localStorageDump) {
        const local = localStorage.getItem(localStorageKey);
        if (local === null) {
          const persisted = data.localStorageDump[localStorageKey];
          if (persisted !== undefined) setText(persisted);
        }
        
        const localDel = localStorage.getItem(`${localStorageKey}_deleted`);
        if (localDel === null) {
          const persisted = data.localStorageDump[`${localStorageKey}_deleted`];
          if (persisted !== undefined) {
            setIsDeleted(persisted === true || persisted === "true");
          }
        }

        const localStyle = localStorage.getItem(`ae_delstyle_${id}`);
        if (localStyle === null) {
          const persisted = data.localStorageDump[`ae_delstyle_${id}`];
          if (persisted !== undefined) setExtraClasses(persisted);
        }

        const localSiblings = localStorage.getItem(`ae_deltext_v3_${id}_siblings`);
        if (localSiblings === null) {
          const persisted = data.localStorageDump[`ae_deltext_v3_${id}_siblings`];
          if (persisted !== undefined && persisted !== null) {
            setSiblings(typeof persisted === "string" ? JSON.parse(persisted) : persisted);
          }
        }
      }
    };

    window.addEventListener("ae_dynamic_defaults_loaded", handleDefaultsLoaded);

    // If global files already fetched in the background, update immediately
    const globalWin = (window as any);
    if (globalWin.__loadedDynamicDefaults) {
      const fakeEvent = new CustomEvent("ae_dynamic_defaults_loaded", { detail: globalWin.__loadedDynamicDefaults });
      handleDefaultsLoaded(fakeEvent);
    }

    return () => {
      window.removeEventListener("ae_dynamic_defaults_loaded", handleDefaultsLoaded);
    };
  }, [id, localStorageKey]);

  const addSibling = () => {
    const next = [...siblings, "✍️ 键入新高管级出海视觉文案规划段落 (点击即可修改)..."];
    setSiblings(next);
    localStorage.setItem(`ae_deltext_v3_${id}_siblings`, JSON.stringify(next));
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  const deleteSibling = (index: number) => {
    const next = siblings.filter((_, idx) => idx !== index);
    setSiblings(next);
    localStorage.setItem(`ae_deltext_v3_${id}_siblings`, JSON.stringify(next));
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  const updateSiblingText = (index: number, newText: string) => {
    const next = [...siblings];
    next[index] = newText;
    setSiblings(next);
    localStorage.setItem(`ae_deltext_v3_${id}_siblings`, JSON.stringify(next));
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  const applyOption = (action: string) => {
    let classes = extraClasses.split(" ").filter(Boolean);
    
    if (action === "size-up" || action === "size-down") {
      const sizes = [
        'text-[10px]', 'text-xs', 'text-sm', 'text-base', 
        'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 
        'text-4xl', 'text-5xl', 'text-6xl'
      ];
      let currentIdx = -1;
      sizes.forEach((s, idx) => {
        if (classes.includes(s) || className.includes(s)) {
          currentIdx = idx;
        }
      });
      if (currentIdx === -1) {
        currentIdx = 3; // default text-base
      }
      let targetIdx = currentIdx + (action === "size-up" ? 1 : -1);
      if (targetIdx >= 0 && targetIdx < sizes.length) {
        classes = classes.filter(c => !sizes.includes(c));
        classes.push(sizes[targetIdx]);
      }
    } else if (action === "bold") {
      const isCurrentlyBold = classes.includes("font-bold") || className.includes("font-bold");
      classes = classes.filter(c => c !== "font-bold" && c !== "font-light" && c !== "font-medium" && c !== "font-light");
      if (isCurrentlyBold) {
        classes.push("font-light");
      } else {
        classes.push("font-bold");
      }
    } else if (action === "italic") {
      const isCurrentlyItalic = classes.includes("italic") || className.includes("italic");
      classes = classes.filter(c => c !== "italic" && c !== "not-italic");
      if (isCurrentlyItalic) {
        classes.push("not-italic");
      } else {
        classes.push("italic");
      }
    } else if (action.startsWith("color-")) {
      const colorMap: Record<string, string> = {
        "color-white": "text-white",
        "color-cyan": "text-[#00d2ff]",
        "color-blue": "text-[#0066ff]",
        "color-orange": "text-[#ff6b00]",
        "color-zinc": "text-zinc-500"
      };
      const colors = Object.values(colorMap);
      classes = classes.filter(c => !colors.includes(c));
      const newColor = colorMap[action];
      if (newColor) classes.push(newColor);
    } else if (action === "add-sibling-p") {
      addSibling();
      return;
    } else if (action === "delete-node") {
      setIsDeleted(true);
      window.dispatchEvent(new Event("ae_unsaved_change"));
      return;
    }
    
    const nextStyles = classes.join(" ");
    setExtraClasses(nextStyles);
    localStorage.setItem(`ae_delstyle_${id}`, nextStyles);
    window.dispatchEvent(new Event("ae_unsaved_change"));
  };

  useEffect(() => {
    const handleStyleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string }>;
      if (customEvent.detail && customEvent.detail.action) {
        applyOption(customEvent.detail.action);
      }
    };
    window.addEventListener(`ae_apply_style_${id}`, handleStyleChange);
    return () => {
      window.removeEventListener(`ae_apply_style_${id}`, handleStyleChange);
    };
  }, [id, extraClasses, className, siblings]);

  if (isDeleted) return null;

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const val = e.currentTarget.innerText;
    if (val !== text) {
      setText(val);
      window.dispatchEvent(new Event("ae_unsaved_change"));
      
      // Dispatch system-wide draft updated toast notification event
      window.dispatchEvent(new CustomEvent("ae_save_success", {
        detail: { 
          title: "草稿已更新 / Draft Updated", 
          desc: `修改文本暂存至草稿，由于配置需要，请点击“保存修改”实现永久保存。` 
        }
      }));
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleted(true);
    window.dispatchEvent(new Event("ae_unsaved_change"));
    
    // Dispatch system-wide draft updated event
    window.dispatchEvent(new CustomEvent("ae_save_success", {
      detail: { 
        title: "已临时隐藏 / Element Hidden", 
        desc: "已将此文字段落临时隐藏，点击顶部的“保存修改”以完成永久保存。" 
      }
    }));
  };

  const Component = as;

  if (isEditMode) {
    return (
      <span className="relative group/edit text-left inline-block max-w-full">
        <Component
          data-text-id={id}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          className={`outline-dashed outline-1 outline-orange-500/40 hover:outline-orange-500/80 px-1.5 py-0.5 rounded transition-all focus:outline-solid focus:outline-2 focus:outline-[#FF6B00] leading-relaxed cursor-text ${className} ${extraClasses}`}
        >
          {text}
        </Component>
        
        {siblings.map((sib, sIdx) => (
          <p
            key={sIdx}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateSiblingText(sIdx, e.currentTarget.innerText)}
            className="text-xs text-zinc-400 mt-2 outline-dashed outline-1 outline-orange-500/30 hover:outline-orange-500/60 focus:outline-[#FF6B00] rounded px-1.5 py-0.5 block leading-relaxed relative group/sibling transition-all"
          >
            {sib}
            <button
              type="button"
              onClick={() => deleteSibling(sIdx)}
              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white p-0.5 rounded-full shadow-md opacity-0 group-hover/sibling:opacity-100 transition-opacity z-50 flex items-center justify-center cursor-pointer"
              style={{ width: "14px", height: "14px" }}
              title="删除此段落 / Delete Sibling"
            >
              <X style={{ width: "8px", height: "8px" }} />
            </button>
          </p>
        ))}

        <button
          type="button"
          onClick={handleDelete}
          className="absolute -top-2.5 -right-3 bg-red-600 hover:bg-red-500 text-white p-0.5 rounded-full shadow-md opacity-0 group-hover/edit:opacity-100 transition-opacity z-50 flex items-center justify-center cursor-pointer"
          title="Delete this line / 删除此文本行"
          style={{ width: "16px", height: "16px" }}
        >
          <X style={{ width: "10px", height: "10px" }} />
        </button>
      </span>
    );
  }

  if (siblings.length === 0) {
    return <Component className={`${className} ${extraClasses}`}>{text}</Component>;
  }

  return (
    <span className="inline-block max-w-full text-left">
      <Component className={`${className} ${extraClasses}`}>{text}</Component>
      {siblings.map((sib, sIdx) => (
        <span key={sIdx} className="text-xs text-zinc-400 mt-2 leading-relaxed block">
          {sib}
        </span>
      ))}
    </span>
  );
}
