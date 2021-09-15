<template lang="">
  <el-row>
    <el-col :md="20">
      <el-card>
        <div class="card-header">
          <div class="card-title">
            <h3>Update Driver Information</h3>
          </div>
        </div>
        <div class="card-body">
          <el-tabs type="border-card">
            <el-tab-pane label="Personal Information">
              <driver-info />
            </el-tab-pane>
            <el-tab-pane label="Vehicle Information"
              ><vehicle-info
            /></el-tab-pane>
            <el-tab-pane label="Documents">
              <documents />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import DriverInfo from "./DriverInfo";
import VehicleInfo from "./VehicleInfo";
import Documents from "./Documents";
export default {
  name: "EditDriver",
  created(){
    console.log(this.$router.params);
  },
  components: {
    "driver-info": DriverInfo,
    "vehicle-info": VehicleInfo,
    'documents' : Documents
  },
};
</script>

<style scoped></style>
