<script setup lang="ts">
import { CirclePlus, Delete, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { reactive, ref, watch } from "vue";
import { createRole, deleteRole, pageApi, updateRole } from "@/api/auth/role"
import { RoleInfo } from "@/api/auth/types";
import { usePagination } from "@/hooks/usePagination";
import { formatDateTime } from "@/utils";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";


defineOptions({
  name: "Role-Index-Page",
})
const dialogVisible = ref(false)
const loading = ref<boolean>(false)
const searchData = reactive({
  code: "",
  name: "",
})

const formRef = ref<FormInstance | null>(null)
const formData = reactive<RoleInfo>({})
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      let requestMethod = updateRole
      if (formData.id) {
        console.debug("有ID，调用更新接口")
      }else{
        console.debug("没有ID，调用创建接口")
        requestMethod = createRole
      }
      requestMethod(formData)
        .then(() => {
          ElMessage.success("操作成功")
          dialogVisible.value = false
          formRef.value?.resetFields()
          getTableData()
        })
        .catch(() => {
          console.error("创建或更新数据失败！")
        })
    }else{
      return false
    }
  })
  dialogVisible.value = false
}
const searchFormRef = ref<FormInstance | null>(null)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const tableData = ref<RoleInfo[]>([])
const getTableData = () => {
  loading.value = true
  pageApi({
    page: paginationData.currentPage,
    size: paginationData.pageSize,
    ...searchData,
  }).then((res) => {
    if (res.data) {
      paginationData.total = res.data?.totalElements ?? 0
      tableData.value = res.data?.content ?? []
    }
  }).catch(() => {
    tableData.value = []
  }).finally(() => {
    loading.value = false
  })
}

const handleSearch = () => {
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}

const selectedIds = ref<number[]>([])
const handleSelectChange = (selections: RoleInfo[]) => {
  const ids = selections.filter((ele) => ele.id).map((ele) => ele.id!)
  if (ids) {
    selectedIds.value = ids
  }
  console.debug("已经选择的ID列表: ", ids)
}
//#region 删
const handleDeleteMuch = () => {
  const list = selectedIds.value
  if (list.length <= 0) {
    ElMessage.warning("未选择数据")
    return
  }
  ElMessageBox.confirm(`确认删除 ${list.length} 条数据？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteRole({ ids: selectedIds.value }).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  });
}
const controlDialog = (row?: RoleInfo) => {
  formData.name = row?.name
  formData.id = row?.id
  formData.code = row?.code
  dialogVisible.value = true
}
const handleDeleteOne = (row: any) => {
  ElMessageBox.confirm(`确认删除此条数据？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteRole({ ids: [row.id] }).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  }).catch(() => {
    console.debug("用户取消删除")
  })
}
//#endregion
const handleRefresh = () => {
  getTableData()
}
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value?.resetFields();
  } else {
    console.debug(`搜索表单的引用为空！ ${searchFormRef.value}`)
  }
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="code" label="角色代码">
          <el-input v-model="searchData.code" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="角色名">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="controlDialog">新增角色</el-button>
          <el-button type="danger" :icon="Delete" @click="handleDeleteMuch">批量删除</el-button>
        </div>
        <div>
          <!--
                    <el-tooltip content="下载">
                      <el-button type="primary" :icon="Download" circle />
                    </el-tooltip>
                    -->
          <el-tooltip content="刷新表格">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData"
                  @selection-change="handleSelectChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="code" label="角色代码" align="center" />
          <el-table-column prop="name" label="角色名" align="center" />
          <el-table-column prop="createdTime" label="创建时间" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdTime) }}
            </template>
          </el-table-column>

          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="controlDialog(scope.row)">修改</el-button>
              <el-button type="danger" text bg size="small" @click="handleDeleteOne(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      width="30%"
      :title="formData.id != undefined ? '修改数据': '新增数据'"
      v-model="dialogVisible">
      <el-form ref="formRef" :model="formData"
               label-width="100px" label-position="left"
      >
        <el-form-item prop="code" label="角色代码">
          <el-input v-model="formData.code" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="角色名">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">

.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
