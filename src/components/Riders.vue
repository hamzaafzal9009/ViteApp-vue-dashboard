<template>
  <div id="dashboard-container">
    <el-card class="card-min-height">
      <div class="card-header">
        <div class="card-title">
          <h3>Riders</h3>
        </div>
        <!-- <div class="card-actions">
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
                    <el-option class="capitalize" value="Full Name"
                      >Full Name
                    </el-option>
                    <el-option class="capitalize" value="Email"
                      >Email
                    </el-option>
                    <el-option class="capitalize" value="Phone Number"
                      >Phone Number
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
        </div> -->
      </div>

      <div class="card-body">
        <el-tabs
          v-model="activeName"
          @tab-click="setStatusFilter"
          type="border-card"
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
              v-if="status !== 'Requested Rides'"
              size="small"
              empty-text="No results found."
            >
              <el-table-column label="Date">
                <template slot-scope="props">
                  <div v-if="status === 'Requested Rides'">
                    <div>
                      {{ returnDate(props.row.createdAt) }}
                    </div>
                    <div class="caption">
                      {{ returnTime(props.row.createdAt) }}
                    </div>
                  </div>
                  <div v-else>
                    {{ props.row.parentDate || "No Date Available" }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                prop="driverFirstName"
                label="Full Name"
                width="200"
              >
                <template slot-scope="props">
                  <span>
                    <img
                      :src="
                        !props.row.userAvatarUrl ||
                        props.row.userAvatarUrl === 'N/A'
                          ? require(`@/assets/img/default-user.jpg`)
                          : props.row.userAvatarUrl
                      "
                      class="img-user"
                      alt="..."
                    />
                  </span>
                  <span v-if="typeof props === 'object'" class="driver-name">
                    {{ props.row.userFullName }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="userEmail" label="Email">
              </el-table-column>

              <el-table-column prop="userPhoneNumber" label="Phone Number">
              </el-table-column>
              <el-table-column prop="userTotalRating" label="Total Rating">
                <template slot-scope="props">
                  <span
                    v-if="
                      props.row.userTotalRating &&
                        props.row.userTotalRating !== ''
                    "
                  >
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="props.row.userTotalRating"
                      placement="left"
                    >
                      <el-rate
                        :value="parseInt(props.row.userTotalRating)"
                        disabled
                      >
                      </el-rate>
                    </el-tooltip>
                  </span>
                  <span v-else>
                    No Data Available
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="totalTrips" label="Total Trips">
                <template slot-scope="props">
                  <span v-if="props.row.totalTrips">
                    {{ props.row.totalTrips }} Trip(s)
                  </span>
                  <span v-else>
                    No Data Available
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="regDate" label="Reg Date">
                <template slot-scope="props">
                  {{ props.row.regDate || "No Data Available" }}
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="Actions" width="140">
                <template slot-scope="props">
                  <el-tooltip
                    v-if="
                      props.row.isBlocked === 'false' ||
                        props.row.isBlocked === false
                    "
                    class="item"
                    effect="dark"
                    content="Block Rider"
                    placement="top"
                  >
                    <el-button
                      type="default"
                      icon="el-icon-close"
                      circle
                      plain
                      size="mini"
                      @click="doIt(props.row, 'block')"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    v-if="
                      props.row.isBlocked === 'true' ||
                        props.row.isBlocked === true
                    "
                    class="item"
                    effect="dark"
                    content="Unblock Rider"
                    placement="top"
                  >
                    <el-button
                      type="default"
                      icon="el-icon-check"
                      circle
                      plain
                      size="mini"
                      @click="doIt(props.row, 'unblock')"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Edit Driver"
                    placement="top"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      circle
                      plain
                      size="mini"
                      @click="
                        $router.push(
                          `/riders/edit/${props.row.userPhoneNumber}`
                        )
                      "
                    ></el-button>
                  </el-tooltip>
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
                      @click="doIt(props.row, 'delete')"
                    ></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>

            <el-table
              :data="requestedRides"
              style="width: 100%"
              v-if="status === 'Requested Rides'"
              size="small"
              empty-text="No results found."
            >
              <el-table-column label="Full Name" width="200">
                <template slot-scope="props">
                  <span>
                    <img
                      :src="
                        !props.row.user.userAvatarUrl ||
                        props.row.user.userAvatarUrl == 'N/A' ||
                        props.row.user.userAvatarUrl == null
                          ? require(`@/assets/img/default-user.jpg`)
                          : props.row.user.userAvatarUrl
                      "
                      class="img-user"
                      alt="..."
                    />
                  </span>
                  <span v-if="typeof props === 'object'" class="driver-name">
                    {{ props.row.user.userFullName }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="Email">
                <template slot-scope="props">
                  {{ props.row.user.userEmail }}
                </template>
              </el-table-column>

              <el-table-column label="Phone Number">
                <template slot-scope="props">
                  <span
                    v-if="
                      !props.row.user.userPhoneNumber ||
                        props.row.user.userPhoneNumber == null ||
                        props.row.user.userPhoneNumber == 'N/A'
                    "
                  >
                    No Data Avaliable
                  </span>
                  <span v-else>
                    <strong>{{ props.row.user.userPhoneNumber }}</strong>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="Pick Up Location">
                <template slot-scope="props">
                  <span
                    v-if="
                      !props.row.pickUpLocation ||
                        props.row.pickUpLocation.itemTitle == null ||
                        props.row.pickUpLocation.itemTitle == 'N/A'
                    "
                  >
                    No Data Available
                  </span>
                  <span v-else>
                    {{ props.row.pickUpLocation.itemTitle }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="Drop Off Location">
                <template slot-scope="props">
                  <span
                    v-if="
                      !props.row.dropOffLocation ||
                        props.row.dropOffLocation.itemTitle == null ||
                        props.row.dropOffLocation.itemTitle == 'N/A'
                    "
                  >
                    No Data Available
                  </span>
                  <span v-else>
                    {{ props.row.dropOffLocation.itemTitle }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column fixed="right" label="Actions" width="140">
                <template slot-scope="props">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Edit Rider"
                    placement="top"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      circle
                      plain
                      size="mini"
                      @click="
                        $router.push(
                          `/riders/edit/${props.row.userId.replaceAll('+', '')}`
                        )
                      "
                    ></el-button>
                  </el-tooltip>
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
                      @click="doIt(props.row, 'delete')"
                    ></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="pagination block" v-if="status !== 'Requested Rides'">
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
    </el-card>
  </div>
</template>

<script>
import firebase from "firebase/app";
const db = firebase.firestore();
const ridersRef = db.collection("riders");
const requestRides = db.collection("tempRides");
const vehiclesRef = db.collection("vehicles");
import { EventService } from "../main";

export default {
  name: "Riders",
  data: () => ({
    tabs: [
      {
        text: "All",
        name: "first",
      },
      {
        text: "Active",
        name: "second",
      },
      {
        text: "Blocked",
        name: "third",
      },
      {
        text: "Requested Rides",
        name: "forth",
      },
    ],
    search_by: "",
    status: "All",
    search: "",
    ridersData: [],
    comfirmationBox: false,
    message: "",
    requestedRides: [],
    showFilters: false,
    currentAction: "",
    loading: false,
    tripsDetail: {},
    tripsInfo: [],
    dailyEarningDetail: {},
    authUser: {},
    ridersHistory: [],
    currentId: "",
    filters: {
      full_name: "",
      phone_number: "",
      email: "",
    },
    activeName: "first",
    paginationData: {
      perPage: 10,
      currentPage: 0,
      perPageOptions: [10, 20, 50],
      total: 0,
    },
  }),
  computed: {
    ridersDetail() {
      return this.ridersData.filter(
        (el) => typeof el.userFullName !== "undefined"
      );
    },
    statusFilterData() {
      if (this.status === "Requested Rides") {
        return this.requestedRides.sort((a, b) => b.updatedAt - a.updatedAt);
      }
      return this.ridersDetail
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .filter((ele) => {
          if (ele.userFullName && ele.userPhoneNumber && ele.userEmail) {
            if (this.status === "Active") {
              return ele.isBlocked === "false" || ele.isBlocked === false;
            } else if (this.status === "Blocked") {
              return ele.isBlocked === "true" || ele.isBlocked === true;
            } else {
              return ele;
            }
          }
        });
    },
    tripFilterData() {
      const start =
          this.paginationData.currentPage * this.paginationData.perPage,
        end = start + this.paginationData.perPage;
      this.paginationData.total = this.statusFilterData.length;
      // return this.statusFilterData.slice(start, end);
      return this.statusFilterData
        .filter((ele) => {
          return (
            ele.userFullName
              .toLowerCase()
              .includes(this.filters.full_name.toLowerCase() || "") &&
            ele.userPhoneNumber
              .toLowerCase()
              .includes(this.filters.phone_number.toLowerCase() || "") &&
            ele.userEmail
              .toLowerCase()
              .includes(this.filters.email.toLowerCase() || "")
          );
        })
        .slice(start, end);
    },
    paginationPage() {
      return this.paginationData.currentPage + 1;
    },
  },
  created() {
    this.getRiders();
  },
  methods: {
    searchBy() {
      if (this.search_by === "Email") {
        this.filters.email = this.search;
      } else if (this.search_by === "Phone Number") {
        this.filters.phone_number = this.search;
      } else {
        this.filters.full_name = this.search;
      }
    },
    addPageNum(page) {
      this.paginationData.currentPage = page - 1;
    },
    getRequestedRides() {
      EventService.$emit("loading", "show");
      this.requestedRides = [];
      requestRides.get().then((data) => {
        const response = data.docs.map((value) => value.data());
        const rides = Object.keys(response);
        console.log(
          "🚀 ~ file: Riders.vue ~ line 390 ~ requestRides.get ~ rides",
          response
        );
        this.requestedRides = response;

        // if (rides.length) {
        //   rides.forEach((x) => {
        //     const items = this.driverData.find((y) => y.userId === x);
        //     if (items) {
        //       this.requestedRides.push({
        //         ...items,
        //         createdAt: response[x],
        //       });
        //     }
        //   });
        // }
        EventService.$emit("loading", "hide");
      });
    },
    getRiders() {
      EventService.$emit("loading", "show");
      ridersRef.get().then((data) => {
        this.ridersData = data.docs.map((value) => value.data());
        console.dir(this.ridersData);
        EventService.$emit("loading", "hide");
      });
    },
    setStatusFilter(tab, event) {
      this.status = tab.label;
      if (tab.label === "Requested Rides") {
        this.getRequestedRides();
      }
      this.activeName = tab.name;
    },
    returnDate(date) {
      const humanDate = new Date(parseInt(date));
      return humanDate.toDateString().substring(4, 16);
    },
    returnTime(date) {
      const humanDate = new Date(parseInt(date));
      return humanDate.toString().substring(16, 24);
    },
    doIt(details, action) {
      this.$confirm(`Are you sure you want to ${action} this rider?`)
        .then((_) => {
          this.currentId = details.userId;
          EventService.$emit("loading", "show");
          if (action === "block") {
            this.blockUser();
          } else if (action === "unblock") {
            this.unBlockUser();
          } else if (action === "delete") {
            this.deleteRider();
          }
        })
        .catch((_) => {});
    },
    deleteRider() {
      ridersRef
        .doc(this.currentId)
        .delete()
        .then(() => {
          EventService.$emit("loading", "hide");
          EventService.$emit("successMessage", "Rider Deleted Successfully");
          this.getRiders();
        })
        .catch((err) => {
          EventService.$emit("loading", "hide");
          console.error(err);
          EventService.$emit("errorMessage", "Something Went Wrong!");
        });
    },
    blockUser() {
      ridersRef
        .doc(this.currentId)
        .update({ isBlocked: true })
        .then(() => {
          EventService.$emit("loading", "hide");
          EventService.$emit("successMessage", "Rider Blocked Successfully");
          this.getRiders();
        })
        .catch((err) => {
          EventService.$emit("loading", "hide");
          console.error(err);
          EventService.$emit("errorMessage", "Something Went Wrong!");
        });
    },
    unBlockUser() {
      ridersRef
        .doc(this.currentId)
        .update({ isBlocked: false })
        .then(() => {
          EventService.$emit("loading", "hide");
          EventService.$emit("successMessage", "Rider Unblocked Successfully");
          this.getRiders();
        })
        .catch((err) => {
          EventService.$emit("loading", "hide");
          console.error(err);
          EventService.$emit("errorMessage", "Something Went Wrong!");
        });
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
