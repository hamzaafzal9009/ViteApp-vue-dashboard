<template lang="">
  <el-row>
    <el-col :md="18">
      <el-card>
        <div class="card-header">
          <div class="card-title">
            <h3>Update Rider Information</h3>
          </div>
        </div>
        <div class="card-body">
          <el-tabs type="border-card">
            <el-tab-pane label="Personal Information">
              <rider-info />
            </el-tab-pane>
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
import RiderInfo from "./RiderInfo";
import Documents from "./Documents";
export default {
  components: {
    "rider-info": RiderInfo,
    documents: Documents,
  },
};
</script>

<style scoped></style>
