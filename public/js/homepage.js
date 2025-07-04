async function addBox() {
  // You can later replace these with actual user input
  const title = "Add a title";
  const content = "Type something...";
  const color = "#f3e9c0"; // default white background

  try {
    const response = await fetch("/addbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color, title, content })
    });

    if (!response.ok) {
      throw new Error("Failed to save box to database");
    }

    const data = await response.json(); // { id, color, title, content }

    addBoxFromData(data); // your rendering function
  } catch (err) {
    console.error("Error adding box:", err);
  }
}

function addBoxFromData(data) {
  const plusBox = document.getElementById("parent");

  const box = document.createElement("div");
  box.classList.add("box");
  if (data.color) box.style.backgroundColor = data.color;
  box.setAttribute("id", data.id);
  const contentbox = document.createElement("div");
  contentbox.classList.add("contentbox");
  box.appendChild(contentbox);

  const titlebox = document.createElement("p");
  titlebox.classList.add("titlebox");
  titlebox.innerText = data.title || "";
  contentbox.appendChild(titlebox);

  const descriptionbox = document.createElement("p");
  descriptionbox.innerText = data.content || "";
  descriptionbox.classList.add("descriptionbox");
  contentbox.appendChild(descriptionbox);

  const box_parent = document.createElement("div");
  box_parent.classList.add("box-parent");
  box.appendChild(box_parent);

  const gearboxdiv = document.createElement("div");
  gearboxdiv.classList.add("gearboxdiv");
  const gearButton = document.createElement("img");
  gearButton.classList.add("gearButton");
  gearButton.src = "/images/options-wheel.svg";
  gearboxdiv.appendChild(gearButton);
  box_parent.appendChild(gearboxdiv);

  const colorboxdiv = document.createElement("div");
  colorboxdiv.classList.add("colorboxdiv");
  const colorButton = document.createElement("img");
  colorButton.classList.add("colorButton");
  colorButton.src = "/images/dots-horizontal.svg";
  colorboxdiv.appendChild(colorButton);
  box_parent.appendChild(colorboxdiv);

  const gearpalette = document.createElement("div");
  gearpalette.classList.add("gearpalette");
  gearpalette.hidden = true;
  gearpalette.insertAdjacentHTML("beforeend", `
    <button class="geared-button openbtn">Open</button>
    <button class="geared-button deletebtn">Delete</button>
  `);
  gearboxdiv.appendChild(gearpalette);
  gearboxdiv.addEventListener("click", (e) => {
    e.stopPropagation();
    gearpalette.hidden = !gearpalette.hidden;
  });


  // opened note 
  const openbtn = gearpalette.querySelector('.openbtn');
  openbtn.addEventListener("click", async (e) => {
    const data = await fetchBoxesInfoDatabase();
    const boxId = e.target.closest(".box").getAttribute("id");
    const boxdata = data.find(box => box.id == boxId);
    openTheNote(boxdata);
  });
  box.addEventListener("dblclick", async (e) => {
    const data = await fetchBoxesInfoDatabase();
    const boxId = e.target.closest(".box").getAttribute("id");
    const boxdata = data.find(box => box.id == boxId);
    openTheNote(boxdata);
  });

  //delete btn ftn
  const deletebtn = gearpalette.querySelector('.deletebtn');
  deletebtn.addEventListener("click", async (e) => {

    e.stopPropagation();
    const boxId = e.target.closest(".box").getAttribute("id");

    const response = await fetch("/deletebox", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: boxId })
    });
    if (response.ok) {
      box.remove();
      //close box if opened
      const openednoteparent = document.querySelector('.openedNote-parent');
      openednoteparent.classList.remove('appliedchanges');

      console.log("Box deleted");
    } else {
      console.error("Failed to delete box");
    }
  });

  const colorpalette = document.createElement("div");
  colorpalette.classList.add("colorpalette");
  colorpalette.hidden = true;
  colorpalette.insertAdjacentHTML("beforeend", `
    <button class="colored-button" style="background-color:#d4e6f1;"></button>
    <button class="colored-button" style="background-color:#E8E0D1;"></button>
    <button class="colored-button" style="background-color:#F3E9C0;"></button>
    <button class="colored-button" style="background-color:#FAC7AB;"></button>
    <button class="colored-button" style="background-color:#ECBDC2;"></button>
  `);
  colorboxdiv.appendChild(colorpalette);

  //hide color palette
  colorboxdiv.addEventListener("click", (e) => {
    e.stopPropagation();
    colorpalette.hidden = !colorpalette.hidden;
  });

  document.addEventListener("click", () => {
    colorpalette.hidden = true;
    gearpalette.hidden = true;
    const openednoteparent = document.querySelector('.openedNote-parent');
    openednoteparent.classList.remove('appliedchanges');
  });

  const colorchangebtn = colorpalette.querySelectorAll('.colored-button');
  colorchangebtn.forEach(button => {

    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      const boxId = e.target.closest(".box").getAttribute("id");
      const newColor = rgbToHex(e.target.style.backgroundColor);

      const response = await fetch("/updateColor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: boxId, color: newColor })
      });
      if (response.ok) {
        console.log("color updated");
        box.style.backgroundColor = newColor;


      } else {
        console.error("Failed to update color");
      }
    });
  });
  const addButton = document.querySelector(".addBox-button");
  plusBox.insertBefore(box, addButton);
}

