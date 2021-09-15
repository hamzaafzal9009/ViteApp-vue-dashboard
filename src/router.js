import Vue from "vue";
import Router from "vue-router";

import Dashboard from "./components/Dashboard.vue";
import Drivers from "./components/Drivers";
import Login from "./components/Login";
import Edit from "./components/DriverComponents/Edit";
import Riders from "./components/Riders";
import EditRider from "./components/RidersComponents/EditRider";
import Vehicles from "./components/Vehicles";
import Trips from "./components/Trips";
Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
    },
    {
      path: "/drivers/:id?",
      name: "Drivers",
      component: Drivers,
    },
    {
      path: "/vehicles",
      name: "Vehicles",
      component: Vehicles,
    },
    {
      path: "/trips",
      name: "Trips",
      component: Trips,
    },
    {
      path: "/drivers/edit/:id",
      name: "Edit Drivers",
      component: Edit,
    },

    {
      path: "/riders",
      name: "Riders",
      component: Riders,
    },

    {
      path: "/riders/edit/:id",
      name: "Edit Riders",
      component: EditRider,
    },
    {
      path: "/login/:reason?",
      name: "Login",
      component: Login,
    },

    {
      path: "/*",
      redirect: "/login",
    },
  ],
});
