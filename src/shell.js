const version = document.getElementById("version");
const menu = document.getElementById("menu");
const navigation = document.getElementById("navigation");
const preferenceKey = "onimusha2-guide:preferred-version";

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const preferredVersion = storage()?.getItem(preferenceKey);
if (["ps2", "ps4"].includes(preferredVersion)) version.value = preferredVersion;

version.addEventListener("change", () => {
  try {
    storage()?.setItem(preferenceKey, version.value);
  } catch {
    // The page remains usable when browser storage is unavailable.
  }
});

function closeMenu() {
  navigation.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
}

menu.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    menu.focus();
  }
});

for (const link of navigation.querySelectorAll("a")) {
  link.addEventListener("click", closeMenu);
}
