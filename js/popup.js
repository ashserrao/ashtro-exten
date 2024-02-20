// Trigger recording ===========================================
document.addEventListener("DOMContentLoaded", () => {
  const startVideoButton = document.querySelector("button#start-rec");
  const stopVideoButton = document.querySelector("button#stop-rec");
  startVideoButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "request_recording" },
        function (response) {
          if (!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.log(chrome.runtime.lastError, "Error starting the video");
          }
        }
      );
    });
  });

  stopVideoButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "stop_recording" },
        function (response) {
          if (!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.log(chrome.runtime.lastError, "Error stopping the video");
          }
        }
      );
    });
  });
});

// RAM variables =================================
var ram_capacity = 16;
var ram_used = 0;
var ram_usage = 70;
var ram_balance = 100 - ram_usage;

// CPU variables =================================
var core_number = navigator.hardwareConcurrency;
var cpu_model;
var cpu_load;
var cpuUsage = [];
var graphCpuUsage = [];
var cpuBalance = [];
var previousCPU = null;

//Chrome Elements =======================================

const cpuCharts = [];

//System CPU and RAM Load monitoring function==========================
function SysStat() {
  //CPU Load ==========================
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
      cpuUsage.push(usedInPercentage);
      cpuBalance.push(100 - usedInPercentage);
    }
    usedPers = Math.round(usedPers / info.numOfProcessors);
    previousCPU = info;
    cpu_model = info.modelName;
    cpu_load = usedPers;
  });
  // RAM Load ================================
  chrome.system.memory.getInfo(function (info) {
    ram_usage =
      100 - Math.round((info.availableCapacity / info.capacity) * 100);
    ram_capacity = parseInt(info.capacity / 1000000000);
  });
}

// Ram Chart Data ======================================
const ram_data = {
  datasets: [
    {
      data: [ram_usage, ram_balance],
      backgroundColor: ["#209E91", "rgba(0, 0, 0, 0.2)"],
      borderColor: ["#209E91", "rgba(0, 0, 0, 0.2)"],
      borderWidth: 1,
      cutout: "70%",
      circumference: 180,
      rotation: 270,
    },
  ],
};

const ramChartText = {
  id: "ramChartText",
  afterDatasetsDraw(chart, args, pluginOptions) {
    const {
      ctx,
      data,
      chartArea: { top, bottom, left, right, width, height },
      scales: { r },
    } = chart;

    ctx.save();
    const xcord = chart.getDatasetMeta(0).data[0].x;
    const ycord = chart.getDatasetMeta(0).data[0].y;

    ctx.font = "15px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = "15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${ram_usage}%`, xcord, ycord);
  },
};

const ram_Chart = {
  type: "doughnut",
  data: ram_data,
  options: {
    aspectRatio: 2,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  },
  plugins: [ramChartText],
};

// render init block
const ramChart = new Chart(document.getElementById("ram-chart"), ram_Chart);

// Define a function to update chart data
function updateRamChart() {
  ramCapacity.innerText = ram_capacity + "GB";
  // cpuLoad.innerText = "Overall | " + cpu_load + "%";
  ramUsed.innerText = (ram_usage / 100) * ram_capacity + "GB";
  cpuModel.innerText = cpu_model;
  ramChart.data.datasets[0].data = [ram_usage, 100 - ram_usage];
  ramChart.update();
}

// CPU Load=====================================

function createChart() {
  // CPU Chart Data ======================================
  for (let i = 0; i < core_number; i++) {
    const container = document.createElement("div");
    container.classList.add("cpu-container");
    const canvas = document.createElement("canvas");
    canvas.id = `cpu-chart${i + 1}`;
    container.appendChild(canvas);
    document.getElementById("cpu-charts").appendChild(container);

    // Configure chart data==========================
    const cpu_data = {
      datasets: [
        {
          data: [cpuUsage[i], cpuBalance[i]],
          backgroundColor: ["#209E91", "rgba(0, 0, 0, 0.2)"],
          borderColor: ["#209E91", "rgba(0, 0, 0, 0.2)"],
          borderWidth: 1,
          cutout: "70%",
          circumference: 180,
          rotation: 270,
        },
      ],
    };

    const gaugeChartText = {
      id: "gaugeChartText",
      afterDatasetsDraw(chart, args, pluginOptions) {
        const {
          ctx,
          data,
          chartArea: { top, bottom, left, right, width, height },
          scales: { r },
        } = chart;

        ctx.save();
        const xcord = chart.getDatasetMeta(0).data[0].x;
        const ycord = chart.getDatasetMeta(0).data[0].y;

        ctx.font = "15px sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${graphCpuUsage[i]}%`, xcord, ycord);
        // ctx.fillText(`core ${i + 1}`, xcord, ycord);
      },
    };

    // Chart configuration===============================
    const chartType = {
      type: "doughnut",
      data: cpu_data,
      options: {
        aspectRatio: 2,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
      plugins: [gaugeChartText],
    };
    cpuCharts.push(new Chart(canvas, chartType));
  }
}

// Updating chart data==========================================
function updateCpuChart() {
  graphCpuUsage.slice(0, 7);
  for (let i = 0; i < core_number; i++) {
    cpuCharts[i].data.datasets[0].data = [cpuUsage[i], cpuBalance[i]];
    cpuCharts[i].update();
  }
  graphCpuUsage = cpuUsage.slice();
  cpuUsage.splice(0, 7);
  cpuBalance.splice(0, 7);
}

// Create CPU core chart===========================================
setTimeout(createChart, 500);

// CPU and RAM Load trigger ===============================
setInterval(function () {
  SysStat();
  updateRamChart();
  updateCpuChart();
}, 2000);

// Clearing any incstance of setInterval function ============================
clearInterval();
