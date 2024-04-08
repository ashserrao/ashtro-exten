//Redirect to profile page ========================
const profileIconButton = document.getElementById("profile");

profileIconButton.onclick = function () {
  window.location = "profile.html";
};

//Clicking on anywhere on the document calling function redirect============
const cardClick = document.getElementById("clickcard");

cardClick.onclick = redirect;

//redirect function=====================
function redirect() {
  window.location = "./softConfig.html";
}

//Calling HTML variables ===============================================
const ramProgress = document.querySelector(".ram-progress");
const ramCapacity = document.getElementById("ram-capacity");
const ramUsage = document.getElementById("ram-usage");
const cpuModel = document.getElementById("cpu-model");
const cpuCore = document.getElementById("cpu-core");
const cpuProgress = document.querySelector(".cpu-progress");
const cpuUsage = document.getElementById("cpu-usage");

//RAM variables ======================================
var ram_capacity = 0;
var ram_usage = 70;

//CPU variables ======================================
var cpu_model = "Loading...";
var cpu_cores = navigator.hardwareConcurrency;
var cpu_used = 40;
let core_usage = Array(cpu_cores).fill(0);
let updatedUsage = Array(cpu_cores).fill(0);
let previousCPU = null;

//System CPU and RAM Load monitoring function==========================
function SysStat() {
  // CPU Load ==================================
  chrome.system.cpu.getInfo(function (info) {
    var usedPers = 0;
    for (var i = 0; i < info.numOfProcessors; i++) {
      var usage = info.processors[i].usage;
      if (previousCPU !== null) {
        var oldUsage = previousCPU.processors[i].usage;
        usedInPercentage = Math.floor(
          ((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) /
            (usage.total - oldUsage.total)) *
            100
        );
      } else {
        usedInPercentage = Math.floor(
          ((usage.kernel + usage.user) / usage.total) * 100
        );
      }
      usedPers += usedInPercentage;
      core_usage.push(Math.round(usedInPercentage));
    }
    usedPers = Math.round(usedPers / info.numOfProcessors);
    core_usage.splice(0, cpu_cores);
    updatedUsage = core_usage.slice(0, cpu_cores);
    cpu_used = usedPers;
    previousCPU = info;
    cpu_model = info.modelName;
  });
  // RAM Load ================================
  chrome.system.memory.getInfo(function (info) {
    ram_usage =
      100 - Math.round((info.availableCapacity / info.capacity) * 100);
    ram_capacity = parseInt(info.capacity / 1000000000);
  });
}

//Ram bar ====================
function ramBar() {
  ramProgress.style.width = ` ${ram_usage}%`;
  ramUsage.innerText = `${ram_usage}%`;
  ramCapacity.innerText = `${ram_capacity}  GB`;
}

//Overall CPU bar ====================
function cpuBar() {
  cpuModel.innerText = `${cpu_model}`;
  cpuCore.innerText = `${cpu_cores}`;
  cpuProgress.style.width = ` ${cpu_used}%`;
  cpuUsage.innerText = `${cpu_used}%`;
}

//core progress bar function =============================
function createProgressBar(coreIndex) {
  const container = document.createElement("div");
  container.classList.add("item");

  const progress = document.createElement("progress");
  progress.max = 100;
  progress.value = updatedUsage[coreIndex];
  progress.id = `progress${coreIndex}`;

  const cpuName = document.createElement("span");
  cpuName.textContent = `CPU${coreIndex + 1}`;
  const corePercentage = document.createElement("span");
  corePercentage.classList.add("core-percentage");
  corePercentage.textContent = `${updatedUsage[coreIndex]}%`;

  container.appendChild(cpuName);
  container.appendChild(corePercentage);
  container.appendChild(progress);

  document.getElementById("core-chart").appendChild(container);
}

// Function to update the progress values based on new array data====================
function updateProgressValues(newUsage) {
  for (let i = 0; i < newUsage.length; i++) {
    const progressBar = document.getElementById(`progress${i}`);
    const newValue = newUsage[i];
    progressBar.value = newValue;
    progressBar.previousElementSibling.textContent = `${newValue}%`;
  }
}

// Loop through the CPU cores and create progress bars for each===================
for (let i = 0; i < cpu_cores; i++) {
  createProgressBar(i);
}

function minimumRequirement() {
  document.getElementById("ram-usedimg").src = "/assets/loaded.svg";
  if (ram_capacity < 4) {
    document.getElementById("ram-reqimg").src = "/assets/cross_mark.svg";
  } else {
    document.getElementById("ram-reqimg").src = "/assets/loaded.svg";
  }

  if (cpuModel === "Loading...") {
    document.getElementById("cpu-name").src = "/assets/cross_mark.svg";
  } else {
    document.getElementById("cpu-name").src = "/assets/loaded.svg";
  }
  if (cpu_cores < 4) {
    document.getElementById("core-number").src = "/assets/cross_mark.svg";
  } else {
    document.getElementById("core-number").src = "/assets/loaded.svg";
  }
}

// CPU and RAM Load trigger ===============================
setInterval(function () {
  SysStat();
  ramBar();
  cpuBar();
  updateProgressValues(updatedUsage);
  minimumRequirement();
}, 2000);

// clearing Interval======================================
clearInterval();
