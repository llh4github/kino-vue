<script setup lang="ts">
import { CirclePlus, Delete, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { reactive, ref, watch } from "vue";
import { checkUniqueCode, createRole, deleteRole, pageApi, roleDetail, updateRole } from "@/api/auth/role"
import { allData } from "@/api/auth/permission";
import { PermissionInfo, RoleInfo } from "@/api/auth/types";
import { usePagination } from "@/hooks/usePagination";
import { formatDateTime } from "@/utils";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";


defineOptions({
  name: "Role-Index-Page",
})
const loading = ref<boolean>(false)
//region 搜索栏逻辑
const dialogVisible = ref(false)
const searchData = reactive({
  code: undefined,
  name: undefined,
})
const searchFormRef = ref<FormInstance | null>(null)
const handleSearch = () => {
  if (paginationData.currentPage === 1) {
    getTableData()
  }
  paginationData.currentPage = 1
}
//endregion

//region 新增或更新逻辑
const formRef = ref<FormInstance | null>(null)
const formData = reactive<RoleInfo>({})
const permissions = ref<PermissionInfo[]>([])
const fetchAllPermissions = async () => {
  const resp = await allData()
  permissions.value = resp.data ?? []
}
const validateCode = (rule: any, value: any, callback: any) => {
  if (value.length < 3) {
    callback()
  } else {
    const id = formData.id
    checkUniqueCode(value, id).then((res) => {
      if (res.data) {
        callback(new Error("数据已存在"))
      } else {
        callback()
      }
    })
  }
}

const controlDialog = async (row?: RoleInfo) => {
  await fetchAllPermissions()
  formData.name = row?.name
  formData.id = row?.id
  formData.code = row?.code
  if (row?.id) {
    const resp = await roleDetail(row.id)
    if (resp.data) {
      const role = resp.data
      formData.id = role.id
      formData.name = role.name
      formData.code = role.code
      formData.permissionIds = role?.permissions
        ?.map((ele) => ele.id)
        .filter(ele => ele != undefined)
        .map(ele => ele as number) ?? []
      dialogVisible.value = true
    } else {
      ElMessage.error("数据不存在，请刷新后再试")
      dialogVisible.value = false
    }
  } else {
    dialogVisible.value = true
  }
}
const formRules: FormRules = reactive({
  code: [
    { required: true, trigger: "blur", message: "请输入角色代码" },
    { min: 3, max: 10, message: "长度应该在 1 到 10 之间", trigger: "blur" },
    { validator: validateCode, trigger: "blur" },
  ],
  name: [
    { required: true, trigger: "blur", message: "请输入角色名" },
    { min: 1, max: 10, message: "长度应该在 1 到 10 之间", trigger: "blur" },
  ],
})
const cancelDialog = () => {
  console.debug("取消")
  formRef.value?.clearValidate()
  dialogVisible.value = false
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      let requestMethod = updateRole
      if (formData.id) {
        console.debug("有ID，调用更新接口")
      } else {
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
    } else {
      return false
    }
  })
}
//endregion

//region 列表分页逻辑
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const tableData = ref<RoleInfo[]>([])
const handleRefresh = () => {
  getTableData()
}
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

const handleSelectChange = (selections: RoleInfo[]) => {
  const ids = selections.filter((ele) => ele.id).map((ele) => ele.id!)
  if (ids) {
    selectedIds.value = ids
  }
  console.debug("已经选择的ID列表: ", ids)
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
//endregion


//#region 删
const selectedIds = ref<number[]>([])
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
      <el-form ref="formRef" :model="formData" :rules="formRules"
               label-width="100px" label-position="left"
      >
        <el-form-item prop="code" label="角色代码">
          <el-input v-model="formData.code" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="角色名">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="permissionIds" label="拥有的权限">
          <el-checkbox-group v-model="formData.permissionIds">
            <template v-for="item in permissions">
              <el-checkbox
                :label="item.id"
                :name="item.name"
                :checked="formData?.permissionIds?.indexOf(item.id!!) > 0"
              >{{ item.name }}
              </el-checkbox>
            </template>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialog">取消</el-button>
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
