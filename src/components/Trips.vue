<template>
  <div id="dashboard-container">
    <el-card class="card-min-height">
      <div class="card-header">
        <div class="card-title">
          <h3>Trips</h3>
        </div>
        <div class="card-actions">
          <div class="input-group">
            <el-popover
              trigger="click"
              class="filter clickable"
              v-model="showFilters"
            >
              <div class="filter-button" slot="reference">
                <i class="fas fa-filter"></i>
              </div>
              <div class="dropdown-filter-menu">
                <div class="dropdown-filter-option">
                  <label>Search By</label>
                  <el-select v-model="search_by" :collapse-tags="true">
                    <el-option class="capitalize" value="Date">Date </el-option>
                    <el-option class="capitalize" value="Driver Name"
                      >Driver Name
                    </el-option>
                    <el-option class="capitalize" value="Rider Name"
                      >Rider Number
                    </el-option>
                    <el-option class="capitalize" value="Price"
                      >Price
                    </el-option>
                  </el-select>
                </div>
              </div>
            </el-popover>
            <el-input
              placeholder="Search Driver"
              @input="searchBy"
              v-model="search"
              ><i slot="suffix" class="far fa-search"></i
            ></el-input>
          </div>
        </div>
      </div>

      <div class="card-body">
        <el-tabs
          v-model="activeName"
          @tab-click="setStatusFilter"
          type="border-card"
          lazy="true"
        >
          <el-tab-pane
            :label="tab.text"
            :name="tab.name"
            v-for="(tab, index) in tabs"
            :key="index"
          >
            <el-table
              :data="tripFilterData"
              style="width: 100%"
              v-if="status !== 'Canceled'"
              highlight-current-row
              @row-click="handleCurrentChange"
              size="small"
              empty-text="No results found."
            >
              <el-table-column prop="parentDate" label="Date" sortable>
                <template slot-scope="props">
                  <span>
                    {{ props.row.parentDate || "No Data Found" }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="Rider">
                <template slot-scope="props">
                  <div class="clickable">
                    <span>
                      <img
                        :src="
                          getItemObjectAvatarUrl(
                            props.row,
                            'user',
                            'userAvatarUrl'
                          )
                        "
                        class="img-user"
                        alt="..."
                      />
                    </span>
                    <span v-if="typeof props === 'object'" class="driver-name">
                      {{
                        getItemObjectProperty(props.row, "user", "userFullName")
                      }}
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Driver">
                <template slot-scope="props">
                  <div class="clickable">
                    <span>
                      <img
                        :src="
                          getItemObjectAvatarUrl(
                            props.row,
                            'driver',
                            'driverAvatarUrl'
                          )
                        "
                        class="img-user"
                        alt="..."
                      />
                    </span>
                    <span v-if="typeof props === 'object'" class="driver-name">
                      {{
                        getItemObjectProperty(
                          props.row,
                          "driver",
                          "driverFullName"
                        )
                      }}
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="Status">
                <template slot-scope="props">
                  {{ statusMap[props.row.rideStatus] }}
                </template>
              </el-table-column>
              <el-table-column label="Final Price">
                <template slot-scope="props">
                  {{ props.row.finalPrice || "No Data Found" }}
                </template>
              </el-table-column>
            </el-table>

            <el-table
              :data="tripFilterData"
              style="width: 100%"
              v-if="status === 'Canceled'"
              highlight-current-row
              @row-click="handleCurrentChange"
              size="small"
              empty-text="No results found."
            >
              <el-table-column prop="creationTime" label="Date" sortable>
                <template slot-scope="props">
                  <span v-if="props.row.creationTime">
                    <span>
                      {{ props.row.creationTime.substring(0, 10) }} -
                      {{ props.row.creationTime.substring(11, 19) }}
                    </span>
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="Rider">
                <template slot-scope="props">
                  <div class="clickable">
                    <span>
                      <img
                        :src="getRiderAvatarUrl(props.row.requestorId)"
                        class="img-user"
                        alt="..."
                      />
                    </span>
                    <span v-if="typeof props === 'object'" class="driver-name">
                      {{ getRiderName(props.row.requestorId) }}
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="Review">
                <template slot-scope="props">
                  <div>
                    {{
                      props.row.state && props.row.state.canceled
                        ? props.row.state.canceled.description
                        : "No Review"
                    }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Stauts">
                <template>
                  <div>
                    {{ status }}
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <el-dialog
      title="Trip Information"
      v-if="currentRow !== null"
      :visible.sync="dialog"
      width="70%"
      :before-close="handleClose"
      center
    >
      <el-row class="text-center">
        <el-col :span="12">
          <div class="b-bottom-right">
            <p>Driver Name</p>
            <p>
              <b>
                {{
                  currentRow.driver.driverFirstName +
                    " " +
                    currentRow.driver.driverLastName
                }}
              </b>
            </p>
          </div>
          <div class="b-bottom-right">
            <p>Date</p>
            <p>
              <b>
                {{ currentRow.parentDate }}
              </b>
            </p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="b-bottom-right">
            <p>Rider Name</p>
            <p>
              <b>
                {{ currentRow.user.userFullName }}
              </b>
            </p>
          </div>
          <div class="b-bottom-right">
            <p>Pickup</p>
            <p>
              <b>
                {{ currentRow.pickUpLocation.itemTitle || "-" }}
              </b>
            </p>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="b-bottom-right">
            <p>Drop Off</p>
            <p>
              <b>
                {{ currentRow.dropOffLocation.itemTitle || "-" }}
              </b>
            </p>
          </div>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button-group>
          <el-button
            type="primary"
            size="small"
            @click="$router.push(`/drivers/edit/${currentRow.driverId}`)"
            >Driver Profile</el-button
          >
          <el-button
            type="primary"
            size="small"
            @click="$router.push(`/riders/edit/${currentRow.driverId}`)"
            >Rider Profile</el-button
          >
        </el-button-group>
      </span>
    </el-dialog>
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
    </div>
  </div>
</template>
<script>
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore();
const ref = db.collection("riderHistories");
const riderRef = db.collection("riders");
import { EventService } from "../main";
export default {
  name: "trips",

  data: () => ({
    headers: [
      { text: "Date", value: "time", sortable: true },
      { text: "Rider Name", value: "userFullName", sortable: true },
      { text: "Driver Name", value: "driverFullName", sortable: true },
      { text: "Status", sortable: false },
      { text: "Final Price", value: "finalPrice", sortable: true },
    ],
    otherHeaders: [
      { text: "Date", value: "time", sortable: true },
      { text: "Rider Name", value: "userFullName", sortable: true },
      { text: "Reason", value: "userFullName", sortable: true },
      { text: "Status", sortable: false },
    ],

    status: "Completed",
    search: "",
    ridersData: [],
    comfirmationBox: false,
    message: "",
    currentAction: "",
    loading: false,
    filters: {
      parentDate: "",
      driverFullName: "",
      riderFullName: "",
      finalPrice: "",
      status: 8,
    },
    dialog: false,
    tripsDetail: {},
    tripsInfo: [],
    dailyEarningDetail: {},
    authUser: {},
    ridoesTrips: [],
    riderData: [],
    driverData: [],
    showInformation: false,
    details: {},
    statusMap: {
      2: "PENDING",
      3: "ACCEPTED",
      4: "DECLINED",
      5: "COMING",
      6: "REACHED",
      7: "BEGUN",
      8: "COMPLETED",
      9: "CANCELED",
      11: "DRIVER_CANCELLED",
    },
    dataToPost: {
      from: new Date("2021-01-01"),
      fleetId: "default",
      to: new Date(),
    },

    activeName: "first",
    paginationData: {
      perPage: 10,
      currentPage: 0,
      perPageOptions: [10, 20, 50],
      total: 0,
    },
    status: "Completed",
    showFilters: false,
    search_by: "",
    tabs: [
      {
        text: "Completed",
        name: "first",
      },
      {
        text: "Begun",
        name: "second",
      },
      {
        text: "Canceled",
        name: "third",
      },
    ],
    currentRow: null,
  }),
  computed: {
    paginationPage() {
      return this.paginationData.currentPage + 1;
    },
    driverDetail() {
      if (this.status === "Completed") {
        const start =
            this.paginationData.currentPage * this.paginationData.perPage,
          end = start + this.paginationData.perPage;
        const data = this.driverData
          .filter(
            (el) =>
              el.driverId &&
              el.rideStatus &&
              el.rideStatus.toString().includes("8")
          )
          .sort((a, b) => new Date(b.time) - new Date(a.time));

        this.paginationData.total = data.length;
        console.dir(data);
        return data.slice(start, end);
      } else if (this.status === "Begun") {
        const start =
            this.paginationData.currentPage * this.paginationData.perPage,
          end = start + this.paginationData.perPage;
        const data = this.driverData
          .filter(
            (el) =>
              el.driverId &&
              el.driver &&
              el.rideStatus &&
              el.rideStatus.toString().includes("7")
          )
          .sort((a, b) => new Date(b.time) - new Date(a.time));
        this.paginationData.total = data.length;

        return data.slice(start, end);
      } else if (this.status == "Canceled") {
        const start =
            this.paginationData.currentPage * this.paginationData.perPage,
          end = start + this.paginationData.perPage;
        const data = this.ridoesTrips.filter((x) => x.state.canceled);
        this.paginationData.total = data.length;
        return data.slice(start, end);
      }
      return [];
    },
    tripFilterData() {
      if (this.status === "Completed") {
        return this.driverDetail.filter((ele) => {
          return (
            ele.parentDate &&
            ele.parentDate.toString().includes(this.filters.parentDate) &&
            ele.driver &&
            ele.driver.driverFirstName &&
            ele.driver.driverFirstName
              .toString()
              .includes(this.filters.driverFullName) &&
            ele.user &&
            ele.user.userFullName &&
            ele.user.userFullName
              .toString()
              .includes(this.filters.riderFullName) &&
            ele.finalPrice &&
            ele.finalPrice.toString().includes(this.filters.finalPrice)
          );
        });
      } else {
        return this.driverDetail;
      }
    },
  },
  created() {
    EventService.$emit("loading", "show");
    this.getDrivers();
    this.getRiderInfo();
    this.getInprogress();
  },
  methods: {
    searchBy() {
      if (this.search_by === "Date") {
        this.filters.parentDate = this.search;
      } else if (this.search_by === "Driver Name") {
        this.filters.driverFullName = this.search;
      } else if (this.search_by === "Rider Name") {
        this.filters.riderFullName = this.search;
      } else if (this.search_by === "Price") {
        this.filters.finalPrice = this.search;
      } else {
        this.filters.driverFullName = this.search;
      }
    },

    addPageNum(page) {
      console.log(page);
      this.paginationData.currentPage = page - 1;
    },
    handleCurrentChange(row) {
      this.dialog = true;
      this.details = row;
      this.currentRow = row;
    },
    handleClose() {
      this.currentRow = null;
      console.log(this.currentRow);
      this.dialog = false;
    },
    getDrivers() {
      ref.get().then((data) => {
        const response = data.docs;
        response.forEach((x) => {
          this.driverData.push(Object.assign({}, ...Object.values(x.data())));
        });

        EventService.$emit("loading", "hide");
      });
    },

    getRiderInfo() {
      riderRef.get().then((data) => {
        this.riderData = { ...data.docs.map((value) => value.data()) };
        EventService.$emit("loading", "hide");
      });
    },
    getInprogress() {
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
        .post(
          "https://api.rideos.ai/ride-hail-operations/v1/GetTrips",
          this.dataToPost
        )
        .then(({ data }) => {
          this.ridoesTrips = data["trip"];
        })
        .finally(() => {
          EventService.$emit("loading", "hide");
        });
    },
    setStatusFilter(tab) {
      this.status = tab.label;
      console.log(this.status);
    },

    getRiderAvatarUrl(riderId) {
      const riderObj = Object.values(this.riderData).find(
        (obj) => obj.userId === riderId
      );
      if (riderObj && riderObj["userAvatarUrl"] !== "N/A") {
        return riderObj["userAvatarUrl"];
      }
      return require(`@/assets/img/default-user.jpg`);
    },
    getRiderName(riderId) {
      const riderObj = Object.values(this.riderData).find(
        (obj) => obj.userId === riderId
      );
      if (riderObj) {
        return riderObj["userFullName"];
      }
      return "No Name";
    },
    getRiderEmail(riderId) {
      const riderObj = Object.values(this.riderData).find(
        (obj) => obj.userId === riderId
      );
      if (riderObj) {
        return riderObj["userEmail"];
      }
      return "-";
    },
    getItemObjectAvatarUrl(item, objName, propertyName) {
      if (
        item &&
        typeof item[objName] !== "undefined" &&
        typeof item[objName][propertyName] !== "undefined" &&
        item[objName][propertyName] !== "N/A"
      ) {
        return item[objName][propertyName];
      }
      return require(`@/assets/img/default-user.jpg`);
    },
    getItemObjectProperty(item, objName, propertyName) {
      if (
        item &&
        typeof item[objName] !== "undefined" &&
        typeof item[objName][propertyName] !== "undefined"
      ) {
        return item[objName][propertyName];
      }
      return "No Data Available";
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
