import { useEffect } from "react";

const useThemeStyles = (isColorChanged) => {
  useEffect(() => {
    document.documentElement.style.setProperty('--color1-color', isColorChanged ? '#020f2e' : '#072E70');
    document.documentElement.style.setProperty('--colorText-color', isColorChanged ? '#ffffff' : '#072E70');
    document.documentElement.style.setProperty('--color2-color', isColorChanged ? '#cfe8ff' : '#ffffff');
    document.documentElement.style.setProperty('--color3-color', isColorChanged ? '#06255A' : '#d4e4ff');
    document.documentElement.style.setProperty('--color4-color', isColorChanged ? '#688abd' : '#174FAD');
    document.documentElement.style.setProperty('--color5-color', isColorChanged ? '#f0f6fd' : '#ffffff');
    document.documentElement.style.setProperty('--color6-color', isColorChanged ? '#070b31' : '#2D4D82');
    document.documentElement.style.setProperty('--colorItemHover-color', isColorChanged ? '#193e74' : '#a6c8ff');
    document.documentElement.style.setProperty('--colorItemMouse-color', isColorChanged ? '#072d65' : '#8bb1ff');
  }, [isColorChanged]);
};

export default useThemeStyles;
