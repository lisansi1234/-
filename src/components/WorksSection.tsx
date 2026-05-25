import React, { FormEvent } from "react";
import { DesignBrief } from "../types";
import AnkerBlueListingSystem from "./AnkerBlueListingSystem";
import DeletableText from "./DeletableText";

interface WorksSectionProps {
  worksSubTab: "showcase" | "sandbox" | "aplus";
  setWorksSubTab: (tab: "showcase" | "sandbox" | "aplus") => void;
  productName: string;
  setProductName: (name: string) => void;
  designStyle: string;
  setDesignStyle: (style: string) => void;
  extraRequirements: string;
  setExtraRequirements: (reqs: string) => void;
  isLoading: boolean;
  loaderLogs: string[];
  activeLogIndex: number;
  currentBrief: DesignBrief | null;
  disassemblyFactor: number;
  setDisassemblyFactor: (factor: number) => void;
  hoveredLayerIndex: number | null;
  setHoveredLayerIndex: (index: number | null) => void;
  aplusLayoutType: "basic" | "premium";
  setAplusLayoutType: (type: "basic" | "premium") => void;
  handleGenerateDesign: (e: FormEvent) => void;
  loadPresetProduct: (key: "power" | "earbuds" | "keyboard") => void;
  isEditMode: boolean;
  visibleSections?: string[];
  toggleSection?: (id: string) => void;
}

export default function WorksSection({
  worksSubTab,
  setWorksSubTab,
  productName,
  setProductName,
  designStyle,
  setDesignStyle,
  extraRequirements,
  setExtraRequirements,
  isLoading,
  setIsLoading,
  loaderLogs,
  activeLogIndex,
  currentBrief,
  disassemblyFactor,
  setDisassemblyFactor,
  hoveredLayerIndex,
  setHoveredLayerIndex,
  aplusLayoutType,
  setAplusLayoutType,
  handleGenerateDesign,
  loadPresetProduct,
  isEditMode,
  setIsEditMode,
  isVerified,
  onOpenLoginModal,
  visibleSections = ["works_banner", "works_showcase", "works_sandbox", "works_aplus"],
  toggleSection = () => {}
}: any) {
  return (
    <div id="works-navigation-inner-anchor" className="space-y-10 animate-fade-in scroll-mt-24 select-none text-left">
      
      {/* Unified Outbound Digital Workshop Panel */}
      <div className="pt-2 animate-fade-in">
        <AnkerBlueListingSystem 
          isEditMode={isEditMode} 
          setIsEditMode={setIsEditMode}
          isVerified={isVerified}
          onOpenLoginModal={onOpenLoginModal}
          visibleSections={visibleSections}
          toggleSection={toggleSection}
          productName={productName}
          setProductName={setProductName}
          designStyle={designStyle}
          setDesignStyle={setDesignStyle}
          extraRequirements={extraRequirements}
          setExtraRequirements={setExtraRequirements}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          loaderLogs={loaderLogs}
          activeLogIndex={activeLogIndex}
          currentBrief={currentBrief}
          disassemblyFactor={disassemblyFactor}
          setDisassemblyFactor={setDisassemblyFactor}
          hoveredLayerIndex={hoveredLayerIndex}
          setHoveredLayerIndex={setHoveredLayerIndex}
          aplusLayoutType={aplusLayoutType}
          setAplusLayoutType={setAplusLayoutType}
          handleGenerateDesign={handleGenerateDesign}
          loadPresetProduct={loadPresetProduct}
        />
      </div>
    </div>
  );
}
