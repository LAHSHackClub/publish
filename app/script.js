
async function getPeristLog() {
  const res = await fetch(`/log/${club.id}`);
  const json = await res.json();
  document.querySelector("#log").innerHTML = json._log.join("<br />");
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
    setInterval(getPeristLog, 3000);
  }
  catch (e) {
    document.querySelector("#log").innerHTML = "error "+e;
    console.error(e);
  }
}