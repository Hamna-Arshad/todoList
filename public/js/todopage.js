
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
    findspan.forEach((span) => {
      span.style.visibility = span.style.visibility === "hidden" ? "visible" : "hidden";
    });
  });
});


function addListItems(item) {
  const parentcontainer = document.querySelector(".listitems");
  //list item
  const listitem = document.createElement("div");
  listitem.classList.add("listitem");
  listitem.setAttribute("id", item.id);
  //checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("checkbox");
  checkbox.checked = item.status;
  //move box to end
  checkbox.addEventListener("click", () => {
    updateCheckboxItem(checkbox);
  });
  listitem.appendChild(checkbox);
  //text area
  const textfield = document.createElement("textarea");
  textfield.classList.add("textarea");
  textfield.innerHTML = item.description;
  //deletebtn
  const delbtn = document.createElement("img");
  delbtn.src = "/images/delete.svg";
  delbtn.classList.add("delbtn");


  listitem.appendChild(delbtn);
  listitem.appendChild(textfield);
  parentcontainer.prepend(listitem);
  if (checkbox.checked) {
    textfield.classList.add("checkedbox");
    updateCheckboxItem(checkbox);
  }
}

//update the checkbox status and move the item
const listcontainer = document.querySelector(".listitems");

function updateCheckboxItem(checkbox) {
  const parentlistitem = checkbox.closest(".listitem");
  const textarea = parentlistitem.querySelector(".textarea");

  if (checkbox.checked) {
    textarea.classList.add("checkedbox");
    listcontainer.appendChild(parentlistitem);
  } else {
    textarea.classList.remove("checkedbox");
    listcontainer.prepend(parentlistitem);
  }
}


// Attach listener for existing checkboxes
listcontainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("checkbox")) {
    updateCheckboxItem(e.target);
  }
  if (e.target.classList.contains("delbtn")) {
    const parentContainer = e.target.closest(".listitem");
    const boxid = parentContainer.getAttribute("id");
    //remove from db
    try {
      const response = await fetch("/deleteListItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: boxid }) 
      });
      if (response.ok) {
        if (parentContainer) parentContainer.remove();

      }
    } catch (error) {
      console.log("Error deleting item");
    }
  }
});

//get all the items from the db
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/getItemData", { method: "GET" });
    const data = await response.json();

    data.forEach(row => {
      addListItems(row);
    });
  } catch (error) {
    console.error("Error updating list", error);
  }
});


async function addItems() {
  try {
    const response = await fetch("/addNewItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (response.ok) {
      const data = await response.json();
      console.log("new item added", data);
      addListItems(data);
    }
  } catch (error) {
    console.error("Error adding a new list item", error);

  }
}

document.querySelector(".savelistitem-button").addEventListener("click", async () => {
  try {
    const listitems = document.querySelectorAll(".listitem");
    const itemdata = [];

    listitems.forEach((item) => {
      const id = item.getAttribute("id");
      const status = item.querySelector(".checkbox").checked;
      const description = item.querySelector(".textarea").value;

      itemdata.push({ id, description, status });
    });

    const response = await fetch("/storeItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemdata)
    });

    if (response.ok) {
      console.log("Data saved successfully");
    } else {
      console.error("Save failed");
    }

  } catch (error) {
    console.log("Error saving data!", error);
  }
});
