<template>
  <el-form ref="form" label-width="50px">
    <el-form-item required>
      <el-col :span="11">
        <strong>Full Name: </strong>
        <el-input
          type="text"
          placeholder="Full Name"
          v-model="formValues.userFullName"
          :rules="requiredRules"
          style="width: 100%;"
        ></el-input>
      </el-col>

      <el-col :span="12" :offset="1">
        <strong>Email: </strong>
        <el-input
          type="email"
          placeholder="Email Address"
          v-model="formValues.userEmail"
          style="width: 100%;"
          :rules="emailRules"
        ></el-input>
      </el-col>
    </el-form-item>
    <el-form-item required>
      <el-col :span="11">
        <strong>Phone Number: </strong>
        <el-input
          type="text"
          placeholder="Phone Number"
          v-model="formValues.userPhoneNumber"
          :rules="requiredRules"
          style="width: 100%;"
        ></el-input>
      </el-col>

      <el-col :span="12" :offset="1">
        <strong>City: </strong>
        <el-input
          type="text"
          placeholder="City"
          v-model="formValues.userCity"
          style="width: 100%;"
          :rules="requiredRules"
        ></el-input>
      </el-col>
    </el-form-item>

    <el-form-item required>
      <el-col :span="11">
        <strong>Area: </strong>
        <el-input
          type="text"
          placeholder="Area"
          v-model="formValues.userArea"
          :rules="requiredRules"
          style="width: 100%;"
        ></el-input>
      </el-col>

      <el-col :span="12" :offset="1">
        <strong>Postal Code: </strong>
        <el-input
          type="text"
          placeholder="Postal Code"
          v-model="formValues.userPostalCode"
          style="width: 100%;"
          :rules="requiredRules"
        ></el-input>
      </el-col>
    </el-form-item>
    <el-form-item required>
      <el-col :span="24">
        <strong>Address: </strong>
        <el-input
          type="textarea"
          placeholder="Address"
          v-model="formValues.userAddress"
          :rules="requiredRules"
          style="width: 100%;"
        ></el-input>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="updateData" round>Save</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore();
const ref = db.collection("riders");
import { EventService } from "../../main";

export default {
  data() {
    return {
      formValues: {
        gender: "Male",
      },
      requiredRules: [(v) => !!v || "This is required"],
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
    };
  },
  created() {
    this.getDriverInfo();
  },
  methods: {
    updateData() {
      this.$confirm(`Are you sure you want update?`)
        .then((_) => {
          EventService.$emit("loading", "show");
          if (this.$refs.form.validate()) {
            ref
              .doc(this.$route.params.id)
              .update(this.formValues)
              .then(() => {
                EventService.$emit("loading", "hide");
                EventService.$emit("successMessage", "Updated Successfully!");
              })
              .catch((err) => {
                EventService.$emit("loading", "hide");
                EventService.$emit("errorMessage", "Something Went Wrong!");
                console.error(err);
              });
          } else {
            EventService.$emit("loading", "hide");
            EventService.$emit("errorMessage", "Recheck your data!");
          }
        })
        .catch((_) => {});
    },
    getDriverInfo() {
      EventService.$emit("loading", "show");
      firebase
        .firestore()
        .collection("riders")
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          EventService.$emit("loading", "hide");
          this.formValues = { ...snapshot.data() };
          console.log("🚀 ~ file: RiderInfo.vue ~ line 149 ~ .then ~ this.formValues", this.formValues)
        })
        .catch((error) => ({
          errorCode: error.code,
          errorMessage: error.message,
        }));
    },
  },
};
</script>
