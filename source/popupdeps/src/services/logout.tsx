export const Logout = () => {
  chrome.runtime.sendMessage({ swaction: "SIGN_USER_OUT" });
}