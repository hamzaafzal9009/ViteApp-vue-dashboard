<template>
  <el-card>
    <div class="o-card-title-3 trip-title">
      Trip Information
    </div>
    <div class="o-card-title-3">
      Daily Trips Break Up
    </div>

    <div class="dashboard-row dashboard-loader" v-show="showLoading">
      <i class="el-icon-loading"></i>
    </div>

    <div style="min-height: 300px; position: relative;" v-if="!showLoading">
      <vue-apex-charts
        type="area"
        height="375"
        :options="apexChartData.chartOptions"
        :series="apexChartData.series"
      ></vue-apex-charts>
    </div>
  </el-card>
</template>

<script>
import VueApexCharts from "vue-apexcharts";

export default {
  name: "TripInformation",
  
  components: {
    VueApexCharts,
  },
  data: () => ({
    elementVisible: false,
    showLoading: false,
    apexChartData: {
      chartOptions: {
        grid: {
          show: true,
          borderColor: "rgba(0, 0, 0, .3)",
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        chart: {
          toolbar: {
            show: true,
          },
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        fill: {
          type: "gradient",
          opacity: ["0.1", "0.1"],
        },
        xaxis: {
          type: "datetime",
          categories: [],
          labels: {
            style: {
              cssClass: "grey--text lighten-2--text fill-color",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              cssClass: "grey--text lighten-2--text fill-color",
            },
          },
        },
        markers: {
          size: 3,
        },
        tooltip: {
          x: {
            format: "dd/MM/yyyy",
          },
          theme: "dark",
        },
        legend: {
          show: false,
        },
      },
      series: [],
    },
    totalCompleted: 0,
    totalCanceled: 0,
    totalOther: 0,
    totalTrips: 0,
    iconClass: "fas fa-route",
  }),
  created() {
    this.getTrips();
  },
  methods: {
    getTrips() {
      this.showLoading = true;
      const api = this.axios.create({
        headers: {
          common: {
            "Content-Type": "application/json",
            "X-API-Key":
              "NJjy0LIuZVCPGWjyjfHsYdL9TAQiVZbP:FgXY7PrpLCpeboYy5y5BWQp-KBzaHQJ83p7parhnAGCu0W5XJIQYp7IkkltqHbk-",
            Accept: "application/json",
          },
        },
      });
      api
        .post("https://api.rideos.ai/ride-hail-operations/v1/GetTrips", {
          from: new Date("2021-01-01T00:00:00.000Z"),
          fleetId: "default",
          to: new Date(),
        })
        .then(({ data }) => {
          data["trip"].sort((a, b) => {
            return new Date(b.creationTime) - new Date(a.creationTime);
          });
          const dailyTrips = {};
          data["trip"].forEach((tripData) => {
            const tripDate =
              tripData.creationTime.slice(0, 10) + "T00:00:00.000Z";
            if (typeof dailyTrips[tripDate] === "undefined") {
              dailyTrips[tripDate] = {
                completed: 0,
                canceled: 0,
                other: 0,
              };
            }
            if (tripData.state.canceled) {
              dailyTrips[tripDate]["canceled"] += 1;
            }
            if (tripData.state.completed) {
              dailyTrips[tripDate]["completed"] += 1;
            }
            if (!(tripData.state.completed || tripData.state.canceled)) {
              dailyTrips[tripDate]["other"] += 1;
            }
          });

          const completedArr = [];
          const canceledArr = [];
          const otherArr = [];
          this.apexChartData.chartOptions.xaxis.categories = Object.keys(
            dailyTrips
          );
          Object.keys(dailyTrips).forEach((day) => {
            completedArr.push(dailyTrips[day].completed);
            canceledArr.push(dailyTrips[day].canceled);
            otherArr.push(dailyTrips[day].other);
          });
          this.apexChartData.series = [
            { name: "Completed Trips", data: completedArr },
            { name: "Canceled Trips", data: canceledArr },
            { name: "Other", data: otherArr },
          ];
          this.totalCompleted = completedArr.reduce((a, b) => a + b, 0);
          this.totalCanceled = canceledArr.reduce((a, b) => a + b, 0);
          this.totalOther = otherArr.reduce((a, b) => a + b, 0);
          this.totalTrips =
            this.totalCompleted + this.totalCanceled + this.totalOther;

          this.showLoading = false;
        });
    },
  },
};
</script>
<style scoped>
.trip-title {
  font-weight: bold;
}
</style>
