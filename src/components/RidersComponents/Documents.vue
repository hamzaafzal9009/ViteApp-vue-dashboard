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
              @click="openviewDialog(item, currentUser[item.value])"
              :src="currentUser[item.value]"
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
const db = firebase.firestore();
const ridersRef = db.collection("riders");
import { EventService } from "../../main";

export default {
  components: {
    ImageUpload: () => import("./ImageUpload"),
  },
  data() {
    return {
      showImages: false,
      similarImage: "",
      title: "",
      currentUser: {},
      vehicleDetail: {},
      imageDialog: false,
      imageUrl: "",
      imageName: "",
      documents: [
        {
          title: "Rider Photo",
          value: "userAvatarUrl",
          name: "profilePhoto",
          src: "https://cdn.vuetifyjs.com/images/cards/store.jpg",
        },
      ],
      currentValue: [],
      loading: false,
      currentType: "",
      currentName: "",
      currentPath: "",
    };
  },
  created() {
    this.getDriverInfo();
  },
  methods: {
    openviewDialog(detail, image) {
      this.similarImage = image;
      this.showImages = true;
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
      EventService.$emit("loading", "show");
      ridersRef
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          this.currentUser = { ...snapshot.data() };
          EventService.$emit("loading", "hide");
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
        this.updateRiderImage(image, this.currentValue, this.currentName);
      }
    },
    updateRiderImage(image, value, name) {
      EventService.$emit("loading", "show");
      firebase
        .storage()
        .ref(`/riders/${this.$route.params.id}/${name}`)
        .put(image, { contentType: `image/jpg` })
        .then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            ridersRef
              .doc(this.$route.params.id)
              .update({ [value]: url })
              .then(() => {
                EventService.$emit("successMessage", "Updated Successful");
                this.driversInfo();
              });
          });
        })
        .finally(() => {
          EventService.$emit("loading", "hide");
        });
    },
    driversInfo() {
      EventService.$emit("loading", "show");
      ridersRef
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          this.currentUser = snapshot.data();
          EventService.$emit("loading", "hide");
        })
        .catch((error) => ({
          errorCode: error.code,
          errorMessage: error.message,
        }));
    },
  },
};
</script>
