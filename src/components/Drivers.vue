<template>
  <div id="dashboard-container">
    <el-card class="card-min-height">
      <div class="card-header">
        <div class="card-title">
          <h3>Drivers</h3>
        </div>
        <div class="card-actions">
          <div class="input-group" style="position:relative">
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
                  <el-select
                    v-model="search_by"
                    :collapse-tags="true"
                    @change="onChangeSelect($event)"
                  >
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
            <span
              style="position: absolute; top:43px; left:13px; font-size: 12px"
              >Select</span
            >
            <el-input
              :placeholder="search_placeholder"
              @input="searchBy"
              v-model="search"
              ><i slot="suffix" class="far fa-search"></i
            ></el-input>
            <download-excel
              :data="json_data"
              :fields="json_fields"
              worksheet="Drivers List"
              name="drivers.xls"
            >
              <el-button plain>
                <i class="fal fa-file-export"></i>
              </el-button>
              <span
                style="position: absolute; top:44px; right:15px; font-size: 12px"
                >Export</span
              >
            </download-excel>
          </div>
        </div>
        <download-excel
          class="d-sm-block"
          :data="json_data"
          :fields="json_fields"
          worksheet="Drivers List"
          name="drivers.xls"
        >
          <el-button plain>
            <i class="fal fa-file-export"></i> Export List
          </el-button>
        </download-excel>
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
              size="small"
              empty-text="No results found."
              highlight-current-row
              @cell-click="handleCurrentChange"
            >
              <el-table-column
                prop="driverFirstName"
                label="Full Name"
                class-name="clickable"
                width="300"
              >
                <template slot-scope="props">
                  <span>
                    <img
                      :src="
                        props.row.driverAvatarUrl === ''
                          ? require(`@/assets/img/default-user.jpg`)
                          : props.row.driverAvatarUrl
                      "
                      class="img-user"
                      alt="..."
                    />
                  </span>
                  <span v-if="typeof props === 'object'" class="driver-name">
                    {{
                      `${props.row.driverFirstName} ${props.row.driverLastName}`
                    }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="Online" width="70" class-name="clickable">
                <template slot-scope="props">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    placement="right"
                    :content="
                      props.row.driverAvailibility === 'online'
                        ? 'Driver Online'
                        : 'Driver Offline'
                    "
                  >
                    <div class="text-center">
                      <i
                        class="fa fa-circle"
                        :class="
                          props.row.driverAvailibility === 'online'
                            ? 'green-text'
                            : 'grey-text'
                        "
                      ></i>
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column
                class-name="clickable"
                prop="driverPhoneNumber"
                label="Phone #"
                width="120"
              >
              </el-table-column>
              <el-table-column
                prop="driverEmail"
                label="Email"
                width="230"
                class-name="clickable"
              >
              </el-table-column>
              <el-table-column
                prop="driverDob"
                label="DOB"
                width="130"
                class-name="clickable"
              >
              </el-table-column>
              <el-table-column
                prop="reg_date"
                label="Reg Date"
                width="130"
                class-name="clickable"
              >
                <template slot-scope="props">
                  {{ props.row.reg_date || "No Data Available" }}
                </template>
              </el-table-column>
              <el-table-column
                prop="totalTrips"
                class-name="clickable"
                label="Total Trips"
                width="130"
              >
                <template slot-scope="props">
                  {{ props.row.totalTrips || "No Data Available" }}
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="Actions" width="140">
                <template slot-scope="props">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Block Driver"
                    placement="top"
                  >
                    <el-button
                      type="info"
                      icon="el-icon-close"
                      circle
                      plain
                      size="mini"
                      @click="blockDriver(props.row)"
                      v-if="
                        ['confirmed', 'incomplete'].includes(
                          props.row.driverStatus
                        ) &&
                          (props.row.isBlocked === 'false' ||
                            props.row.isBlocked === false)
                      "
                    ></el-button>
                  </el-tooltip>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Unblock Driver"
                    placement="top"
                  >
                    <el-button
                      type="info"
                      icon="el-icon-check"
                      circle
                      plain
                      size="mini"
                      @click="unBlockDriver(props.row)"
                      v-if="
                        props.row.isBlocked === 'true' ||
                          props.row.isBlocked === true
                      "
                    ></el-button>
                  </el-tooltip>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Approve Driver"
                    placement="top"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-check"
                      circle
                      plain
                      size="mini"
                      @click="approveDriver(props.row)"
                      v-if="props.row.driverStatus == 'pending'"
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
                          `/drivers/edit/${props.row.driverPhoneNumber}`
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
                      @click="deleteDriver(props.row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
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
      </div>
    </el-card>

    <el-dialog
      title="Driver Details"
      :visible.sync="driverDetailsDialog"
      width="75%"
      custom-class="driver-dialog"
      :before-close="handleCloseDialog"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="box-card clickable" shadow="hover">
            <el-row>
              <el-col :span="18">
                <div class="o-card-title-3">
                  Trips Total
                </div>
                <div class="o-card-data text-center">
                  {{ tripsTotal }}
                </div>
              </el-col>
              <el-col :span="6">
                <div class="o-card-icon">
                  <i class="fal fa-suitcase-rolling"></i>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card clickable" shadow="hover">
            <el-row>
              <el-col :span="18">
                <div class="o-card-title-3">
                  Driver Earning
                </div>
                <div class="o-card-data text-center">
                  {{ myEarning }}
                </div>
              </el-col>
              <el-col :span="6">
                <div class="o-card-icon">
                  <i class="fal fa-money-bill-wave"></i>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card clickable" shadow="hover">
            <el-row>
              <el-col :span="18">
                <div class="o-card-title-3">
                  Vite Earning
                </div>
                <div class="o-card-data text-center">
                  {{ viteFees }}
                </div>
              </el-col>
              <el-col :span="6">
                <div class="o-card-icon">
                  <i class="fal fa-money-check-alt"></i>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" v-if="currentRow !== null">
        <el-col :span="8">
          <el-card class="box-card clickable" shadow="hover">
            <el-row>
              <el-col :span="18">
                <div class="o-card-title-3">
                  Accepted Trips
                </div>
                <div class="o-card-data text-center">
                  {{ currentRow.acceptedTrips }}
                </div>
              </el-col>
              <el-col :span="6">
                <div class="o-card-icon">
                  <i class="fal fa-comment-alt-check"></i>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card clickable" shadow="hover">
            <el-row>
              <el-col :span="18">
                <div class="o-card-title-3">
                  Cancelled Trips
                </div>
                <div class="o-card-data text-center">
                  {{ currentRow.canceledTrips }}
                </div>
              </el-col>
              <el-col :span="6">
                <div class="o-card-icon">
                  <i class="fal fa-window-close"></i>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card clickable" shadow="hover">
            <el-row>
              <el-col :span="18">
                <div class="o-card-title-3">
                  Missed Trips
                </div>
                <div class="o-card-data text-center">
                  {{ currentRow.missedTrips }}
                </div>
              </el-col>
              <el-col :span="6">
                <div class="o-card-icon">
                  <i class="fal fa-map-marker-slash"></i>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCloseDialog">Close</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import firebase from "firebase/app";
const db = firebase.firestore();
const driverRef = db.collection("drivers");
const myEarningRef = db.collection("dailyEarnings");
import { EventService } from "../main";
import Vue from "vue";
import JsonExcel from "vue-json-excel";

Vue.component("downloadExcel", JsonExcel);
export default {
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
        text: "New",
        name: "forth",
      },
      {
        text: "Incomplete",
        name: "fifth",
      },
    ],
    search_by: "",
    search_placeholder: "Search Driver",
    status: "All",
    search: "",
    driverData: [],
    loading: false,
    status: "",
    showFilters: false,
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
    dailyEarningDetail: {
      total_earnings: 0,
    },
    driverDetailsDialog: false,
    currentRow: null,

    json_fields: {
      "First Name": "driverFirstName",
      "Last Name": "driverLastName",
      Email: "driverEmail",
      "Phone #": "driverPhoneNumber",
      "Date of Birth": "driverDob",
      Gender: "driverGender",
      Status: "driverStatus",
      "Total Trips": "totalTrips",
      "Accepted Trips": "acceptedTrips",
      "Cancelled Trips": "canceledTrips",
      "Total Earning": "totalEarnings",
    },
    json_data: [],
    json_meta: [
      [
        {
          key: "charset",
          value: "utf-8",
        },
      ],
    ],
  }),

  created() {
    this.getDrivers();
    if (this.$route.params.id) {
      this.activeName = this.$route.params.id;
    } else {
      this.$router.push("/drivers/first");
    }
  },
  computed: {
    paginationPage() {
      return this.paginationData.currentPage + 1;
    },
    driverDetail() {
      return this.driverData.filter((el) => {
        if (typeof el.driverDob !== "undefined") {
          let d = el.driverDob;
          if (typeof el.driverDob === "object") {
            d = new Date(el.driverDob.seconds * 1000)
              .toISOString()
              .slice(0, 10);
          } else {
            try {
              d = new Date(el.driverDob).toISOString().slice(0, 10);
            } catch (e) {
              d = el.driverDob;
            }
          }
          el.driverDob = d;
        } else {
          el.driverDob = "No Data Availble";
        }
        if (el.driverPhoneNumber) {
          return true;
        }
        return false;
      });
    },
    statusFilterData() {
      return this.driverDetail.filter((ele) => {
        if (this.status === "All") {
          return ele;
        } else if (this.status === "Active") {
          return (
            ele.driverStatus === "confirmed" &&
            (ele.isBlocked === "false" || ele.isBlocked === false)
          );
        } else if (this.status === "Blocked") {
          return ele.isBlocked === "true" || ele.isBlocked === true;
        } else if (this.status === "New") {
          return (
            ele.driverStatus === "pending" &&
            (ele.isBlocked === "false" || ele.isBlocked === false)
          );
        } else if (this.status === "Incomplete") {
          return (
            ele.driverStatus === "incomplete" &&
            (ele.isBlocked === "false" || ele.isBlocked === false)
          );
        } else {
          return ele;
        }
      });
    },
    tripFilterData() {
      const start =
          this.paginationData.currentPage * this.paginationData.perPage,
        end = start + this.paginationData.perPage;
      console.log(this.status, this.statusFilterData.slice(start, end));
      return this.statusFilterData
        .filter((ele) => {
          return (
            ele.driverFirstName
              .toLowerCase()
              .includes(this.filters.full_name.toLowerCase() || "") &&
            ele.driverPhoneNumber
              .toLowerCase()
              .includes(this.filters.phone_number.toLowerCase() || "") &&
            ele.driverEmail
              .toLowerCase()
              .includes(this.filters.email.toLowerCase() || "")
          );
        })
        .slice(start, end);
    },

    totalPrice() {
      return Object.values(this.dailyEarningDetail).map(
        (x) => parseInt(x.total_earnings) || 0
      );
    },
    tripsTotal() {
      return this.totalPrice.reduce(this.sum);
    },
    myEarning() {
      return Math.ceil(this.tripsTotal - this.tripsTotal * 0.1);
    },
    viteFees() {
      return Math.ceil(this.tripsTotal * 0.1);
    },
  },
  methods: {
    handleCurrentChange(row, column, cell) {
      if (column.label !== "Actions") {
        this.currentRow = row;
        let driverid = row.driverId;

        EventService.$emit("loading", "show");
        myEarningRef
          .doc(driverid)
          .get()
          .then((data) => {
            const responseData = data.data();
            this.dailyEarningDetail = responseData || { total_earnings: 0 };
            this.driverDetailsDialog = true;
          })
          .catch((err) => console.log("error =>", err))
          .finally(EventService.$emit("loading", "hide"));
      }
    },
    sum(x, y) {
      return x + y;
    },
    onChangeSelect(e) {
      if (e == "Phone Number") {
        this.search_placeholder = "Search Driver by Number";
      } else if (e == "Email") {
        this.search_placeholder = "Search Driver by Email";
      } else {
        this.search_placeholder = "Search Driver by Name";
      }
    },
    searchBy() {
      if (this.search_by === "Email") {
        this.filters.email = this.search;
        this.search_placeholder = "Search Driver by Email";
      } else if (this.search_by === "Phone Number") {
        this.filters.phone_number = this.search;
        this.search_placeholder = "Search Driver by Number";
      } else {
        this.filters.full_name = this.search;
      }
    },
    addPageNum(page) {
      this.paginationData.currentPage = page - 1;
    },
    getDrivers() {
      EventService.$emit("loading", "show");
      driverRef.get().then((data) => {
        const response = data.docs.map((value) => value.data());
        this.driverData = response;
        this.json_data = response;
        this.paginationData.total = response.length;
        EventService.$emit("loading", "hide");
      });
    },
    handleCloseDialog() {
      this.$confirm("Are you sure to close this dialog?")
        .then((_) => {
          this.currentRow = null;
          this.driverDetailsDialog = false;
          done();
        })
        .catch((_) => {});
    },
    setStatusFilter(tab, event) {
      this.status = tab.label;
      this.activeName = tab.name;
    },

    deleteDriver(row) {
      this.$confirm("Are you sure you want to delete?")
        .then((_) => {
          let currentId = row.driverPhoneNumber;
          EventService.$emit("loading", "show");
          driverRef
            .doc(currentId)
            .delete()
            .then(() => {
              EventService.$emit("loading", "show");
              EventService.$emit(
                "successMessage",
                "Driver Deleted Successful."
              );
              this.getDrivers();
            })
            .catch(() => {
              EventService.$emit(
                "errorMessage",
                "Something went wrong, please try again."
              );
              EventService.$emit("loading", "hide");
            });
          done();
        })
        .catch((_) => {});
    },
    blockDriver(row) {
      this.$confirm("Are you sure you want to block?")
        .then((_) => {
          let currentId = row.driverPhoneNumber;
          EventService.$emit("loading", "show");
          driverRef
            .doc(currentId)
            .update({ isBlocked: "true" })
            .then(() => {
              EventService.$emit("loading", "hide");
              EventService.$emit("successMessage", "Driver is Blocked.");

              this.getDrivers();
            })
            .catch((err) => {
              EventService.$emit(
                "errorMessage",
                "Something went wrong, please try again."
              );
              EventService.$emit("loading", "hide");
              console.info(err);
            });
          done();
        })
        .catch((_) => {});
    },
    approveDriver(row) {
      this.$confirm("Are you sure you want to approve driver?")
        .then((_) => {
          let currentId = row.driverPhoneNumber;
          EventService.$emit("loading", "show");
          driverRef
            .doc(currentId)
            .update({ driverStatus: "confirmed" })
            .then(() => {
              EventService.$emit("loading", "hide");
              EventService.$emit("successMessage", "Driver is Apprived.");
              this.getDrivers();
            })
            .catch((err) => {
              EventService.$emit(
                "errorMessage",
                "Something went wrong, please try again."
              );
              EventService.$emit("loading", "hide");
              console.info(err);
            });
          done();
        })
        .catch((_) => {});
    },
    unBlockDriver(row) {
      this.$confirm("Are you sure you want to block?")
        .then((_) => {
          let currentId = row.driverPhoneNumber;
          EventService.$emit("loading", "show");
          driverRef
            .doc(currentId)
            .update({ isBlocked: "false" })
            .then(() => {
              EventService.$emit("loading", "hide");
              EventService.$emit("successMessage", "Driver is Unblocked.");
              this.getDrivers();
            })
            .catch((err) => {
              EventService.$emit(
                "errorMessage",
                "Something went wrong, please try again."
              );
              EventService.$emit("loading", "hide");
              console.info(err);
            });
          done();
        })
        .catch((_) => {});
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

.d-sm-block {
  display: none;
}

@media screen and (max-width: 786px) {
  .card-header {
    flex-direction: column;
  }
  .d-sm-block {
    padding-top: 15px;
    display: block;
  }
}
</style>
