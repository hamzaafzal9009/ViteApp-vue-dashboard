<template>
  <el-card>
    <div class="o-card-title-3 trip-title">
      Vehicle Information
    </div>
    <div class="o-card-title-3">
      Vehicle Information Used to Trips
    </div>

    <div class="dashboard-row dashboard-loader" v-show="showLoading">
      <i class="el-icon-loading"></i>
    </div>

    <div style="max-height: 300px; position: relative;" v-if="!showLoading">
      <vue-apex-charts
        type="donut"
        height="345px"
        :options="pieChartData.pieChart.chartOptions"
        :series="pieChartData.pieChart.series"
      ></vue-apex-charts>
    </div>

    <div style="margin-top: 70px">
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-row type="flex" justify="center">
            <div
              v-for="lable in pieChartData.lables"
              :lable="lable"
              :key="lable.name"
              style="min-width: 100px"
            >
              <span>
                <span
                  class="subtitle-2"
                  :class="[lable.color]"
                  style="padding-right: 10px; padding-left:10px"
                >
                  <i class="fa fa-circle mr-2"></i>
                </span>
                <span
                  class="font-weight-regular blue-grey--text text--lighten-2 mr-1"
                  >{{ lable.name }}</span
                >
              </span>
            </div>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import VueApexCharts from "vue-apexcharts";

export default {
  name: "VehicleInformation",
  components: {
    VueApexCharts,
  },
  data: () => ({
    elementVisible: false,
    showLoading: false,
    pieChartData: {
      chartTittle: "Vehicle Information",
      iconClass: "fas fa-car",
      chartsubTittle: "Vehicle Information Used to Trips",
      lables: [
        {
          color: "deep-purple--text text--accent-2",
          name: "Online",
        },
        {
          color: "green--text text--accent-2",
          name: "On Trip",
        },
        {
          color: "info--text",
          name: "Offline",
        },
      ],
      pieChart: {
        series: [],
        chartOptions: {
          labels: ["Online", "On Trip", "Offline"],
          dataLabels: {
            enabled: false,
          },
          grid: {
            padding: {
              left: 0,
              right: 0,
            },
            borderColor: "rgba(0,0,0,0.5)",
          },
          plotOptions: {
            pie: {
              donut: {
                size: "86px",
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontSize: "18px",
                    color: undefined,
                    offsetY: -10,
                  },
                  value: {
                    show: true,
                    color: "#99abb4",
                  },
                  total: {
                    show: true,
                    label: "Total Vehicles",
                    color: "#99abb4",
                  },
                },
              },
            },
          },
          stroke: {
            width: 1,
            colors: "rgba(0,0,0,0.1)",
          },
          legend: {
            show: false,
          },
          colors: ["#7c4dff", "#69F0AE", "#1e88e5", "#745af2"],
          tooltip: {
            fillSeriesColor: false,
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  height: 250,
                },
              },
            },
          ],
        },
      },
    },
  }),
  created() {
    this.getVehicle();
  },
  methods: {
    getVehicle() {
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
        .post("https://api.rideos.ai/ride-hail-operations/v1/GetVehicles", {
          fleetId: "default",
        })
        .then(({ data }) => {
          const vehcleStatus = {
            online: 0,
            offline: 0,
            onTrip: 0,
          };
          data["vehicle"].forEach((vehicle) => {
            if (vehicle.state.readiness) {
              vehcleStatus.online += 1;
            }
            if (!vehicle.state.readiness) {
              vehcleStatus.offline += 1;
            }
            if (vehicle.state.plan.step.length > 0) {
              vehcleStatus.onTrip += 1;
            }
          });
          this.pieChartData.pieChart.series = [
            vehcleStatus.online,
            vehcleStatus.onTrip,
            vehcleStatus.offline,
          ];
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
.deep-purple--text.text--accent-2 {
  color: #7c4dff !important;
  caret-color: #7c4dff !important;
}
.green--text.text--accent-2 {
  color: #69f0ae !important;
  caret-color: #69f0ae !important;
}
.info--text {
  color: #1e88e5 !important;
  caret-color: #1e88e5 !important;
}
.blue-grey--text.text--lighten-2 {
    color: #90a4ae!important;
    caret-color: #90a4ae!important;
}
</style>
