<template>
  <div id="dashboard-container">
    <el-row :gutter="20">
      <el-col
        v-for="(item, index) in documents"
        :key="index"
        :xs="24"
        :sm="24"
        :md="8"
      >
        <el-card>
          <div class="card-header">
            <div class="card-title">
              <h3>{{ item.title }}</h3>
            </div>
            <div class="card-actions">
              <el-button
                icon="el-icon-edit"
                circle
                @click="openImageDialog(item, 'isProfile')"
              ></el-button>
            </div>
          </div>
          <div class="card-body">
            <el-image
              style="width: 100%; height: 175px; cursor: pointer"
              @click="openviewDialog(item, authUser[item.value])"
              :src="authUser[item.value]"
              fit="contain"
            ></el-image>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col
        v-for="(item, index) in vehicleDocs"
        :key="index + '0001'"
        :xs="24"
        :sm="24"
        :md="8"
      >
        <el-card>
          <div class="card-header">
            <div class="card-title">
              <h3>{{ item.title }}</h3>
            </div>
            <div class="card-actions">
              <el-button icon="el-icon-edit" circle></el-button>
            </div>
          </div>
          <div class="card-body">
            <el-image
              style="width: 100%; height: 175px; cursor: pointer"
              @click="openviewDialog(item, vehicleDetail[item.value])"
              :src="
                vehicleDetail[item.value]
                  ? vehicleDetail[item.value]
                  : vehicleDetail[item.nextValue]
              "
              fit="contain"
            ></el-image>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="showImages" width="30%">
      <el-image
        style="width: 100%; height: 100%; cursor: pointer"
        :src="similarImage"
        fit="contain"
      ></el-image>
    </el-dialog>
    <ImageUpload
      v-if="imageDialog"
      v-model="imageName"
      :resize="false"
      :title="title"
      @close="imageDialog = false"
      @imageName="imageName = $event"
      @input="updateProfileImage"
    />
  </div>
</template>
<script>
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
const db = firebase.firestore();
const refVehicle = db.collection("vehicles");
const refDrivers = db.collection("drivers");
import { EventService } from "../../main";

export default {
  name: "Documents",
  components: {
    ImageUpload: () => import("./ImageUpload"),
  },
  data() {
    return {
      title: "",
      openProfileEditForm: false,
      authUser: {},
      vehicleDetail: {},
      imageDialog: false,
      imageUrl: "",
      similarImage: "",
      imageName: "",
      showImages: false,
      currentFile: "",
      currentIndex: 0,
      formValues: {},
      documents: [
        {
          title: "Driver Photo",
          value: "driverAvatarUrl",
          name: "profilePhoto",
          src: "https://cdn.vuetifyjs.com/images/cards/store.jpg",
        },
        {
          title: "Driver Id",
          value: "driverIDUrl",
          name: "driver_id",
          src: "https://cdn.vuetifyjs.com/images/cards/store.jpg",
        },
        {
          title: "Driver License",
          value: "driverLicenseUrl",
          name: "driver_license",
          src: "https://cdn.vuetifyjs.com/images/cards/store.jpg",
        },
      ],
      currentValue: [],
      loading: false,
      vehicleDocs: [
        {
          title: "Vehicle Photo",
          value: "vehicleAvatarUrl",
          path: "vehicles/",
          src: "https://cdn.vuetifyjs.com/images/cards/store.jpg",
        },
        {
          title: "PSV Taxi License",
          value: "vehicleLicenseUrl",
          nextValue: "vehicleLicense",
          path: "vehicleLicense/",
          src: "https://cdn.vuetifyjs.com/images/cards/store.jpg",
        },
        {
          title: "Proof of Insurance",
          value: "proofOfInsuranceUrl",
          path: "vehiclesdocs/",
          src: "https://cdn.vuetifyjs.com/images/cards/store.jpg",
        },
      ],
      currentType: "",
      items: [
        {
          text: "Dashboard",
          disabled: false,
          href: "/dashboard",
        },
        {
          text: "Documents",
          disabled: true,
          href: "breadcrumbs_link_1",
        },
      ],
      currentName: "",
      currentPath: "",
    };
  },
  created() {
    EventService.$emit("loading", "show");
    this.getVechicleInfo();
    this.getDriverInfo();
  },
  methods: {
    handleClose(done) {
      this.$confirm("Are you sure to close this dialog?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    openImageDialog(detail, type) {
      this.title = detail.title;
      this.imageDialog = true;
      this.currentValue = detail.value;
      this.currentType = type;
      this.currentName = detail.name;
      this.currentPath = detail.path;
    },
    getDriverInfo() {
      refDrivers
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          EventService.$emit("loading", "hide");
            
          this.authUser = { ...snapshot.data() };
        })
        .catch((error) => ({
          errorCode: error.code,
          errorMessage: error.message,
        }));

      console.dir(this.authUser);
    },
    openviewDialog(detail, image) {
      this.similarImage = image;
      // console.dir(image);
      this.showImages = true;
    },
    getVechicleInfo() {
      refVehicle
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          EventService.$emit("loading", "hide");
              
          this.vehicleDetail = { ...snapshot.data() };
        })
        .catch((error) => ({
          errorCode: error.code,
          errorMessage: error.message,
        }));
    },
    updateProfileImage(image) {
      this.imageUrl = URL.createObjectURL(image);
      this.imageDialog = false;
      if (this.currentType === "isProfile") {
        this.updateDriversImage(image, this.currentValue, this.currentName);
      } else {
        this.updateVechicleDocs(image, this.currentValue, this.currentPath);
      }
    },
    updateDriversImage(image, value, name) {
      if (this.loading) return;
      this.loading = true;
      firebase
        .storage()
        .ref("/drivers/" + this.$route.params.id + "/" + name)
        .put(image, { contentType: `image/jpg` })
        .then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            refDrivers
              .doc(this.$route.params.id)
              .update({ [value]: url })
              .then(() => {
                this.setNotifyMessage("Successfully Upload docs");
                this.driversInfo();
              });
          });
        })
        .finally(() => {
          
          this.loading = false;
        });
    },
    driversInfo() {
      refDrivers
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          this.$nextTick(() => {
            this.authUser = snapshot.data();
          });
        })
        .catch((error) => ({
          errorCode: error.code,
          errorMessage: error.message,
        }));
    },
    updateVechicleDocs(image, value, path) {
      if (this.loading) return;
      this.loading = true;
      firebase
        .storage()
        .ref(path + this.$route.params.id)
        .put(image, { contentType: `image/jpg` })
        .then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            refVehicle
              .doc(this.$route.params.id)
              .update({ [value]: url })
              .then(() => {
                this.setNotifyMessage("Successfully Upload docs");
                this.getVechicleInfo();
              });
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
