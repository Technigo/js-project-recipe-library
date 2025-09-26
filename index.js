const kitchenButtons = document.querySelectorAll(".btn-filter-kitch");
const sortButtons = document.querySelectorAll(".btn-sort")


//kitchen filter - can choose multiple, but All is always chosen alone

kitchenButtons.forEach(btn => {
  btn.addEventListener("click", () => {
 
    const isAll = btn.textContent.trim() === "All";

    if(isAll) {
      kitchenButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    else {
      btn.classList.toggle("active");
      const allBtn = [...kitchenButtons].find(b => b.textContent.trim() === "All");
      allBtn.classList.remove("active");
    }
    applyFiltersAndSorting();
  });
});

//clear active state function
function clearActive(group) {
  group.forEach(btn => btn.classList.remove("active"));
}

//sorting cards by
sortButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    clearActive(sortButtons);
    btn.classList.add("active");
    applyFiltersAndSorting();
  });
});