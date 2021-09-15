<template>
  <el-dialog
    :title="title || 'Upload Image'"
    :visible.sync="dialog"
    width="50%"
    :before-close="close"
  >
    <el-row :gutter="20">
      <el-col :span="24" v-if="showImg && !showCroppie">
        <el-image
          style="width: 100%; height: 250"
          :src="cropped"
          fit="contain"
        ></el-image>
      </el-col>
      <el-col :span="24" v-if="showCroppie">
        <vue-croppie
          ref="croppieRef"
          :enable-resize="true"
          :viewport="getViewPort"
          :boundary="{ height: 500, width: '100%' }"
          @result="result"
        ></vue-croppie>
      </el-col>
      <el-col :span="24" v-if="!image && !showCroppie" class="text-center">
        <i class="fal fa-upload"></i>
        <div class="grey--text">
          Browse Image from here
        </div>
      </el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <input
        ref="image"
        type="file"
        class="d-none"
        accept="image/*"
        @change="upload"
      />
      <el-button @click="close">Cancel</el-button>
      <el-button type="success" v-if="!cropStatus && showCroppie" @click="crop"
        >Crop</el-button
      >

      <el-button type="success" v-if="cropped" @click="update"
        >Update</el-button
      >

      <el-button type="success" v-if="cropped" @click="update"
        >Upload</el-button
      >

      <el-button type="warning" v-if="!image" @click="pickFile"
        >Browse</el-button
      >

      <el-button type="primary" v-else text @click="reset">Reset</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from "vue";
import VueCroppie from "vue-croppie";
import { mapMutations } from "vuex";
import "croppie/croppie.css";
Vue.use(VueCroppie);
export default {
  props: {
    cover: {
      type: Boolean,
      default: false,
    },
    profile: {
      type: Boolean,
      default: false,
    },
    // Temporary fix carried out for overlay issue when v-dialog is present inside another v-dialog
    hideOverlay: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: null,
    },
    viewPort: {
      type: Object,
      default() {
        return {
          width: "100%",
          height: 350,
        };
      },
    },
    optionsSize: {
      type: String,
      default: "original",
    },
  },
  data() {
    return {
      dialog: true,
      image: "",
      showCroppie: false,
      cropped: "",
      cropStatus: false,
      showImg: false,
      file: "",
      fileName: "",
      options: {
        format: "jpeg",
        circle: false,
        size: this.optionsSize,
      },
      checkbox: true,
    };
  },
  computed: {
    getViewPort() {
      if (this.cover) {
        return { width: "100%", height: 300, type: "square" };
      } else if (this.profile) {
        return { width: 200, height: 200, type: "circle" };
      } else {
        return {
          width: this.viewPort.width,
          height: this.viewPort.height,
          type: "square",
        };
      }
    },
  },
  methods: {
    ...mapMutations({
      setSnackBar: "common/setSnackBar",
    }),

    pickFile() {
      this.$refs.image.click();
    },
    upload(file) {
      if (file.target.files[0].name.split(".").pop() !== "svg") {
        const reader = new FileReader();
        this.fileName = file.target.files[0].name;
        reader.readAsDataURL(file.target.files[0]);
        this.showCroppie = true;
        reader.onload = () => {
          this.$refs.croppieRef.bind({
            url: reader.result,
          });
          this.image = reader.result;
          this.file = file.target.files;
          file.target.value = null;
        };
      } else {
        this.setSnackBar({
          text: "SVG image not allowed here.",
          color: "red",
        });
      }
    },
    crop() {
      this.$refs.croppieRef.result(this.options, (output) => {
        this.cropped = output;
      });
      this.showCroppie = false;
      this.cropStatus = false;
      this.showImg = true;
    },
    close() {
      this.$confirm("Are you sure to close this dialog?")
        .then((_) => {
          this.dialog = false;
          this.$emit("close");
          this.reset();
          done();
        })
        .catch((_) => {});
    },
    update() {
      this.$emit("croppedImage", this.dataURLtoBlob(this.cropped));
      this.$emit("imageName", this.fileName);
      this.$emit("input", this.dataURLtoBlob(this.cropped));
      this.$emit("base64Data", this.cropped);
      this.$emit("actualFile", this.file);
      this.dialog = false;
      this.reset();
    },
    dataURLtoBlob(dataurl) {
      const arr = dataurl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      blob.name = this.fileName;
      return blob;
    },
    result(output) {
      this.cropped = output;
    },
    reset() {
      this.cropped = null;
      this.cropStatus = false;
      this.showImg = false;
      this.showCroppie = false;
      this.image = "";
      this.file = "";
      this.fileName = "";
    },
  },
};
</script>

<style>
.fal.fa-upload {
  font-size: 72px;
  margin-bottom: 20px;
}
.d-none {
  display: none;
}
</style>
