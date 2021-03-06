
async function getPeristLog() {
  const res = await fetch(`/log/${club.id}`)
    .catch(e => document.querySelector("#log").innerHTML += "<br /> error! (network issue?) "+e);
  const json = await res.json();
  document.querySelector("#log").innerHTML = json._log.join("<br />");
  document.querySelector(".ov-log").scrollBy(0, 1000);
}

let club;
let lastPublish;
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const clubId = new URLSearchParams(window.location.search).get("club");
    if (!clubId) throw new Error("No club ID provided");
    club = await (await fetch(`/club/${clubId}`)).json();

    document.querySelector("#club").innerHTML = club.name;
    document.querySelector("#status").href = `https://${club.short}.lahs.club`;
    document.querySelector("#status").innerHTML = `${club.short}.lahs.club`;
    document.querySelector("#publish").removeAttribute("disabled");
  }
  catch (e) {
    console.error(e);
  }
});
async function publish() {
  try {
    fetch(`/club/${club.id}`, { method: "POST" });

    document.querySelector(".ov-log").classList.add("shown");
    setTimeout(() => {
      setInterval(getPeristLog, 3000);
    }, 2000);
  }
  catch (e) {
    document.querySelector("#log").innerHTML = "error "+e;
    console.error(e);
  }
}