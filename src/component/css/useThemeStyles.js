import { useEffect } from "react";

const useThemeStyles = (isColorChanged) => {
  useEffect(() => {
    document.documentElement.style.setProperty('--color1-color', isColorChanged ? '#06090E' : '#072E70');     // фон navbar
    document.documentElement.style.setProperty('--colorText-color', isColorChanged ? '#ffffff' : '#072E70');  // цвет текста
    document.documentElement.style.setProperty('--colorTextHeaderDate-color', isColorChanged ? '#ffffff' : '#072E70');  // цвет текста
    document.documentElement.style.setProperty('--color2-color', isColorChanged ? '#cfe8ff' : '#ffffff');     // фон чата
    document.documentElement.style.setProperty('--color3-color', isColorChanged ? '#152A3D' : '#d4e4ff');     // фон sidebar
    document.documentElement.style.setProperty('--color4-color', isColorChanged ? '#06090E' : '#174FAD');     // цвет ползунка у прокрутки
    document.documentElement.style.setProperty('--color5-color', isColorChanged ? '#f0f6fd' : '#ffffff');     // фон сообщения-запроса
<<<<<<< HEAD
    document.documentElement.style.setProperty('--color6-color', isColorChanged ? '#06090E' : '#2D4D82');     // цвет границ сообщения-ответа
    document.documentElement.style.setProperty('--color7-color', isColorChanged ? '#437FB1' : '#608bd6');     // светлый цвет на странице входа
    document.documentElement.style.setProperty('--colorItemHover-color', isColorChanged ? '#437FB1' : '#a6c8ff');    // при наведении курсора на чат
    document.documentElement.style.setProperty('--colorItemMouse-color', isColorChanged ? '#294F74' : '#8bb1ff');    // при выборе чата
    document.documentElement.style.setProperty('--colorShadow-color', isColorChanged ? '0 0 5px 2px rgba(95, 94, 94, 0.5)' : '0 0 5px 3px rgba(0, 0, 0, 0.1)'); // тень у чатов в sidebar
    document.documentElement.style.setProperty('--color1Trans-color', isColorChanged ? 'rgba(6, 9, 14, 0.4)' : 'rgba(7, 46, 112, 0.4)');     // фон navbar
=======
    document.documentElement.style.setProperty('--color6-color', isColorChanged ? '#070b31' : '#2D4D82');     // цвет границ сообщения-ответа
    document.documentElement.style.setProperty('--colorItemHover-color', isColorChanged ? '#193e74' : '#a6c8ff');    // при наведении курсора на чат
    document.documentElement.style.setProperty('--colorItemMouse-color', isColorChanged ? '#072d65' : '#8bb1ff');    // при выборе чата
    document.documentElement.style.setProperty('--colorShadow-color', isColorChanged ? '0 0 5px 1px #ccc' : '0 0 5px 3px rgba(0, 0, 0, 0.1)')
>>>>>>> 2a1949bc795f4b122bc18afa76bb3fb425da6716
  }, [isColorChanged]);
};

export default useThemeStyles;
