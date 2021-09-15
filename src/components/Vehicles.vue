<template>
  <div id="dashboard-container">
    <el-card class="card-min-height">
      <div class="card-header">
        <div class="card-title">
          <h3>Vehicles</h3>
        </div>
        <div class="card-actions">
          <div class="input-group">
            <el-input
              v-model="filters.phone_number"
              placeholder="Search By Phone Number"
              ><i slot="suffix" class="far fa-search"></i
            ></el-input>
          </div>
        </div>
      </div>

      <div class="card-body">
        <el-table
          :data="tripFilterData"
          style="width: 100%"
          size="small"
          empty-text="No results found."
        >
          <el-table-column prop="driverFirstName" label="Driver" width="300">
            <template slot-scope="props">
              <span v-if="isDriverPresent(props.row.id)">
                <span>
                  <img
                    :src="getDriverAvatarUrl(props.row.id)"
                    class="img-user"
                    alt="..."
                  />
                </span>
                <span v-if="typeof props === 'object'" class="driver-name">
                  {{ getDriverName(props.row.id) }}
                </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="driverEmail" label="Email" width="250">
            <template slot-scope="props">
              <span v-if="isDriverPresent(props.row.id)">
                <span v-if="typeof props === 'object'">
                  {{ getDriverEmail(props.row.id) }}
                </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="fleetId" label="Fleet" width="80">
          </el-table-column>
          <el-table-column prop="id" label="Number" width="130">
          </el-table-column>

          <el-table-column
            prop="definition"
            label="Vehicle Capacity"
            width="150"
          >
            <template slot-scope="props">
              <div>
                {{ props.row.definition.riderCapacity || "-" }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="state" label="Availability" width="120">
            <template slot-scope="props">
              <div>
                <el-tooltip
                  class="item"
                  effect="dark"
                  placement="right"
                  :content="props.row.state.readiness ? ' Online' : ' Offline'"
                >
                  <div class="text-center">
                    <i
                      class="fa fa-circle"
                      :class="
                        props.row.state.readiness ? 'green-text' : 'grey-text'
                      "
                    ></i>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastActiveTime"
            label="Last Active"
            width="150"
          >
            <template slot-scope="props">
              <div v-if="props.row.state.lastActiveTime">
                {{ props.row.state.lastActiveTime.substring(0, 10) }}
              </div>
              <div v-if="props.row.state.lastActiveTime">
                {{ props.row.state.lastActiveTime.substring(11, 19) }}
              </div>
              <div v-else>
                No Record Found
              </div>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="Actions" width="90">
            <template slot-scope="props">
              <el-tooltip
                class="item"
                effect="dark"
                content="Delete Driver"
                placement="top"
              >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  plain
                  size="mini"
                  @click="openConfirmDialog(props.row)"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination block">
        <span
          >Showing {{ paginationData.perPage }} of
          {{ paginationData.total }} Total Results</span
        >
        <el-pagination
          background
          layout="prev, pager, next"
          :current-page="paginationPage"
          :page-size="paginationData.perPage"
          :total="paginationData.total"
          small
          @current-change="addPageNum"
        ></el-pagination>
        <el-select
          class="per-page-select"
          size="mini"
          v-model="paginationData.perPage"
        >
          <el-option
            v-for="option in paginationData.perPageOptions"
            :value="option"
            :key="option"
            >{{ option }}
          </el-option>
        </el-select>
      </div></el-card
    >
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore();
const driverRef = db.collection("drivers");
import { EventService } from "../main";

export default {
  data() {
    return {
      items: [
        {
          text: "Dashboard",
          disabled: false,
          href: "/dashboards",
        },
        {
          text: "Vehicles",
          disabled: true,
          href: "",
        },
      ],
      comfirmationBox: false,
      message: "",
      currentAction: "",
      loading: false,
      headers: [
        { text: "Driver", sortable: false },
        { text: "Vehicle", sortable: false },
        { text: "Fleet", sortable: false },
        { text: "Vehicle Capacity", sortable: false },
        { text: "Is Available", sortable: false },
        { text: "Last Active Time", sortable: false },
        { text: "Action", sortable: false },
      ],
      filters: {
        full_name: "",
        phone_number: "",
        email: "",
      },
      tripsDetail: {},
      status: "All",
      tripsInfo: [],
      currentId: "",
      dailyEarningDetail: {},
      authUser: {},
      driverData: [],
      currentStatus: "",
      vehicleList: [],
      paginationData: {
        perPage: 10,
        currentPage: 0,
        perPageOptions: [10, 20, 50],
        total: 0,
      },
    };
  },
  computed: {
    driverDetail() {
      return this.vehicleList.filter((el) => el.id);
    },
    paginationPage() {
      return this.paginationData.currentPage + 1;
    },
    tripFilterData() {
      const start =
          this.paginationData.currentPage * this.paginationData.perPage,
        end = start + this.paginationData.perPage;
      return this.driverDetail
        .filter((ele) => {
          return ele.id
            .toLowerCase()
            .includes(this.filters.phone_number.toLowerCase() || "");
        })
        .slice(start, end);
    },
  },
  head() {
    return {
      title: "Vehicle | List | Admin",
    };
  },
  created() {
    EventService.$emit("loading", "show");
    this.getDrivers();
    this.getVehicle();
  },
  methods: {
    getDrivers() {
      driverRef.get().then((data) => {
        const response = { ...data.docs.map((value) => value.data()) };
        // console.log("Driver", JSON.stringify(response));
        this.driverData = response;
        EventService.$emit("loading", "hide");
      });
    },
    addPageNum(page) {
      this.paginationData.currentPage = page - 1;
    },
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
          this.vehicleList = data["vehicle"];
          this.paginationData.total = data["vehicle"].length;
          //   console.log("Vehicle", JSON.stringify(this.vehicleList));
        })
        .finally(() => {
          EventService.$emit("loading", "hide");
        });
    },
    setStatusFilter(tab) {
      this.status = tab;
    },
    openConfirmDialog(detail) {
      this.currentId = detail.id;
      this.currentStatus = detail.driverStatus;
      this.deleteUser();
    },
    deleteUserOnly() {
      EventService.$emit("loading", "show");
      driverRef
        .doc(this.currentId)
        .delete()
        .then(() => {
          EventService.$emit("successMessage", "Deleted Successful.");
          EventService.$emit("loading", "hide");
          this.getDrivers();
        })
        .catch(() => {
          EventService.$emit("errorMessage", "Something Went Wrong!");
          EventService.$emit("loading", "hide");
        });
    },

    deleteUser() {
      this.$confirm("Are you sure you want to Delete?")
        .then((_) => {
          EventService.$emit("loading", "show");
          const dataToPost = {
            id: this.currentId,
          };
          const url = "https://api.rideos.ai/ride-hail-driver/v1/RemoveVehicle";
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
          api.post(url, dataToPost).then(() => {
            EventService.$emit("successMessage", "Deleted Successful.");
            EventService.$emit("loading", "hide");
            this.getVehicle();
          });
        })
        .catch((_) => {});
    },
    getDriverAvatarUrl(vehicleId) {
      const riderObj = Object.values(this.driverData).find(
        (obj) => obj.driverId === vehicleId
      );
      if (riderObj && riderObj["userAvatarUrl"] !== "") {
        if (riderObj["driverAvatarUrl"] !== "") {
          return riderObj["driverAvatarUrl"];
        } else {
          return require(`@/assets/img/default-user.jpg`);
        }
      }
      return require(`@/assets/img/default-user.jpg`);
    },
    getDriverName(vehicleId) {
      const riderObj = Object.values(this.driverData).find(
        (obj) => obj.driverId === vehicleId
      );
      if (riderObj) {
        return `${riderObj["driverFirstName"]} ${riderObj["driverLastName"]}`;
      }
      return "No Name";
    },
    getDriverEmail(vehicleId) {
      const riderObj = Object.values(this.driverData).find(
        (obj) => obj.driverId === vehicleId
      );
      if (riderObj) {
        return riderObj["driverEmail"];
      }
      return "-";
    },
    isDriverPresent(vehicleId) {
      const riderObj = Object.values(this.driverData).find(
        (obj) => obj.driverId === vehicleId
      );
      if (riderObj) {
        return true;
      }
      return false;
    },
  },
};
</script>
<style scoped>
.grey-text {
  color: #cecece;
}
.green-text {
  color: darkgreen;
}

.img-user {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.driver-name {
  position: absolute;
  top: 26px;
  left: 80px;
}
.text-center {
  text-align: center;
}
</style>
