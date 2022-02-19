import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL;
console.log(BASE_URL);

export const logIn = (dispatch) => {
  if (window.localStorage.getItem("course_token")) {
    dispatch({ type: "courses/logIn" });
  }

  const popupCenter = (title, w, h) => {
    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : window.screen.width;
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : window.screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    const newWindow = window.open(
      "about:blank",
      title,
      `
        scrollbars=yes,
        width=${w / systemZoom}, 
        height=${h / systemZoom}, 
        top=${top}, 
        left=${left}
        `
    );

    newWindow?.focus();

    const pollTimer = window.setInterval(() => {
      if (newWindow && newWindow.closed !== false) {
        window.clearInterval(pollTimer);
      }
    }, 200);
    
    return newWindow;
  };

  const loginWindow = popupCenter("Login with CMU Email", 400, 600);
  axios.get(BASE_URL + "/auth/signRequest").then((response) => {
    if (response.data.token) {
      if (loginWindow) {
        loginWindow.location.href =
          "https://login.scottylabs.org/login/" + response.data.token;
      } else {
        alert("Unable to create login request");
      }
    }
  });

  window.addEventListener(
    "message",
    (event) => {
      if (event.origin !== "https://login.scottylabs.org") return;
      else {
        window.localStorage.setItem("course_token", event.data);
        axios
          .post(BASE_URL + "/auth/login", {
            token: event.data,
          })
          .then(() => {
            dispatch({ type: "courses/logIn" });
          })
          .catch(() => {
            dispatch({ type: "courses/logOut" });
            alert("Failed to log in");
          });
      }
    },
    false
  );
};

export const logOut = (dispatch) => {
  window.localStorage.removeItem("course_token");
  dispatch({ type: "courses/logOut" });
};
