<template>
  <el-row>
    <el-form ref="form" label-position="top" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Manufacturer">
            <el-input
              :rules="requiredRules"
              v-model="formValues.manufacturer"
              placeholder="Manufacturer"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Model Name">
            <el-input
              v-model="formValues.modelName"
              :rules="requiredRules"
              placeholder="Model Name"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Model Year">
            <el-input
              :rules="requiredRules"
              v-model="formValues.modelYear"
              placeholder="Model Year"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="License Number Plate">
            <el-input
              v-model="formValues.licensePlateNumber"
              :rules="requiredRules"
              placeholder="License Number Plate"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Vehicle Color">
            <el-input
              :rules="requiredRules"
              v-model="formValues.vehicleColor"
              placeholder="Vehicle Color"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Number of Seats">
            <el-input
              v-model="formValues.numberOfSeats"
              :rules="requiredRules"
              placeholder="Number of Seats"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button type="primary" @click="submitInput" round>Save</el-button>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import { EventService } from "../../main";

export default {
  data() {
    return {
      formValues: {
        manufacturer: "",
        modelName: "",
        modelYear: "",
        licensePlateNumber: "",
        vehicleColor: "",
        numberOfSeats: "",
      },
      requiredRules: [(v) => !!v || "This is required"],
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
    };
  },
  created() {
    this.getVechicleInfo();
  },
  methods: {
    submitInput() {
      this.updateData();
    },
    getVechicleInfo() {
      firebase
        .firestore()
        .collection("vehicles")
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          this.formValues = { ...snapshot.data() };
          EventService.$emit("loading", "hide");
        })
        .catch((error) => {
          EventService.$emit("loading", "hide");
          EventService.$emit("errorMessage", "Something Went Wrong.");
        });
    },
    updateData() {
      EventService.$emit("loading", "show");

      firebase
        .firestore()
        .collection("vehicles")
        .doc(this.$route.params.id)
        .update(this.formValues)
        .then(() => {
          EventService.$emit("loading", "hide");
          EventService.$emit("successMessage", "Updated Successful");
          this.$emit("next");
        })
        .catch(() => {
          EventService.$emit("loading", "hide");
          EventService.$emit("errorMessage", "Something Went Missing.");
        });
    },
  },
};
</script>
<style>
.p-50 {
  padding-right: 50px;
}
</style>
