<template>
  <div id="dashboard-container">
    <el-row :gutter="20">
      <NumberCard />
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <TripInformation />
      </el-col>
      <el-col :xs="24" :sm="12">
        <VehicleInformation />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import NumberCard from "./DashboardComponents/NumberCard";
import TripInformation from "./DashboardComponents/TripInformation";
import VehicleInformation from "./DashboardComponents/VehicleInformation";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore();
const driverRef = db.collection("drivers");

export default {
  name: "dashboard",
  components: {
    NumberCard,
    TripInformation,
    VehicleInformation,
  },
  data: () => ({
    driversData: [
      {
        title: "Total Drivers",
        iconcolor: "info",
        icon: "fas fa-user-tie",
        value: "total",
        total: 0,
        number: 0,
      },
      {
        title: "Approved Drivers",
        iconcolor: "green",
        icon: "fas fa-user-check",
        value: "approve",
        total: 0,
        number: 0,
      },
      {
        title: "Blocked Drivers",
        iconcolor: "warning",
        icon: "fas fa-user-slash",
        value: "blocked",
        total: 0,
        number: 0,
      },
      {
        title: "New Drivers",
        iconcolor: "light-green",
        icon: "fas fa-user-plus",
        value: "new",
        total: 0,
        number: 0,
      },
      {
        title: "Incomplete Drivers",
        iconcolor: "error",
        icon: "fas fa-user-times",
        value: "incomplete",
        total: 0,
        number: 0,
      },
    ],

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
  methods: {
    getVehicle() {
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
        });
    },
  },
};
</script>

<style scoped>

</style>