// fetch and load bozes from db
document.addEventListener("DOMContentLoaded", () => {
  fetchBoxesFromDatabase();
});

async function fetchBoxesFromDatabase() {
  try {
    const response = await fetch("/api/boxes");
    const boxes = await response.json();
    boxes.forEach(box => addBoxFromData(box));
    return boxes;
  } catch (err) {
    console.error("Failed to fetch boxes:", err);
  }
}

//rgb to hex
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g); // extract R, G, B values
  if (!result) return null;

  return (
    "#" +
    result
      .slice(0, 3)
      .map((x) => parseInt(x).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

//close the opened note
const openednoteparent = document.querySelector('.openedNote-parent');
const closeOpenedNote = document.querySelector('.cross-btn');

// 1. Close when clicking the cross button
closeOpenedNote.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent it from bubbling to document
  openednoteparent.classList.remove('appliedchanges');
});

// 2. Close when clicking *outside* the note
document.addEventListener("click", (e) => {
  const isInside = openednoteparent.contains(e.target);
  const isCrossBtn = e.target.closest('.cross-btn') !== null;

  if (!isInside && !isCrossBtn) {
    openednoteparent.classList.remove('appliedchanges');
  }
});
// 3. Prevent closing when clicking *inside*
openednoteparent.addEventListener("click", (e) => {
  e.stopPropagation();
});


//make the note editable
const saveBtn = document.querySelector('.save-data');
saveBtn.addEventListener("click", async (e) => {
  try {
    const note = e.target.closest(".openedNote-parent");

    // Replace any textarea with <p> before saving
    ["title-section", "description-section"].forEach(className => {
      const textarea = note.querySelector(`textarea.${className}`);
      if (textarea) {
        const p = document.createElement("p");
        p.className = className;
        p.innerHTML = textarea.value;
        textarea.replaceWith(p);
      }
    });

    // Get updated content
    const id = note.getAttribute("id");
    const title = note.querySelector('.title-section').textContent;
    const content = note.querySelector('.description-section').innerHTML.replace(/<br\s*\/?>/gi, "\n");

    console.log("data neing saved:", content);
    const response = await fetch("/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, content })
    });

    if (response.ok) {
      console.log("Data saved successfully");
    } else {
      console.error("Save failed");
    }

    //also update the content on the minmimized notes
    const boxToUpdate = document.querySelector(`#parent .box[id="${id}"]`);
    boxToUpdate.querySelector(".titlebox").innerText = title;
    boxToUpdate.querySelector(".descriptionbox").innerText = content;


  } catch (err) {
    console.error("Error while saving data", err);
  }
});

document.addEventListener("dblclick", (e) => {
  if (e.target.matches(".title-section, .description-section")) {
    const p = e.target;
    const textarea = document.createElement("textarea");
    textarea.className = p.className;
    textarea.value = p.innerHTML.replace(/<br\s*\/?>/gi, "\n");
    p.replaceWith(textarea);
    textarea.focus();

    const handleClickOutside = (event) => {
      if (event.target !== textarea) {
        const newP = document.createElement("p");
        newP.className = textarea.className;
        newP.innerHTML = textarea.value;
        textarea.replaceWith(newP);
        document.removeEventListener("click", handleClickOutside);
      }
    };

    // Delay to prevent double-click from triggering immediate blur
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
  }
});


function openTheNote(data) {
  const openednoteparent = document.querySelector('.openedNote-parent');
  openednoteparent.style.backgroundColor = data.color;
  openednoteparent.classList.add('appliedchanges');
  const titleSectionOfNote = document.querySelector('.title-section');
  titleSectionOfNote.innerText = data.title;
  const descriptionSectionOfNote = document.querySelector('.description-section');
  data.content = data.content;

  descriptionSectionOfNote.innerText = data.content;
  openednoteparent.setAttribute("id", data.id);
}


async function fetchBoxesInfoDatabase() {
  try {
    const response = await fetch("/api/boxes");
    const boxes = await response.json();
    return boxes;
  } catch (err) {
    console.error("Failed to fetch boxes:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const menubtn = document.querySelector(".menubtn");
  const sidebarparent = document.querySelector(".sidebar-parent");
  const sidebarheader = document.querySelector(".sidebar-header");
  const listofbtns = document.querySelector(".listOfbtns");
  const headerdiv = document.querySelector(".header-div");
  const childdiv = document.querySelector(".child-div");
  const findspan = sidebarparent.querySelectorAll("span");

  menubtn.addEventListener("click", () => {
    sidebarheader.classList.toggle("sidebar-header-btn-toggle");
    listofbtns.classList.toggle("list-toggle");
    sidebarparent.classList.toggle("sidebar-parent-toggle");
    headerdiv.classList.toggle("header-div-toggle");
    childdiv.classList.toggle("child-div-toggle");
    findspan.forEach((span)=>{
    span.style.visibility = span.style.visibility === "hidden" ? "visible" : "hidden";
    });
  });
});