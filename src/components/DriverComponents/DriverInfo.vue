<template>
  <el-row>
    <el-form ref="form" label-width="120px">
      <el-form-item label="Driver Name" required>
        <el-col :span="11">
          <el-input
            type="text"
            placeholder="First Name"
            v-model="formValues.driverFirstName"
            :rules="requiredRules"
            style="width: 100%;"
          ></el-input>
        </el-col>

        <el-col :span="12" :offset="1">
          <el-input
            type="text"
            placeholder="Last Name"
            :rules="requiredRules"
            v-model="formValues.driverLastName"
            style="width: 100%;"
          ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="Contact Info" required>
        <el-col :span="11">
          <el-input
            type="email"
            placeholder="Email Address"
            v-model="formValues.driverEmail"
            style="width: 100%;"
            :rules="emailRules"
          ></el-input>
        </el-col>

        <el-col :span="12" :offset="1">
          <el-input
            type="text"
            placeholder="Phone Number"
            :rules="requiredRules"
            v-model="formValues.driverPhoneNumber"
            style="width: 100%;"
          ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="Personal Info" required>
        <el-col :span="7">
          <el-input
            type="text"
            placeholder="Date of Birth"
            :rules="requiredRules"
            v-model="formValues.driverDob"
            style="width: 100%;"
          ></el-input>
        </el-col>

        <el-col :span="7" :offset="1">
          <el-input
            v-model="formValues.driverPassword"
            placeholder="Password"
            type="password"
            show-password
          ></el-input>
        </el-col>
        <el-col :span="7" :offset="1">
          <span class="p-50">Gender</span>
          <span v-for="(gender, i) in ['Male', 'Female']" :key="i">
            <el-button
              size="small"
              round
              :type="formValues.driverGender === gender ? 'primary' : ''"
              @click.prevent="
                $nextTick(() => {
                  formValues.driverGender = gender;
                })
              "
              >{{ gender }}</el-button
            >
          </span>
        </el-col>
      </el-form-item>
      <el-form-item label="Address" required>
        <el-col :span="24">
          <el-input
            type="textarea"
            placeholder="Personal Address"
            style="width: 100%;"
            :rules="requiredRules"
            v-model="formValues.driverHomeAddress"
            resize="none"
          ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updateData" round>Save</el-button>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore();
const ref = db.collection("drivers");
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
      show: false,
    };
  },
  created() {
    this.getDriverInfo();
  },
  methods: {
    updateData() {
      EventService.$emit("loading", "show");
      if (this.$refs.form.validate()) {
        ref
          .doc(this.$route.params.id)
          .update(this.formValues)
          .then(() => {
            EventService.$emit("loading", "hide");
            EventService.$emit("successMessage", "Driver Updated Successful.");
          })
          .catch(() => {
            EventService.$emit("loading", "hide");
            EventService.$emit("errorMessage", "Something Went Wrong.");
          });
      }
    },
    getDriverInfo() {
      EventService.$emit("loading", "show");
      firebase
        .firestore()
        .collection("drivers")
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          this.formValues = { ...snapshot.data() };
          this.formValues.driverGender = snapshot.data().driverGender;
          let mData = new Date(snapshot.data().driverDob * 1000);
          this.formValues.driverDob = mData.toGMTString();
          console.dir(this.formValues);
          EventService.$emit("loading", "hide");
        })
        .catch((error) => {
          EventService.$emit("loading", "hide");
          EventService.$emit("errorMessage", "Driver Deleted Successful.");
        });
    },
    refreshData() {
      this.openProfileEditForm = false;
      firebase
        .firestore()
        .collection("drivers")
        .doc(this.$route.params.id)
        .get()
        .then((snapshot) => {
          this.formValues = { ...snapshot.data() };
          this.$nextTick(() => {
            localStorage.setItem("authUser", JSON.stringify(snapshot.data()));
            this.authUser = JSON.parse(localStorage.getItem("authAdmin"));
          });
        })
        .catch((error) => ({
          errorCode: error.code,
          errorMessage: error.message,
        }));
    },
  },
};
</script>

<style>
.p-50 {
  padding-right: 50px;
}
</style>
